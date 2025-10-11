"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth-storage";

export function useAuthToken() {
    const [token, setToken] = useState<string | null>(() => getAccessToken());

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleAuthChange = () => {
            setToken(getAccessToken());
        };

        window.addEventListener("auth-change", handleAuthChange);

        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, []);

    return token;
}
