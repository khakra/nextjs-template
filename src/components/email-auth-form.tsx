import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const emailSchema = z.object({
  email: z.string().email(),
});

export function EmailAuthForm({
  acceptedTerms,
  defaultEmail = "",
  onAuthenticated,
}: {
  acceptedTerms: boolean;
  defaultEmail?: string;
  onAuthenticated?: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error(
        "Accept the Terms of Service and Privacy Policy to continue."
      );
      return;
    }
    setLoading(true);
    try {
      const { email: validatedEmail } = emailSchema.parse({ email });
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: validatedEmail,
        type: "sign-in",
      });
      if (error) {
        console.info("Failed to send verification code", error);
        if (error.code === "INVALID_EMAIL") {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error("Failed to send verification code!");
        }
      } else {
        toast.success("Verification code sent! Please check your inbox.");
        setShowEmailForm(false);
        setShowOtpInput(true);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error(
        "Accept the Terms of Service and Privacy Policy to continue."
      );
      return;
    }
    const { error } = await authClient.signIn.emailOtp({
      email,
      otp,
    });
    if (error) {
      toast.error("Failed to verify OTP! Try with a different email.");
    } else {
      toast.success("Login Code Verified!");
      onAuthenticated?.();
      setShowEmailForm(false);
      setShowOtpInput(false);
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Use full page navigation to ensure session cookie is sent
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  return (
    <form
      className="flex flex-col gap-4 px-4 sm:px-16"
      onSubmit={showOtpInput ? handleOtpSubmit : handleEmailSubmit}
    >
      {showEmailForm ? (
        <>
          <h4 className="mb-2 text-center text-md">
            What&apos;s Your Email Address?
          </h4>
          <div className="flex flex-col gap-2">
            <Input
              autoComplete="email"
              autoFocus
              className="text-md outline-none focus-visible:ring-0 md:text-sm"
              disabled={loading || showOtpInput}
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              type="email"
              value={email}
            />
          </div>
          <button
            className="w-full cursor-pointer rounded-md bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Sending..." : "Continue with Email"}
          </button>
        </>
      ) : null}
      {showOtpInput ? (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="mb-2 text-center font-normal">
            We&apos;ve sent you a temporary login code. <br />
            Please check your inbox at {email}
          </div>
          <InputOTP
            maxLength={6}
            onChange={(value) => setOtp(value)}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <button
            className="mt-2 w-3/4 cursor-pointer rounded-md bg-foreground px-4 py-2 font-medium text-background"
            disabled={otp.length === 0}
            type="submit"
          >
            {loading ? "Verifying..." : "Verify Login Code"}
          </button>
        </div>
      ) : null}

      {showEmailForm || showOtpInput ? null : (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Logging you in...</p>
        </div>
      )}
    </form>
  );
}
