import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EmailAuthForm } from "@/components/email-auth-form";
import { authClient } from "@/lib/auth-client";

type SocialOrEmailAuthProps = {
  pageType: "register" | "login";
};

export function SocialOrEmailAuth({ pageType }: SocialOrEmailAuthProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const isRegister = pageType === "register";

  return (
    <div className="flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl">
      {!showEmailForm && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl">
            {isRegister ? "Sign Up" : "Sign In"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isRegister
              ? "Choose your preferred method"
              : "Use your email or Google to sign in"}
          </p>
        </div>
      )}
      {showEmailForm ? (
        <>
          <EmailAuthForm />
          <button
            className="mx-auto mt-2 flex cursor-pointer items-center gap-2 text-sm hover:underline"
            onClick={() => setShowEmailForm(false)}
            type="button"
          >
            <ArrowLongLeftIcon className="size-4" /> back to{" "}
            {isRegister ? "signup" : "login"}
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4 px-4 sm:px-16">
          <button
            aria-label={
              isRegister ? "Continue with Google" : "Sign in with Google"
            }
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-foreground px-4 py-2 font-medium text-background shadow-sm transition-colors"
            onClick={async () => {
              try {
                const data = await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                });
                if (data.error) {
                  toast.error("Failed to sign in with Google!");
                }
              } catch (_err) {
                toast.error("Failed to sign in with Google!");
              }
            }}
            type="button"
          >
            <Image
              alt="Google"
              className="size-5"
              height={20}
              src="/google-icon.svg"
              width={20}
            />
            {isRegister ? "Continue with Google" : "Sign in with Google"}
          </button>
          <button
            aria-label="Continue with Email"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 font-medium shadow-sm transition-colors"
            onClick={() => setShowEmailForm(true)}
            type="button"
          >
            Continue with Email
          </button>
          <div>
            <p className="mt-4 text-center text-muted-foreground text-sm">
              {isRegister ? (
                <>
                  {"Already have an account? "}
                  <Link className="font-semibold hover:underline" href="/login">
                    Sign in
                  </Link>
                  {" instead."}
                </>
              ) : (
                <>
                  {"Don't have an account? "}
                  <Link
                    className="font-semibold hover:underline"
                    href="/register"
                  >
                    Sign up
                  </Link>
                  {" for free."}
                </>
              )}
            </p>
          </div>
        </div>
      )}
      <p className="mt-4 px-4 text-center text-muted-foreground text-xs sm:px-16">
        By signing up or logging in, you agree to our{" "}
        <Link
          className="text-muted-foreground underline"
          href="/privacy-policy"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          className="text-muted-foreground underline"
          href="/terms-of-service"
        >
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
