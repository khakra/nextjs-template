import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SocialOrEmailAuth } from "@/components/social-or-email-auth";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

// Resolving the session on the server means a signed-in visitor is redirected
// before any of this page is sent, and a signed-out one gets the form in the
// first response instead of a skeleton followed by a client-side session fetch.
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <SocialOrEmailAuth pageType="login" />
    </div>
  );
}
