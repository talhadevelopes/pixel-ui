export const BASE_URL = "http://localhost:4000";

export const API = {
    auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        google: "/api/auth/google",
        googleCallback: "/api/auth/google-callback",
        profile: "/api/auth/profile",
    },
    projects: {
        create: "/api/projects",
    },
    frames: {
        base: "/api/frames",
    },
    chat: {
        completions: "/api/chat/completions",
        messages: "/api/chat/messages",
    },
};