import { GoogleCallbackInput, LoginInput, RegisterInput, googleCallbackSchema, verifyOtpSchema, resendOtpSchema } from "../validation/authValidation";
import { AuthRequest } from "../middleware/auth";
import { Response, NextFunction } from "express";
import z from "zod";

import { and, eq } from "drizzle-orm";
import { db } from "../utils/drizzle";
import { userTable, tempRegistrationTable } from "../db/schema";
import { sendError, sendSuccess } from "../types/response";
import { generateAccessToken, generateRefreshToken, hashPassword, verifyPassword, verifyRefreshToken } from "../utils/jwt";
import { handleGoogleCallback } from "../services/googleAuthService";
import { sendVerificationEmail } from "../services/mailjetService";

const OTP_EXPIRY_MINUTES = 10;
function generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export class AuthController {
    static async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body as RegisterInput;
            const emailLower = email.trim().toLowerCase();

            const existingUser = await db.select()
                .from(userTable)
                .where(eq(userTable.email, emailLower))
                .limit(1);

            if (existingUser.length > 0) {
                return sendError(res, "User already exists", 400);
            }

            const hashedPassword = await hashPassword(password);

            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            await db.delete(tempRegistrationTable).where(eq(tempRegistrationTable.email, emailLower));

            await db.insert(tempRegistrationTable).values({
                name,
                email: emailLower,
                password: hashedPassword,
                otpCode: otp,
                expiresAt,
            });

            await sendVerificationEmail(emailLower, name, otp);

            sendSuccess(res, { email: emailLower }, "OTP sent to email", 200);

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

    static async verifyOtp(req: AuthRequest, res: Response) {
        try {
            const { email, otp } = verifyOtpSchema.parse(req.body);
            const emailLower = email.trim().toLowerCase();

            const tempRows = await db.select()
                .from(tempRegistrationTable)
                .where(and(eq(tempRegistrationTable.email, emailLower), eq(tempRegistrationTable.otpCode, otp)))
                .limit(1);

            if (tempRows.length === 0) {
                return sendError(res, "Invalid or expired OTP", 400);
            }

            const temp = tempRows[0];
            if (temp.expiresAt && new Date(temp.expiresAt) < new Date()) {
                await db.delete(tempRegistrationTable).where(eq(tempRegistrationTable.email, emailLower));
                return sendError(res, "OTP expired", 400);
            }

            const inserted = await db.insert(userTable).values({
                name: temp.name,
                email: temp.email,
                password: temp.password,
                credits: 3,
                tier: "free",
                dailyCreditsLimit: 3,
                lastCreditReset: new Date(),
                subscriptionStatus: "active",
            }).returning();

            const user = inserted[0];

            await db.delete(tempRegistrationTable).where(eq(tempRegistrationTable.email, email));

            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                credits: user.credits,
            });

            const refreshToken = generateRefreshToken({
                userId: user.id,
            });

            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                tier: user.tier,
                dailyCreditsLimit: user.dailyCreditsLimit,
                accessToken,
                refreshToken,
            };

            sendSuccess(res, userResponse, "Registration verified successfully", 201);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return sendError(res, "Validation Error", 400, error.errors);
            }
            sendError(res, "Server Error", 500);
        }
    }

    static async resendOtp(req: AuthRequest, res: Response) {
        try {
            const { email } = resendOtpSchema.parse(req.body);
            const emailLower = email.trim().toLowerCase();

            const tempRows = await db.select()
                .from(tempRegistrationTable)
                .where(eq(tempRegistrationTable.email, emailLower))
                .limit(1);

            if (tempRows.length === 0) {
                return sendError(res, "No registration in progress", 400);
            }

            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            const updated = await db.update(tempRegistrationTable)
                .set({ otpCode: otp, expiresAt })
                .where(eq(tempRegistrationTable.email, emailLower))
                .returning();

            const temp = updated[0] ?? tempRows[0];

            await sendVerificationEmail(emailLower, temp.name, otp);

            sendSuccess(res, { email: emailLower }, "OTP resent", 200);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return sendError(res, "Validation Error", 400, error.errors);
            }
            sendError(res, "Server Error", 500);
        }
    }
}