"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const RETURN_URL = "/dashboard/billing";

// Each action either redirects to Stripe (the auth client follows the
// returned URL) or, for resume, updates in place and reloads.
function useAction(action: () => Promise<{ error: unknown }>) {
  const [pending, setPending] = useState(false);
  const run = async () => {
    setPending(true);
    const { error } = await action();
    if (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Something went wrong. Please try again.";
      toast.error(message);
      setPending(false);
    }
  };
  return { pending, run };
}

export function ManageBillingButton() {
  const { pending, run } = useAction(() =>
    authClient.subscription.billingPortal({ returnUrl: RETURN_URL })
  );
  return (
    <Button disabled={pending} onClick={run} variant="outline">
      {pending ? "Opening…" : "Invoices & payment method"}
    </Button>
  );
}

export function CancelSubscriptionButton() {
  const { pending, run } = useAction(() =>
    authClient.subscription.cancel({ returnUrl: RETURN_URL })
  );
  return (
    <Button disabled={pending} onClick={run} variant="ghost">
      {pending ? "Opening…" : "Cancel subscription"}
    </Button>
  );
}

export function ResumeSubscriptionButton() {
  const { pending, run } = useAction(async () => {
    const result = await authClient.subscription.restore();
    if (!result.error) {
      window.location.reload();
    }
    return result;
  });
  return (
    <Button disabled={pending} onClick={run}>
      {pending ? "Resuming…" : "Resume subscription"}
    </Button>
  );
}

export function ChangePlanButton({
  plan,
  subscriptionId,
  label,
}: {
  plan: string;
  subscriptionId?: string;
  label: string;
}) {
  const { pending, run } = useAction(() =>
    authClient.subscription.upgrade({
      plan,
      subscriptionId,
      successUrl: RETURN_URL,
      cancelUrl: RETURN_URL,
      returnUrl: RETURN_URL,
    })
  );
  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={run}
      variant="outline"
    >
      {pending ? "Redirecting…" : label}
    </Button>
  );
}
