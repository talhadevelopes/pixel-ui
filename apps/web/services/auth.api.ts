import axios from "axios";
import { setAuthTokens } from "@/lib/auth-storage";
import { API, BASE_URL } from "./api";
import { AuthTokens, GoogleCallbackResponse, jsonHeaders, LoginPayload, RegisterPayload, RegisterStartResponse, ResendOtpPayload, UserProfile, VerifyOtpPayload } from "@workspace/types";
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
    try {
        const res = await axios.post(`${BASE_URL}${API.auth.login}`, payload, {
            headers: jsonHeaders as Record<string, string>,
        });
        const body = res?.data ?? null;
        const data = body?.data as AuthTokens | undefined;

        if (!data?.accessToken) {
            throw new Error("Invalid login response");
        }
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to login";
        throw new Error(message);
    }
}

export async function registerStart(payload: RegisterPayload): Promise<RegisterStartResponse> {
    try {
        const res = await axios.post(`${BASE_URL}${API.auth.register}`, payload, {
            headers: jsonHeaders as Record<string, string>,
        });
        const body = res?.data ?? null;
        const data = body?.data as { email?: string } | undefined;
        if (!data?.email) {
            throw new Error("Invalid register response");
        }
        return { email: data.email };
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to register";
        throw new Error(message);
    }
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<AuthTokens> {
    try {
        const res = await axios.post(`${BASE_URL}${API.auth.verifyOtp}`, payload, {
            headers: jsonHeaders as Record<string, string>,
        });
        const body = res?.data ?? null;
        const data = body?.data as { accessToken?: string; refreshToken?: string } | undefined;
        if (!data?.accessToken) {
            throw new Error("Invalid verify OTP response");
        }
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to verify OTP";
        throw new Error(message);
    }
}

export async function resendOtp(payload: ResendOtpPayload): Promise<RegisterStartResponse> {
    try {
        const res = await axios.post(`${BASE_URL}${API.auth.resendOtp}`, payload, {
            headers: jsonHeaders as Record<string, string>,
        });
        const body = res?.data ?? null;
        const data = body?.data as { email?: string } | undefined;
        if (!data?.email) {
            throw new Error("Invalid resend OTP response");
        }
        return { email: data.email };
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to resend OTP";
        throw new Error(message);
    }
}

export async function getProfile(accessToken: string): Promise<UserProfile> {
    try {
        const res = await axios.get(`${BASE_URL}${API.auth.profile}`, {
            headers: {
                ...jsonHeaders,
                Authorization: `Bearer ${accessToken}`,
            } as Record<string, string>,
        });
        const body = res?.data ?? null;
        const data = body?.data as UserProfile | undefined;
        if (!data) {
            throw new Error("Invalid profile response");
        }
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to load profile";
        throw new Error(message);
    }
}

export async function exchangeGoogleCode(code: string, state?: string): Promise<GoogleCallbackResponse> {
    try {
        const res = await axios.post(`${BASE_URL}${API.auth.googleCallback}`, { code, state }, {
            headers: jsonHeaders as Record<string, string>,
        });
        const body = res?.data ?? null;
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
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to complete Google login";
        throw new Error(message);
    }
}


