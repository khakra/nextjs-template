"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthSkeleton } from "@/components/auth-skeleton";
import { SocialOrEmailAuth } from "@/components/social-or-email-auth";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hasResolvedSession, setHasResolvedSession] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setHasResolvedSession(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (session?.user?.id) {
      router.replace("/dashboard");
    }
  }, [session?.user?.id, router]);

  const showInitialSkeleton = !hasResolvedSession && isPending;
  const isRedirecting = Boolean(session?.user?.id);

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      {showInitialSkeleton || isRedirecting ? (
        <AuthSkeleton />
      ) : (
        <SocialOrEmailAuth pageType="register" />
      )}
    </div>
  );
}
