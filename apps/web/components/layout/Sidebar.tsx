"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Progress } from "@workspace/ui";
import {
  Sparkles, LogOut, Moon, Sun, FolderOpen, User, X, Home,
  ChevronRight, PanelLeftClose, PanelLeftOpen, Settings,
  UserPlus, LogIn,
} from "lucide-react";
import { useSubscriptionStatusQuery } from "@/mutations/";
import { getAccessToken } from "@/lib/auth-storage";
import { useAuthToken } from "@/services/auth.api";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useProfileQuery } from "@/queries/";
import { ProjectHistory } from "@/components/layout/ProjectsHistory";

export function Sidebar() {
  const [open, setOpen]           = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "workspace" | null>(null);

  const accessToken                  = useAuthToken();
  const { openLogin, openSignup }    = useAuthModal();
  const { data: subscriptionStatus } = useSubscriptionStatusQuery(accessToken);
  const { theme, setTheme }          = useTheme();
  const { data: profile }            = useProfileQuery(accessToken);

  const userCredits       = subscriptionStatus?.credits ?? 0;
  const totalCredits      = subscriptionStatus?.dailyCreditsLimit ?? 0;
  const creditPercentage  = totalCredits > 0 ? (userCredits / totalCredits) * 100 : 0;
  const subscriptionLabel = subscriptionStatus?.subscriptionStatus ?? "inactive";
  const avatarLetter      = (profile?.name?.[0] ?? profile?.email?.[0] ?? "U").toUpperCase();

  const W = open ? 200 : 64;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "var(--font-base)" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: W,
        flexShrink: 0,
        background: "var(--color-bg-sidebar)",
        borderRight: "1px solid var(--color-border-alt)",
        display: "flex",
        flexDirection: "column",
        padding: "14px 0",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        position: "relative",
        height: "100vh",
      }}>

        {/* Logo row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          padding: open ? "0 14px 20px" : "0 0 20px",
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="logo-icon logo-icon-md" style={{ flexShrink: 0 }}>
              <Sparkles size={14} />
            </div>
            {open && (
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-heading)", whiteSpace: "nowrap" }}>
                BuildAI
              </span>
            )}
          </div>
          {open && (
            <button
              className="btn-icon btn-icon-sm"
              onClick={() => setOpen(false)}
              style={{ flexShrink: 0 }}
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Expand tab — only when collapsed */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              position: "absolute",
              top: 16,
              right: -1,
              width: 20,
              height: 20,
              background: "var(--color-bg-white)",
              border: "1px solid var(--color-border)",
              borderRadius: "0 6px 6px 0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-nav)",
              padding: 0,
              zIndex: 10,
            }}
          >
            <ChevronRight size={11} />
          </button>
        )}

        {/* GROUP 1 — Main */}
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
          {open && (
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-ghost)", letterSpacing: 1.2, textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>
              Main
            </p>
          )}

          {/* Home */}
          <Link href="/workspace" style={{ textDecoration: "none" }}>
            <button
              title={!open ? "Home" : undefined}
              className="nav-item"
              style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "10px 0" }}
            >
              <span style={{ flexShrink: 0 }}><Home size={17} /></span>
              {open && <span>Home</span>}
            </button>
          </Link>

          {/* Profile */}
          {accessToken && (
            <button
              title={!open ? "Profile" : undefined}
              onClick={() => setActiveTab(activeTab === "profile" ? null : "profile")}
              className={`nav-item ${activeTab === "profile" ? "nav-active" : ""}`}
              style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "10px 0" }}
            >
              {activeTab === "profile" && <div className="nav-item__accent" />}
              <span style={{ flexShrink: 0 }}><User size={17} /></span>
              {open && <span>Profile</span>}
              {open && activeTab === "profile" && <ChevronRight size={13} style={{ marginLeft: "auto", flexShrink: 0 }} />}
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: open ? "calc(100% - 16px)" : 28, height: 1, background: "var(--color-border-alt)", margin: "6px auto" }} />

        {/* GROUP 2 — Workspace */}
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {open && (
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-ghost)", letterSpacing: 1.2, textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>
              Workspace
            </p>
          )}

          {accessToken ? (
            <button
              title={!open ? "Projects" : undefined}
              onClick={() => setActiveTab(activeTab === "workspace" ? null : "workspace")}
              className={`nav-item ${activeTab === "workspace" ? "nav-active" : ""}`}
              style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "10px 0" }}
            >
              {activeTab === "workspace" && <div className="nav-item__accent" />}
              <span style={{ flexShrink: 0 }}><FolderOpen size={17} /></span>
              {open && <span>Projects</span>}
              {open && activeTab === "workspace" && <ChevronRight size={13} style={{ marginLeft: "auto", flexShrink: 0 }} />}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                title={!open ? "Sign up" : undefined}
                onClick={openSignup}
                className="nav-item"
                style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "10px 0", color: "var(--color-primary)" }}
              >
                <span style={{ flexShrink: 0 }}><UserPlus size={17} /></span>
                {open && <span>Sign up</span>}
              </button>
              <button
                title={!open ? "Log in" : undefined}
                onClick={openLogin}
                className="nav-item"
                style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "10px 0" }}
              >
                <span style={{ flexShrink: 0 }}><LogIn size={17} /></span>
                {open && <span>Log in</span>}
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM */}
        <div style={{ padding: "0 8px", borderTop: "1px solid var(--color-border-alt)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Theme toggle */}
          <button
            title={!open ? (theme === "light" ? "Dark mode" : "Light mode") : undefined}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="nav-item"
            style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "9px 0" }}
          >
            <span style={{ flexShrink: 0 }}>
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </span>
            {open && (theme === "light" ? "Dark mode" : "Light mode")}
          </button>

          {/* Logout */}
          {accessToken && (
            <Link href="/logout" style={{ textDecoration: "none" }}>
              <button
                title={!open ? "Log out" : undefined}
                className="nav-item"
                style={{ gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "9px 10px" : "9px 0", color: "var(--color-error)" }}
              >
                <span style={{ flexShrink: 0 }}><LogOut size={17} /></span>
                {open && "Log out"}
              </button>
            </Link>
          )}

          {/* Avatar row */}
          {accessToken && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: open ? 10 : 0,
              justifyContent: open ? "flex-start" : "center",
              padding: open ? "8px 10px 0" : "8px 0 0",
              overflow: "hidden",
            }}>
              <div className="user-avatar">{avatarLetter}</div>
              {open && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-heading)", whiteSpace: "nowrap" }}>
                    {profile?.name ?? ""}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "capitalize" }}>
                    {subscriptionLabel} plan
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SLIDE-OUT PANEL ── */}
      {activeTab && (
        <div style={{
          width: 280,
          height: "100vh",
          background: "var(--color-bg-white)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          animation: "slideIn 0.18s ease",
        }}>

          {/* PROFILE PANEL */}
          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-heading)" }}>Profile</span>
                <button className="btn-icon btn-icon-sm" onClick={() => setActiveTab(null)}><X size={15} /></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 16, boxShadow: "0 0 0 3px #DBEAFE" }}>
                    {avatarLetter}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {profile?.name ?? ""}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {profile?.email ?? ""}
                    </div>
                  </div>
                </div>

                {/* Credits */}
                <div style={{ background: "var(--color-primary-bg)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-ghost)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Credits Remaining</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-heading)", marginBottom: 8 }}>
                    {userCredits}<span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-text-muted)" }}> / {totalCredits}</span>
                  </div>
                  <Progress value={creditPercentage} className="h-1.5" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "capitalize" }}>Plan: {subscriptionLabel}</span>
                    <Link href="/payments"><span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", cursor: "pointer" }}>Upgrade →</span></Link>
                  </div>
                </div>

                {/* Subscription rows */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-heading)", marginBottom: 10 }}>Subscription</div>
                  {[
                    ["Status", subscriptionLabel],
                    ["Daily Limit", `${totalCredits} credits`],
                    ["Used Today", `${totalCredits - userCredits} credits`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-heading)", textTransform: "capitalize" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <Link href="/payments" style={{ display: "block" }}>
                  <button className="btn-primary btn-primary-full" style={{ padding: "10px 0", fontSize: 13 }}>
                    Manage Subscription
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* WORKSPACE PANEL */}
          {activeTab === "workspace" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-heading)" }}>Workspace</span>
                <button className="btn-icon btn-icon-sm" onClick={() => setActiveTab(null)}><X size={15} /></button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-ghost)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>
                  Recent Projects
                </div>
                <ProjectHistory />
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}