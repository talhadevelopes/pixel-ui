"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { exchangeGoogleCode } from "@/services/google-auth";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Processing Google sign-in...");
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) {
            return;
        }

        const handleCallback = async () => {
            hasProcessed.current = true;

            const code = searchParams.get("code");
            const returnedError = searchParams.get("error");

            if (returnedError) {
                setStatus("Google authentication was cancelled or failed.");
                setTimeout(() => router.replace("/login?error=google_cancelled"), 2000);
                return;
            }

            if (!code) {
                setStatus("Missing authorization code from Google.");
                setTimeout(() => router.replace("/login?error=google_missing_code"), 2000);
                return;
            }

            try {
                setStatus("Finalising Google login...");
                await exchangeGoogleCode(code);
                setStatus("Google login successful! Redirecting...");

                setTimeout(() => router.replace("/workspace"), 1200);
            } catch (error) {
                console.error("Google login failed", error);
                const message = error instanceof Error ? error.message : "google_login_failed";
                setStatus("Failed to complete Google login.");
                setTimeout(() => router.replace(`/login?error=${encodeURIComponent(message)}`), 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="rounded-xl border border-border bg-card px-8 py-10 text-center shadow">
                <h2 className="text-2xl font-semibold">Completing Google Sign-In</h2>
                <p className="mt-4 text-sm text-muted-foreground">{status}</p>
                <p className="mt-6 text-xs text-muted-foreground">
                    If this takes more than a few seconds, you will be redirected automatically.
                </p>
            </div>
        </div>
    );
}