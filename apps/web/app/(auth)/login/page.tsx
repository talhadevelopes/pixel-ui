"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

    const handleSubmit = async (event: any) => {
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
        <div className="min-h-screen bg-background text-foreground flex justify-center relative overflow-hidden">
            {/* Ocean Gradient Background */}
            <div
                className="absolute top-1/3 right-20 w-96 h-96 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/10 dark:bg-accent/10 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "4s" }}
            />

            {/* Light rays effect */}
            <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-primary/30 to-transparent blur-2xl" />
                <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-accent/20 to-transparent blur-2xl" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-primary/40 dark:bg-primary/40 rounded-full animate-bubble-rise"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-screen-xl m-0 sm:m-10 bg-card/50 dark:bg-card/30 backdrop-blur-xl shadow-2xl sm:rounded-lg flex justify-center flex-1 border border-border/50 relative z-10">
                <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                   
                    <div className="mt-12 flex flex-col items-center">
                        <div className="w-full flex-1 mt-8">
                            {/* Badge */}
                           

                            <div className="flex flex-col items-center">
                                
                                 <a   href={`${BASE_URL}${API.auth.google}`}
                                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-primary/10 dark:bg-primary/20 text-foreground flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow-lg hover:shadow-primary/20 border border-primary/30 hover:border-primary/50"
                                >
                                    <div className="bg-card p-2 rounded-full">
                                        <svg className="w-4" viewBox="0 0 533.5 544.3">
                                            <path
                                                d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                                                fill="#4285f4"
                                            />
                                            <path
                                                d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                                                fill="#34a853"
                                            />
                                            <path
                                                d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                                                fill="#fbbc04"
                                            />
                                            <path
                                                d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                                                fill="#ea4335"
                                            />
                                        </svg>
                                    </div>
                                    <span className="ml-4">Sign In with Google</span>
                                </a>
                            </div>

                            <div className="my-12 border-b border-border text-center">
                                <div className="leading-none px-2 inline-block text-sm text-muted-foreground tracking-wide font-medium bg-card transform translate-y-1/2">
                                    Or sign in with E-mail
                                </div>
                            </div>

                            <div className="mx-auto max-w-xs">
                                <input
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-input border border-border placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:bg-card transition-all duration-300"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={loginMutation.isPending}
                                />
                                <input
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-input border border-border placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:bg-card mt-5 transition-all duration-300"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={loginMutation.isPending}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={loginMutation.isPending}
                                    className="mt-5 tracking-wide font-semibold bg-primary text-primary-foreground w-full py-4 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:opacity-50"
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-6 h-6 -ml-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <path d="M20 8v6M23 11h-6" />
                                            </svg>
                                            <span className="ml-3">Sign In</span>
                                        </>
                                    )}
                                </button>
                                <p className="mt-6 text-xs text-muted-foreground text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" className="border-b border-primary/50 border-dotted text-primary hover:text-accent transition-colors">
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-primary/5 dark:bg-primary/10 text-center hidden lg:flex relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10"></div>
                    <div className="relative z-10 flex items-center justify-center w-full p-12">
                        <div className="text-left max-w-md space-y-6">
                            <h2 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                                Design with AI
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Generate responsive Tailwind UI layouts in seconds with our AI-powered design studio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}