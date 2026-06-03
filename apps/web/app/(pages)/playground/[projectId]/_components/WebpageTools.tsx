import {
  Clock, Code, Download, History, Laptop, Monitor,
  SquareArrowOutUpRight, TabletSmartphone, Undo2, Redo2,
  Layers, Smartphone, MoreHorizontal,
} from "lucide-react";
import { ViewCodeBlock } from "./ViewCodeBlock";
import { useEffect, useState } from "react";
import { baseDocument } from "@/lib/code-templates";
import {
  Select, Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@workspace/ui";
import { useAuthToken } from "@/services/auth.api";
import { fetchFrameHistory, fetchFrameSnapshot } from "@/services/frames.api";
import type { FrameSnapshotMeta } from "@workspace/types";

const C = {
  navy: "#0B1740", primary: "#2563EB", primaryBg: "#EBF2FF",
  border: "#E0E8FA", muted: "#8A9AC0", bg: "#ffffff", pageBg: "#F8FAFF",
};

function Btn({ onClick, title, children, active, variant = "ghost" }: {
  onClick?: () => void; title?: string; children: React.ReactNode;
  active?: boolean; variant?: "ghost" | "outline" | "primary";
}) {
  const s: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
    transition: "all 0.15s",
    ...(variant === "primary"
      ? { background: C.primary, color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }
      : variant === "outline"
      ? { background: C.bg, color: C.navy, border: `1px solid ${C.border}` }
      : { background: active ? C.primaryBg : "transparent", color: active ? C.primary : C.muted, border: active ? `1px solid ${C.border}` : "1px solid transparent" }),
  };
  return <button onClick={onClick} title={title} style={s}>{children}</button>;
}

export function WebPageTools({
  selectedScreenSize, onScreenSizeChange, generatedCode, currentCode,
  projectId, frameId, onPreviewHtml, onQuickAction, onTryAnother, onUndo, onRedo,
}: any) {
  const accessToken = useAuthToken();
  const [finalCode, setFinalCode] = useState("");
  const [history, setHistory] = useState<FrameSnapshotMeta[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("current");
  const [compareCode, setCompareCode] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const clean = (baseDocument.replace("{code}", currentCode || generatedCode || "") || "")
      .replaceAll("```html", "").replace(/```/g, "").replace(/\bhtml\b/, "");
    setFinalCode(clean);
  }, [currentCode, generatedCode]);

  useEffect(() => {
    const load = async () => {
      if (!accessToken || !projectId || !frameId) return;
      try {
        const s = await fetchFrameHistory({ projectId, frameId }, accessToken);
        setHistory(s);
      } catch {}
    };
    load();
  }, [accessToken, projectId, frameId]);

  const openNewTab = () => {
    if (!finalCode) return;
    const url = URL.createObjectURL(new Blob([finalCode], { type: "text/html" }));
    window.open(url, "_blank");
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([finalCode], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url; a.download = "index.html";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleVersionChange = async (value: string) => {
    if (value === "current") {
      setSelectedVersion("current");
      onPreviewHtml?.(generatedCode);
      return;
    }
    const id = Number(value);
    if (!accessToken || !id) return;
    try {
      setSelectedVersion(value);
      const snap = await fetchFrameSnapshot(id, accessToken);
      onPreviewHtml?.(snap.designCode);
      setFinalCode((baseDocument.replace("{code}", snap.designCode) || "")
        .replaceAll("```html", "").replace("```", "").replace("html", ""));
    } catch {}
  };

  // Shared version select handler (desktop + mobile)
  const handleVersionSelect = async (v: string) => {
    await handleVersionChange(v);
    if (v !== "current") {
      const id = Number(v);
      if (accessToken && id) {
        try { const s = await fetchFrameSnapshot(id, accessToken); setCompareCode(s?.designCode ?? ""); } catch {}
      }
    } else {
      setCompareCode("");
    }
  };

  const screens = [
    { key: "web",    Icon: Monitor,          title: "Desktop" },
    { key: "laptop", Icon: Laptop,           title: "Laptop" },
    { key: "tablet", Icon: TabletSmartphone, title: "Tablet" },
    { key: "mobile", Icon: Smartphone,       title: "Mobile" },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", background: C.bg, borderBottom: `1px solid ${C.border}`,
      gap: 10, flexWrap: "nowrap", fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── LEFT GROUP ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

        {/* DESKTOP: viewport toggles + divider + undo/redo */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
            {screens.map(({ key, Icon, title }) => (
              <button key={key} title={title} onClick={() => onScreenSizeChange(key)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7, border: "none", cursor: "pointer", background: selectedScreenSize === key ? C.bg : "transparent", color: selectedScreenSize === key ? C.primary : C.muted, boxShadow: selectedScreenSize === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: C.border, margin: "0 2px" }} />
          <Btn onClick={() => onUndo?.()} title="Undo"><Undo2 size={15} /></Btn>
          <Btn onClick={() => onRedo?.()} title="Redo"><Redo2 size={15} /></Btn>
        </div>

        {/* MOBILE: viewport toggles + divider + undo/redo — always visible, no dropdown */}
        <div className="flex md:hidden" style={{ alignItems: "center", gap: 4 }}>
          <div style={{ display: "flex", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
            {screens.map(({ key, Icon, title }) => (
              <button key={key} title={title} onClick={() => onScreenSizeChange(key)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: "none", cursor: "pointer", background: selectedScreenSize === key ? C.bg : "transparent", color: selectedScreenSize === key ? C.primary : C.muted, boxShadow: selectedScreenSize === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: C.border, margin: "0 2px" }} />
          <Btn onClick={() => onUndo?.()} title="Undo"><Undo2 size={15} /></Btn>
          <Btn onClick={() => onRedo?.()} title="Redo"><Redo2 size={15} /></Btn>
        </div>

      </div>

      {/* ── RIGHT GROUP ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

        {/* DESKTOP: all tools visible — no dropdown whatsoever */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 6 }}>
          {(history?.length ?? 0) > 0 && (
            <Select value={selectedVersion} onValueChange={handleVersionSelect}>
              <SelectTrigger style={{ width: 190, fontSize: 13 }}>
                <History size={13} style={{ marginRight: 6 }} />
                <SelectValue placeholder="Version History" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={13} /><span>Current Version</span>
                  </div>
                </SelectItem>
                {history.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500 }}>{s.label || `Version #${s.id}`}</span>
                      {s.createdAt && <span style={{ fontSize: 11, color: C.muted }}>{new Date(s.createdAt).toLocaleString()}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: C.bg, color: C.navy, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                <Layers size={14} /> Diff View
              </button>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: "95vw" }}>
              <DialogHeader><DialogTitle>Diff: Current vs Selected Version</DialogTitle></DialogHeader>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxHeight: "70vh", overflow: "auto" }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current</h4>
                  <pre style={{ background: C.pageBg, padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 11, overflowX: "auto" }}>{currentCode}</pre>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Selected</h4>
                  <pre style={{ background: C.pageBg, padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 11, overflowX: "auto" }}>{compareCode}</pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Btn onClick={openNewTab} variant="outline">View <SquareArrowOutUpRight size={13} /></Btn>
          <Btn onClick={download} variant="primary"><Download size={14} /> Download</Btn>

          <ViewCodeBlock code={currentCode}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: C.primary, color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
              <Code size={14} /> Code
            </button>
          </ViewCodeBlock>
        </div>

        {/* MOBILE: three dots button → dropdown with Image-1 tools only */}
        <div className="flex md:hidden" style={{ position: "relative" }}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: showMobileMenu ? C.primaryBg : C.bg, cursor: "pointer", transition: "all 0.15s" }}
          >
            <MoreHorizontal size={18} color={showMobileMenu ? C.primary : C.navy} />
          </button>

          {showMobileMenu && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setShowMobileMenu(false)}
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
              />
              {/* Dropdown panel */}
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 220, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.12)", padding: 12, zIndex: 50, display: "flex", flexDirection: "column", gap: 4 }}>

                {/* Version History — only shown if history exists */}
                {(history?.length ?? 0) > 0 && (
                  <>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={selectedVersion}
                        onValueChange={(v) => { handleVersionSelect(v); setShowMobileMenu(false); }}
                      >
                        <SelectTrigger style={{ width: "100%", fontSize: 13 }}>
                          <History size={13} style={{ marginRight: 6 }} />
                          <SelectValue placeholder="Version History" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Clock size={13} /><span>Current Version</span>
                            </div>
                          </SelectItem>
                          {history.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: 500 }}>{s.label || `Version #${s.id}`}</span>
                                {s.createdAt && <span style={{ fontSize: 11, color: C.muted }}>{new Date(s.createdAt).toLocaleString()}</span>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
                  </>
                )}

                {/* Diff View */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 4px", border: "none", background: "none", color: C.navy, cursor: "pointer", textAlign: "left", borderRadius: 6 }}>
                      <Layers size={14} color={C.primary} /> Diff View
                    </button>
                  </DialogTrigger>
                  <DialogContent style={{ maxWidth: "95vw", zIndex: 200 }}>
                    <DialogHeader><DialogTitle>Diff: Current vs Selected Version</DialogTitle></DialogHeader>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxHeight: "70vh", overflow: "auto" }}>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current</h4>
                        <pre style={{ background: C.pageBg, padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 11, overflowX: "auto" }}>{currentCode}</pre>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Selected</h4>
                        <pre style={{ background: C.pageBg, padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 11, overflowX: "auto" }}>{compareCode}</pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* View Project */}
                <button
                  onClick={() => { openNewTab(); setShowMobileMenu(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 4px", border: "none", background: "none", color: C.navy, cursor: "pointer", textAlign: "left", borderRadius: 6 }}
                >
                  <SquareArrowOutUpRight size={14} color={C.primary} /> View Project
                </button>

                {/* Download HTML */}
                <button
                  onClick={() => { download(); setShowMobileMenu(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 4px", border: "none", background: "none", color: C.navy, cursor: "pointer", textAlign: "left", borderRadius: 6 }}
                >
                  <Download size={14} color={C.primary} /> Download HTML
                </button>

                {/* View Code */}
                <ViewCodeBlock code={currentCode}>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "8px 4px", border: "none", background: "none", color: C.navy, cursor: "pointer", textAlign: "left", borderRadius: 6 }}
                  >
                    <Code size={14} color={C.primary} /> View Code
                  </button>
                </ViewCodeBlock>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}