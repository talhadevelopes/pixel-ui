import { Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/response.utils";
import {
  SUBSCRIPTION_PLANS,
  isValidPaidTier,
} from "../utils/subscriptionPlans";
import {
  createSubscription,
  fetchSubscription,
  cancelSubscription,
} from "../utils/razorpay";
import { prisma } from "../utils/prisma";

export class SubscriptionController {
  static async getPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
        tier: plan.tier,
        name: plan.name,
        price: plan.price,
        credits: plan.credits,
        description: plan.description,
        features: plan.features,
      }));

      return sendSuccess(res, { plans }, "Subscription plans fetched");
    } catch (error) {
      console.error("Get plans error:", error);
      return sendError(res, "Failed to fetch plans", 500);
    }
  }

  static async createSubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tier } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, "User not authenticated", 401);
      }

      if (!isValidPaidTier(tier)) {
        return sendError(res, "Invalid subscription tier", 400);
      }

      const plan = SUBSCRIPTION_PLANS[tier];
      const planIdFromConfig =
        "razorpayPlanId" in plan ? plan.razorpayPlanId : undefined;
      const planIdEnvKey = `RAZORPAY_PLAN_${tier.toUpperCase()}` as const;
      const planId = planIdFromConfig || process.env[planIdEnvKey];

      if (!planId) {
        console.error("Plan ID missing for tier", tier);
        return sendError(res, "Subscription plan not configured", 500);
      }

      // Create Razorpay Subscription
      const subscriptionOptions = {
        plan_id: planId,
        customer_notify: true,
        total_count: 12, // 12 monthly payments
        notes: {
          userId,
          tier,
        },
      };

      const razorpaySubscription =
        await createSubscription(subscriptionOptions);

      // Save to database
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          tier,
          razorpaySubscriptionId: razorpaySubscription.id,
          status: "created",
          amount: plan.priceInPaise,
        },
      });

      return sendSuccess(
        res,
        {
          subscriptionId: razorpaySubscription.id,
          shortUrl: razorpaySubscription.short_url,
          amount: plan.price,
          tier: plan.tier,
        },
        "Subscription created successfully"
      );
    } catch (error) {
      console.error("Create subscription error:", error);
      return sendError(res, "Failed to create subscription", 500);
    }
  }

  static async verifySubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, "User not authenticated", 401);
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return sendError(res, "Invalid payment signature", 400);
      }

      // Fetch subscription details from Razorpay
      const subscription = await fetchSubscription(razorpay_subscription_id);

      if (subscription.status !== "active") {
        return sendError(res, "Subscription is not active", 400);
      }

      // Get subscription from DB
      const subscriptionRecord = await prisma.subscriptionHistory.findFirst({
        where: { razorpaySubscriptionId: razorpay_subscription_id },
      });

      if (!subscriptionRecord) {
        return sendError(res, "Subscription not found", 404);
      }

      const plan =
        SUBSCRIPTION_PLANS[
          subscriptionRecord.tier as keyof typeof SUBSCRIPTION_PLANS
        ];

      // Calculate end date (30 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      // Update user with new tier
      await prisma.user.update({
        where: { id: userId },
        data: {
          tier: subscriptionRecord.tier,
          dailyCreditsLimit: plan.credits,
          credits: plan.credits,
          subscriptionId: razorpay_subscription_id,
          subscriptionStatus: "active",
          subscriptionEndDate: endDate,
          lastCreditReset: new Date(),
        },
      });

      // Update subscription history
      await prisma.subscriptionHistory.updateMany({
        where: { razorpaySubscriptionId: razorpay_subscription_id },
        data: {
          status: "active",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          startDate: new Date(),
          endDate: endDate,
        },
      });

      return sendSuccess(
        res,
        {
          tier: subscriptionRecord.tier,
          credits: plan.credits,
          endDate,
        },
        "Subscription activated successfully"
      );
    } catch (error) {
      console.error("Verify subscription error:", error);
      return sendError(res, "Failed to verify subscription", 500);
    }
  }

  static async cancelSubscription(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, "User not authenticated", 401);
      }

      // Get user
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.subscriptionId) {
        return sendError(res, "No active subscription found", 404);
      }

      // Cancel on Razorpay
      await cancelSubscription(user.subscriptionId);

      // Update user status
      const freePlan = SUBSCRIPTION_PLANS.free;

      const oldSubId = user.subscriptionId;
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "cancelled",
          subscriptionId: null,
          subscriptionEndDate: null,
          tier: freePlan.tier,
          dailyCreditsLimit: freePlan.credits,
          credits: freePlan.credits,
        },
      });

      // Update subscription history
      if (oldSubId) {
        await prisma.subscriptionHistory.updateMany({
          where: { razorpaySubscriptionId: oldSubId },
          data: { status: "cancelled" },
        });
      }

      return sendSuccess(
        res,
        null,
        "Subscription cancelled. You can use your current plan until the end date."
      );
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return sendError(res, "Failed to cancel subscription", 500);
    }
  }

  static async getSubscriptionStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, "User not authenticated", 401);
      }

      let user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      // Ensure daily credit reset if 24h passed
      const now = Date.now();
      const lastReset = user.lastCreditReset
        ? new Date(user.lastCreditReset).getTime()
        : 0;
      const twentyFourHrs = 24 * 60 * 60 * 1000;
      if (now - lastReset >= twentyFourHrs) {
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            credits: user.dailyCreditsLimit ?? user.credits ?? 0,
            lastCreditReset: new Date(),
          },
        });
      }

      const tier = (user.tier as keyof typeof SUBSCRIPTION_PLANS) ?? "free";
      const plan = SUBSCRIPTION_PLANS[tier] ?? SUBSCRIPTION_PLANS.free;
      let dailyCreditsLimit = user.dailyCreditsLimit ?? plan.credits;

      // Auto-heal daily limit to match plan cap if lower (e.g., migrating from 3 -> 5 free tier)
      if (dailyCreditsLimit < plan.credits) {
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            dailyCreditsLimit: plan.credits,
            credits: Math.min(user.credits ?? plan.credits, plan.credits),
          },
        });
        dailyCreditsLimit = plan.credits;
      }

      const credits = Math.min(
        user.credits ?? dailyCreditsLimit,
        dailyCreditsLimit
      );
      const subscriptionStatus = user.subscriptionStatus ?? "inactive";

      return sendSuccess(
        res,
        {
          tier,
          credits,
          dailyCreditsLimit,
          subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
          lastCreditReset: user.lastCreditReset,
        },
        "Subscription status fetched"
      );
    } catch (error) {
      console.error("Get subscription status error:", error);
      return sendError(res, "Failed to fetch subscription status", 500);
    }
  }
}
