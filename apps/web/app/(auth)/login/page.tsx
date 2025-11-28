"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@workspace/ui";
import Image from "next/image";
import { setAuthTokens } from "@/lib/auth-storage";
import { API, BASE_URL } from "@/services/api";
import { useLoginMutation } from "@/mutations/";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const loginMutation = useLoginMutation({
        onSuccess: (tokens) => {
            setAuthTokens(tokens);
            toast.success("Logged in successfully");
            router.replace("/workspace");
        },
        onError: (error) => {
            console.error("Login failed", error);
            toast.error(error.message);
        },
    });

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            toast.error("Email and password are required");
            return;
        }

        try {
            await loginMutation.mutateAsync({ email: trimmedEmail, password: trimmedPassword });
        } catch (error) {
            if (!(error instanceof Error)) {
                toast.error("Failed to login");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Sign in to continue designing with Pixel-UI
                        </p>
                    </div>

                    {/* Login Form Card */}
                    <div className="space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg backdrop-blur-sm">
                        <div className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    disabled={loginMutation.isPending}
                                    className="h-11 bg-input border-border hover:border-primary/50 focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-accent" />
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loginMutation.isPending}
                                    className="h-11 bg-input border-border hover:border-primary/50 focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm text-primary hover:text-accent transition-colors font-semibold">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loginMutation.isPending}
                                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:from-muted disabled:to-muted disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg text-background flex items-center justify-center gap-2 group mt-2"
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground font-medium">or continue with</span>
                            </div>
                        </div>

                        {/* Google OAuth Button */}
                        <a
                            href={`${BASE_URL}${API.auth.google}`}
                            className="w-full h-11 border-2 border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 font-semibold text-foreground group"
                        >
                            <Image src="/google-icon.svg" alt="Google" width={18} height={18} />
                            <span>Google</span>
                        </a>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link className="text-primary font-semibold hover:text-accent transition-colors" href="/register">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}