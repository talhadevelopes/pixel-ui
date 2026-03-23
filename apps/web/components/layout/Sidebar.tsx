"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Progress } from "@workspace/ui";
import {
  Sparkles, LogOut, Moon, Sun, FolderOpen, User, X, Home,
  ChevronRight, PanelLeftClose, UserPlus, LogIn,
} from "lucide-react";
import { useSubscriptionStatusQuery } from "@/mutations/";
import { useAuthToken } from "@/services/auth.api";
import { useAuthModal } from "@/components/global/AuthModalContext";
import { useProfileQuery } from "@/queries/";
import { ProjectHistory } from "@/components/layout/ProjectsHistory";

const C = {
  navy:      "#0B1740",
  primary:   "#2563EB",
  primaryBg: "#EBF2FF",
  border:    "#E0E8FA",
  borderAlt: "#E8EEF8",
  bg:        "#ffffff",
  sidebar:   "#FAFBFF",
  muted:     "#8A9AC0",
  faint:     "#B0C0DC",
  ghost:     "#C4D0E8",
  nav:       "#94A3B8",
  error:     "#EF4444",
};

function NavBtn({ onClick, active, title, open, icon, label, color }: {
  onClick?: () => void; active?: boolean; title?: string;
  open: boolean; icon: React.ReactNode; label?: string; color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={!open ? title : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: open ? 14 : 0, justifyContent: open ? "flex-start" : "center",
        padding: open ? "12px 16px" : "14px 0",
        border: "none", cursor: "pointer", borderRadius: 12,
        background: active ? C.primaryBg : hovered ? "#F0F5FF" : "transparent",
        color: color ?? (active ? C.primary : hovered ? C.primary : C.nav),
        
       fontSize: 15,
        fontWeight: active ? 600 : 400, textAlign: "left",
        position: "relative", whiteSpace: "nowrap", overflow: "hidden",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {active && (
        <div style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 4, height: 26, background: C.primary, borderRadius: "0 4px 4px 0" }} />
      )}
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {open && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
      {open && active && <ChevronRight size={15} style={{ marginLeft: "auto", flexShrink: 0 }} />}
    </button>
  );
}

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
  const W = open ? 260 : 80;

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: W, flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.borderAlt}`,
        display: "flex", flexDirection: "column",
        padding: "16px 0",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden", position: "relative", height: "100vh",
      }}>

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", padding: open ? "0 20px 24px" : "0 0 24px", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, background: C.primary, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            {open && <span style={{ fontWeight: 700, fontSize: 18, color: C.navy, whiteSpace: "nowrap" }}>BuildAI</span>}
          </div>
          {open && (
            <button onClick={() => setOpen(false)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: C.nav, display: "flex", padding: 6, borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.nav; }}>
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        {/* Expand tab */}
        {!open && (
          <button onClick={() => setOpen(true)}
            style={{ position: "absolute", top: 20, right: -1, width: 24, height: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 8px 8px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.nav, padding: 0, zIndex: 10 }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.nav}>
            <ChevronRight size={14} />
          </button>
        )}

        {/* GROUP 1 */}
        <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {open && <p style={{ fontSize: 12, fontWeight: 700, color: C.ghost, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>Main</p>}
          <Link href="/workspace" style={{ textDecoration: "none" }}>
            <NavBtn open={open} icon={<Home size={20} />} label="Home" title="Home" />
          </Link>
          {accessToken && (
            <NavBtn open={open} icon={<User size={20} />} label="Profile" title="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab(activeTab === "profile" ? null : "profile")} />
          )}
        </div>

        {/* Divider */}
        <div style={{ width: open ? "calc(100% - 20px)" : 32, height: 1, background: C.borderAlt, margin: "8px auto" }} />

        {/* GROUP 2 */}
        <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {open && <p style={{ fontSize: 12, fontWeight: 700, color: C.ghost, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>Workspace</p>}
          {accessToken ? (
            <NavBtn open={open} icon={<FolderOpen size={20} />} label="Projects" title="Projects"
              active={activeTab === "workspace"}
              onClick={() => setActiveTab(activeTab === "workspace" ? null : "workspace")} />
          ) : (
            <>
              <NavBtn open={open} icon={<UserPlus size={20} />} label="Sign up" title="Sign up" color={C.primary} onClick={openSignup} />
              <NavBtn open={open} icon={<LogIn size={20} />} label="Log in" title="Log in" onClick={openLogin} />
            </>
          )}
        </div>

        {/* BOTTOM */}
        <div style={{ padding: "0 10px", borderTop: `1px solid ${C.borderAlt}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
          <NavBtn open={open}
            icon={theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            label={theme === "light" ? "Dark mode" : "Light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")} />

          {accessToken && (
            <Link href="/logout" style={{ textDecoration: "none" }}>
              <NavBtn open={open} icon={<LogOut size={20} />} label="Log out" title="Log out" color={C.error} />
            </Link>
          )}

          {accessToken && (
            <div style={{ display: "flex", alignItems: "center", gap: open ? 12 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "10px 12px 0" : "10px 0 0", overflow: "hidden" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0, border: `2px solid ${C.bg}`, boxShadow: "0 0 0 2px #DBEAFE" }}>
                {avatarLetter}
              </div>
              {open && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, whiteSpace: "nowrap" }}>{profile?.name ?? ""}</div>
                  <div style={{ fontSize: 12, color: C.faint, textTransform: "capitalize" }}>{subscriptionLabel} plan</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SLIDE-OUT PANEL ── */}
      {activeTab && (
        <div style={{ width: 340, height: "100vh", background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, animation: "slideIn 0.18s ease" }}>

          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>Profile</span>
                <button onClick={() => setActiveTab(null)} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.nav }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0, border: `2px solid ${C.bg}`, boxShadow: "0 0 0 4px #DBEAFE" }}>
                    {avatarLetter}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.name ?? ""}</div>
                    <div style={{ fontSize: 13, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.email ?? ""}</div>
                  </div>
                </div>

                <div style={{ background: C.primaryBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.ghost, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Credits Remaining</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.navy, marginBottom: 10 }}>
                    {userCredits}<span style={{ fontSize: 16, fontWeight: 400, color: C.muted }}> / {totalCredits}</span>
                  </div>
                  <Progress value={creditPercentage} className="h-2" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 13, color: C.muted, textTransform: "capitalize" }}>Plan: {subscriptionLabel}</span>
                    <Link href="/payments"><span style={{ fontSize: 13, fontWeight: 700, color: C.primary, cursor: "pointer" }}>Upgrade →</span></Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 12 }}>Subscription</div>
                  {[["Status", subscriptionLabel], ["Daily Limit", `${totalCredits} credits`], ["Used Today", `${totalCredits - userCredits} credits`]].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, color: C.muted }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, textTransform: "capitalize" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <Link href="/payments" style={{ display: "block" }}>
                  <button style={{ width: "100%", padding: "12px 0", background: C.primary, color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
                    Manage Subscription
                  </button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "workspace" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>Workspace</span>
                <button onClick={() => setActiveTab(null)} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.nav }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ghost, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Recent Projects</div>
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