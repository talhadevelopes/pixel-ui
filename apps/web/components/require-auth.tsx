"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAccessToken } from "@/lib/auth-storage";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/logout"]);

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = getAccessToken();

        if (!token && !PUBLIC_PATHS.has(pathname)) {
            router.replace("/login");
            return;
        }

        setIsChecking(false);
    }, [router, pathname]);

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
