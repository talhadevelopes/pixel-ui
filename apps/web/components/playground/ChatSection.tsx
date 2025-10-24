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
                display: baseContent,
            };
        });
    }, [messages]);

    return (
        <div className="flex h-[70%] mt-[20%] flex-col rounded-lg overflow-hidden shadow-2xl font-mono text-sm bg-card border border-border/70">
            {/* Terminal Header */}
            <div className="bg-muted/30 px-4 py-2 flex items-center gap-2 border-b border-border/70">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <span className="text-muted-foreground text-xs ml-4">terminal — ai-assistant</span>
                <div className="ml-auto flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {formattedMessages.length === 0 && !loading ? (
                    <>
                        <div className="text-primary">AI Assistant v2.0.1 initialized...</div>
                        <div className="text-primary">Type your message to start the conversation</div>
                    </>
                ) : (
                    formattedMessages.map((message, index) => {
                        const isUser = message.role === "user";
                        return (
                            <div key={`${message.role}-${index}`}>
                                {isUser ? (
                                    <div className="text-accent">
                                        &gt; {message.display}
                                        <span className="animate-pulse">_</span>
                                    </div>
                                ) : (
                                    <div className="text-foreground whitespace-pre-wrap pl-4 border-l-2 border-primary">
                                        {message.display}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Terminal Input */}
            <div className="bg-muted/30 px-4 py-2 border-t border-border/70">
                <div className="flex items-center gap-2">
                    <span className="text-accent">&gt;</span>
                    <textarea
                        placeholder="Type command..."
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground"
                    />
                    <Button
                        size="sm"
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="gap-2"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatSection;