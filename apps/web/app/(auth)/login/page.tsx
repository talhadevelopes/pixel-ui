"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import Image from "next/image";

import { API, BASE_URL } from "@/service/api";
import { setAuthTokens } from "@/lib/auth-storage";

type LoginResponse = {
    data: {
        accessToken: string;
        refreshToken?: string;
    };
};

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            toast.error("Email and password are required");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${BASE_URL}${API.auth.login}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.message ?? "Failed to login");
            }

            const result = (await response.json()) as LoginResponse;

            setAuthTokens({
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
            });

            toast.success("Logged in successfully");
            router.push("/");
        } catch (error) {
            console.error("Login failed", error);
            toast.error(error instanceof Error ? error.message : "Failed to login");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to continue.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Email</span>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">Password</span>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full gap-2" type="button" asChild>
                    <a href={`${BASE_URL}${API.auth.google}`}>
                        <Image src="/google-icon.svg" alt="Google" width={18} height={18} />
                        Continue with Google
                    </a>
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link className="text-primary hover:underline" href="/register">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
