import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/lib/mail";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import prisma from "@/prisma/index";
import { emailHarmony } from "better-auth-harmony";
import { render } from "@react-email/components";
import VerifyOtp from "@/emails/verify-otp";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  user: {
    additionalFields: {
      credits: {
        type: "number",
        required: true,
        defaultValue: 4,
      },
      usage: {
        type: "number",
        required: true,
        defaultValue: 0,
      },
    },
  },
  plugins: [
    emailHarmony(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("Sending OTP:", { email, otp, type });
        const emailHtml = await render(VerifyOtp({ validationCode: otp }));
        const text = await render(VerifyOtp({ validationCode: otp }), {
          plainText: true,
        });
        sendEmail(
          `${otp} is your email verification code`,
          emailHtml,
          text,
          email
        );
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        getCheckoutSessionParams: async (
          { user, session, plan, subscription },
          request
        ) => {
          return {
            params: {
              allow_promotion_codes: true,
            },
          };
        },
        plans: [
          {
            name: "starter",
            priceId:
              process.env.NODE_ENV === "development"
                ? "price_1RapsBE39VkEJfMLgZaaYdds"
                : "price_1QWrlQE39VkEJfMLUmUg5Vpv",
            limits: {
              credits: 20,
            },
          },
          {
            name: "pro",
            priceId:
              process.env.NODE_ENV === "development"
                ? "price_1RapsrE39VkEJfMLsWVV37zr"
                : "price_1QWrlOE39VkEJfML0jhgqhRp",
            limits: {
              credits: 50,
            },
          },
          {
            name: "expert",
            priceId:
              process.env.NODE_ENV === "development"
                ? "price_1RaptVE39VkEJfML1lKOwX9t"
                : "price_1QWrlME39VkEJfMLhpNbzPgx",
            limits: {
              credits: 100,
            },
          },
        ],
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
