import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { useEffect, useState } from "react";
import { auth } from "./auth";

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
  const [activeSubscription, setActiveSubscription] = useState<any | null>(
    null
  );

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await authClient.subscription.list();

        if (data?.length === 0) {
          setActiveSubscription(null);
          return;
        }
        // get the active subscription
        const activeSubscription = data?.find(
          (sub) => sub.status === "active" || sub.status === "trialing"
        );
        setActiveSubscription(activeSubscription);
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
