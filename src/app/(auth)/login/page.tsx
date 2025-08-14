"use client";

import { SocialOrEmailAuth } from "@/app/components/social-or-email-auth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.id) {
      router.push("/dashboard");
    }
  }, [session?.user?.id, router]);

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <SocialOrEmailAuth pageType="login" />
    </div>
  );
}
