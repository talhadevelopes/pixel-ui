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
import { useAuthModal } from "@/contexts/AuthModalContext";
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
        gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center",
        padding: open ? "9px 10px" : "10px 0",
        border: "none", cursor: "pointer", borderRadius: 10,
        background: active ? C.primaryBg : hovered ? "#F0F5FF" : "transparent",
        color: color ?? (active ? C.primary : hovered ? C.primary : C.nav),
        
       fontSize: 13,
        fontWeight: active ? 600 : 400, textAlign: "left",
        position: "relative", whiteSpace: "nowrap", overflow: "hidden",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {active && (
        <div style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: C.primary, borderRadius: "0 3px 3px 0" }} />
      )}
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {open && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
      {open && active && <ChevronRight size={13} style={{ marginLeft: "auto", flexShrink: 0 }} />}
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
  const W = open ? 200 : 64;

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: W, flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.borderAlt}`,
        display: "flex", flexDirection: "column",
        padding: "14px 0",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden", position: "relative", height: "100vh",
      }}>

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", padding: open ? "0 14px 20px" : "0 0 20px", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, background: C.primary, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Sparkles size={14} />
            </div>
            {open && <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, whiteSpace: "nowrap" }}>BuildAI</span>}
          </div>
          {open && (
            <button onClick={() => setOpen(false)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: C.nav, display: "flex", padding: 4, borderRadius: 7 }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.nav; }}>
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Expand tab */}
        {!open && (
          <button onClick={() => setOpen(true)}
            style={{ position: "absolute", top: 16, right: -1, width: 20, height: 20, background: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 6px 6px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.nav, padding: 0, zIndex: 10 }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.nav}>
            <ChevronRight size={11} />
          </button>
        )}

        {/* GROUP 1 */}
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
          {open && <p style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 1.2, textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Main</p>}
          <Link href="/workspace" style={{ textDecoration: "none" }}>
            <NavBtn open={open} icon={<Home size={17} />} label="Home" title="Home" />
          </Link>
          {accessToken && (
            <NavBtn open={open} icon={<User size={17} />} label="Profile" title="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab(activeTab === "profile" ? null : "profile")} />
          )}
        </div>

        {/* Divider */}
        <div style={{ width: open ? "calc(100% - 16px)" : 28, height: 1, background: C.borderAlt, margin: "6px auto" }} />

        {/* GROUP 2 */}
        <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {open && <p style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 1.2, textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Workspace</p>}
          {accessToken ? (
            <NavBtn open={open} icon={<FolderOpen size={17} />} label="Projects" title="Projects"
              active={activeTab === "workspace"}
              onClick={() => setActiveTab(activeTab === "workspace" ? null : "workspace")} />
          ) : (
            <>
              <NavBtn open={open} icon={<UserPlus size={17} />} label="Sign up" title="Sign up" color={C.primary} onClick={openSignup} />
              <NavBtn open={open} icon={<LogIn size={17} />} label="Log in" title="Log in" onClick={openLogin} />
            </>
          )}
        </div>

        {/* BOTTOM */}
        <div style={{ padding: "0 8px", borderTop: `1px solid ${C.borderAlt}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          <NavBtn open={open}
            icon={theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            label={theme === "light" ? "Dark mode" : "Light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")} />

          {accessToken && (
            <Link href="/logout" style={{ textDecoration: "none" }}>
              <NavBtn open={open} icon={<LogOut size={17} />} label="Log out" title="Log out" color={C.error} />
            </Link>
          )}

          {accessToken && (
            <div style={{ display: "flex", alignItems: "center", gap: open ? 10 : 0, justifyContent: open ? "flex-start" : "center", padding: open ? "8px 10px 0" : "8px 0 0", overflow: "hidden" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, border: `2px solid ${C.bg}`, boxShadow: "0 0 0 2px #DBEAFE" }}>
                {avatarLetter}
              </div>
              {open && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: "nowrap" }}>{profile?.name ?? ""}</div>
                  <div style={{ fontSize: 10, color: C.faint, textTransform: "capitalize" }}>{subscriptionLabel} plan</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SLIDE-OUT PANEL ── */}
      {activeTab && (
        <div style={{ width: 280, height: "100vh", background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, animation: "slideIn 0.18s ease" }}>

          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>Profile</span>
                <button onClick={() => setActiveTab(null)} style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.nav }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, border: `2px solid ${C.bg}`, boxShadow: "0 0 0 3px #DBEAFE" }}>
                    {avatarLetter}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.name ?? ""}</div>
                    <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.email ?? ""}</div>
                  </div>
                </div>

                <div style={{ background: C.primaryBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Credits Remaining</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 8 }}>
                    {userCredits}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> / {totalCredits}</span>
                  </div>
                  <Progress value={creditPercentage} className="h-1.5" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: C.muted, textTransform: "capitalize" }}>Plan: {subscriptionLabel}</span>
                    <Link href="/payments"><span style={{ fontSize: 11, fontWeight: 700, color: C.primary, cursor: "pointer" }}>Upgrade →</span></Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Subscription</div>
                  {[["Status", subscriptionLabel], ["Daily Limit", `${totalCredits} credits`], ["Used Today", `${totalCredits - userCredits} credits`]].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, textTransform: "capitalize" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <Link href="/payments" style={{ display: "block" }}>
                  <button style={{ width: "100%", padding: "10px 0", background: C.primary, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
                    Manage Subscription
                  </button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "workspace" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>Workspace</span>
                <button onClick={() => setActiveTab(null)} style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.nav }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.ghost, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Recent Projects</div>
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