"use client";

import { useEffect, useRef, useState } from "react";
import { WebPageTools } from "./WebpageTools";
import ElementSettingsSection from "./ElementSettingSection";
import ImageSettingsAction from "./ImageSettingsSection";
import { X, Sparkles } from "lucide-react";
import { useDesignStore } from "@/store/useDesignStore";
import { html } from "@/utils/htmlTemplate";

interface WebsiteDesignSectionProps {
  generatedCode: string;
  projectId?: string;
  frameId?: string;
  onSettingsToggle?: (visible: boolean) => void; // Add this
}

const stripFences = (code: string) => {
  console.log("stripFences input:", code?.substring(0, 100));
  const result = code
    .replace(/```html/gi, "")
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
  let result = code;

  const allClosingTags = result.match(/<\/[^>]+>/g);
  if (allClosingTags && allClosingTags.length > 0) {
    const lastTag = allClosingTags[allClosingTags.length - 1];
    const lastTagIndex = result.lastIndexOf(lastTag ?? "");

    if (lastTagIndex !== -1) {
      result = result.substring(0, lastTagIndex + (lastTag ?? "").length);
    }
  }

  result = result.trim();
  console.log("stripTrailingMetadata output length:", result?.length);
  return result;
};

export function WebsiteDesignSection({
  generatedCode,
  projectId,
  frameId,
  onSettingsToggle, // Add this line
}: WebsiteDesignSectionProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>("web");
  const [showSettings, setShowSettings] = useState(false);
  const { selectedElement, setSelectedElement, setIframeRef } =
    useDesignStore();
  const [renderedCode, setRenderedCode] = useState(generatedCode);
  const [isIframeReady, setIsIframeReady] = useState(false);

  const [isViewingSnapshot, setIsViewingSnapshot] = useState(false);

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
    setIsIframeReady(false);

    console.log("Setting iframe srcdoc, length:", html.length);
    iframeRef.current.srcdoc = html(processedCode);
    iframeRef.current.onload = () => setIsIframeReady(true);

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

  return (
    <div className="flex flex-col h-full w-full">
      <WebPageTools
        selectedScreenSize={selectedScreenSize}
        onScreenSizeChange={setSelectedScreenSize}
        generatedCode={generatedCode}
        projectId={projectId}
        frameId={frameId}
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
