import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Input } from "@workspace/ui";

import { setAuthTokens } from "@/lib/auth-storage";
import {
    useResendOtpMutation,
    useVerifyOtpMutation,
} from "@/mutations/";

export default function VerifyOtpContent() {
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

    const handleSubmit = async (e: any) => {
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
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12 overflow-hidden relative">
                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>

                <div className="relative z-10 w-full max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left Side - OTP Form */}
                        <div className="w-full">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Link href="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to register
                                    </Link>
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        Verify Email
                                    </h1>
                                    <p className="text-lg text-muted-foreground">
                                        We sent a 6-digit code to <span className="font-semibold text-foreground">{emailParam || "your email"}</span>
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* OTP Input */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            Verification Code
                                        </label>
                                        <Input
                                            id="otp"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="000000"
                                            required
                                            disabled={verifyMutation.isPending}
                                            className="h-14 bg-input border-2 border-border text-center text-3xl tracking-widest font-semibold hover:border-primary/50 focus:border-primary transition-colors"
                                        />
                                        <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</p>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={verifyMutation.isPending || otp.length !== 6}
                                        className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg text-background flex items-center justify-center gap-2 group"
                                    >
                                        {verifyMutation.isPending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Verify Code
                                                <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Action Links */}
                                <div className="pt-6 border-t border-border space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendMutation.isPending}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {resendMutation.isPending ? "Resending..." : "Resend Code"}
                                    </button>
                                    <Link href="/register" className="w-full flex items-center justify-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                        Use Different Email
                                    </Link>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                                    <p className="text-xs text-muted-foreground">
                                        The code will expire in <span className="font-semibold text-foreground">10 minutes</span>. If you don't see the email, check your spam folder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Timeline */}
                        <div className="hidden md:flex flex-col items-center justify-center">
                            <div className="w-full max-w-xs">
                                {/* Timeline Container */}
                                <div className="space-y-8">
                                    {/* Step 1 - Create Account (Completed) */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                                                <CheckCircle2 className="w-6 h-6 text-background" />
                                            </div>
                                            <div className="w-1 h-16 bg-gradient-to-b from-primary to-accent/30 mt-2"></div>
                                        </div>
                                        <div className="flex flex-col justify-start pt-2">
                                            <h3 className="text-lg font-bold text-foreground line-through opacity-60">Create Account</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Account created successfully
                                            </p>
                                            <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 inline-w-fit">
                                                <p className="text-xs font-medium text-primary">Completed</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 - Verify OTP (Active) */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg ring-4 ring-primary/20 relative">
                                                <Mail className="w-6 h-6 text-background" />
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur animate-pulse"></div>
                                            </div>
                                            <div className="w-1 h-16 bg-gradient-to-b from-accent to-accent/30 mt-2"></div>
                                        </div>
                                        <div className="flex flex-col justify-start pt-2">
                                            <h3 className="text-lg font-bold text-foreground">Verify Email</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Enter the code sent to your inbox
                                            </p>
                                            <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 inline-w-fit">
                                                <p className="text-xs font-medium text-primary">Current Step</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 - Account Ready (Pending) */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-lg ring-4 ring-muted/30">
                                                <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-start pt-2">
                                            <h3 className="text-lg font-semibold text-foreground/60">All Set</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Start designing with Pixel-UI
                                            </p>
                                            <div className="mt-3 px-3 py-2 rounded-lg bg-muted/50 inline-w-fit">
                                                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="mt-12 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30 backdrop-blur-sm">
                                    <div className="flex gap-3">
                                        <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Almost there!</p>
                                            <p className="text-xs text-muted-foreground mt-1">Verify your email to complete registration</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>

    );
}
