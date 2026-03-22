"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ImagePlus,
  Send,
  UserPlus,
  ArrowRight,
  InfoIcon,
  StarIcon,
  MessageSquareIcon,
  DollarSignIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/auth-storage";
import { useAuthToken } from "@/services/auth.api";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCreateProjectMutation, subscriptionKeys } from "@/mutations/";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const TABS = ["All", "Landing", "App", "Auth", "Commerce", "Forms"];

const CHIPS_BY_TAB: Record<string, string[]> = {
  All:      ["Pricing page", "Analytics dashboard", "Login screen", "Landing hero", "Checkout", "Onboarding"],
  Landing:  ["Hero section", "Features block", "Pricing table", "Footer", "Testimonials", "CTA banner"],
  App:      ["Dashboard", "Data table", "Settings page", "Profile page", "Notifications", "Activity feed"],
  Auth:     ["Login screen", "Sign up form", "Forgot password", "Two-factor auth", "Magic link", "SSO screen"],
  Commerce: ["Product grid", "Product detail", "Cart page", "Checkout", "Order summary", "Order history"],
  Forms:    ["Contact form", "Multi-step wizard", "Survey", "Feedback form", "Booking form", "Upload form"],
};

const generateProjectId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}`;
};

const generateFrameId = () => `frame-${Math.random().toString(36).slice(2, 8)}`;

function HeroSection() {
  const [userInput, setUserInput] = useState("");
  const [focused, setFocused]     = useState(false);
  const [tab, setTab]             = useState("All");

  const router               = useRouter();
  const { openSignup }       = useAuthModal();
  const createProjectMutation = useCreateProjectMutation();
  const queryClient          = useQueryClient();
  const token                = useAuthToken();

  const handleGenerate = async () => {
    if (!token) {
      openSignup();
      return;
    }

    const trimmedInput = userInput.trim();
    if (!trimmedInput) {
      toast.error("Please describe what you want to design.");
      return;
    }

    const projectId = generateProjectId();
    const frameId   = generateFrameId();
    const messages: ChatMessage[] = [{ role: "user", content: trimmedInput }];

    try {
      await createProjectMutation.mutateAsync({
        payload: { projectId, frameId, messages },
        accessToken: token,
      });

      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      toast.success("Project created successfully");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (error) {
      console.error("Create project failed", error);
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    }
  };

  const handleImageUpload = () => {
    toast.info("Image upload coming soon");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-white font-base flex flex-col relative overflow-hidden">

      {/* Watermark */}
      <div  style={{ color: 'lightBlue' }} className="watermark watermark-center watermark-xl">BUILD - DESIGN - DEVELOP</div>

      {/* Hero */}
      <div className="landing-hero">
        <h1 className="landing-title">
          From prompt to<br />pixel-perfect UI
        </h1>

        {/* Search / Input bar */}
        <div
          className={`search-bar ${focused ? "focused" : ""}`}
          style={{ alignItems: "flex-start", padding: "12px 8px 8px 18px" }}
        >
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
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "var(--color-text-heading)",
              background: "transparent",
              fontFamily: "var(--font-base)",
              resize: "none",
              lineHeight: 1.5,
              paddingTop: 4,
            }}
          />
          {/* Bottom row: image upload + generate */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 8,
              paddingLeft: 8,
              height: "100%",
              minHeight: 72,
            }}
          >
            <button
              className="btn-icon"
              onClick={handleImageUpload}
              title="Upload image reference"
              style={{ padding: 6 }}
            >
              <ImagePlus size={18} />
            </button>

            <button
              className="search-btn"
              onClick={handleGenerate}
              disabled={token ? (!userInput.trim() || createProjectMutation.isPending) : false}
              style={{
                opacity: token && (!userInput.trim() || createProjectMutation.isPending) ? 0.6 : 1,
                cursor: token && (!userInput.trim() || createProjectMutation.isPending) ? "not-allowed" : "pointer",
              }}
            >
              {createProjectMutation.isPending ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Generating...
                </>
              ) : (
                !token ? (
                  <>
                    <UserPlus size={14} /> Sign up to Build
                  </>
                ) : (
                  <>
                    <Send size={14} /> Generate
                  </>
                )
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-group">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn ${tab === t ? "tab-active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chips */}
        <div className="chip-row">
          {(CHIPS_BY_TAB[tab] || []).map((c) => (
            <button
              key={c}
              className="chip"
              onClick={() => setUserInput(c)}
              disabled={!token}
              style={{
                opacity: !token ? 0.6 : 1,
                cursor: !token ? "not-allowed" : "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default HeroSection;