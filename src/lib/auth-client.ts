import { stripeClient } from "@better-auth/stripe/client";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useEffect, useState } from "react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    stripeClient({
      subscription: true,
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});

export function useSubscription() {
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await authClient.subscription.list();

        if (data?.length === 0) {
          setActiveSubscription(null);
          return;
        }
        // get the active subscription
        const foundSubscription = data?.find(
          (sub) => sub.status === "active" || sub.status === "trialing"
        );
        setActiveSubscription(foundSubscription);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
      }
    };

    fetchSubscriptions();
  }, []);

  return {
    activeSubscription,
  };
}

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
type Subscription = Awaited<
  ReturnType<typeof authClient.subscription.list>
>["data"][number];
