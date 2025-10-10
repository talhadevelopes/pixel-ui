"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WebPageTools } from "./WebpageTools";
import ElementSettingsSection from "./ElementSettingSection";
import ImageSettingsAction from "./ImageSettingsSection";

interface WebsiteDesignSectionProps {
    generatedCode: string;
}

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Generated design preview" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

const stripFences = (code: string) =>
    code
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .trim();

const sanitizeScripts = (code: string) =>
    code
        .replace(/<script/gi, "<!-- script")
        .replace(/script>/gi, "script -->");

const stripTrailingMetadata = (code: string) => {
    return code
        .replace(/©\s?\d{4}[^<]*$/i, "")
        .replace(/\/\/\s?Theme Toggle Logic[\s\S]*/i, "")
        .trim();
};

export function WebsiteDesignSection({ generatedCode }: WebsiteDesignSectionProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedScreenSize, setSelectedScreenSize] = useState<string>('web');
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const preparedCode = useMemo(() => {
        const stripped = stripTrailingMetadata(stripFences(generatedCode));
        return sanitizeScripts(stripped);
    }, [generatedCode]);

    useEffect(() => {
        if (!iframeRef.current) return;
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(HTML_CODE);
        doc.close();

        // Reacquire document reference after close
        const updatedDoc = iframe.contentDocument;
        if (!updatedDoc || !updatedDoc.body) return;

        // Inject the prepared code into the root div
        const root = updatedDoc.getElementById("root");
        if (root) {
            root.innerHTML = preparedCode || "<div class='p-10 text-center'>Generated code will appear here</div>";
        }

        let hoverEL: HTMLElement | null = null;
        let selectedEL: HTMLElement | null = null;

        const handleMouseOver = (e: MouseEvent) => {
            if (selectedEL) return;
            const target = e.target as HTMLElement;
            if (hoverEL && hoverEL === target) {
                hoverEL.style.outline = "";
            }
            hoverEL = target;
            hoverEL.style.outline = "2px dotted blue";
        };

        const handleMouseOut = (e: MouseEvent) => {
            if (selectedEL) return;
            if (hoverEL) {
                hoverEL.style.outline = "";
                hoverEL = null;
            }
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target as HTMLElement;
            if (selectedEL && selectedEL !== target) {
                selectedEL.style.outline = "";
                selectedEL.removeAttribute("contenteditable");
            }
            selectedEL = target;
            selectedEL.style.outline = "2px solid red";
            selectedEL.setAttribute("contenteditable", "true");
            selectedEL.focus();
            console.log('Selected element:', selectedEL);
            setSelectedElement(selectedEL);
        };

        const handleBlur = () => {
            if (selectedEL) {
                console.log('Final edited element:', selectedEL.outerHTML);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedEL) {
                selectedEL.style.outline = "";
                selectedEL.removeAttribute("contenteditable");
                selectedEL.removeEventListener("blur", handleBlur);
                selectedEL = null;
            }
        };

        updatedDoc.body.addEventListener("mouseover", handleMouseOver);
        updatedDoc.body.addEventListener("mouseout", handleMouseOut);
        updatedDoc.body.addEventListener("click", handleClick);
        updatedDoc.body.addEventListener("keydown", handleKeyDown);

        // Cleanup on unmount
        return () => {
            const cleanupDoc = iframe.contentDocument;
            if (cleanupDoc?.body) {
                cleanupDoc.body.removeEventListener("mouseover", handleMouseOver);
                cleanupDoc.body.removeEventListener("mouseout", handleMouseOut);
                cleanupDoc.body.removeEventListener("click", handleClick);
                cleanupDoc.body.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [preparedCode]);


    return (
        <div className="flex gap-2 w-full">
            <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-muted/20 p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</h2>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl border border-border/70">
                    <iframe
                        ref={iframeRef}
                        className={`h-full w-full bg-white ${selectedScreenSize === 'mobile' ? 'w-1/2' : 'w-full'}`}
                        sandbox="allow-scripts allow-same-origin"
                        title="Generated website preview"
                    />
                </div>
                <WebPageTools selectedScreenSize={selectedScreenSize} setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)} generatedCode={generatedCode} />
            </div>


            {selectedElement?.tagName === "IMG" ? (
                <ImageSettingsAction selectedEl={selectedElement} />
            ) : selectedElement ? (
                <ElementSettingsSection selectedElement={selectedElement} clearSelection={() => setSelectedElement(null)} />
            ) : null}
        </div>

    );
}

export default WebsiteDesignSection;