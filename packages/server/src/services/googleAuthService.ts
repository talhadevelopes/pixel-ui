import crypto from "node:crypto";
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessToken, generateRefreshToken, hashPassword } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import { GoogleLoginData } from "@workspace/types"
import { GOOGLE_TOKEN_ENDPOINT, GOOGLE_USERINFO_ENDPOINT } from "../utils/env";

class GoogleAuthError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = "GoogleAuthError";
        this.statusCode = statusCode;
    }
}

export async function handleGoogleCallback(code: string, state?: string): Promise<GoogleLoginData> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
        process.env.GOOGLE_CALLBACK_URL ??
        `${process.env.CLIENT_URL ?? "http://localhost:3000"}/auth/google/callback`;

    console.log(`[GoogleAuth] Handling callback with URI: ${redirectUri}`);

    if (!clientId || !clientSecret) {
        throw new GoogleAuthError("Google OAuth is not configured correctly", 500);
    }

    const tokenPayload = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenPayload.toString(),
    });

    const tokenJson = await tokenResponse.json().catch(() => null);

    if (!tokenResponse.ok || !tokenJson?.access_token) {
        const description = tokenJson?.error_description ?? tokenJson?.error ?? "Failed to exchange Google authorization code";
        throw new GoogleAuthError(description, tokenResponse.status || 400);
    }

    const googleAccessToken = tokenJson.access_token as string;

    const userinfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${googleAccessToken}`,
        },
    });

    const profile = await userinfoResponse.json().catch(() => null);

    if (!userinfoResponse.ok || !profile?.email) {
        throw new GoogleAuthError("Failed to fetch Google user profile", userinfoResponse.status || 400);
    }

    const email: string = profile.email;
    const name: string = profile.name ?? profile.given_name ?? "Google User";

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);

        user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                name,
                email,
                password: hashedPassword,
                credits: 5,
            },
        });
    } else if (!user.name && name) {
        user = await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        credits: user.credits,
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        accessToken,
        refreshToken,
    };
}
