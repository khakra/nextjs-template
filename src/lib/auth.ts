import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import { render } from "react-email";
import Stripe from "stripe";
import VerifyOtp from "@/emails/verify-otp";
import { sendEmail } from "@/lib/mail";
import { FREE_PLAN_CREDITS, getPlanCredits, PLANS } from "@/lib/plans";
import prisma from "@/lib/prisma";

if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET must be set when STRIPE_SECRET_KEY is set, otherwise subscription webhooks are silently dropped"
  );
}

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER,
  pro: process.env.STRIPE_PRICE_ID_PRO,
  expert: process.env.STRIPE_PRICE_ID_EXPERT,
};

// Credit policy
// -------------
// `credits` is the allowance for the current billing period and `usage` is what
// has been consumed within it. An allowance is granted once per period, keyed on
// the period start recorded in `creditsPeriodStart`.
//
// The keying matters: Stripe does not guarantee webhook ordering and retries
// freely, and `customer.subscription.updated` fires for cancellations, restores,
// card changes and metadata edits — none of which are payments. Granting on that
// event let a user mint credits by toggling cancel/restore. Grants therefore hang
// off `invoice.paid` (a real payment) and the initial checkout, and the write is
// conditional so a replayed or out-of-order event lands on nothing.
//
// referenceId is the user id because customerType defaults to "user"; updateMany
// keeps a webhook for a deleted user a no-op rather than an exception the plugin
// would swallow.
async function grantPlanCredits({
  referenceId,
  planName,
  periodStart,
}: {
  referenceId: string;
  planName: string | null | undefined;
  periodStart: Date;
}) {
  const credits = getPlanCredits(planName);

  if (credits === undefined) {
    return;
  }

  // A no-op here means the period was already granted or the event is stale,
  // which is the expected outcome for a Stripe retry rather than an error.
  await prisma.user.updateMany({
    where: {
      id: referenceId,
      OR: [
        { creditsPeriodStart: null },
        { creditsPeriodStart: { lt: periodStart } },
      ],
    },
    data: { credits, usage: 0, creditsPeriodStart: periodStart },
  });
}

// Plan changes take effect immediately but must not reset `usage`, otherwise
// switching plans back and forth would refill the allowance for free.
async function setPlanAllowance(
  referenceId: string,
  planName: string | null | undefined
) {
  const credits = getPlanCredits(planName);

  if (credits === undefined) {
    return;
  }

  await prisma.user.updateMany({
    where: { id: referenceId },
    data: { credits },
  });
}

const stripeConfig = process.env.STRIPE_SECRET_KEY
  ? stripe({
      stripeClient: new Stripe(process.env.STRIPE_SECRET_KEY),
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      createCustomerOnSignUp: true,
      // Renewals are granted here rather than from onSubscriptionUpdate:
      // invoice.paid is the only event that means money actually moved.
      onEvent: async (event) => {
        if (event.type !== "invoice.paid") {
          return;
        }

        const invoice = event.data.object;
        const subscriptionRef =
          invoice.parent?.subscription_details?.subscription;
        const stripeSubscriptionId =
          typeof subscriptionRef === "string"
            ? subscriptionRef
            : subscriptionRef?.id;

        // One-off invoices have no subscription — nothing to renew.
        if (!stripeSubscriptionId) {
          return;
        }

        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId },
          select: { referenceId: true, plan: true },
        });

        if (!subscription) {
          return;
        }

        await grantPlanCredits({
          referenceId: subscription.referenceId,
          planName: subscription.plan,
          periodStart: new Date(invoice.period_start * 1000),
        });
      },
      subscription: {
        enabled: true,
        getCheckoutSessionParams: async () => ({
          params: {
            allow_promotion_codes: true,
          },
        }),
        plans: PLANS.map((plan) => ({
          name: plan.name,
          priceId: PRICE_IDS[plan.name] as string,
          limits: {
            credits: plan.credits,
          },
        })),
        // Fires once when checkout completes — the first period's allowance.
        // Subsequent periods come from the invoice.paid handler above.
        onSubscriptionComplete: async ({ subscription, plan }) => {
          if (!subscription) {
            return;
          }

          await grantPlanCredits({
            referenceId: subscription.referenceId,
            planName: plan.name,
            periodStart: subscription.periodStart ?? new Date(),
          });
        },
        // Deliberately does NOT grant: this fires for cancellations, restores,
        // card updates and metadata edits, none of which are payments. It only
        // re-points the allowance at the current plan after an upgrade or
        // downgrade, leaving usage intact.
        onSubscriptionUpdate: async ({ subscription }) => {
          if (subscription.status !== "active") {
            return;
          }

          await setPlanAllowance(subscription.referenceId, subscription.plan);
        },
        onSubscriptionDeleted: async ({ subscription }) => {
          // A user can hold more than one subscription row; only fall back to
          // the free allowance once none of them are live.
          const stillSubscribed = await prisma.subscription.findFirst({
            where: {
              referenceId: subscription.referenceId,
              status: { in: ["active", "trialing"] },
              NOT: { id: subscription.id },
            },
            select: { id: true },
          });

          if (stillSubscribed) {
            return;
          }

          await prisma.user.updateMany({
            where: { id: subscription.referenceId },
            data: {
              credits: FREE_PLAN_CREDITS,
              usage: 0,
              creditsPeriodStart: null,
            },
          });
        },
      },
    })
  : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  user: {
    additionalFields: {
      // input: false keeps these server-controlled — without it the public
      // update-user endpoint would let any user rewrite their own balance
      credits: {
        type: "number",
        required: true,
        defaultValue: 4,
        input: false,
      },
      usage: {
        type: "number",
        required: true,
        defaultValue: 0,
        input: false,
      },
      // Billing period the current allowance was granted for. Makes credit
      // grants idempotent against Stripe's retries and out-of-order delivery.
      creditsPeriodStart: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    emailHarmony(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const emailHtml = await render(VerifyOtp({ validationCode: otp }));
        const text = await render(VerifyOtp({ validationCode: otp }), {
          plainText: true,
        });
        await sendEmail(
          `${otp} is your email verification code`,
          emailHtml,
          text,
          email
        );
      },
    }),
    ...(stripeConfig ? [stripeConfig] : []),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
