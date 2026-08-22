"use client";

import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmailAuthForm } from "@/components/email-auth-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import {
  getPreferences,
  type LastAuthMethod,
  setPreference,
} from "@/lib/preferences";

function LastUsedBadge() {
  return (
    <Badge
      className="absolute -top-2 -right-2 rounded-full bg-background text-[0.65rem] uppercase leading-none shadow-sm"
      variant="outline"
    >
      Last used
    </Badge>
  );
}

interface SocialOrEmailAuthProps {
  pageType: "register" | "login";
}

export function SocialOrEmailAuth({ pageType }: SocialOrEmailAuthProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<LastAuthMethod | null>(
    null
  );
  const [showEmailForm, setShowEmailForm] = useState(false);
  const isRegister = pageType === "register";

  useEffect(() => {
    const preferences = getPreferences();
    setAcceptedTerms(preferences.termsAgreed);
    setLastAuthMethod(preferences.lastAuthMethod);
  }, []);

  const handleTermsAgreementChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    setPreference("termsAgreed", checked);
  };

  const handleAuthMethodUsed = (method: LastAuthMethod) => {
    setLastAuthMethod(method);
    setPreference("lastAuthMethod", method);
  };

  const termsAgreement = (
    <div className="flex items-start gap-3 rounded-md border border-border bg-background/80 p-3 text-left shadow-sm">
      <Checkbox
        aria-label="Agree to the Terms of Service and Privacy Policy"
        checked={acceptedTerms}
        className="mt-0.5"
        id="terms-agreement"
        onCheckedChange={(checked) =>
          handleTermsAgreementChange(checked === true)
        }
      />
      <label
        className="text-muted-foreground text-xs leading-5"
        htmlFor="terms-agreement"
      >
        I agree to the{" "}
        <Link
          className="font-medium underline hover:text-foreground"
          href="/terms-of-service"
          target="_blank"
        >
          Terms of Service
        </Link>{" "}
        and acknowledge the{" "}
        <Link
          className="font-medium underline hover:text-foreground"
          href="/privacy-policy"
          target="_blank"
        >
          Privacy Policy
        </Link>
        .
      </label>
    </div>
  );

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
          <div className="px-4 sm:px-16">{termsAgreement}</div>
          <EmailAuthForm
            acceptedTerms={acceptedTerms}
            onAuthenticated={() => handleAuthMethodUsed("email")}
          />
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
          {termsAgreement}
          <button
            aria-label={
              isRegister ? "Continue with Google" : "Sign in with Google"
            }
            className="relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-foreground px-4 py-2 font-medium text-background shadow-sm transition-colors"
            onClick={async () => {
              if (!acceptedTerms) {
                toast.error(
                  "Accept the Terms of Service and Privacy Policy to continue."
                );
                return;
              }
              try {
                handleAuthMethodUsed("google");
                const data = await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                });
                if (data.error) {
                  toast.error("Failed to sign in with Google!");
                }
              } catch {
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
            {lastAuthMethod === "google" && <LastUsedBadge />}
          </button>
          <button
            aria-label="Continue with Email"
            className="relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 font-medium shadow-sm transition-colors"
            onClick={() => {
              if (!acceptedTerms) {
                toast.error(
                  "Accept the Terms of Service and Privacy Policy to continue."
                );
                return;
              }
              setShowEmailForm(true);
            }}
            type="button"
          >
            Continue with Email
            {lastAuthMethod === "email" && <LastUsedBadge />}
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
    </div>
  );
}
