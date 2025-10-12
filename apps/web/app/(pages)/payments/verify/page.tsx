"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { toast } from "sonner";

import { useAuthToken } from "@/hooks/useAuthToken";
import { useVerifySubscriptionMutation } from "@/mutations/useSubscription";

export default function VerifySubscriptionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const accessToken = useAuthToken();

    const payload = useMemo(() => {
        const subscriptionId = searchParams?.get("razorpay_subscription_id");
        const paymentId = searchParams?.get("razorpay_payment_id");
        const signature = searchParams?.get("razorpay_signature");

        if (!subscriptionId || !paymentId || !signature) {
            return null;
        }

        return {
            razorpay_subscription_id: subscriptionId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
        };
    }, [searchParams]);

    const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
    const verifyMutation = useVerifySubscriptionMutation(accessToken);

    useEffect(() => {
        if (!payload) {
            setStatus("error");
            return;
        }

        verifyMutation
            .mutateAsync(payload)
            .then(result => {
                setStatus("success");
                toast.success("Subscription activated", {
                    description: result.subscriptionEndDate
                        ? `Valid until ${new Date(result.subscriptionEndDate).toLocaleDateString()}`
                        : undefined,
                });
            })
            .catch(error => {
                console.error("Verification failed", error);
                setStatus("error");
                toast.error(error instanceof Error ? error.message : "Failed to verify payment");
            });
    }, [payload, verifyMutation]);

    const isLoading = status === "pending" || verifyMutation.isPending;
    const isSuccess = status === "success";

    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center justify-center p-6">
            <Card className="w-full">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle>Payment Verification</CardTitle>
                    <CardDescription>We&apos;re confirming your subscription status.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 py-10">
                    {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                    {isSuccess && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                    {!isLoading && !isSuccess && <XCircle className="h-12 w-12 text-destructive" />}

                    <p className="text-sm text-muted-foreground">
                        {isLoading && "Hold tight while we verify your payment details."}
                        {isSuccess && "Your subscription is now active. Enjoy the premium features!"}
                        {!isLoading && !isSuccess && "We couldn&apos;t verify the payment. Please contact support if this persists."}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => router.push("/workspace")}>Back to workspace</Button>
                    <Button onClick={() => router.push("/payments")}>Go to payments</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
