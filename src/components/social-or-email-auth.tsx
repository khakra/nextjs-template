import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmailAuthForm } from "@/components/email-auth-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";

interface SocialOrEmailAuthProps {
  pageType: "register" | "login";
}

export function SocialOrEmailAuth({ pageType }: SocialOrEmailAuthProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();
  const isRegister = pageType === "register";

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl gap-4 flex flex-col">
      {!showEmailForm && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold">
            {isRegister ? "Sign Up" : "Sign In"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRegister
              ? "Choose your preferred method"
              : "Use your email or Google to sign in"}
          </p>
        </div>
      )}
      {!showEmailForm ? (
        <div className="flex flex-col gap-4 px-4 sm:px-16">
          <button
            type="button"
            className="flex items-center justify-center w-full gap-2 py-2 px-4 border bg-foreground text-background rounded-md shadow-sm transition-colors font-medium cursor-pointer"
            onClick={async () => {
              try {
                const data = await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                });
                if (data.error) {
                  toast.error("Failed to sign in with Google!");
                }
              } catch (err) {
                toast.error("Failed to sign in with Google!");
              }
            }}
            aria-label={
              isRegister ? "Continue with Google" : "Sign in with Google"
            }
          >
            <Image
              src="/google-icon.svg"
              alt="Google"
              width={20}
              height={20}
              className="size-5"
            />
            {isRegister ? "Continue with Google" : "Sign in with Google"}
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-full gap-2 py-2 px-4 border rounded-md shadow-sm transition-colors font-medium cursor-pointer"
            onClick={() => setShowEmailForm(true)}
            aria-label="Continue with Email"
          >
            Continue with Email
          </button>
          <div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRegister ? (
                <>
                  {"Already have an account? "}
                  <Link
                    href="/login"
                    className="font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                  {" instead."}
                </>
              ) : (
                <>
                  {"Don't have an account? "}
                  <Link
                    href="/register"
                    className="font-semibold hover:underline"
                  >
                    Sign up
                  </Link>
                  {" for free."}
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <EmailAuthForm />
          <button
            type="button"
            className="flex items-center gap-2 mx-auto mt-2 text-sm hover:underline cursor-pointer"
            onClick={() => setShowEmailForm(false)}
          >
            <ArrowLongLeftIcon className="size-4" /> back to{" "}
            {isRegister ? "signup" : "login"}
          </button>
        </>
      )}
      <p className="px-4 mt-4 text-xs text-center text-muted-foreground sm:px-16">
        By signing up or logging in, you agree to our{" "}
        <Link
          href="/privacy-policy"
          className="underline text-muted-foreground"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms-of-service"
          className="underline text-muted-foreground"
        >
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
