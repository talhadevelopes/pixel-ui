import {
  Clock, Code, Download, History, Laptop, Monitor,
  SquareArrowOutUpRight, TabletSmartphone, Undo2, Redo2,
  Layers, Smartphone,
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

  const screens = [
    { key: "web",    Icon: Monitor,          title: "Desktop" },
    { key: "laptop", Icon: Laptop,           title: "Laptop" },
    { key: "tablet", Icon: TabletSmartphone, title: "Tablet" },
    { key: "mobile", Icon: Smartphone,       title: "Mobile" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, borderBottom: `1px solid ${C.border}`, gap: 10, flexWrap: "wrap", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Viewport toggle */}
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

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>

        {(history?.length ?? 0) > 0 && (
          <Select value={selectedVersion} onValueChange={async (v) => {
            await handleVersionChange(v);
            if (v !== "current") {
              const id = Number(v);
              if (accessToken && id) {
                try { const s = await fetchFrameSnapshot(id, accessToken); setCompareCode(s?.designCode ?? ""); } catch {}
              }
            } else { setCompareCode(""); }
          }}>
            <SelectTrigger style={{ width: 190, fontSize: 13 }}>
              <History size={13} style={{ marginRight: 6 }} />
              <SelectValue placeholder="Version History" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={13} /><span>Current Version</span></div>
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
    </div>
  );
}