import { GoogleCallbackInput, LoginInput, RegisterInput, googleCallbackSchema, verifyOtpSchema, resendOtpSchema, loginSchema, registerSchema } from "../validation/authValidation";

import { AuthRequest } from "../middleware/authMiddleware";
import { Response, NextFunction } from "express";
import z from "zod";
import { sendError, sendSuccess } from "../utils/response.utils";
import { generateAccessToken, generateRefreshToken, hashPassword, verifyPassword, verifyRefreshToken } from "../utils/jwt";
import { handleGoogleCallback } from "../services/googleAuthService";
import { generateOtp, OTP_EXPIRY_MINUTES, sendVerificationEmail } from "../services/mailjetService";
import crypto from "crypto";
import { prisma } from "../utils/prisma";


export class AuthController {
    static async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = registerSchema.parse(req.body);
            const emailLower = email.trim().toLowerCase();

            const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });

            if (existingUser) {
                return sendError(res, "User already exists", 400);
            }

            const hashedPassword = await hashPassword(password);

            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            await prisma.tempRegistration.deleteMany({ where: { email: emailLower } });

            await prisma.tempRegistration.create({
                data: {
                    id: crypto.randomUUID(),
                    name,
                    email: emailLower,
                    password: hashedPassword,
                    otpCode: otp,
                    expiresAt,
                },
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
            const { email, password } = loginSchema.parse(req.body);
            const emailLower = email.trim().toLowerCase();

            console.log(`[Auth] Login attempt for ${emailLower}`);

            const user = await prisma.user.findUnique({ where: { email: emailLower } });

            if (!user) {
                console.warn(`[Auth] Login failed - user not found for ${emailLower}`);
                return sendError(res, "Invalid credentials", 401);
            }

            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                console.warn(`[Auth] Invalid password for ${emailLower}`);
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
            console.log(`[Auth] Login successful for ${emailLower}`);
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

            const user = await prisma.user.findUnique({ where: { id: userId! } });

            console.log('Found user:', user);

            if (!user) {
                return sendError(res, "User not found", 404);
            }

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

            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

            if (!user) {
                return sendError(res, "User not found", 404);
            }

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

            const temp = await prisma.tempRegistration.findFirst({ where: { email: emailLower, otpCode: otp } });

            if (!temp) {
                return sendError(res, "Invalid or expired OTP", 400);
            }

            if (temp.expiresAt && new Date(temp.expiresAt) < new Date()) {
                await prisma.tempRegistration.deleteMany({ where: { email: emailLower } });
                return sendError(res, "OTP expired", 400);
            }

            const user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    name: temp.name,
                    email: temp.email,
                    password: temp.password,
                    credits: 5,
                    tier: "free",
                    dailyCreditsLimit: 5,
                    lastCreditReset: new Date(),
                    subscriptionStatus: "active",
                },
            });

            await prisma.tempRegistration.deleteMany({ where: { email: emailLower } });

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

            const tempRow = await prisma.tempRegistration.findUnique({ where: { email: emailLower } });

            if (!tempRow) {
                return sendError(res, "No registration in progress", 400);
            }

            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            const temp = await prisma.tempRegistration.update({
                where: { email: emailLower },
                data: { otpCode: otp, expiresAt },
            });

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