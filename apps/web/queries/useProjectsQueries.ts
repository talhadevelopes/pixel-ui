"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchFrameDetails } from "@/services/frames.api";
import { FrameDetails } from "@workspace/types";

export const frameDetailsKey = (frameId: string, projectId: string) => ["frames", projectId, frameId] as const;

type FrameQueryKey = ReturnType<typeof frameDetailsKey>;

export type FrameQueryOptions = Partial<
    Omit<UseQueryOptions<FrameDetails, Error, FrameDetails, FrameQueryKey>, "queryKey" | "queryFn">
>;

export function useFrameDetailsQuery(
    frameId: string | null | undefined,
    projectId: string | null | undefined,
    accessToken: string | null | undefined,
    options?: FrameQueryOptions,
) {
    return useQuery<FrameDetails, Error, FrameDetails, FrameQueryKey>({
        queryKey: frameDetailsKey(frameId ?? "", projectId ?? ""),
        queryFn: async () => {
            if (!frameId || !projectId || !accessToken) {
                throw new Error("Missing identifiers");
            }
            return fetchFrameDetails({ frameId, projectId }, accessToken);
        },
        enabled: Boolean(frameId && projectId && accessToken) && (options?.enabled ?? true),
        staleTime: 30_000,
        ...options,
    });
}
