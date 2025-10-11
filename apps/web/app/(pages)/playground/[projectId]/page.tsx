"use client";

import { useParams, useSearchParams } from "next/navigation";
import { PlaygroundHeader } from "./_components/PlaygroundHeader";
import { WebsiteDesignSection } from "./_components/WebsiteDesign";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatSection from "./_components/ChatSection";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/auth-storage";
import { fetchFrameDetails, saveFrameMessages, updateFrameDesign } from "@/services/frames.api";
import { createChatCompletion } from "@/services/chat.api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { parseChatCompletionStream, stripCodeFences } from "@/utils/chat-stream";

export interface FrameDetails {
    frameId: string;
    projectId: string;
    designCode: string | null;
    chatMessages: Messages[] | null;
}

export interface Messages {
    role: string;
    content: string;
}

const PROMPT_TEMPLATE = `userInput: {userInput}

Instructions:
- If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

Generate a complete HTML Tailwind CSS code using Flowbite UI components.
(Use a modern design with #4b5c as the primary color.)
- Only include the <body> content (do not add <html> or <title>).
- Make it fully responsive for all screen sizes.
- All primary components must match the theme.

then:
- Use placeholders for all images:
  Light mode:
  https://community.softr.io/uploads/db9110/original/2X/7f/7c6e0c54325ff1ca71263aa8e5b8df6f8372e0dcc.jpeg
  Dark mode:
  https://community.softr.io/uploads/2015/12/placeholder-3.jpg
- Add alt tags describing each image prompt.
- Use the following libraries/components where appropriate:
  - Flowbite UI components
  - Awesome icons (fa fa-*)
  - Chart.js for charts & graphs
  - Slider.js for sliders/carousels/slidesheets
  - Tooltips and poppers
  - Interactive components like modals or dropdowns
- Ensure proper spacing, alignment, hierarchy, and consistency.
- Use colors that are visually appealing and match the theme.
- Header menu options should be spaced apart rather than grouped.

Do not include broken links.
Do not add any extra text before or after the HTML code.

- If user input does not explicitly ask to generate code, then respond with a simple, friendly text message instead of generating any code.

Example:
- User: "Hi" ⟹ Response: "Hello! How can I help you today?"
- User: "Build a responsive landing page with Tailwind CSS" ⟹ Response: [Generate full HTML code as per instructions above]`;

export default function PlaygroundPage() {
    const params = useParams();
    const projectIdParam = params?.projectId as string | string[] | undefined;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    const searchParams = useSearchParams();
    const frameId = searchParams.get("frameId");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>("");
    const accessToken = useAuthToken();
    const autoTriggerRef = useRef(false);
    const sendMessageRef = useRef<((input: string, options?: { appendUserMessage?: boolean; presetMessages?: Messages[] }) => Promise<void>) | null>(null);

    const [isSaving, setIsSaving] = useState(false);

    const saveGeneratedCode = useCallback(async (code: string) => {
        if (!frameId || !projectId) return;
        if (!accessToken) {
            toast.error("Please log in again");
            return;
        }

        try {
            await updateFrameDesign({ frameId, projectId, designCode: code }, accessToken);
            toast.success("Website is ready");
        } catch (error) {
            console.error("Failed to save generated code", error);
            throw error;
        }
    }, [accessToken, frameId, projectId]);

    const saveMessages = useCallback(async (updatedMessages: Messages[]) => {
        if (!frameId) return;
        if (!accessToken) {
            return;
        }

        try {
            await saveFrameMessages({ frameId, messages: updatedMessages }, accessToken);
        } catch (error) {
            console.error("Failed to save messages", error);
        }
    }, [accessToken, frameId]);

    const formatUserPrompt = useCallback((content: string) => {
        if (content.includes("Instructions:")) {
            return content;
        }
        return PROMPT_TEMPLATE.replace("{userInput}", content);
    }, []);

    const sendMessage = useCallback(async (userInput: string, options?: { appendUserMessage?: boolean; presetMessages?: Messages[] }) => {
        if (!frameId) {
            toast.error("Select a frame to continue");
            return;
        }

        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        setLoading(true);

        let workingMessages = options?.presetMessages ?? messages;

        if (options?.appendUserMessage !== false) {
            const userMessage: Messages = { role: "user", content: trimmedInput };
            workingMessages = [...messages, userMessage];
            setMessages(workingMessages);
            setGeneratedCode("");
        } else if (options?.presetMessages) {
            setMessages(options.presetMessages);
        }

        const messagesForApi = workingMessages.map((message) =>
            message.role === "user" ? { ...message, content: formatUserPrompt(message.content) } : message,
        );

        try {
            if (!accessToken) {
                toast.error("Please log in again");
                return;
            }

            const response = await createChatCompletion({
                accessToken,
                frameId,
                messages: messagesForApi,
            });

            const { code: cleanedCode, raw } = await parseChatCompletionStream(response, {
                onPartialCode: (partial) => setGeneratedCode(partial),
            });

            const finalCode = cleanedCode && cleanedCode !== "undefined" ? cleanedCode : "";
            if (finalCode) {
                setGeneratedCode(finalCode);
            }
            const assistantMessage: Messages = finalCode
                ? { role: "assistant", content: "Your Code is Ready" }
                : { role: "assistant", content: raw };

            const finalMessages = [...workingMessages, assistantMessage];
            setMessages(finalMessages);

            if (finalCode) {
                setGeneratedCode(finalCode);
                await saveGeneratedCode(finalCode);
            } else if (options?.appendUserMessage !== false) {
                setGeneratedCode("");
            }

            await saveMessages(finalMessages);
        } catch (error) {
            console.error("Error sending message", error);
            toast.error(error instanceof Error ? error.message : "Failed to process message");
        } finally {
            setLoading(false);
        }
    }, [accessToken, frameId, formatUserPrompt, messages, saveGeneratedCode, saveMessages]);

    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    useEffect(() => {
        if (!frameId || !projectId) {
            setMessages([]);
            setGeneratedCode("");
            return;
        }

        const loadFrame = async () => {
            try {
                if (!accessToken) {
                    toast.error("Please log in again");
                    return;
                }

                const data = await fetchFrameDetails({ frameId, projectId }, accessToken);

                const existingMessages = data.chatMessages ?? [];
                setMessages(existingMessages);

                const designCode = data.designCode ?? "";
                if (designCode) {
                    setGeneratedCode(stripCodeFences(designCode));
                } else {
                    setGeneratedCode("");
                }

                const firstMessage = existingMessages[0];
                if (!autoTriggerRef.current && firstMessage?.content && !designCode) {
                    autoTriggerRef.current = true;
                    void sendMessageRef.current?.(firstMessage.content, {
                        appendUserMessage: false,
                        presetMessages: existingMessages,
                    });
                }
            } catch (error) {
                console.error("Error fetching frame details", error);
                const message = error instanceof Error ? error.message : "Failed to load frame details";
                toast.error(message);
            }
        };

        void loadFrame();
    }, [accessToken, frameId, projectId]);

    useEffect(() => {
        autoTriggerRef.current = false;
    }, [frameId, projectId]);

    const handleManualSave = useCallback(async () => {
        if (!generatedCode) {
            toast.info("Generate a design before saving");
            return;
        }

        if (!frameId || !projectId) {
            toast.error("Frame details unavailable");
            return;
        }

        setIsSaving(true);
        try {
            await saveGeneratedCode(generatedCode);
        } catch (error) {
            console.error("Manual save failed", error);
            const message = error instanceof Error ? error.message : "Failed to save generated code";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    }, [frameId, generatedCode, projectId, saveGeneratedCode]);

    return (
        <div className="px-6 py-8 min-h-screen bg-background">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
                <PlaygroundHeader
                    projectId={projectId}
                    frameId={frameId}
                    messageCount={messages.length}
                    onSave={handleManualSave}
                    isSaving={isSaving}
                />
               <div className="grid gap-6 lg:grid-cols-[0.8fr_2fr] lg:min-h-[calc(100vh-18rem)]">
                    <ChatSection loading={loading} messages={messages ?? []} onSend={(input) => sendMessage(input)} />
                    <WebsiteDesignSection generatedCode={generatedCode} />
                </div>
            </div>
        </div>
    );
}
