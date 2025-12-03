import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string | undefined;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string | undefined;

if (isProd) {
    if (!JWT_REFRESH_SECRET || !JWT_ACCESS_SECRET) {
        throw new Error('JWT secrets are not configured in production');
    }
}

export function generateAccessToken(payload: any): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET || 'dev_access_secret', { expiresIn: "60m" });
}

export function generateRefreshToken(payload: any): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET || 'dev_refresh_secret', { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): any {
    return jwt.verify(token, JWT_ACCESS_SECRET || 'dev_access_secret');
}

export function verifyRefreshToken(token: string): any {
    return jwt.verify(token, JWT_REFRESH_SECRET || 'dev_refresh_secret');
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}