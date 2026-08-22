import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SocialOrEmailAuth } from "@/components/social-or-email-auth";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

// See the note in login/page.tsx — the session is resolved server-side so a
// signed-in visitor never downloads this route.
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <SocialOrEmailAuth pageType="register" />
    </div>
  );
}
