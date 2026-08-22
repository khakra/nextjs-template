"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
  const { data: session, isPending } = authClient.useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const startCheckout = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setIsRedirecting(true);

    const { error } = await authClient.subscription.upgrade({
      plan,
      successUrl: "/dashboard",
      cancelUrl: "/#pricing",
    });

    // On success the browser is redirected to Stripe, so this only runs on failure.
    if (error) {
      toast.error(
        error.message ?? "Could not start checkout. Please try again."
      );
      setIsRedirecting(false);
    }
  };

  return (
    <button
      aria-describedby={planLabelledBy}
      className={className}
      disabled={isPending || isRedirecting}
      onClick={startCheckout}
      type="button"
    >
      {isRedirecting ? "Redirecting…" : "Buy plan"}
    </button>
  );
}
