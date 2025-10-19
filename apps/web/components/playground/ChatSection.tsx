import { useCallback, useMemo, useState } from "react";
import { Messages } from "../../app/(pages)/playground/[projectId]/page";
import { Button } from "@workspace/ui/components/button";
import { ArrowUpRight, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ChatSectionProps {
    messages: Messages[];
    onSend: (input: string) => void;
    loading: boolean;
}

function ChatSection({ messages, onSend, loading }: ChatSectionProps) {
    const [input, setInput] = useState("");
    const { theme, setTheme } = useTheme();

    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setInput("");
    }, [input, onSend]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const formattedMessages = useMemo(() => {
        const extractUserPrompt = (content: string) => {
            const match = content.match(/userInput:\s*([\s\S]*?)(?:\n\n|$)/i);
            const extracted = match?.[1]?.trim();
            return extracted && extracted.length > 0 ? extracted : content;
        };

        return messages.map((message) => {
            const baseContent = message.role === "user" ? extractUserPrompt(message.content) : message.content;
            return {
                ...message,
                display: baseContent.replace(/\n/g, "<br />"),
            };
        });
    }, [messages]);

    return (
        <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Chat</h2>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {formattedMessages.length === 0 && !loading ? (
                    <p className="text-sm text-muted-foreground">Start the conversation to generate your design.</p>
                ) : (
                    formattedMessages.map((message, index) => {
                        const isUser = message.role === "user";
                        return (
                            <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                        isUser ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: message.display }}
                                />
                            </div>
                        );
                    })
                )}
            </div>
            <div className="border-t border-border/70 px-5 py-4">
                <div className="rounded-xl border border-border/80 bg-background">
                    <textarea
                        placeholder="Describe what you want to build..."
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm outline-none"
                    />
                    <div className="flex justify-end gap-2 border-t border-border/70 px-4 py-3">
                        <Button
                            size="sm"
                            type="button"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="gap-2"
                        >
                            <ArrowUpRight className="h-4 w-4" />
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatSection;