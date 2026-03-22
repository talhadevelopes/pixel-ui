import { Router } from "express";
import { SubscriptionController } from "../controllers/subscriptionController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

//get all subscription plans
router.get("/plans", SubscriptionController.getPlans);

//create a new subscription
router.post("/subscribe", protect, SubscriptionController.createSubscription);

//verify subscription payment
router.post("/verify", protect, SubscriptionController.verifySubscription);

//cancel active subscription
router.post("/cancel", protect, SubscriptionController.cancelSubscription);

//get user's subscription status
router.get("/status", protect, SubscriptionController.getSubscriptionStatus);

export default router;