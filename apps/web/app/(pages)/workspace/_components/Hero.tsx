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
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">

      {/* Watermark */}
      <div className="absolute bottom-[-10px] md:bottom-[-30px] left-1/2 -translate-x-1/2 text-[56px] sm:text-[100px] md:text-[240px] font-black text-[rgba(37,99,235,0.035)] tracking-[-4px] md:tracking-[-12px] select-none pointer-events-none whitespace-nowrap z-0 max-md:overflow-hidden max-w-full">
        BUILD - DESIGN - DEVELOP
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-[2] px-4 pt-4 pb-10 md:px-6 md:pt-0 md:pb-[12vh]">

        {/* Title */}
        <h1 className="text-[28px] sm:text-4xl md:text-[56px] font-bold text-[#0B1740] tracking-[-1px] md:tracking-[-2.2px] leading-[1.15] md:leading-[1.1] text-center mb-6 md:mb-[42px] max-w-[680px]">
          From prompt to<br />pixel-perfect UI
        </h1>

        {/* Search bar */}
        <div
          className={`w-full max-w-[720px] bg-white rounded-2xl md:rounded-[18px] flex flex-col md:flex-row md:items-start p-3 md:py-4 md:pr-3 md:pl-6 mb-5 md:mb-6 transition-all duration-[0.22s] ${
            focused
              ? "border-[1.5px] border-[#2563EB] shadow-[0_0_0_5px_rgba(37,99,235,0.08),0_12px_36px_rgba(37,99,235,0.12)]"
              : "border-[1.5px] border-[#D1DCFA] shadow-[0_6px_24px_rgba(37,99,235,0.07)]"
          }`}
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
            className="flex-1 border-none outline-none text-sm md:text-[17px] text-[#0B1740] bg-transparent resize-none leading-relaxed pt-1 md:pt-1 w-full min-h-[72px] md:min-h-0"
          />

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-3 md:gap-3 pl-0 md:pl-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8EEF8] md:border-none mt-2 md:mt-0 md:min-h-[84px] w-full md:w-auto">
            {/* Image upload */}
            <button
              onClick={() => toast.info("Image upload coming soon")}
              title="Upload image reference"
              className="p-2 bg-transparent border-none cursor-pointer text-[#94A3B8] flex rounded-[10px] hover:text-[#2563EB] transition-colors"
            >
              <ImagePlus size={20} />
            </button>

            {/* Generate button */}
            <button
              onClick={!token ? openSignup : handleGenerate}
              disabled={token ? (!userInput.trim() || isPending) : false}
              className={`inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 md:px-7 md:py-3.5 bg-[#2563EB] text-white border-none rounded-xl text-sm md:text-base font-semibold shadow-[0_6px_16px_rgba(37,99,235,0.30)] transition-all ${
                token && (!userInput.trim() || isPending) ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
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
        <div className="flex gap-1.5 md:gap-1.5 mb-4 md:mb-[18px] bg-[#F4F7FF] rounded-xl md:rounded-[14px] p-1 md:p-1.5 max-w-full overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-none rounded-lg md:rounded-[10px] px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-[15px] cursor-pointer transition-all ${
                tab === t
                  ? "bg-white font-semibold text-[#2563EB] shadow-[0_2px_6px_rgba(0,0,0,0.07)]"
                  : "bg-transparent font-normal text-[#8A9AC0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 md:gap-2.5 justify-center max-w-[720px] px-1">
          {(CHIPS_BY_TAB[tab] || []).map((c) => (
            <button
              key={c}
              onClick={() => { if (token) setUserInput(c); else openSignup(); }}
              onMouseEnter={() => setHoveredChip(c)}
              onMouseLeave={() => setHoveredChip(null)}
              className={`rounded-full px-3.5 py-2 md:px-[22px] md:py-2.5 text-xs md:text-sm font-medium cursor-pointer transition-all ${
                !token ? "opacity-60" : ""
              } ${
                hoveredChip === c
                  ? "bg-[#DBEAFE] border border-[#93C5FD] text-[#1D4ED8]"
                  : "bg-white border border-[#E0E8FA] text-[#4B68B0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
