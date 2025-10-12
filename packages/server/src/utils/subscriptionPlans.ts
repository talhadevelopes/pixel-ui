// utils/subscriptionPlans.ts

const proPlanId = process.env.RAZORPAY_PLAN_PRO ?? "";
const premiumPlanId = process.env.RAZORPAY_PLAN_PREMIUM ?? "";

export const SUBSCRIPTION_PLANS = {
  free: {
    tier: 'free',
    credits: 3,
    price: 0,
    priceInPaise: 0,
    name: 'Free',
    description: 'Perfect for trying out',
    features: [
      '3 projects per day',
      'Basic AI features',
      'Community support'
    ]
  },
  pro: {
    tier: 'pro',
    credits: 20,
    price: 99,
    priceInPaise: 9900,
    name: 'Pro',
    description: 'For regular users',
    features: [
      '20 projects per day',
      'Advanced AI features',
      'Priority support',
      'Export designs'
    ],
    razorpayPlanId: proPlanId,
  },
  premium: {
    tier: 'premium',
    credits: 100,
    price: 399,
    priceInPaise: 39900,
    name: 'Premium',
    description: 'For power users',
    features: [
      '100 projects per day',
      'All AI features',
      'Premium support',
      'Custom branding',
      'Team collaboration'
    ],
    razorpayPlanId: premiumPlanId,
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;

export const PAID_TIERS: SubscriptionTier[] = ['pro', 'premium'];

export function isValidPaidTier(tier: string): tier is 'pro' | 'premium' {
  return tier === 'pro' || tier === 'premium';
}

export function getPlanDetails(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLANS[tier];
}