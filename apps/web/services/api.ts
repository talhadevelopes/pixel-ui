// Backend base URL. Configure via NEXT_PUBLIC_API_BASE_URL in envs.
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const API = {
    auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        google: "/api/auth/google",
        googleCallback: "/api/auth/google-callback",
        profile: "/api/auth/profile",
        verifyOtp: "/api/auth/verify-otp",
        resendOtp: "/api/auth/resend-otp",
    },
    projects: {
        create: "/api/projects",
        list: "/api/projects",
    },
    frames: {
        base: "/api/frames",
    },
    chat: {
        completions: "/api/chat/completions",
        messages: "/api/chat/messages",
    },
    subscriptions: {
        plans: "/api/subscriptions/plans",
        subscribe: "/api/subscriptions/subscribe",
        verify: "/api/subscriptions/verify",
        cancel: "/api/subscriptions/cancel",
        status: "/api/subscriptions/status",
    },
};