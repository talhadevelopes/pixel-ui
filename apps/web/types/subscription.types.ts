
export type SubscriptionTier = "free" | "pro" | "premium";

export type SubscriptionPlan = {
    tier: SubscriptionTier;
    name: string;
    price: number;
    credits: number;
    description: string;
    features: string[];
};

export type SubscriptionPlansResponse = {
    plans: SubscriptionPlan[];
};

export type SubscriptionStatus = {
    tier: SubscriptionTier;
    credits: number;
    dailyCreditsLimit: number;
    subscriptionStatus: "inactive" | "active" | "cancelled" | "expired";
    subscriptionEndDate: string | null;
    lastCreditReset: string | null;
};

export type CreateSubscriptionPayload = {
    tier: Exclude<SubscriptionTier, "free">;
};

export type CreateSubscriptionResult = {
    subscriptionId: string;
    shortUrl: string | null;
    amount: number;
    tier: SubscriptionTier;
};

export type VerifySubscriptionPayload = {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};