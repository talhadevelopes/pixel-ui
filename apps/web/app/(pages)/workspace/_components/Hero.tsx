"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Send, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/services/auth.api";
import { useAuthModal } from "@/components/global/AuthModalContext";
import { useCreateProjectMutation, subscriptionKeys } from "@/mutations/";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const TABS = ["All", "Landing", "App", "Auth", "Commerce", "Forms"];

const CHIPS_BY_TAB: Record<string, string[]> = {
  All:      ["Pricing page", "Analytics dashboard", "Login screen", "Landing hero", "Checkout", "Onboarding"],
  Landing:  ["Hero section", "Features block", "Pricing table", "Footer", "Testimonials", "CTA banner"],
  App:      ["Dashboard", "Data table", "Settings page", "Profile page", "Notifications", "Activity feed"],
  Auth:     ["Login screen", "Sign up form", "Forgot password", "Two-factor auth", "Magic link", "SSO screen"],
  Commerce: ["Product grid", "Product detail", "Cart page", "Checkout", "Order summary", "Order history"],
  Forms:    ["Contact form", "Multi-step wizard", "Survey", "Feedback form", "Booking form", "Upload form"],
};

const generateProjectId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `project-${Date.now()}`;

const generateFrameId = () => `frame-${Math.random().toString(36).slice(2, 8)}`;

function HeroSection() {
  const [userInput, setUserInput] = useState("");
  const [focused, setFocused]     = useState(false);
  const [tab, setTab]             = useState("All");
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);

  const router                = useRouter();
  const { openSignup }        = useAuthModal();
  const createProjectMutation = useCreateProjectMutation();
  const queryClient           = useQueryClient();
  const token                 = useAuthToken();

  const handleGenerate = async () => {
    if (!token) { openSignup(); return; }
    const trimmedInput = userInput.trim();
    if (!trimmedInput) { toast.error("Please describe what you want to design."); return; }
    const projectId = generateProjectId();
    const frameId   = generateFrameId();
    const messages: ChatMessage[] = [{ role: "user", content: trimmedInput }];
    try {
      await createProjectMutation.mutateAsync({ payload: { projectId, frameId, messages }, accessToken: token });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      toast.success("Project created successfully");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  };

  const isPending = createProjectMutation.isPending;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* Watermark */}
      <div style={{
        position: "absolute",
        bottom: -30, left: "50%", transform: "translateX(-50%)",
        fontSize: 240, fontWeight: 900,
        color: "rgba(37,99,235,0.035)",
        letterSpacing: -12,
        userSelect: "none", pointerEvents: "none",
        whiteSpace: "nowrap", zIndex: 0,
      }}>
        BUILD - DESIGN - DEVELOP
      </div>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 2,
        padding: "0 24px 12vh",
      }}>

        {/* Title */}
        <h1 style={{
          fontSize: 56, fontWeight: 700,
          color: "#0B1740",
          letterSpacing: -2.2, lineHeight: 1.1,
          textAlign: "center",
          marginBottom: 42, maxWidth: 680,
        }}>
          From prompt to<br />pixel-perfect UI
        </h1>

        {/* Search bar */}
        <div style={{
          width: "100%", maxWidth: 720,
          background: "#ffffff",
          border: `1.5px solid ${focused ? "#2563EB" : "#D1DCFA"}`,
          borderRadius: 18,
          display: "flex", alignItems: "flex-start",
          padding: "16px 12px 12px 24px",
          boxShadow: focused
            ? "0 0 0 5px rgba(37,99,235,0.08), 0 12px 36px rgba(37,99,235,0.12)"
            : "0 6px 24px rgba(37,99,235,0.07)",
          transition: "all 0.22s",
          marginBottom: 24,
        }}>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={!token}
            placeholder={!token ? "Please sign up to build interfaces..." : "Describe any UI… e.g. 'A modern SaaS landing page with hero section'"}
            rows={3}
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 17, color: "#0B1740",
              background: "transparent",
              resize: "none", lineHeight: 1.6, paddingTop: 4,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingLeft: 12, height: "100%", minHeight: 84 }}>
            {/* Image upload */}
            <button
              onClick={() => toast.info("Image upload coming soon")}
              title="Upload image reference"
              style={{ padding: 8, background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", borderRadius: 10, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2563EB")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >
              <ImagePlus size={20} />
            </button>

            {/* Generate button */}
            <button
              onClick={!token ? openSignup : handleGenerate}
              disabled={token ? (!userInput.trim() || isPending) : false}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", background: "#2563EB", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600,
                cursor: token && (!userInput.trim() || isPending) ? "not-allowed" : "pointer",
                opacity: token && (!userInput.trim() || isPending) ? 0.6 : 1,
                boxShadow: "0 6px 16px rgba(37,99,235,0.30)",
                transition: "all 0.15s",
              }}
            >
              {isPending ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  Generating...
                </>
              ) : !token ? (
                <><UserPlus size={18} /> Sign up to Build</>
              ) : (
                <><Send size={18} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "#F4F7FF", borderRadius: 14, padding: 6 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#ffffff" : "transparent",
                border: "none", borderRadius: 10,
                padding: "8px 20px", fontSize: 15,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#2563EB" : "#8A9AC0",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: tab === t ? "0 2px 6px rgba(0,0,0,0.07)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 720 }}>
          {(CHIPS_BY_TAB[tab] || []).map((c) => (
            <button
              key={c}
              onClick={() => { if (token) setUserInput(c); else openSignup(); }}
              onMouseEnter={() => setHoveredChip(c)}
              onMouseLeave={() => setHoveredChip(null)}
              style={{
                background: hoveredChip === c ? "#DBEAFE" : "#ffffff",
                border: `1px solid ${hoveredChip === c ? "#93C5FD" : "#E0E8FA"}`,
                color: hoveredChip === c ? "#1D4ED8" : "#4B68B0",
                borderRadius: 999, padding: "10px 22px",
                fontSize: 14, cursor: "pointer",
                fontWeight: 500,
                opacity: !token ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default HeroSection;