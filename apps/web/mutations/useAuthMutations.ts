"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import {
    login,
    registerStart,
    verifyOtp,
    resendOtp,
    exchangeGoogleCode,
} from "@/services/auth.api";
import { AuthTokens, GoogleCallbackResponse, LoginPayload, RegisterPayload, RegisterStartResponse, ResendOtpPayload, VerifyOtpPayload } from "@workspace/types";

type MutationOptions<TResult, TVariables> = Omit<
    UseMutationOptions<TResult, Error, TVariables, unknown>,
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
    return useMutation<GoogleCallbackResponse, Error, GoogleCallbackVariables, unknown>({
        mutationKey: ["auth", "google", "callback"],
        mutationFn: ({ code, state }) => exchangeGoogleCode(code, state),
        ...options,
    });
}

