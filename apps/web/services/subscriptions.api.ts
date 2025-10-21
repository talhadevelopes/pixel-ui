import { API, BASE_URL } from "./api";
import { CreateSubscriptionPayload, CreateSubscriptionResult, SubscriptionPlan, SubscriptionPlansResponse, SubscriptionStatus, VerifySubscriptionPayload } from "@/types/subscription.types";


async function request<T>(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(input, init);
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Subscription request failed";
        throw new Error(message);
    }

    return (body?.data ?? body) as T;
}

function authHeaders(accessToken: string | null | undefined) {
    if (!accessToken) {
        return {} as Record<string, string>;
    }

    return {
        Authorization: `Bearer ${accessToken}`,
    } as Record<string, string>;
}

export async function fetchSubscriptionPlans(accessToken?: string | null) {
    return request<SubscriptionPlansResponse>(`${BASE_URL}${API.subscriptions.plans}`, {
        method: "GET",
        headers: {
            ...authHeaders(accessToken),
        },
    });
}

export async function fetchSubscriptionStatus(accessToken: string) {
    return request<SubscriptionStatus>(`${BASE_URL}${API.subscriptions.status}`, {
        method: "GET",
        headers: {
            ...authHeaders(accessToken),
        },
    });
}

export async function createSubscription(payload: CreateSubscriptionPayload, accessToken: string) {
    return request<CreateSubscriptionResult>(`${BASE_URL}${API.subscriptions.subscribe}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(accessToken),
        },
        body: JSON.stringify(payload),
    });
}

export async function verifySubscription(payload: VerifySubscriptionPayload, accessToken: string) {
    return request<SubscriptionStatus>(`${BASE_URL}${API.subscriptions.verify}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(accessToken),
        },
        body: JSON.stringify(payload),
    });
}

export async function cancelActiveSubscription(accessToken: string) {
    await request<null>(`${BASE_URL}${API.subscriptions.cancel}`, {
        method: "POST",
        headers: {
            ...authHeaders(accessToken),
        },
    });
}
