"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Send, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/services/auth.api";
import { useAuthModal } from "@/contexts/AuthModalContext";
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
          fontSize: 48, fontWeight: 700,
          color: "#0B1740",
          letterSpacing: -1.8, lineHeight: 1.1,
          textAlign: "center",
          marginBottom: 36, maxWidth: 540,
        }}>
          From prompt to<br />pixel-perfect UI
        </h1>

        {/* Search bar */}
        <div style={{
          width: "100%", maxWidth: 580,
          background: "#ffffff",
          border: `1.5px solid ${focused ? "#2563EB" : "#D1DCFA"}`,
          borderRadius: 14,
          display: "flex", alignItems: "flex-start",
          padding: "12px 8px 8px 18px",
          boxShadow: focused
            ? "0 0 0 4px rgba(37,99,235,0.08), 0 8px 28px rgba(37,99,235,0.10)"
            : "0 4px 20px rgba(37,99,235,0.07)",
          transition: "all 0.22s",
          marginBottom: 20,
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
              fontSize: 15, color: "#0B1740",
              background: "transparent",
              resize: "none", lineHeight: 1.5, paddingTop: 4,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 8, paddingLeft: 8, height: "100%", minHeight: 72 }}>
            {/* Image upload */}
            <button
              onClick={() => toast.info("Image upload coming soon")}
              title="Upload image reference"
              style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", borderRadius: 8, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2563EB")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >
              <ImagePlus size={18} />
            </button>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={token ? (!userInput.trim() || isPending) : false}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 20px", background: "#2563EB", color: "#fff",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: token && (!userInput.trim() || isPending) ? "not-allowed" : "pointer",
                opacity: token && (!userInput.trim() || isPending) ? 0.6 : 1,
                boxShadow: "0 4px 12px rgba(37,99,235,0.30)",
                transition: "opacity 0.15s",
              }}
            >
              {isPending ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  Generating...
                </>
              ) : !token ? (
                <><UserPlus size={14} /> Sign up to Build</>
              ) : (
                <><Send size={14} /> Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#F4F7FF", borderRadius: 12, padding: 4 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#ffffff" : "transparent",
                border: "none", borderRadius: 9,
                padding: "6px 16px", fontSize: 13,
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#2563EB" : "#8A9AC0",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 540 }}>
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
                borderRadius: 999, padding: "7px 16px",
                fontSize: 12, cursor: !token ? "not-allowed" : "pointer",
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