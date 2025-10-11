"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import {
    updateFrameDesign,
    saveFrameMessages,
    type UpdateFrameDesignPayload,
    type SaveFrameMessagesPayload,
} from "@/services/frames.api";

export type UpdateFrameDesignVariables = {
    payload: UpdateFrameDesignPayload;
    accessToken: string;
};

export type SaveFrameMessagesVariables = {
    payload: SaveFrameMessagesPayload;
    accessToken: string;
};

type MutationOptions<TResult, TVariables> = Omit<
    UseMutationOptions<TResult, Error, TVariables, unknown>,
    "mutationFn"
>;

export function useUpdateFrameDesignMutation(
    options?: MutationOptions<unknown, UpdateFrameDesignVariables>,
) {
    return useMutation<unknown, Error, UpdateFrameDesignVariables, unknown>({
        mutationKey: ["frames", "update"],
        mutationFn: ({ payload, accessToken }) => updateFrameDesign(payload, accessToken),
        ...options,
    });
}

export function useSaveFrameMessagesMutation(
    options?: MutationOptions<unknown, SaveFrameMessagesVariables>,
) {
    return useMutation<unknown, Error, SaveFrameMessagesVariables, unknown>({
        mutationKey: ["frames", "messages"],
        mutationFn: ({ payload, accessToken }) => saveFrameMessages(payload, accessToken),
        ...options,
    });
}
