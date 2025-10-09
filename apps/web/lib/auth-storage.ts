export type AuthTokens = {
    accessToken: string;
    refreshToken?: string;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isBrowser = () => typeof window !== "undefined";

const notifyAuthChange = () => {
    if (!isBrowser()) return;
    window.dispatchEvent(new Event("auth-change"));
};

export const setAuthTokens = ({ accessToken, refreshToken }: AuthTokens) => {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    notifyAuthChange();
};

export const clearAuthTokens = () => {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyAuthChange();
};

export const getAccessToken = () => {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};
