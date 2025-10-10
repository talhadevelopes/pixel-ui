"use client";

import { useParams, useSearchParams } from "next/navigation";
import { PlaygroundHeader } from "./_components/PlaygroundHeader";
import { WebsiteDesignSection } from "./_components/WebsiteDesign";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatSection from "./_components/ChatSection";
import { toast } from "sonner";
import { API, BASE_URL } from "@/service/api";
import { getAccessToken } from "@/lib/auth-storage";

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

const stripCodeFences = (code: string) =>
    code
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .trim();

export default function PlaygroundPage() {
    const params = useParams();
    const projectIdParam = params?.projectId as string | string[] | undefined;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    const searchParams = useSearchParams();
    const frameId = searchParams.get("frameId");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const autoTriggerRef = useRef(false);
    const sendMessageRef = useRef<((input: string, options?: { appendUserMessage?: boolean; presetMessages?: Messages[] }) => Promise<void>) | null>(null);

    const saveGeneratedCode = useCallback(async (code: string) => {
        if (!frameId || !projectId) return;

        try {
            const token = getAccessToken();
            if (!token) {
                toast.error("Please log in again");
                return;
            }

            const response = await fetch(`${BASE_URL}${API.frames.base}?frameId=${frameId}&projectId=${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ designCode: code }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save generated code (${response.status})`);
            }

            toast.success("Website is ready");
        } catch (error) {
            console.error("Failed to save generated code", error);
            toast.error("Failed to save generated code");
        }
    }, [frameId, projectId]);

    const saveMessages = useCallback(async (updatedMessages: Messages[]) => {
        if (!frameId) return;

        try {
            const token = getAccessToken();
            if (!token) {
                return;
            }

            const response = await fetch(`${BASE_URL}${API.chat.messages}?frameId=${frameId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chatMessage: updatedMessages }),
            });

            if (response.status === 401) {
                toast.error("Session expired. Please log in again");
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to save messages (${response.status})`);
            }
        } catch (error) {
            console.error("Failed to save messages", error);
        }
    }, [frameId]);

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
            const token = getAccessToken();
            if (!token) {
                toast.error("Please log in again");
                return;
            }

            const response = await fetch(`${BASE_URL}${API.chat.completions}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    frameId,
                    messages: messagesForApi,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch AI response");
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Streaming reader unavailable");
            }

            const decoder = new TextDecoder();
            let aiResponse = "";
            let codeBuffer = "";
            let isCode = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;

                if (!isCode && aiResponse.includes("```html")) {
                    isCode = true;
                    const index = aiResponse.indexOf("```html") + 7;
                    codeBuffer += aiResponse.slice(index);
                    setGeneratedCode(stripCodeFences(codeBuffer));
                } else if (isCode) {
                    codeBuffer += chunk;
                    setGeneratedCode(stripCodeFences(codeBuffer));
                }
            }

            const cleanedCode = codeBuffer ? stripCodeFences(codeBuffer) : "";
            if (cleanedCode && cleanedCode !== "undefined") {
                setGeneratedCode(cleanedCode);
            }
            const assistantMessage: Messages = cleanedCode
                ? { role: "assistant", content: "Your Code is Ready" }
                : { role: "assistant", content: aiResponse.trim() };

            const finalMessages = [...workingMessages, assistantMessage];
            setMessages(finalMessages);

            if (cleanedCode) {
                setGeneratedCode(cleanedCode);
                await saveGeneratedCode(cleanedCode);
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
    }, [BASE_URL, API.chat.completions, frameId, formatUserPrompt, messages, saveGeneratedCode, saveMessages]);

    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    const getFrameDetails = useCallback(async () => {
        if (!frameId || !projectId) {
            setMessages([]);
            setGeneratedCode("");
            return;
        }

        try {
            const token = getAccessToken();
            if (!token) {
                setMessages([]);
                setGeneratedCode("");
                toast.error("Please log in again");
                return;
            }

            const response = await fetch(`${BASE_URL}${API.frames.base}?frameId=${frameId}&projectId=${projectId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            if (!response.ok) {
                console.error("Failed to fetch frame details", response.status);
                return;
            }

            const payload = await response.json();
            const data = payload?.data as FrameDetails | undefined;

            if (!data) return;

            const existingMessages = data.chatMessages ?? [];
            setMessages(existingMessages);

            const designCode = data.designCode ?? "";
            if (designCode) {
                setGeneratedCode(stripCodeFences(designCode));
            }

            const firstMessage = existingMessages[0];
            if (!autoTriggerRef.current && firstMessage?.content && !designCode) {
                autoTriggerRef.current = true;
                await sendMessageRef.current?.(firstMessage.content, { appendUserMessage: false, presetMessages: existingMessages });
            }
        } catch (error) {
            console.error("Error fetching frame details", error);
        }
    }, [frameId, projectId]);

    useEffect(() => {
        getFrameDetails();
    }, [getFrameDetails]);

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
