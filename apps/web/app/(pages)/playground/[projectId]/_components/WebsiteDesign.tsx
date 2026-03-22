"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Sparkles, Monitor, Tablet, Smartphone, Code, Share2, Download } from "lucide-react";
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
  const { selectedElement, setSelectedElement, setIframeRef } = useDesignStore();
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

  const shellLoadedRef          = useRef(false);
  const pendingCodeRef          = useRef<string | null>(null);
  const skipNextFullRenderRef   = useRef(false);
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

  // ── All original logic — untouched ──────────────────────────────────────

  useEffect(() => {
    if (iframeRef.current) {
      //@ts-ignore
      setIframeRef(iframeRef);
    }
    return () => { setSelectedElement(null); };
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
    if (selectedElement) setShowSettings(true);
  }, [selectedElement]);

  useEffect(() => {
    onSettingsToggle?.(!showSettings);
  }, [showSettings, onSettingsToggle]);

  useEffect(() => {
    if (!isViewingSnapshot) {
      const timer = window.setTimeout(() => setRenderedCode(generatedCode), 150);
      setIsViewingSnapshot(false);
      return () => window.clearTimeout(timer);
    }
  }, [generatedCode, isViewingSnapshot]);

  const [lastCode, setLastCode] = useState("");

  useEffect(() => {
    if (!iframeRef.current) return;

    let processedCode = "";
    if (renderedCode && renderedCode.length > 0 && renderedCode !== "undefined") {
      try {
        processedCode = stripTrailingMetadata(renderedCode);
        processedCode = stripFences(processedCode);
        processedCode = sanitizeScripts(processedCode);
      } catch (error) {
        console.error("Error processing code:", error);
        processedCode = "";
      }
    }

    if (processedCode === lastCode) return;
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
      if (event.data?.type === "elementSelected") setSelectedElement(event.data.element);
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

  // ── Screen size → viewport class ────────────────────────────────────────
  const getScreenSizeClass = (size: string) => {
    switch (size) {
      case "mobile":  return "max-w-md";
      case "tablet":  return "max-w-2xl";
      case "laptop":  return "max-w-5xl";
      default:        return "w-full";
    }
  };

  // ── NEW UI ───────────────────────────────────────────────────────────────
  return (
    <div className="preview-panel" style={{ height: "100%" }}>

      {/* Toolbar */}
      <div className="preview-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Viewport toggle */}
          <div className="viewport-toggle">
            {[
              { key: "desktop", Icon: Monitor },
              { key: "tablet",  Icon: Tablet },
              { key: "mobile",  Icon: Smartphone },
            ].map(({ key, Icon }) => (
              <button
                key={key}
                className={`viewport-btn ${selectedScreenSize === key ? "viewport-active" : ""}`}
                onClick={() => setSelectedScreenSize(key)}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>

          {/* WebPageTools (undo/redo/quick actions — unchanged) */}
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
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn-toolbar"><Code size={18} /></button>
          <button className="btn-toolbar"><Share2 size={18} /></button>
          <div className="divider-vertical" />
          <button className="btn-export">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Element settings panel */}
        <div
          style={{
            width: showSettings ? 360 : 0,
            overflow: "hidden",
            transition: "width 0.25s ease",
            background: "var(--color-bg-white)",
            borderRight: showSettings ? "1px solid var(--color-border)" : "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {showSettings && (
            <>
              <div style={{
                position: "sticky", top: 0,
                background: "var(--color-bg-white)",
                borderBottom: "1px solid var(--color-border)",
                padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                zIndex: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32,
                    background: "var(--color-primary-bg)",
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Sparkles size={15} color="var(--color-primary)" />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-heading)" }}>
                    Element Settings
                  </span>
                </div>
                <button className="btn-icon btn-icon-sm" onClick={() => setShowSettings(false)}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
                {selectedElement?.tagName?.toLowerCase() === "img" ? (
                  //@ts-ignore
                  <ImageSettingsAction selectedEl={selectedElement} />
                ) : selectedElement ? (
                  <ElementSettingsSection
                    selectedElement={selectedElement}
                    clearSelection={handleClearSelection}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 12 }}>
                    <div style={{ width: 56, height: 56, background: "var(--color-primary-bg)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={24} color="var(--color-primary)" style={{ opacity: 0.5 }} />
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", textAlign: "center" }}>
                      Select an element to customize
                    </p>
                  </div>
                )}

                {selectedElement && (
                  <div style={{ marginTop: 24 }}>
                    <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 8 }}>
                      Regenerate this element
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Input
                        value={regenHint}
                        onChange={(e) => setRegenHint(e.target.value)}
                        placeholder="Optional hint…"
                      />
                      <Button
                        type="button"
                        onClick={() => streamReplaceSelected(selectedElement, regenHint)}
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

        {/* Preview iframe */}
        <div className="preview-content" style={{ flex: 1, overflow: "auto", padding: 32, background: "rgba(241,245,249,0.5)" }}>
          <div className={`mx-auto ${getScreenSizeClass(selectedScreenSize)}`} style={{ height: "100%" }}>
            <div
              className="browser-frame"
              style={{ width: "100%", height: "100%", minHeight: "80vh" }}
            >
              {/* Browser bar */}
              <div className="browser-bar">
                <div className="browser-dots">
                  <div className="browser-dot" />
                  <div className="browser-dot" />
                  <div className="browser-dot" />
                </div>
                <div className="browser-url">preview.design</div>
                <div className="browser-spacer" />
              </div>

              {/* iframe */}
              <iframe
                ref={iframeRef}
                style={{
                  width: "100%",
                  minHeight: "85vh",
                  background: "#fff",
                  border: "none",
                  opacity: isIframeReady ? 1 : 0.5,
                  transition: "opacity 0.3s",
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