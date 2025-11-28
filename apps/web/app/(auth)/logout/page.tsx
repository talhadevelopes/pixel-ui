"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearAuthTokens } from "@/lib/auth-storage";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        clearAuthTokens();
        toast.success("Logged out successfully");
        router.replace("/login");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="rounded-xl border border-border bg-card px-6 py-8 text-center shadow">
                <p className="text-sm text-muted-foreground">Signing you out...</p>
            </div>
        </div>
    );
}
