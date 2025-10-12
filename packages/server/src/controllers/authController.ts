import { GoogleCallbackInput, LoginInput, RegisterInput, googleCallbackSchema } from "../validation/authValidation";
import { AuthRequest } from "../middleware/auth";
import { Response, NextFunction } from "express";
import z from "zod";

import { eq } from "drizzle-orm";
import { db } from "../utils/drizzle";
import { userTable } from "../db/schema";
import { sendError, sendSuccess } from "../types/response";
import { generateAccessToken, generateRefreshToken, hashPassword, verifyPassword, verifyRefreshToken } from "../utils/jwt";
import { handleGoogleCallback } from "../services/googleAuthService";

export class AuthController {
    static async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body as RegisterInput;

            const existingUser = await db.select()
                .from(userTable)
                .where(eq(userTable.email, email))
                .limit(1);

            if (existingUser.length > 0) {
                return sendError(res, "User already exists", 400);
            }

            const hashedPassword = await hashPassword(password);

            // ✅ UPDATED: Added default subscription values for new users
            const [user] = await db.insert(userTable).values({
                name,
                email,
                password: hashedPassword,
                credits: 3, // Free tier gets 3 credits
                tier: "free",
                dailyCreditsLimit: 3,
                lastCreditReset: new Date(),
                subscriptionStatus: "active",
            }).returning();

            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                credits: user.credits
            });

            const refreshToken = generateRefreshToken({
                userId: user.id
            });

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                tier: user.tier,
                dailyCreditsLimit: user.dailyCreditsLimit,
                accessToken,
                refreshToken
            };

            sendSuccess(res, userResponse, "User registered successfully", 201);

        } catch (error) {
            console.log('Register error:', error);
            if (error instanceof z.ZodError) {
                return sendError(res, "Validation Error", 400, error.errors);
            }
            sendError(res, "Server Error", 500);
        }
    }

    static async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body as LoginInput;

            const users = await db.select()
                .from(userTable)
                .where(eq(userTable.email, email))
                .limit(1);

            if (users.length === 0) {
                return sendError(res, "Invalid credentials", 401);
            }

            const user = users[0];

            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return sendError(res, "Invalid credentials", 401);
            }

            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                credits: user.credits
            });

            const refreshToken = generateRefreshToken({
                userId: user.id
            });

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                accessToken,
                refreshToken
            };

            sendSuccess(res, userResponse, "Login successful");

        } catch (error) {
            console.log('Login error:', error);
            if (error instanceof z.ZodError) {
                return sendError(res, "Validation Error", 400, error.errors);
            }
            sendError(res, "Server Error", 500);
        }
    }

    static async redirectToGoogle(req: AuthRequest, res: Response) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
            const redirectUri = `${clientUrl}/auth/google/callback`;

            if (!clientId) {
                return sendError(res, "Google OAuth is not configured", 500);
            }

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: "code",
                scope: "openid email profile",
                access_type: "offline",
                prompt: "consent",
            });

            res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
        } catch (error) {
            console.error("Google redirect error", error);
            sendError(res, "Failed to initiate Google login", 500);
        }
    }

    static async googleCallback(req: AuthRequest, res: Response) {
        try {
            const body = googleCallbackSchema.parse(req.body) as GoogleCallbackInput;

            const loginData = await handleGoogleCallback(body.code, body.state);

            sendSuccess(res, loginData, "Google login successful");
        } catch (error) {
            console.error("Google callback error:", error);
            if (error instanceof z.ZodError) {
                return sendError(res, "Validation Error", 400, error.errors);
            }
            if (error instanceof Error && "statusCode" in error) {
                const statusCode = (error as any).statusCode ?? 400;
                return sendError(res, error.message, statusCode);
            }
            sendError(res, "Failed to process Google login", 500);
        }
    }

    static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            
            console.log('User ID from token:', userId);
            console.log('User object from token:', req.user);
    
            const users = await db.select()
                .from(userTable)
                .where(eq(userTable.id, userId!))
                .limit(1);
    
            console.log('Found users:', users);
    
            if (users.length === 0) {
                return sendError(res, "User not found", 404);
            }
    
            const user = users[0];
            const { password, ...userWithoutPassword } = user;
    
            sendSuccess(res, userWithoutPassword, "Profile fetched successfully");
    
        } catch (error) {
            console.log('Profile error:', error);
            sendError(res, "Server Error", 500);
        }
    }

    static async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return sendError(res, "Refresh token required", 400);
            }

            const decoded = verifyRefreshToken(refreshToken);
            
            const users = await db.select()
                .from(userTable)
                .where(eq(userTable.id, decoded.userId))
                .limit(1);

            if (users.length === 0) {
                return sendError(res, "User not found", 404);
            }

            const user = users[0];
            const newAccessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                credits: user.credits
            });

            sendSuccess(res, { accessToken: newAccessToken }, "Token refreshed");
        } catch (error) {
            console.log('Refresh token error:', error);
            sendError(res, "Invalid refresh token", 401);
        }
    }
}