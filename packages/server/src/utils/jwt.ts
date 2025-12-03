import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET as string) || 'dev_refresh_secret';
const JWT_ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET as string) || 'dev_access_secret';

export function generateAccessToken(payload: any): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "60m" });
}

export function generateRefreshToken(payload: any): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): any {
    return jwt.verify(token, JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): any {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}