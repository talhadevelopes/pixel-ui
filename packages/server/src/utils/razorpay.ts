import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

export async function createSubscription(options: CreateSubscriptionOptions) {
  return (await razorpayInstance.subscriptions.create(options as any)) as RazorpaySubscription;
}

export async function fetchSubscription(subscriptionId: string) {
  return (await razorpayInstance.subscriptions.fetch(subscriptionId as any)) as RazorpaySubscription;
}

export async function cancelSubscription(subscriptionId: string) {
  await razorpayInstance.subscriptions.cancel(subscriptionId as any);
}

export default razorpayInstance;