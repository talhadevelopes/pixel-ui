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
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left — project info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38, height: 38,
            background: "#EBF2FF",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookAIcon size={17} color="#2563EB" />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#C4D0E8", letterSpacing: 1.5, textTransform: "uppercase", margin: 0, marginBottom: 2 }}>
            Playground
          </p>
          <h1 style={{ fontSize: 14, fontWeight: 600, color: "#0B1740", margin: 0 }}>
            Project {projectId ?? "—"}
          </h1>
        </div>
      </div>

      {/* Right — meta + save */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {[
          ["Frame",    frameId ?? "Not selected"],
          ["Messages", String(messageCount)],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: "1px solid #E0E8FA",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 12,
              color: "#8A9AC0",
              background: "#F8FAFF",
            }}
          >
            {label}&nbsp;
            <span style={{ fontWeight: 600, color: "#0B1740" }}>{value}</span>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            background: "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
            transition: "opacity 0.15s",
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
              Saving…
            </>
          ) : (
            <>
              <Save size={14} /> Save
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}