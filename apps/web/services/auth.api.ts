import { API, BASE_URL } from "./api";

export type AuthTokens = {
    accessToken: string;
    refreshToken?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    credits: number | null;
};

export type GoogleCallbackResponse = UserProfile & AuthTokens;

const jsonHeaders: HeadersInit = {
    "Content-Type": "application/json",
};

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

export async function register(payload: RegisterPayload): Promise<AuthTokens> {
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

    const data = body?.data as AuthTokens | undefined;

    if (!data?.accessToken) {
        throw new Error("Invalid register response");
    }

    return data;
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

    return data;
}


