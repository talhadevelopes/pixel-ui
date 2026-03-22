import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, User, Send, Paperclip } from "lucide-react";
import { FrameMessage } from "@workspace/types";

interface ChatSectionProps {
  messages: FrameMessage[];
  onSend: (input: string) => void;
  loading: boolean;
}

function ChatSection({ messages, onSend, loading }: ChatSectionProps) {
  const [input, setInput]           = useState("");
  const [loadingStage, setLoadingStage] = useState(0);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }, [input, onSend]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [loading]);

  const loadingText =
    loadingStage === 0 ? "AI is thinking…" :
    loadingStage === 1 ? "Setting up the template…" :
    "Generating code…";

  return (
    <div className="chat-layout" style={{ width: "100%", height: "100%" }}>

      {/* Header */}
      <div className="chat-header">
        <div>
          <div className="chat-header__title">AI Assistant</div>
          <span className="chat-header__status">v2.0.1 Active</span>
        </div>
        {loading && (
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--color-primary)",
            boxShadow: "0 0 0 3px var(--color-primary-bg)",
            animation: "pulse 1.2s ease infinite",
          }} />
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {formattedMessages.length === 0 && !loading ? (
          <div className="chat-msg-ai">
            <div className="chat-avatar chat-avatar-ai">
              <Sparkles size={14} />
            </div>
            <div className="chat-bubble-ai">
              AI Assistant initialized. Describe what you want to build and I'll generate it for you.
            </div>
          </div>
        ) : (
          formattedMessages.map((message, index) => {
            const isUser = message.role === "user";
            return isUser ? (
              <div key={`${message.role}-${index}`} className="chat-msg-user">
                <div className="chat-avatar chat-avatar-user">
                  <User size={14} />
                </div>
                <div className="chat-bubble-user">{message.display}</div>
              </div>
            ) : (
              <div key={`${message.role}-${index}`} className="chat-msg-ai">
                <div className="chat-avatar chat-avatar-ai">
                  <Sparkles size={14} />
                </div>
                <div className="chat-bubble-ai" style={{ whiteSpace: "pre-wrap" }}>
                  {message.display}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="chat-msg-ai">
            <div className="chat-avatar chat-avatar-ai">
              <Sparkles size={14} />
            </div>
            <div className="chat-bubble-ai" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>{loadingText}</span>
              <span style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--color-primary)",
                      animation: `bounce 1s ease ${i * 0.15}s infinite`,
                      display: "inline-block",
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          placeholder="Message Assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="textarea-field"
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default ChatSection;