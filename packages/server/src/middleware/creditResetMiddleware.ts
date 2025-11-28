// middleware/creditReset.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { prisma } from "../utils/prisma";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function creditResetMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(); // Let auth middleware handle it
    }

    // Fetch user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return next();
    }

    // Calculate time since last reset
    const now = Date.now();
    const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset).getTime() : 0;
    const timeSinceReset = now - lastReset;

    // If 24 hours have passed, reset credits
    if (timeSinceReset >= TWENTY_FOUR_HOURS) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: user.dailyCreditsLimit ?? user.credits ?? 0,
          lastCreditReset: new Date(),
        },
      });

      // Update req.user with fresh credit count
      if (req.user) {
        req.user.credits = updatedUser.credits;
      }

      console.log(`✅ Credits reset for user ${userId}: ${updatedUser.credits} credits`);
    }

    next();
  } catch (error) {
    console.error("Credit reset middleware error:", error);
    next(); // Continue even if reset fails
  }
}