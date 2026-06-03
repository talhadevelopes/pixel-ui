"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { htmlShell } from "@/lib/code-templates";
import { useAuthToken } from "@/services/auth.api";
import { Input, Button } from "@workspace/ui";
import { WebsiteDesignSectionProps } from "@workspace/types";
import { useWebsiteDesignStore, useDesignStore } from "@/store";
import {
  stripFences,
  sanitizeScripts,
  stripTrailingMetadata,
} from "@/lib/code-processors";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { WebPageTools, ElementSettingsSection, ImageSettingsAction } from "./index";

export function WebsiteDesignSection({
  generatedCode,
  projectId,
  frameId,
  onSettingsToggle,
  onCodeChange,
}: WebsiteDesignSectionProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { selectedElement, setSelectedElement, setIframeRef } =
    useDesignStore();
  const {
    selectedScreenSize,
    setSelectedScreenSize,
    showSettings,
    setShowSettings,
    renderedCode,
    setRenderedCode,
    isIframeReady,
    setIsIframeReady,
    regenHint,
    setRegenHint,
    pushUndo,
    popUndo,
    pushRedo,
    popRedo,
    clearRedoStack,
    lastQuickAction,
    setLastQuickAction,
  } = useWebsiteDesignStore();
  const shellLoadedRef = useRef(false);
  const pendingCodeRef = useRef<string | null>(null);
  const skipNextFullRenderRef = useRef(false);

  const [isViewingSnapshot, setIsViewingSnapshot] = useState(false);
  const accessToken = useAuthToken();
  const { streamReplaceSelected, handleQuickAction, handleTryAnother } =
    useAIGeneration(
      frameId,
      accessToken,
      //@ts-ignore
      iframeRef,
      skipNextFullRenderRef,
      onCodeChange
    );

  useEffect(() => {
    if (iframeRef.current) {
      //@ts-ignore
      setIframeRef(iframeRef);
    }

    return () => {
      setSelectedElement(null);
    };
  }, [setIframeRef, setSelectedElement]);

  useEffect(() => {
    if (!iframeRef.current || shellLoadedRef.current) return;
    iframeRef.current.srcdoc = htmlShell();
    iframeRef.current.onload = () => {
      shellLoadedRef.current = true;
      setIsIframeReady(true);
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
    if (!iframeRef.current) {
      return;
    }

    let processedCode = "";

    if (
      renderedCode &&
      renderedCode.length > 0 &&
      renderedCode !== "undefined"
    ) {
      try {
        processedCode = stripTrailingMetadata(renderedCode);
        processedCode = stripFences(processedCode);
        processedCode = sanitizeScripts(processedCode);
      } catch (error) {
        console.error("Error processing code:", error);
        processedCode = "";
      }
    } else {
      processedCode = "";
    }

    if (processedCode === lastCode) {
      return;
    }
    setLastCode(processedCode);
    if (skipNextFullRenderRef.current) {
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

  const handleUndo = useCallback(() => {
    const prev = popUndo();
    if (prev !== undefined) {
      pushRedo(renderedCode || "");
      skipNextFullRenderRef.current = true;
      setRenderedCode(prev);
    }
  }, [renderedCode, popUndo, pushRedo, setRenderedCode]);

  const handleRedo = useCallback(() => {
    const next = popRedo();
    if (next !== undefined) {
      pushUndo(renderedCode || "");
      skipNextFullRenderRef.current = true;
      setRenderedCode(next);
    }
  }, [renderedCode, popRedo, pushUndo, setRenderedCode]);

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
          setRenderedCode(code);
          setIsViewingSnapshot(true);
        }}
      />

      <div className="flex flex-1 overflow-hidden relative bg-background">
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
                      <Button
                        type="button"
                        onClick={() =>
                          streamReplaceSelected(selectedElement, regenHint)
                        }
                      >
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