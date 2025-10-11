import { setAuthTokens } from "@/lib/auth-storage";
import {
    exchangeGoogleCode as requestGoogleCallback,
    type GoogleCallbackResponse,
} from "./auth.api";

export type { GoogleCallbackResponse } from "./auth.api";

export async function exchangeGoogleCode(code: string, state?: string) {
    const data = await requestGoogleCallback(code, state);

    setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    });

    return data;
}
