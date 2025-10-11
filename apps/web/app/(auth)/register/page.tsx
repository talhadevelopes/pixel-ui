"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { useRegisterMutation } from "@/mutations/useAuthMutations";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const registerMutation = useRegisterMutation({
        onSuccess: () => {
            toast.success("Account created. Please log in to continue.");
            router.push("/login");
        },
        onError: (error) => {
            console.error("Register failed", error);
            toast.error(error.message);
        },
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Sign up to start designing with Pixel-UI.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Name</span>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Jane Doe"
                            required
                            disabled={registerMutation.isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">Email</span>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={registerMutation.isPending}
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
                            disabled={registerMutation.isPending}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link className="text-primary hover:underline" href="/login">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
