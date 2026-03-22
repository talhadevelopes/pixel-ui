import { Loader2, Save, BookAIcon } from "lucide-react";
import { useDesignStore } from "@/store/useDesignStore";
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
        background: "var(--color-bg-white)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Left — project info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40, height: 40,
            background: "var(--color-primary-bg)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BookAIcon size={18} color="var(--color-primary)" />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-ghost)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>
            Playground
          </p>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-heading)" }}>
            Project {projectId ?? "—"}
          </h1>
        </div>
      </div>

      {/* Right — meta + save */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {[
          ["Frame", frameId ?? "Not selected"],
          ["Messages", String(messageCount)],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 12,
              color: "var(--color-text-muted)",
            }}
          >
            {label}&nbsp;
            <span style={{ fontWeight: 600, color: "var(--color-text-heading)" }}>{value}</span>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          style={{
            padding: "8px 20px",
            fontSize: 13,
            opacity: isSaving ? 0.7 : 1,
            cursor: isSaving ? "not-allowed" : "pointer",
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