import { setAuthTokens } from "@/lib/auth-storage";
import { API, BASE_URL } from "./api";
import { AuthTokens, GoogleCallbackResponse, jsonHeaders, LoginPayload, RegisterPayload, RegisterStartResponse, ResendOtpPayload, UserProfile, VerifyOtpPayload } from "@/types/auth.types";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth-storage";

//this hook to check auth status
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

export async function login(payload: LoginPayload): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}${API.auth.login}`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to login";
        throw new Error(message);
    }

    const data = body?.data as AuthTokens | undefined;

    if (!data?.accessToken) {
        throw new Error("Invalid login response");
    }

    return data;
}

export async function registerStart(payload: RegisterPayload): Promise<RegisterStartResponse> {
    const response = await fetch(`${BASE_URL}${API.auth.register}`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to register";
        throw new Error(message);
    }

    const data = body?.data as { email?: string } | undefined;

    if (!data?.email) {
        throw new Error("Invalid register response");
    }

    return { email: data.email };
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}${API.auth.verifyOtp}`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to verify OTP";
        throw new Error(message);
    }

    const data = body?.data as { accessToken?: string; refreshToken?: string } | undefined;
    if (!data?.accessToken) {
        throw new Error("Invalid verify OTP response");
    }

    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

export async function resendOtp(payload: ResendOtpPayload): Promise<RegisterStartResponse> {
    const response = await fetch(`${BASE_URL}${API.auth.resendOtp}`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to resend OTP";
        throw new Error(message);
    }

    const data = body?.data as { email?: string } | undefined;
    if (!data?.email) {
        throw new Error("Invalid resend OTP response");
    }

    return { email: data.email };
}

export async function getProfile(accessToken: string): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}${API.auth.profile}`, {
        method: "GET",
        headers: {
            ...jsonHeaders,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to load profile";
        throw new Error(message);
    }

    const data = body?.data as UserProfile | undefined;

    if (!data) {
        throw new Error("Invalid profile response");
    }

    return data;
}

export async function exchangeGoogleCode(code: string, state?: string): Promise<GoogleCallbackResponse> {
    // Make the API call
    const response = await fetch(`${BASE_URL}${API.auth.googleCallback}`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ code, state }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to complete Google login";
        throw new Error(message);
    }

    const data = body?.data as GoogleCallbackResponse | undefined;

    if (!data?.accessToken) {
        throw new Error("Invalid Google login response");
    }

    // Store the tokens (side effect)
    setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    });

    return data;
}


