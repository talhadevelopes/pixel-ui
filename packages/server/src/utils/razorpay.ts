import Razorpay from "razorpay";
import { CreateSubscriptionOptions, RazorpaySubscription } from "@workspace/types";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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