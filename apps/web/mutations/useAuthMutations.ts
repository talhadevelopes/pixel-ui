"use client";

import { useMutation, type UseMutationOptions, useQueryClient } from "@tanstack/react-query";

import {
    login,
    registerStart,
    verifyOtp,
    resendOtp,
    exchangeGoogleCode,
} from "@/services/auth.api";
import { AuthTokens, GoogleCallbackResponse, LoginPayload, RegisterPayload, RegisterStartResponse, ResendOtpPayload, VerifyOtpPayload } from "@workspace/types";
import { setAuthTokens } from "@/lib/auth-storage";
import { authProfileQueryKey } from "@/queries/";
import { subscriptionKeys } from "./useSubscription";

type MutationOptions<TResult, TVariables> = Omit<
    UseMutationOptions<TResult, Error, TVariables, any>,
    "mutationFn"
>;

export type GoogleCallbackVariables = {
    code: string;
    state?: string;
};

export function useLoginMutation(options?: MutationOptions<AuthTokens, LoginPayload>) {
    return useMutation<AuthTokens, Error, LoginPayload, unknown>({
        mutationKey: ["auth", "login"],
        mutationFn: login,
        ...options,
    });
}

export function useRegisterStartMutation(options?: MutationOptions<RegisterStartResponse, RegisterPayload>) {
    return useMutation<RegisterStartResponse, Error, RegisterPayload, unknown>({
        mutationKey: ["auth", "register-start"],
        mutationFn: registerStart,
        ...options,
    });
}

export function useVerifyOtpMutation(options?: MutationOptions<AuthTokens, VerifyOtpPayload>) {
    return useMutation<AuthTokens, Error, VerifyOtpPayload, unknown>({
        mutationKey: ["auth", "verify-otp"],
        mutationFn: verifyOtp,
        ...options,
    });
}

export function useResendOtpMutation(options?: MutationOptions<RegisterStartResponse, ResendOtpPayload>) {
    return useMutation<RegisterStartResponse, Error, ResendOtpPayload, unknown>({
        mutationKey: ["auth", "resend-otp"],
        mutationFn: resendOtp,
        ...options,
    });
}


export function useGoogleCallbackMutation(
    options?: MutationOptions<GoogleCallbackResponse, GoogleCallbackVariables>,
) {
    const queryClient = useQueryClient();
    return useMutation<GoogleCallbackResponse, Error, GoogleCallbackVariables, unknown>({
        mutationKey: ["auth", "google", "callback"],
        mutationFn: ({ code, state }) => exchangeGoogleCode(code, state),
        ...options,
        onSuccess: (data, variables, context) => {
            setAuthTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            queryClient.invalidateQueries({ queryKey: authProfileQueryKey as any });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() as any });
            (options?.onSuccess as any)?.(data, variables, context);
        },
    });
}

