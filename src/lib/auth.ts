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

// referenceId is the user id here because customerType defaults to "user".
// updateMany rather than update so a webhook for a deleted user is a no-op
// instead of an exception the plugin would swallow.
async function setUserCredits(referenceId: string, credits: number) {
  await prisma.user.updateMany({
    where: { id: referenceId },
    data: { credits, usage: 0 },
  });
}

const stripeConfig = process.env.STRIPE_SECRET_KEY
  ? stripe({
      stripeClient: new Stripe(process.env.STRIPE_SECRET_KEY),
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      createCustomerOnSignUp: true,
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
        // Without these hooks a paid subscription never reaches the user record:
        // the plan's credit allowance is config the app would otherwise ignore.
        onSubscriptionComplete: async ({ subscription, plan }) => {
          const credits = getPlanCredits(plan.name);
          if (credits !== undefined) {
            await setUserCredits(subscription.referenceId, credits);
          }
        },
        onSubscriptionUpdate: async ({ subscription }) => {
          // Fires on plan changes and renewals; re-apply the current allowance.
          if (subscription.status !== "active") {
            return;
          }
          const credits = getPlanCredits(subscription.plan);
          if (credits !== undefined) {
            await setUserCredits(subscription.referenceId, credits);
          }
        },
        onSubscriptionDeleted: async ({ subscription }) => {
          await setUserCredits(subscription.referenceId, FREE_PLAN_CREDITS);
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
