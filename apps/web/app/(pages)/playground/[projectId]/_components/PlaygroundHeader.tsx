import { Loader2, Save, BookAIcon } from "lucide-react";
import { useDesignStore } from "@/store/designStore";
import { PlaygroundHeaderProps } from "@workspace/types";

export function PlaygroundHeader({
  projectId,
  frameId,
  messageCount = 0,
  onSave,
  isSaving = false,
}: PlaygroundHeaderProps) {
  const { saveDesign } = useDesignStore();

  const handleSave = () => {
    if (projectId) saveDesign(projectId);
    onSave?.();
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #E0E8FA",
        borderRadius: 16,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "nowrap",
        gap: 8,
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div
          style={{
            width: 32, height: 32,
            background: "#EBF2FF",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookAIcon size={14} color="#2563EB" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#C4D0E8", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
            Playground
          </p>
          <h1 style={{ fontSize: 12, fontWeight: 600, color: "#0B1740", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Project {projectId ?? "—"}
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div className="hidden sm:flex" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            ["Frame",    frameId ?? "—"],
            ["Msgs", String(messageCount)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                border: "1px solid #E0E8FA",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 11,
                color: "#8A9AC0",
                background: "#F8FAFF",
                whiteSpace: "nowrap"
              }}
            >
              {label}&nbsp;
              <span style={{ fontWeight: 600, color: "#0B1740" }}>{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            background: "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            boxShadow: "0 2px 8px rgba(37,99,235,0.20)",
            transition: "opacity 0.15s",
            whiteSpace: "nowrap"
          }}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={12} />
              <span className="hidden xs:inline">Saving…</span>
            </>
          ) : (
            <>
              <Save size={12} />
              <span className="hidden xs:inline">Save</span>
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
