"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import {
    createProject,
    type CreateProjectPayload,
    type ProjectCreationResult,
} from "@/services/projects.api";

type MutationOptions<TResult, TVariables> = Omit<
    UseMutationOptions<TResult, Error, TVariables, unknown>,
    "mutationFn"
>;

export type CreateProjectVariables = {
    payload: CreateProjectPayload;
    accessToken: string;
};

export function useCreateProjectMutation(
    options?: MutationOptions<ProjectCreationResult | null, CreateProjectVariables>,
) {
    return useMutation<ProjectCreationResult | null, Error, CreateProjectVariables, unknown>({
        mutationKey: ["projects", "create"],
        mutationFn: ({ payload, accessToken }) => createProject(payload, accessToken),
        ...options,
    });
}
