import axios from "axios";
import { API, BASE_URL } from "./api";
import { CreateSubscriptionPayload, CreateSubscriptionResult, SubscriptionPlan, SubscriptionPlansResponse, SubscriptionStatus, VerifySubscriptionPayload } from "@/types/subscription.types";


async function request<T>(url: string, init?: RequestInit): Promise<T> {
    try {
        const method = (init?.method || "GET").toLowerCase() as any;
        const headers = init?.headers as Record<string, string> | undefined;
        const data = init?.body ? JSON.parse(init.body as string) : undefined;
        const res = await axios({ url, method, headers, data });
        const body = res?.data ?? null;
        return (body?.data ?? body) as T;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Subscription request failed";
        throw new Error(message);
    }
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
