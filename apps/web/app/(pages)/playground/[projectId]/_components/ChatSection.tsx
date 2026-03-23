import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, User, Send } from "lucide-react";
import { FrameMessage } from "@workspace/types";

interface ChatSectionProps {
  messages: FrameMessage[];
  onSend: (input: string) => void;
  loading: boolean;
}

const C = {
  navy:      "#0B1740",
  primary:   "#2563EB",
  primaryBg: "#EBF2FF",
  border:    "#E0E8FA",
  bg:        "#ffffff",
  pageBg:    "#F8FAFC",
  muted:     "#8A9AC0",
  slate800:  "#1e293b",
};

function ChatSection({ messages, onSend, loading }: ChatSectionProps) {
  const [input, setInput]               = useState("");
  const [loadingStage, setLoadingStage] = useState(0);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }, [input, onSend]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formattedMessages = useMemo(() => {
    const extractUserPrompt = (content: string) => {
      const match = content.match(/userInput:\s*([\s\S]*?)(?:\n\n|$)/i);
      const extracted = match?.[1]?.trim();
      return extracted && extracted.length > 0 ? extracted : content;
    };
    return messages.map((message) => ({
      ...message,
      display: message.role === "user" ? extractUserPrompt(message.content) : message.content,
    }));
  }, [messages]);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    if (loading) {
      setLoadingStage(0);
      t1 = setTimeout(() => setLoadingStage(1), 3000);
      t2 = setTimeout(() => setLoadingStage(2), 5000);
    } else {
      setLoadingStage(0);
    }
    return () => { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [loading]);

  const loadingText =
    loadingStage === 0 ? "AI is thinking…" :
    loadingStage === 1 ? "Setting up the template…" :
    "Generating code…";

  const AiAvatar = () => (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
      <Sparkles size={13} />
    </div>
  );

  const AiBubble = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "12px 14px", borderRadius: "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.6, color: C.navy, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}`, background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ height: 64, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>AI Assistant</div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: 1.5 }}>v2.0.1 Active</span>
        </div>
        {loading && (
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, boxShadow: `0 0 0 3px ${C.primaryBg}`, animation: "chatPulse 1.2s ease infinite" }} />
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "rgba(248,250,252,0.5)" }}>

        {formattedMessages.length === 0 && !loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AiAvatar />
            <AiBubble>
              AI Assistant initialized. Describe what you want to build and I'll generate it for you.
            </AiBubble>
          </div>
        )}

        {formattedMessages.map((message, index) => {
          const isUser = message.role === "user";
          return isUser ? (
            <div key={`${message.role}-${index}`} style={{ display: "flex", gap: 12, flexDirection: "row-reverse", alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: C.slate800, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <User size={13} />
              </div>
              <div style={{ background: C.primary, color: "#fff", padding: "12px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 13, lineHeight: 1.6, boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
                {message.display}
              </div>
            </div>
          ) : (
            <div key={`${message.role}-${index}`} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AiAvatar />
              <AiBubble style={{ whiteSpace: "pre-wrap" }}>{message.display}</AiBubble>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AiAvatar />
            <AiBubble style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.muted, fontSize: 13 }}>{loadingText}</span>
              <span style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary, animation: `chatBounce 1s ease ${i * 0.15}s infinite`, display: "inline-block" }} />
                ))}
              </span>
            </AiBubble>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, position: "relative" }}>
        <textarea
          placeholder="Message Assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={e => e.target.style.borderColor = C.primary}
          onBlur={e => e.target.style.borderColor = C.border}
          style={{
            width: "100%", background: C.pageBg,
            border: `1.5px solid ${C.border}`, borderRadius: 14,
            padding: "12px 52px 12px 14px",
            fontSize: 13, color: C.navy, outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            resize: "none", height: 80, boxSizing: "border-box",
            lineHeight: 1.5, transition: "border 0.15s",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            position: "absolute", bottom: 28, right: 28,
            width: 34, height: 34, borderRadius: 10,
            background: C.primary, color: "#fff", border: "none",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.45 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
            transition: "opacity 0.15s",
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <style>{`
        @keyframes chatPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes chatBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}

export default ChatSection;