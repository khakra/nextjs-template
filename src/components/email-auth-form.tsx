import { useState, useEffect } from "react";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const emailSchema = z.object({
  email: z.string().email(),
});

export function EmailAuthForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email: validatedEmail } = emailSchema.parse({ email });
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
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
    const { data, error } = await authClient.signIn.emailOtp({
      email: email,
      otp: otp,
    });
    if (error) {
      toast.error("Failed to verify OTP! Try with a different email.");
    } else {
      toast.success("Login Code Verified!");
      setShowEmailForm(false);
      setShowOtpInput(false);
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Use a small timeout to ensure state updates have been processed
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, router]);

  return (
    <form
      onSubmit={showOtpInput ? handleOtpSubmit : handleEmailSubmit}
      className="flex flex-col gap-4 px-4 sm:px-16"
    >
      {showEmailForm && (
        <>
          <h4 className="text-md text-center mb-2">
            What&apos;s Your Email Address?
          </h4>
          <div className="flex flex-col gap-2">
            <Input
              id="email"
              name="email"
              className="text-md md:text-sm outline-none focus-visible:ring-0"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || showOtpInput}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-foreground text-background font-medium disabled:opacity-60 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Sending..." : "Continue with Email"}
          </button>
        </>
      )}
      {showOtpInput && (
        <div className="flex flex-col gap-2 mt-4 items-center">
          <div className="text-zinc-600 font-normal dark:text-zinc-400 text-center mb-2">
            We&apos;ve sent you a temporary login code. <br />
            Please check your inbox at {email}
          </div>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={(value) => setOtp(value)}
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
            type="submit"
            className="w-3/4 py-2 px-4 rounded-md bg-primary text-white dark:text-black font-medium mt-2 cursor-pointer"
            disabled={otp.length === 0}
          >
            {loading ? "Verifying..." : "Verify Login Code"}
          </button>
        </div>
      )}

      {!showEmailForm && !showOtpInput && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Logging you in...</p>
        </div>
      )}
    </form>
  );
}
