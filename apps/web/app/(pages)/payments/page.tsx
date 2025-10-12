"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthToken } from "@/hooks/useAuthToken";
import {
    useSubscriptionPlansQuery,
    useSubscriptionStatusQuery,
    useCreateSubscriptionMutation,
    useCancelSubscriptionMutation,
} from "@/mutations/useSubscription";
import type { SubscriptionPlan } from "@/services/subscriptions.api";

const PAID_TIERS: Array<"pro" | "premium"> = ["pro", "premium"];
type PlanCard = SubscriptionPlan & {
    isCurrent: boolean;
    isPaidTier: boolean;
};

export default function PaymentsPage() {
    const router = useRouter();
    const accessToken = useAuthToken();

    const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlansQuery(accessToken);
    const { data: statusData, isLoading: isLoadingStatus } = useSubscriptionStatusQuery(accessToken);

    const { mutateAsync: createSubscription, isPending: isCreating } = useCreateSubscriptionMutation(accessToken);
    const { mutateAsync: cancelSubscription, isPending: isCancelling } = useCancelSubscriptionMutation(accessToken);

    const currentTier = statusData?.tier ?? "free";

    const planCards = useMemo<PlanCard[]>(() => {
        if (!plansData?.plans?.length) {
            return [];
        }

        return plansData.plans.map<PlanCard>((plan: SubscriptionPlan) => ({
            ...plan,
            isCurrent: plan.tier === currentTier,
            isPaidTier: PAID_TIERS.includes(plan.tier as "pro" | "premium"),
        }));
    }, [plansData, currentTier]);

    const handleSubscribe = async (tier: "pro" | "premium") => {
        if (!accessToken) {
            toast.error("Please log in to subscribe");
            router.push("/login");
            return;
        }

        try {
            const result = await createSubscription({ tier });
            if (result?.shortUrl) {
                window.location.href = result.shortUrl;
                return;
            }

            toast.success("Subscription created. Please complete payment.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to start subscription";
            toast.error(message);
        }
    };

    const handleCancel = async () => {
        if (!accessToken) {
            toast.error("Please log in");
            router.push("/login");
            return;
        }

        try {
            await cancelSubscription();
            toast.success("Subscription cancelled");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to cancel subscription";
            toast.error(message);
        }
    };

    const isBusy = isLoadingPlans || isLoadingStatus;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Manage Subscription</h1>
                    {statusData?.subscriptionStatus === "active" ? (
                        <Badge variant="outline" className="text-sm capitalize">
                            Active · {statusData.tier}
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-sm capitalize">
                            {statusData?.subscriptionStatus ?? "inactive"}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Choose the plan that fits your workflow. Upgrade or downgrade anytime.
                </p>
            </header>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {isBusy && (
                    <Card className="md:col-span-3">
                        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading plans...
                        </CardContent>
                    </Card>
                )}

                {!isBusy && planCards.length === 0 && (
                    <Card className="md:col-span-3">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No plans available right now.
                        </CardContent>
                    </Card>
                )}

                {!isBusy &&
                    planCards.map((plan: PlanCard) => {
                        const disabled = plan.isCurrent || isCreating || isCancelling;
                        const buttonLabel = plan.isCurrent
                            ? "Current Plan"
                            : plan.isPaidTier
                                ? `Subscribe ₹${plan.price}`
                                : "Switch";

                        return (
                            <Card key={plan.tier} className={plan.isCurrent ? "border-primary" : undefined}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="capitalize">{plan.name}</CardTitle>
                                        {plan.isCurrent && <Badge>Current</Badge>}
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <span className="text-3xl font-semibold">₹{plan.price}</span>
                                        <span className="text-sm text-muted-foreground"> / month</span>
                                    </div>
                                    <div className="rounded-md bg-muted p-3">
                                        <p className="text-sm font-medium">Credits: {plan.credits}</p>
                                    </div>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {plan.features.map((feature: string) => (
                                            <li key={feature}>• {feature}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {plan.isPaidTier ? (
                                        <Button
                                            disabled={disabled}
                                            className="w-full"
                                            onClick={() => handleSubscribe(plan.tier as "pro" | "premium")}
                                        >
                                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {buttonLabel}
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full" variant="outline">
                                            Free tier
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
            </section>

            {statusData?.subscriptionStatus === "active" && (
                <section className="flex flex-col gap-2 rounded-lg border bg-card p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Current subscription</h2>
                        <Button
                            variant="destructive"
                            disabled={isCancelling}
                            onClick={handleCancel}
                        >
                            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cancel subscription
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-3">
                        <div>
                            <p className="font-medium text-foreground">Credits remaining</p>
                            <p>{statusData.credits} / {statusData.dailyCreditsLimit}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Renews on</p>
                            <p>{statusData.subscriptionEndDate ? new Date(statusData.subscriptionEndDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Last reset</p>
                            <p>{statusData.lastCreditReset ? new Date(statusData.lastCreditReset).toLocaleDateString() : "N/A"}</p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
