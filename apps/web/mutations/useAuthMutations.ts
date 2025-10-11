"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import {
    login,
    register,
    type AuthTokens,
    type LoginPayload,
    type RegisterPayload,
} from "@/services/auth.api";
import {
    exchangeGoogleCode,
    type GoogleCallbackResponse,
} from "@/services/google-auth";

type MutationOptions<TResult, TVariables> = Omit<
    UseMutationOptions<TResult, Error, TVariables, unknown>,
    "mutationFn"
>;

export function useLoginMutation(options?: MutationOptions<AuthTokens, LoginPayload>) {
    return useMutation<AuthTokens, Error, LoginPayload, unknown>({
        mutationKey: ["auth", "login"],
        mutationFn: login,
        ...options,
    });
}

export function useRegisterMutation(options?: MutationOptions<AuthTokens, RegisterPayload>) {
    return useMutation<AuthTokens, Error, RegisterPayload, unknown>({
        mutationKey: ["auth", "register"],
        mutationFn: register,
        ...options,
    });
}

export type GoogleCallbackVariables = {
    code: string;
    state?: string;
};

export function useGoogleCallbackMutation(
    options?: MutationOptions<GoogleCallbackResponse, GoogleCallbackVariables>,
) {
    return useMutation<GoogleCallbackResponse, Error, GoogleCallbackVariables, unknown>({
        mutationKey: ["auth", "google", "callback"],
        mutationFn: ({ code, state }) => exchangeGoogleCode(code, state),
        ...options,
    });
}

