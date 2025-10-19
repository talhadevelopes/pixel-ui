"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { useRegisterStartMutation } from "@/mutations/useAuthMutations";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const registerMutation = useRegisterStartMutation({
        onSuccess: ({ email }) => {
            toast.success("OTP sent to your email");
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        },
        onError: (error) => {
            console.error("Register failed", error);
            toast.error(error.message);
        },
    });

    const handleSubmit = async (event : any) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            toast.error("All fields are required");
            return;
        }

        try {
            await registerMutation.mutateAsync({
                name: trimmedName,
                email: trimmedEmail,
                password: trimmedPassword,
            });
        } catch (error) {
            if (!(error instanceof Error)) {
                toast.error("Failed to register");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>

            <div className="relative z-10 w-full max-w-6xl">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Form */}
                    <div className="w-full">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Create Account
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Join us and start designing with Pixel-UI
                                </p>
                            </div>

                            <div className="space-y-5" onSubmit={handleSubmit}>
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" />
                                        Full Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Jane Doe"
                                        required
                                        disabled={registerMutation.isPending}
                                        className="h-11 bg-input border-border hover:border-primary/50 focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
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
                                        disabled={registerMutation.isPending}
                                        className="h-11 bg-input border-border hover:border-primary/50 focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-primary" />
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={registerMutation.isPending}
                                        className="h-11 bg-input border-border hover:border-primary/50 focus:border-primary transition-colors"
                                    />
                                </div>

                                <Button 
                                    onClick={handleSubmit}
                                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl group mt-2"
                                    disabled={registerMutation.isPending}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {registerMutation.isPending ? "Creating account..." : "Sign Up"}
                                        {!registerMutation.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </Button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link className="text-primary font-semibold hover:text-accent transition-colors" href="/login">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Timeline */}
                    <div className="hidden md:flex flex-col items-center justify-center">
                        <div className="w-full max-w-xs">
                            {/* Timeline Container */}
                            <div className="space-y-8">
                                {/* Step 1 - Create Account (Active) */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                                            <User className="w-6 h-6 text-background" />
                                        </div>
                                        <div className="w-1 h-16 bg-gradient-to-b from-primary to-accent/30 mt-2"></div>
                                    </div>
                                    <div className="flex flex-col justify-start pt-2">
                                        <h3 className="text-lg font-bold text-foreground">Create Account</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Fill in your details
                                        </p>
                                        <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                                            <p className="text-xs font-medium text-primary">Current Step</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 - Verify OTP */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-lg ring-4 ring-muted/30">
                                            <Mail className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="w-1 h-16 bg-gradient-to-b from-muted/50 to-transparent mt-2"></div>
                                    </div>
                                    <div className="flex flex-col justify-start pt-2">
                                        <h3 className="text-lg font-semibold text-foreground/60">Verify OTP</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Check your email for code
                                        </p>
                                        <div className="mt-3 px-3 py-2 rounded-lg bg-muted/50">
                                            <p className="text-xs font-medium text-muted-foreground">Pending</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 - Account Ready */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-lg ring-4 ring-muted/30">
                                            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-start pt-2">
                                        <h3 className="text-lg font-semibold text-foreground/60">Account Ready</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Start designing now
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="mt-12 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30 backdrop-blur-sm">
                                <div className="flex gap-3">
                                    <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Takes 2 minutes</p>
                                        <p className="text-xs text-muted-foreground mt-1">Quick setup to access all features</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}