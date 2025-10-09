import { API, BASE_URL } from "@/service/api";
import { setAuthTokens } from "@/lib/auth-storage";

export type GoogleCallbackResponse = {
    id: string;
    name: string;
    email: string;
    credits: number | null;
    accessToken: string;
    refreshToken: string;
};

export async function exchangeGoogleCode(code: string, state?: string) {
    const response = await fetch(`${BASE_URL}${API.auth.googleCallback}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to complete Google login";
        throw new Error(message);
    }

    const data = body?.data as GoogleCallbackResponse | undefined;

    if (!data?.accessToken) {
        throw new Error("Invalid response from Google login");
    }

    setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    });

    return data;
}
