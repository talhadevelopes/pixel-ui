
export type SubscriptionTier = "free" | "pro" | "premium";

export type SubscriptionPlan = {
    tier: SubscriptionTier;
    name: string;
    price: number;
    credits: number;
    description: string;
    features: string[];
};

export type PlanCard = SubscriptionPlan & {
  isCurrent: boolean;
  isPaidTier: boolean;
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


//used in backend
export interface RazorpaySubscription {
  id: string;
  status: string;
  short_url?: string;
}

export interface CreateSubscriptionOptions {
  plan_id: string;
  customer_notify?: boolean | 0 | 1;
  total_count?: number;
  notes?: Record<string, unknown>;
}