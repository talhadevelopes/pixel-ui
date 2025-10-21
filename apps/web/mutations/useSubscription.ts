"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    cancelActiveSubscription,
    createSubscription,
    fetchSubscriptionPlans,
    fetchSubscriptionStatus,
    verifySubscription,
} from "@/services/subscriptions.api";
import { CreateSubscriptionPayload, CreateSubscriptionResult, SubscriptionPlansResponse, SubscriptionStatus, VerifySubscriptionPayload } from "@/types/subscription.types";

export const subscriptionKeys = {
    plans: () => ["subscriptions", "plans"] as const,
    status: () => ["subscriptions", "status"] as const,
};

export function useSubscriptionPlansQuery(accessToken: string | null | undefined) {
    return useQuery<SubscriptionPlansResponse, Error>({
        queryKey: subscriptionKeys.plans(),
        queryFn: () => fetchSubscriptionPlans(accessToken),
        staleTime: 60_000,
    });
}

export function useSubscriptionStatusQuery(accessToken: string | null | undefined) {
    return useQuery<SubscriptionStatus, Error>({
        queryKey: subscriptionKeys.status(),
        queryFn: () => {
            if (!accessToken) {
                throw new Error("Missing access token");
            }
            return fetchSubscriptionStatus(accessToken);
        },
        enabled: Boolean(accessToken),
        staleTime: 15_000,
    });
}

export function useCreateSubscriptionMutation(accessToken: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation<CreateSubscriptionResult, Error, CreateSubscriptionPayload>({
        mutationKey: ["subscriptions", "create"],
        mutationFn: payload => {
            if (!accessToken) {
                throw new Error("Missing access token");
            }
            return createSubscription(payload, accessToken);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        },
    });
}

export function useCancelSubscriptionMutation(accessToken: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation<null, Error, void>({
        mutationKey: ["subscriptions", "cancel"],
        mutationFn: async () => {
            if (!accessToken) {
                throw new Error("Missing access token");
            }
            await cancelActiveSubscription(accessToken);
            return null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
        },
    });
}

export function useVerifySubscriptionMutation(accessToken: string | null | undefined) {
    const queryClient = useQueryClient();

    return useMutation<SubscriptionStatus, Error, VerifySubscriptionPayload>({
        mutationKey: ["subscriptions", "verify"],
        mutationFn: payload => {
            if (!accessToken) {
                throw new Error("Missing access token");
            }
            return verifySubscription(payload, accessToken);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        },
    });
}
