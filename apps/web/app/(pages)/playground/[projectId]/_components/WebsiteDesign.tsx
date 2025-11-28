"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WebPageTools } from "./WebpageTools";
import ElementSettingsSection from "./ElementSettingSection";
import ImageSettingsAction from "./ImageSettingsSection";
import { X, Sparkles } from "lucide-react";
import { useDesignStore } from "@/store/useDesignStore";
import { htmlShell } from "@/lib/html";
import { createChatCompletion } from "@/services/chat.api";
import { parseChatCompletionStream, stripCodeFences } from "@/lib/chat-stream";
import { useAuthToken } from "@/services/auth.api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";

interface WebsiteDesignSectionProps {
  generatedCode: string;
  projectId?: string;
  frameId?: string;
  onSettingsToggle?: (visible: boolean) => void; // Add this
  onCodeChange?: (code: string) => void;
}

const stripFences = (code: string) => {
  console.log("stripFences input:", code?.substring(0, 100));
  const result = code
    .replace(/```\s*html/gi, "")
    .replace(/```/g, "")
    .trim();
  console.log("stripFences output:", result?.substring(0, 100));
  return result;
};

const sanitizeScripts = (code: string) => {
  console.log("sanitizeScripts input length:", code?.length);
  return code;
};

const stripTrailingMetadata = (code: string) => {
  console.log("stripTrailingMetadata input length:", code?.length);
  const result = (code ?? "").trim();
  console.log("stripTrailingMetadata output length:", result?.length);
  return result;
};

export function WebsiteDesignSection({
  generatedCode,
  projectId,
  frameId,
  onSettingsToggle, // Add this line
  onCodeChange,
}: WebsiteDesignSectionProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>("web");
  const [showSettings, setShowSettings] = useState(false);
  const { selectedElement, setSelectedElement, setIframeRef } =
    useDesignStore();
  const [renderedCode, setRenderedCode] = useState(generatedCode);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const shellLoadedRef = useRef(false);
  const pendingCodeRef = useRef<string | null>(null);
  const skipNextFullRenderRef = useRef(false);

  const [isViewingSnapshot, setIsViewingSnapshot] = useState(false);
  const accessToken = useAuthToken();
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const lastQuickActionRef = useRef<{ label: string; lastHtml?: string } | null>(
    null
  );
  const [regenHint, setRegenHint] = useState("");

  useEffect(() => {
    if (iframeRef.current) {
      //@ts-ignore
      setIframeRef(iframeRef);
    }

    return () => {
      setSelectedElement(null);
    };
  }, [setIframeRef, setSelectedElement]);

  // Initialize a persistent iframe shell once to avoid reloading libs on every update
  useEffect(() => {
    if (!iframeRef.current || shellLoadedRef.current) return;
    iframeRef.current.srcdoc = htmlShell();
    iframeRef.current.onload = () => {
      shellLoadedRef.current = true;
      setIsIframeReady(true);
      // Flush any pending code captured before the shell was ready
      if (pendingCodeRef.current && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "setCode", code: pendingCodeRef.current },
          "*"
        );
        pendingCodeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedElement) {
      setShowSettings(true);
    }
  }, [selectedElement]);

  useEffect(() => {
    // Notify parent when settings panel visibility changes
    onSettingsToggle?.(!showSettings);
  }, [showSettings, onSettingsToggle]);

  const getScreenSizeClass = (size: string) => {
    switch (size) {
      case "mobile":
        return "max-w-md";
      case "tablet":
        return "max-w-2xl";
      case "laptop":
        return "max-w-5xl";
      default:
        return "w-full";
    }
  };

  useEffect(() => {
    // Only update if we're not viewing a snapshot
    if (!isViewingSnapshot) {
      const timer = window.setTimeout(() => {
        setRenderedCode(generatedCode);
      }, 150);
      setIsViewingSnapshot(false);

      return () => window.clearTimeout(timer);
    }
  }, [generatedCode, isViewingSnapshot]);

  const [lastCode, setLastCode] = useState("");

  useEffect(() => {
    console.log("=== IFRAME UPDATE EFFECT ===");
    console.log("renderedCode:", renderedCode?.substring(0, 100));
    console.log("iframeRef.current:", iframeRef.current);

    if (!iframeRef.current) {
      console.log("No iframe ref, returning");
      return;
    }

    let processedCode = "";

    if (
      renderedCode &&
      renderedCode.length > 0 &&
      renderedCode !== "undefined"
    ) {
      console.log("Processing code, length:", renderedCode.length);
      try {
        processedCode = stripTrailingMetadata(renderedCode);
        console.log(
          "After stripTrailingMetadata, length:",
          processedCode.length
        );

        processedCode = stripFences(processedCode);
        console.log("After stripFences, length:", processedCode.length);

        processedCode = sanitizeScripts(processedCode);
        console.log("After sanitizeScripts, length:", processedCode.length);
        console.log("Final processedCode:", processedCode?.substring(0, 200));
      } catch (error) {
        console.error("Error processing code:", error);
        processedCode = "";
      }
    } else {
      console.log("No code or empty code, showing placeholder");
      processedCode = "";
    }

    if (processedCode === lastCode) {
      console.log("Code hasn't changed, skipping update");
      return;
    }
    setLastCode(processedCode);
    // Send incremental update if shell is ready; otherwise queue it
    if (skipNextFullRenderRef.current) {
      // Skip one full render to avoid flicker after in-place patch
      skipNextFullRenderRef.current = false;
    } else if (shellLoadedRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "setCode", code: processedCode },
        "*"
      );
    } else {
      pendingCodeRef.current = processedCode;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "elementSelected") {
        setSelectedElement(event.data.element);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [renderedCode, setSelectedElement]);

  const handleClearSelection = () => {
    setSelectedElement(null);
    setShowSettings(false);
  };

  const replaceInnerInOuter = (
    outerHTML: string,
    innerHTML: string,
    newInnerHTML: string
  ) => {
    try {
      const idx = outerHTML.indexOf(innerHTML);
      if (idx === -1) return null;
      return (
        outerHTML.slice(0, idx) + newInnerHTML + outerHTML.slice(idx + innerHTML.length)
      );
    } catch {
      return null;
    }
  };

  const patchRenderedCodeForSelection = (
    selected: any,
    newInner: string,
    code: string
  ) => {
    const { outerHTML, innerHTML } = selected || {};
    if (!outerHTML || innerHTML === undefined) return null;
    const newOuter = replaceInnerInOuter(outerHTML, innerHTML, newInner);
    if (!newOuter) return null;
    const idx = code.indexOf(outerHTML);
    if (idx === -1) return null;
    return code.slice(0, idx) + newOuter + code.slice(idx + outerHTML.length);
  };

  const streamReplaceSelected = useCallback(
    async (hint?: string) => {
      if (!frameId || !accessToken) {
        toast.error("Please log in again");
        return;
      }
      if (!selectedElement) {
        toast.info("Select an element first");
        return;
      }
      const genId =
        (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${frameId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

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

      const { code: cleaned, raw } = await parseChatCompletionStream(response, {
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
        undoStackRef.current.push(renderedCode || "");
        redoStackRef.current = [];
        const patched = patchRenderedCodeForSelection(selectedElement, final, renderedCode || "");
        if (patched) {
          skipNextFullRenderRef.current = true;
          setRenderedCode(patched);
          onCodeChange?.(patched);
        }
      } else {
        toast.error("AI did not return HTML for the selection");
      }
    },
    [accessToken, frameId, renderedCode, selectedElement]
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
      const genId =
        (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${frameId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
      lastQuickActionRef.current = { label };
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
        undoStackRef.current.push(renderedCode || "");
        redoStackRef.current = [];
        const patched = (renderedCode || "") + "\n" + final;
        lastQuickActionRef.current = { label, lastHtml: final };
        skipNextFullRenderRef.current = true;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      } else {
        toast.error("Failed to generate section");
      }
    },
    [accessToken, frameId, renderedCode]
  );

  const handleTryAnother = useCallback(async () => {
    if (!frameId || !accessToken) {
      toast.error("Please log in again");
      return;
    }
    const meta = lastQuickActionRef.current;
    if (!meta?.label) {
      toast.info("Use a quick action first");
      return;
    }
    const genId =
      (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${frameId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
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
      undoStackRef.current.push(renderedCode || "");
      redoStackRef.current = [];
      if (meta.lastHtml) {
        const idx = (renderedCode || "").lastIndexOf(meta.lastHtml);
        const patched =
          idx !== -1
            ? (renderedCode || "").slice(0, idx) + final + (renderedCode || "").slice(idx + meta.lastHtml.length)
            : (renderedCode || "") + "\n" + final;
        lastQuickActionRef.current = { label: meta.label, lastHtml: final };
        skipNextFullRenderRef.current = true;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      } else {
        lastQuickActionRef.current = { label: meta.label, lastHtml: final };
        skipNextFullRenderRef.current = true;
        const patched = (renderedCode || "") + "\n" + final;
        setRenderedCode(patched);
        onCodeChange?.(patched);
      }
    } else {
      toast.error("Failed to regenerate variation");
    }
  }, [accessToken, frameId, renderedCode]);

  const handleUndo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (prev !== undefined) {
      redoStackRef.current.push(renderedCode || "");
      skipNextFullRenderRef.current = true;
      setRenderedCode(prev);
    }
  }, [renderedCode]);

  const handleRedo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (next !== undefined) {
      undoStackRef.current.push(renderedCode || "");
      skipNextFullRenderRef.current = true;
      setRenderedCode(next);
    }
  }, [renderedCode]);

  return (
    <div className="flex flex-col h-full w-full">
      <WebPageTools
        selectedScreenSize={selectedScreenSize}
        onScreenSizeChange={setSelectedScreenSize}
        generatedCode={generatedCode}
        currentCode={renderedCode}
        projectId={projectId}
        frameId={frameId}
        onQuickAction={handleQuickAction}
        onTryAnother={handleTryAnother}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreviewHtml={(code: string) => {
          console.log("📥 Received preview code:", code?.substring(0, 100));
          setRenderedCode(code);
          setIsViewingSnapshot(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden relative bg-background">
        {/* Left Settings Panel */}
        <div
          className={`bg-card shadow-lg transform transition-all duration-300 overflow-y-auto scrollbar ${
            showSettings ? "w-96" : "w-0"
          }`}
          style={{
            height: "calc(100vh - 120px)",
          }}
        >
          {showSettings && (
            <>
              <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Element Settings</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5">
                {selectedElement?.tagName?.toLowerCase() === "img" ? (
                  //@ts-ignore
                  <ImageSettingsAction selectedEl={selectedElement} />
                ) : selectedElement ? (
                  <ElementSettingsSection
                    selectedElement={selectedElement}
                    clearSelection={handleClearSelection}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground text-sm text-center">
                      Select an element to customize
                    </p>
                  </div>
                )}

                {selectedElement && (
                  <div className="mt-6 space-y-2">
                    <label className="text-sm">Regenerate this element</label>
                    <div className="flex gap-2">
                      <Input
                        value={regenHint}
                        onChange={(e) => setRegenHint(e.target.value)}
                        placeholder="Optional hint (e.g. add CTA, 2 columns, dark)"
                      />
                      <Button type="button" onClick={() => streamReplaceSelected(regenHint)}>
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Center Design Preview */}
        <div className="flex-1 overflow-auto p-6">
          <div className={`mx-auto ${getScreenSizeClass(selectedScreenSize)}`}>
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              {/* Top decorative bar with dots */}
              <div className="h-8 bg-muted/30 border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
                  <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground">
                    preview.design
                  </div>
                </div>
              </div>

              

              <iframe
                ref={iframeRef}
                className="w-full bg-white transition-opacity duration-300"
                style={{
                  minHeight: "85vh",
                  opacity: isIframeReady ? 1 : 0.5,
                }}
                title="Design Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteDesignSection;
