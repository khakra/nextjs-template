"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SocialOrEmailAuth } from "@/components/social-or-email-auth";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.id) {
      router.push("/dashboard");
    }
  }, [session?.user?.id, router]);

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <SocialOrEmailAuth pageType="register" />
    </div>
  );
}
