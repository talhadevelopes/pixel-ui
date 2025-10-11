"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getProfile, type UserProfile } from "@/services/auth.api";

const authProfileQueryKey = ["auth", "profile"] as const;

type ProfileQueryOptions = Omit<
    UseQueryOptions<UserProfile, Error, UserProfile, typeof authProfileQueryKey>,
    "queryKey" | "queryFn"
>;

export function useProfileQuery(accessToken?: string | null, options?: ProfileQueryOptions) {
    return useQuery<UserProfile, Error, UserProfile, typeof authProfileQueryKey>({
        queryKey: authProfileQueryKey,
        queryFn: async () => {
            if (!accessToken) {
                throw new Error("Missing access token");
            }

            return getProfile(accessToken);
        },
        ...options,
        enabled: Boolean(accessToken) && (options?.enabled ?? true),
    });
}

