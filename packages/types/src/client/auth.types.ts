
export type AuthTokens = {
    accessToken: string;
    refreshToken?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

export type RegisterStartResponse = {
    email: string;
};

export type VerifyOtpPayload = {
    email: string;
    otp: string;
};

export type ResendOtpPayload = {
    email: string;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    credits: number | null;
};

export type GoogleCallbackResponse = UserProfile & AuthTokens;

export const jsonHeaders: HeadersInit = {
    "Content-Type": "application/json",
};


//used in backend
export type GoogleLoginData = {
    id: string;
    name: string;
    email: string;
    credits: number | null;
    accessToken: string;
    refreshToken: string;
};