"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchFrameDetails,
  saveFrameMessages,
  updateFrameDesign,
} from "@/services/frames.api";
import { createChatCompletion } from "@/services/chat.api";
import { parseChatCompletionStream, stripCodeFences } from "@/lib/chat-stream";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionKeys } from "@/mutations/";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthToken } from "@/services/auth.api";
import { FrameMessage } from "@workspace/types";
import { ChatSection, WebsiteDesignSection, PlaygroundHeader } from "./_components/index";

function PlaygroundContent() {
  const params         = useParams();
  const projectIdParam = params?.projectId as string | string[] | undefined;
  const projectId      = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
  const searchParams   = useSearchParams();
  const frameId        = searchParams.get("frameId");

  const [loading, setLoading]             = useState(false);
  const [messages, setMessages]           = useState<FrameMessage[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isSaving, setIsSaving]           = useState(false);

  const accessToken      = useAuthToken();
  const autoTriggerRef   = useRef(false);
  const sendMessageRef   = useRef<
    | ((msg: string, options?: { appendUserMessage?: boolean; presetMessages?: FrameMessage[] }) => Promise<void>)
    | null
  >(null);
  const queryClient = useQueryClient();

  // ── All original logic — untouched ──────────────────────────────────────

  const saveGeneratedCode = useCallback(
    async (code: string) => {
      if (!frameId || !projectId) return;
      if (!accessToken) { toast.error("Please log in again"); return; }
      try {
        await updateFrameDesign({ frameId, projectId, designCode: code }, accessToken);
        toast.success("Website is ready");
      } catch (error) {
        console.error("Failed to save generated code", error);
        throw error;
      }
    },
    [accessToken, frameId, projectId]
  );

  const saveMessages = useCallback(
    async (updatedMessages: FrameMessage[]) => {
      if (!frameId || !accessToken) return;
      try {
        await saveFrameMessages({ frameId, messages: updatedMessages }, accessToken);
      } catch (error) {
        console.error("Failed to save messages", error);
      }
    },
    [accessToken, frameId]
  );

  const sendMessage = useCallback(
    async (
      userInput: string,
      options?: { appendUserMessage?: boolean; presetMessages?: FrameMessage[] }
    ) => {
      if (!frameId) { toast.error("Select a frame to continue"); return; }
      const trimmedInput = userInput.trim();
      if (!trimmedInput) return;

      setLoading(true);
      let workingMessages = options?.presetMessages ?? messages;

      if (options?.appendUserMessage !== false) {
        const userMessage: FrameMessage = { role: "user", content: trimmedInput };
        workingMessages = [...messages, userMessage];
        setMessages(workingMessages);
      } else if (options?.presetMessages) {
        setMessages(options.presetMessages);
      }

      const messagesForApi = workingMessages.map((m) => ({ role: m.role, content: m.content }));

      try {
        if (!accessToken) { toast.error("Please log in again"); return; }

        const generationId =
          globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `${frameId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        const response = await createChatCompletion({ accessToken, frameId, messages: messagesForApi, generationId });
        const { code: cleanedCode, raw } = await parseChatCompletionStream(response, {
          onPartialCode: (partial) => {
            console.log("Partial code:", partial?.substring(0, 50));
            setGeneratedCode(partial);
          },
        });

        let finalCode     = cleanedCode && cleanedCode !== "undefined" ? cleanedCode : "";
        let effectiveRaw  = raw;

        if (!finalCode) {
          const strictHint    = `${trimmedInput}\nStrictOutput: Return ONLY HTML Tailwind CSS code inside a single markdown fenced code block labeled html. No explanations.`;
          const strictMessages = [{ role: "user", content: strictHint }];
          const response2 = await createChatCompletion({ accessToken, frameId, messages: strictMessages, generationId });
          const { code: cleaned2, raw: raw2 } = await parseChatCompletionStream(response2, {
            onPartialCode: (partial) => setGeneratedCode(partial),
          });
          finalCode    = cleaned2 && cleaned2 !== "undefined" ? cleaned2 : "";
          effectiveRaw = raw2 ?? raw;
        }

        if (finalCode) setGeneratedCode(finalCode);

        const assistantMessage: FrameMessage = finalCode
          ? { role: "assistant", content: "Your Code is Ready" }
          : { role: "assistant", content: effectiveRaw };

        const finalMessages = [...workingMessages, assistantMessage];
        setMessages(finalMessages);

        if (finalCode) {
          setGeneratedCode(finalCode);
          await saveGeneratedCode(finalCode);
        } else if (options?.appendUserMessage !== false) {
          setGeneratedCode("");
        }

        await saveMessages(finalMessages);
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      } catch (error) {
        console.error("Error sending message", error);
        const typedError = error as Error & { status?: number; data?: unknown };
        if (typedError?.status === 403) {
          const info       = (typedError.data as { nextReset?: string | null; credits?: number | null } | null) ?? null;
          const nextReset  = info?.nextReset ? new Date(info.nextReset) : null;
          const resetText  = nextReset ? nextReset.toLocaleString() : null;
          const assistantMessage: FrameMessage = {
            role: "assistant",
            content: resetText
              ? `You are out of credits. Your credits will reset around ${resetText}.`
              : "You are out of credits. Your daily credits will reset soon.",
          };
          setMessages((prev) => [...prev, assistantMessage]);
          queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        } else {
          toast.error(typedError instanceof Error ? typedError.message : "Failed to process message");
        }
      } finally {
        setLoading(false);
      }
    },
    [accessToken, frameId, messages, saveGeneratedCode, saveMessages, queryClient]
  );

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  useEffect(() => {
    if (!frameId || !projectId) { setMessages([]); setGeneratedCode(""); return; }

    const loadFrame = async () => {
      try {
        if (!accessToken) { toast.error("Please log in again"); return; }
        const data            = await fetchFrameDetails({ frameId, projectId }, accessToken);
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
        toast.error(error instanceof Error ? error.message : "Failed to load frame details");
      }
    };

    void loadFrame();
  }, [accessToken, frameId, projectId]);

  useEffect(() => { autoTriggerRef.current = false; }, [frameId, projectId]);

  const handleManualSave = useCallback(async () => {
    if (!generatedCode) { toast.info("Generate a design before saving"); return; }
    if (!frameId || !projectId) { toast.error("Frame details unavailable"); return; }
    setIsSaving(true);
    try {
      await saveGeneratedCode(generatedCode);
    } catch (error) {
      console.error("Manual save failed", error);
      toast.error(error instanceof Error ? error.message : "Failed to save generated code");
    } finally {
      setIsSaving(false);
    }
  }, [frameId, generatedCode, projectId, saveGeneratedCode]);

  // ── NEW LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden max-md:pt-0" style={{ fontFamily: "var(--font-base)" }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Chat column */}
      {isChatVisible && (
        <div
          className="w-full md:w-[420px] shrink-0 border-r border-[var(--color-border)] flex flex-col h-[45vh] md:h-screen max-md:border-b max-md:border-r-0"
        >
          <ChatSection
            loading={loading}
            messages={messages ?? []}
            onSend={(msg) => sendMessage(msg)}
          />
        </div>
      )}

      {/* Preview column */}
      <div className="flex-1 flex flex-col overflow-hidden h-[55vh] md:h-screen min-h-0">
        <WebsiteDesignSection
          generatedCode={generatedCode}
          projectId={projectId}
          frameId={frameId ?? undefined}
          onSettingsToggle={setIsChatVisible}
          onCodeChange={setGeneratedCode}
        />

        {/* Footer header */}
        <div className="px-4 pb-3 md:px-6 md:pb-4 shrink-0">
          <PlaygroundHeader
            projectId={projectId}
            frameId={frameId}
            messageCount={messages.length}
            onSave={handleManualSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}