"use client";

import React from "react";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/verify-otp", "/auth/google/callback"]);
const AUTH_REDIRECT_PATHS = new Set(["/login", "/register", "/verify-otp"]);

export function RequireAuth({ children }: { children: React.ReactNode }) {
    // Auth bypass: always return children
    return <>{children}</>;
}
