"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Globe, CheckCircle2, Zap } from "lucide-react";
import {
  useSubscriptionPlansQuery,
  useSubscriptionStatusQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
} from "@/mutations/";
import { PlanCard, SubscriptionPlan } from "@workspace/types";
import { useAuthToken } from "@/services/auth.api";
import TopLoader from "@/components/custom/Loader";

const PAID_TIERS: Array<"pro" | "premium"> = ["pro", "premium"];

const C = {
  navy:        "#0B1740",
  primary:     "#2563EB",
  primaryBg:   "#EBF2FF",
  primaryRing: "rgba(37,99,235,0.2)",
  muted:       "#8A9AC0",
  body:        "#5570A8",
  border:      "#E0E8FA",
  white:       "#ffffff",
  pageBg:      "#F4F7FF",
  red:         "#EF4444",
};

export default function PaymentsPage() {
  const accessToken = useAuthToken();

  const { data: plansData,  isLoading: isLoadingPlans }  = useSubscriptionPlansQuery(accessToken);
  const { data: statusData, isLoading: isLoadingStatus } = useSubscriptionStatusQuery(accessToken);

  const { mutateAsync: createSubscription, isPending: isCreating }   = useCreateSubscriptionMutation(accessToken);
  const { mutateAsync: cancelSubscription, isPending: isCancelling } = useCancelSubscriptionMutation(accessToken);

  const currentTier = statusData?.tier ?? "free";
  const credits     = statusData?.credits ?? 0;
  const creditLimit = statusData?.dailyCreditsLimit ?? 3;
  const creditPct   = creditLimit > 0 ? Math.round((credits / creditLimit) * 100) : 0;
  const isActive    = statusData?.subscriptionStatus === "active";
  const isBusy      = isLoadingPlans || isLoadingStatus;

  const planCards = useMemo<PlanCard[]>(() => {
    if (!plansData?.plans?.length) return [];
    return plansData.plans.map<PlanCard>((plan: SubscriptionPlan) => ({
      ...plan,
      isCurrent:  plan.tier === currentTier,
      isPaidTier: PAID_TIERS.includes(plan.tier as "pro" | "premium"),
    }));
  }, [plansData, currentTier]);

  const handleSubscribe = async (tier: "pro" | "premium") => {
    if (!accessToken) { toast.error("Please log in to subscribe"); return; }
    try {
      const result = await createSubscription({ tier });
      if (result?.shortUrl) { window.location.href = result.shortUrl; return; }
      toast.success("Subscription created. Please complete payment.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start subscription");
    }
  };

  const handleCancel = async () => {
    if (!accessToken) { toast.error("Please log in"); return; }
    try {
      await cancelSubscription();
      toast.success("Subscription cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    }
  };

  return (
    <div style={{ background: C.white, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 64, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ position: "sticky", top: 96 }}>

            {/* Status badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              marginBottom: 24, padding: "6px 14px", borderRadius: 999,
              border: `1px solid ${isActive ? "rgba(37,99,235,0.25)" : "rgba(148,163,184,0.25)"}`,
              background: isActive ? "rgba(37,99,235,0.07)" : "rgba(148,163,184,0.07)",
              fontSize: 12, fontWeight: 500,
              color: isActive ? C.primary : C.muted,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? C.primary : C.muted, display: "inline-block" }} />
              {isActive ? `Active · ${currentTier} plan` : "Free tier"}
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 52, fontWeight: 900, color: C.navy, lineHeight: 1.05, marginBottom: 20 }}>
              Scale your <br />
              <span style={{ color: C.primary }}>vision.</span>
            </h1>

            <p style={{ fontSize: 15, color: C.body, marginBottom: 40, maxWidth: 360, lineHeight: 1.7 }}>
              From your first project to millions of users — choose the plan that grows with you. Upgrade or cancel anytime.
            </p>

            {/* Credit meter */}
            <div style={{
              marginBottom: 40, padding: "14px 16px", borderRadius: 16,
              border: `1px solid ${C.border}`, background: C.pageBg,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 8 }}>
                <span>Daily credits</span>
                <span style={{ fontWeight: 600, color: C.navy }}>{credits} / {creditLimit} used</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.border }}>
                <div style={{ height: 6, borderRadius: 3, background: C.primary, width: `${creditPct}%`, transition: "width 0.5s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Resets daily at midnight UTC</p>
            </div>

            {/* Value props */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: <Shield size={16} />, title: "Enterprise grade security", desc: "Your data protected by industry-leading security protocols." },
                { icon: <Globe size={16} />,  title: "Global infrastructure",     desc: "Deploy closer to your users with our global edge network."  },
                { icon: <Zap size={16} />,    title: "Instant activation",        desc: "Your plan activates immediately after payment."              },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <div style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                    background: C.primaryBg, display: "flex", alignItems: "center",
                    justifyContent: "center", color: C.primary,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel */}
            {isActive && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                style={{
                  marginTop: 32, display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, fontWeight: 500, padding: "8px 16px", borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.06)", color: C.red,
                  cursor: isCancelling ? "not-allowed" : "pointer",
                  opacity: isCancelling ? 0.6 : 1,
                }}
              >
                {isCancelling && <TopLoader />}
                Cancel subscription
              </button>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {isBusy && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "5rem", fontSize: 14, color: C.muted }}>
                <TopLoader /> Loading plans…
              </div>
            )}

            {!isBusy && planCards.length === 0 && (
              <div style={{ textAlign: "center", padding: "5rem", fontSize: 14, color: C.muted }}>
                No plans available right now.
              </div>
            )}

            {!isBusy && planCards.map((plan: PlanCard) => {
              const isCurrent = plan.isCurrent;
              const disabled  = isCurrent || isCreating || isCancelling;

              return (
                <motion.div
                  key={plan.tier}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  style={{
                    padding: "2rem 2.5rem",
                    borderRadius: 28,
                    border: isCurrent ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                    background: isCurrent ? C.navy : C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 32,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* decorative blob */}
                  {isCurrent && (
                    <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,0.2)", top: -70, right: -70, pointerEvents: "none" }} />
                  )}

                  {/* Left */}
                  <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    {/* Name + badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <h3 style={{ fontSize: 26, fontWeight: 900, color: isCurrent ? C.white : C.navy, margin: 0 }}>
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: C.primary, color: C.white }}>
                          Current
                        </span>
                      )}
                      {plan.tier === "pro" && !isCurrent && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: C.primaryBg, color: C.primary }}>
                          Popular
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: 13, color: isCurrent ? C.muted : C.body, maxWidth: 280, lineHeight: 1.6, marginBottom: 12 }}>
                      {plan.description}
                    </p>

                    {/* Credits pill */}
                    <span style={{
                      display: "inline-block", fontSize: 12, fontWeight: 500,
                      padding: "4px 12px", borderRadius: 999, marginBottom: 14,
                      background: isCurrent ? "rgba(37,99,235,0.22)" : C.primaryBg,
                      color: isCurrent ? "#93C5FD" : C.primary,
                    }}>
                      {plan.credits} credits / day
                    </span>

                    {/* Features */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                      {plan.features.map((f: string) => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: isCurrent ? C.muted : C.body }}>
                          <CheckCircle2 size={13} color={C.primary} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, flexShrink: 0, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 42, fontWeight: 900, color: isCurrent ? C.white : C.navy, lineHeight: 1 }}>
                      ₹{plan.price}
                      <span style={{ fontSize: 14, fontWeight: 500, color: isCurrent ? C.muted : C.body }}>/mo</span>
                    </div>

                    {plan.isPaidTier ? (
                      <button
                        disabled={disabled}
                        onClick={() => handleSubscribe(plan.tier as "pro" | "premium")}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "12px 28px", borderRadius: 12,
                          fontSize: 14, fontWeight: 700, border: "none",
                          background: isCurrent ? "rgba(37,99,235,0.3)" : C.primary,
                          color: C.white,
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled && !isCurrent ? 0.6 : 1,
                          boxShadow: !isCurrent && !disabled ? "0 4px 16px rgba(37,99,235,0.35)" : "none",
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isCreating && <TopLoader />}
                        {isCurrent ? "Current plan" : `Subscribe · ₹${plan.price}`}
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          padding: "12px 28px", borderRadius: 12,
                          fontSize: 14, fontWeight: 700,
                          background: "transparent",
                          border: `1px solid ${C.border}`,
                          color: C.muted, cursor: "not-allowed",
                        }}
                      >
                        Free tier
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Trust row */}
            {!isBusy && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap", paddingTop: 8 }}>
                {["Cancel anytime", "No contracts", "Instant access", "Secure payments"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.primary }} />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}