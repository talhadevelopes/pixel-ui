"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getProfile } from "@/services/auth.api";
import { UserProfile } from "@workspace/types";

export const authProfileQueryKey = ["auth", "profile"] as const;

export type ProfileQueryOptions = Omit<
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

