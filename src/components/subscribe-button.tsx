"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface SubscribeButtonProps {
  plan: string;
  planLabelledBy: string;
  className: string;
}

export function SubscribeButton({
  plan,
  planLabelledBy,
  className,
}: SubscribeButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setError(null);
    setIsRedirecting(true);

    const result = await authClient.subscription.upgrade({
      plan,
      successUrl: "/dashboard",
      cancelUrl: "/#pricing",
    });

    // On success the browser is redirected to Stripe, so this only runs on failure.
    if (result.error) {
      setError(
        result.error.message ?? "Could not start checkout. Please try again."
      );
      setIsRedirecting(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-2">
      <button
        aria-describedby={planLabelledBy}
        className={className}
        // Not gated on the session request: this renders on a static page, so
        // disabling until it resolves would ship a dead button in the HTML. An
        // unresolved session simply routes to /login.
        disabled={isRedirecting}
        onClick={startCheckout}
        type="button"
      >
        {isRedirecting ? "Redirecting…" : "Buy plan"}
      </button>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
