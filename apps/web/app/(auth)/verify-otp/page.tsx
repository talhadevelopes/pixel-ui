"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { setAuthTokens } from "@/lib/auth-storage";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/mutations/useAuthMutations";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const emailParam = useMemo(() => (searchParams?.get("email") || "").trim(), [searchParams]);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const verifyMutation = useVerifyOtpMutation({
    onSuccess: (tokens) => {
      setAuthTokens(tokens);
      toast.success("Registration verified. You're logged in!");
      router.push("/");
    },
    onError: (error) => {
      console.error("Verify OTP failed", error);
      toast.error(error.message);
    },
  });

  const resendMutation = useResendOtpMutation({
    onSuccess: () => {
      toast.success("OTP resent to your email");
    },
    onError: (error) => {
      console.error("Resend OTP failed", error);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!emailParam) {
      toast.error("Missing email. Please register again.");
      router.replace("/register");
    }
  }, [emailParam, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.trim();
    if (!emailParam) return;
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    try {
      await verifyMutation.mutateAsync({ email: emailParam, otp: code });
    } catch (error) {
      if (!(error instanceof Error)) {
        toast.error("Failed to verify OTP");
      }
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;
    try {
      await resendMutation.mutateAsync({ email: emailParam });
    } catch (error) {
      if (!(error instanceof Error)) {
        toast.error("Failed to resend OTP");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium">{emailParam || "your email"}</span>.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <span className="text-sm font-medium">Enter code</span>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              disabled={verifyMutation.isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <button
            type="button"
            className="text-primary hover:underline disabled:opacity-60"
            onClick={handleResend}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? "Resending..." : "Resend code"}
          </button>
          <Link className="text-primary hover:underline" href="/register">
            Change email
          </Link>
        </div>
      </div>
    </div>
  );
}
