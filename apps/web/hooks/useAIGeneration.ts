//all ai generation logic is here
import { useCallback } from "react";
import { toast } from "sonner";
import { createChatCompletion } from "@/services/chat.api";
import { parseChatCompletionStream, stripCodeFences } from "@/lib/chat-stream";
import { patchRenderedCodeForSelection } from "@/lib/code-processors";
import { useWebsiteDesignStore } from "@/store/useWebsiteDesignStore";

export const useAIGeneration = (
  frameId: string | undefined,
  accessToken: string | null,
  iframeRef: React.RefObject<HTMLIFrameElement>,
  skipNextFullRenderRef: React.MutableRefObject<boolean>,
  onCodeChange?: (code: string) => void
) => {
  const {
    renderedCode,
    setRenderedCode,
    pushUndo,
    clearRedoStack,
    lastQuickAction,
    setLastQuickAction,
  } = useWebsiteDesignStore();

  const generateId = useCallback(() => {
    return globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${frameId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, [frameId]);

  const streamReplaceSelected = useCallback(
    async (selectedElement: any, hint?: string) => {
      if (!frameId || !accessToken) {
        toast.error("Please log in again");
        return;
      }
      if (!selectedElement) {
        toast.info("Select an element first");
        return;
      }

      const genId = generateId();
      const basePrompt = `Regenerate only the INNER HTML of the selected element. Do not include <html> or <body> or global wrappers.
Context element outerHTML:
${selectedElement.outerHTML}

Constraints:
- Return ONLY the inner HTML that should be placed inside this element.
- Use Tailwind CSS + Flowbite components where appropriate.
- Keep a clean semantic structure; primary color #4b5c.
${hint ? `User hint: ${hint}` : ""}`;

      const response = await createChatCompletion({
        accessToken,
        frameId,
        messages: [{ role: "user", content: basePrompt }],
        generationId: genId,
      });

      const { code: cleaned } = await parseChatCompletionStream(response, {
        onPartialCode: (partial) => {
          const html = stripCodeFences(partial);
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              { type: "replaceSelectedInnerHTML", html },
              "*"
            );
          }
        },
      });

      let final = cleaned && cleaned !== "undefined" ? cleaned : "";
      if (!final) {
        const strict = `${basePrompt}\nStrictOutput: Return ONLY the inner HTML. No explanations.`;
        const response2 = await createChatCompletion({
          accessToken,
          frameId,
          messages: [{ role: "user", content: strict }],
          generationId: genId,
        });
        const r2 = await parseChatCompletionStream(response2, {
          onPartialCode: (partial) => {
            const html = stripCodeFences(partial);
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { type: "replaceSelectedInnerHTML", html },
                "*"
              );
            }
          },
        });
        final = r2.code && r2.code !== "undefined" ? r2.code : "";
      }

      if (final) {
        pushUndo(renderedCode || "");
        clearRedoStack();
        const patched = patchRenderedCodeForSelection(
          selectedElement,
          final,
          renderedCode || ""
        );
        if (patched) {
          skipNextFullRenderRef.current = true;
          setRenderedCode(patched);
          onCodeChange?.(patched);
        }
      } else {
        toast.error("AI did not return HTML for the selection");
      }
    },
    [
      accessToken,
      frameId,
      renderedCode,
      generateId,
      pushUndo,
      clearRedoStack,
      setRenderedCode,
      onCodeChange,
      iframeRef,
      skipNextFullRenderRef,
    ]
  );

  const quickActionPrompt = (label: string) =>
    `Generate a ${label} section for a landing page.
Return ONLY that section's HTML (<section> or a single top-level <div>), without <html> or <body>.
Use Tailwind CSS + Flowbite, primary color #4b5c.`;

  const handleQuickAction = useCallback(
    async (label: string) => {
      if (!frameId || !accessToken) {
        toast.error("Please log in again");
        return;
      }

      const genId = generateId();
      setLastQuickAction({ label });
      const prompt = quickActionPrompt(label);
      const response = await createChatCompletion({
        accessToken,
        frameId,
        messages: [{ role: "user", content: prompt }],
        generationId: genId,
      });

      const { code: cleaned } = await parseChatCompletionStream(response, {
        onPartialCode: (partial) => {
          const html = stripCodeFences(partial);
          iframeRef.current?.contentWindow?.postMessage(
            { type: "appendToRoot", html, label },
            "*"
          );
        },
      });

      const final = cleaned && cleaned !== "undefined" ? cleaned : "";
      if (final) {
        pushUndo(renderedCode || "");
        clearRedoStack();
        const patched = (renderedCode || "") + "\n" + final;
        setLastQuickAction({ label, lastHtml: final });
        skipNextFullRenderRef.current = true;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      } else {
        toast.error("Failed to generate section");
      }
    },
    [
      accessToken,
      frameId,
      renderedCode,
      generateId,
      setLastQuickAction,
      pushUndo,
      clearRedoStack,
      setRenderedCode,
      onCodeChange,
      iframeRef,
      skipNextFullRenderRef,
    ]
  );

  const handleTryAnother = useCallback(async () => {
    if (!frameId || !accessToken) {
      toast.error("Please log in again");
      return;
    }

    const meta = lastQuickAction;
    if (!meta?.label) {
      toast.info("Use a quick action first");
      return;
    }

    const genId = generateId();
    const prompt = quickActionPrompt(meta.label);
    const response = await createChatCompletion({
      accessToken,
      frameId,
      messages: [{ role: "user", content: prompt }],
      generationId: genId,
    });

    const { code: cleaned } = await parseChatCompletionStream(response, {
      onPartialCode: (partial) => {
        const html = stripCodeFences(partial);
        iframeRef.current?.contentWindow?.postMessage(
          { type: "replaceLastAppended", html },
          "*"
        );
      },
    });

    const final = cleaned && cleaned !== "undefined" ? cleaned : "";
    if (final) {
      pushUndo(renderedCode || "");
      clearRedoStack();
      if (meta.lastHtml) {
        const idx = (renderedCode || "").lastIndexOf(meta.lastHtml);
        const patched =
          idx !== -1
            ? (renderedCode || "").slice(0, idx) +
              final +
              (renderedCode || "").slice(idx + meta.lastHtml.length)
            : (renderedCode || "") + "\n" + final;
        setLastQuickAction({ label: meta.label, lastHtml: final });
        skipNextFullRenderRef.current = true;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      } else {
        setLastQuickAction({ label: meta.label, lastHtml: final });
        skipNextFullRenderRef.current = true;
        const patched = (renderedCode || "") + "\n" + final;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      }
    } else {
      toast.error("Failed to regenerate variation");
    }
  }, [
    accessToken,
    frameId,
    renderedCode,
    lastQuickAction,
    generateId,
    pushUndo,
    clearRedoStack,
    setLastQuickAction,
    setRenderedCode,
    onCodeChange,
    iframeRef,
    skipNextFullRenderRef,
  ]);

  return {
    streamReplaceSelected,
    handleQuickAction,
    handleTryAnother,
  };
};