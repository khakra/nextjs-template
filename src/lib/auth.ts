import { stripe } from "@better-auth/stripe";
import { render } from "@react-email/components";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { emailHarmony } from "better-auth-harmony";
import Stripe from "stripe";
import VerifyOtp from "@/emails/verify-otp";
import { sendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";

if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET must be set when STRIPE_SECRET_KEY is set, otherwise subscription webhooks are silently dropped"
  );
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
        plans: [
          {
            name: "starter",
            priceId: process.env.STRIPE_PRICE_ID_STARTER as string,
            limits: {
              credits: 20,
            },
          },
          {
            name: "pro",
            priceId: process.env.STRIPE_PRICE_ID_PRO as string,
            limits: {
              credits: 50,
            },
          },
          {
            name: "expert",
            priceId: process.env.STRIPE_PRICE_ID_EXPERT as string,
            limits: {
              credits: 100,
            },
          },
        ],
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
