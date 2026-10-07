"use client";

import { IconSpy } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ImpersonateButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function impersonate() {
    setPending(true);
    const { error } = await authClient.admin.impersonateUser({ userId });
    if (error) {
      toast.error(error.message ?? "Failed to impersonate user");
      setPending(false);
      return;
    }
    // Full navigation so every server component and cached client state is
    // rebuilt for the impersonated session.
    window.location.assign("/dashboard");
  }

  return (
    <Button
      disabled={disabled || pending}
      onClick={impersonate}
      size="sm"
      variant="outline"
    >
      <IconSpy />
      {pending ? "Switching…" : "Impersonate"}
    </Button>
  );
}

export function StopImpersonatingButton() {
  const [pending, setPending] = useState(false);

  async function stop() {
    setPending(true);
    const { error } = await authClient.admin.stopImpersonating();
    if (error) {
      toast.error(error.message ?? "Failed to stop impersonating");
      setPending(false);
      return;
    }
    window.location.assign("/dashboard/admin");
  }

  return (
    <Button disabled={pending} onClick={stop} size="sm" variant="secondary">
      {pending ? "Returning…" : "Stop impersonating"}
    </Button>
  );
}
