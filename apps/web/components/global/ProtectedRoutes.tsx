"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAccessToken } from "@/lib/auth-storage";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/verify-otp", "/auth/google/callback"]);
const AUTH_REDIRECT_PATHS = new Set(["/login", "/register", "/verify-otp"]);

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [hasToken, setHasToken] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            return false;
        }
        return Boolean(getAccessToken());
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleAuthChange = () => {
            setHasToken(Boolean(getAccessToken()));
        };

        window.addEventListener("auth-change", handleAuthChange);
        handleAuthChange();

        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, []);

    useEffect(() => {
        const isPublicRoute = PUBLIC_PATHS.has(pathname);

        if (!hasToken) {
            if (!isPublicRoute) {
                router.replace("/login");
                return; // keep checking=true to avoid flashing protected UI
            }
            setIsChecking(false);
            return;
        }

        if (AUTH_REDIRECT_PATHS.has(pathname)) {
            router.replace("/workspace");
            return; // keep checking=true during redirect
        }

        setIsChecking(false);
    }, [hasToken, pathname, router]);

    if (isChecking && !PUBLIC_PATHS.has(pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow">
                    Checking authentication...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
