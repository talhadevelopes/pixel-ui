// routes/subscriptionRoutes.ts
import express from "express";
import { SubscriptionController } from "../controllers/subscriptionController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/subscriptions/plans - Get all subscription plans
router.get("/plans", SubscriptionController.getPlans);

// POST /api/subscriptions/subscribe - Create a new subscription
router.post("/subscribe", protect, SubscriptionController.createSubscription);

// POST /api/subscriptions/verify - Verify subscription payment
router.post("/verify", protect, SubscriptionController.verifySubscription);

// POST /api/subscriptions/cancel - Cancel active subscription
router.post("/cancel", protect, SubscriptionController.cancelSubscription);

// GET /api/subscriptions/status - Get user's subscription status
router.get("/status", protect, SubscriptionController.getSubscriptionStatus);

export default router;