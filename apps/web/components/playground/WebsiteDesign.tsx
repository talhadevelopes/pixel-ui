"use client";

import { useEffect, useRef, useState } from "react";
import { WebPageTools } from "./WebpageTools";
import ElementSettingsSection from "./ElementSettingSection";
import ImageSettingsAction from "./ImageSettingsSection";
import { useDesignStore } from "@/app/store/designStore";
import { X } from "lucide-react";

interface WebsiteDesignSectionProps {
    generatedCode: string;
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
    
    // Don't comment out scripts - keep them as is so they execute
    // We only want to remove text that appears OUTSIDE script tags
    
    return code;
};

// FIXED: Better cleanup of trailing metadata and scripts
const stripTrailingMetadata = (code: string) => {
    console.log("stripTrailingMetadata input length:", code?.length);
    let result = code;
    
    // Step 1: Find the VERY LAST closing tag in the HTML
    const allClosingTags = result.match(/<\/[^>]+>/g);
    if (allClosingTags && allClosingTags.length > 0) {
        const lastTag = allClosingTags[allClosingTags.length - 1];
        const lastTagIndex = result.lastIndexOf(lastTag);
        
        if (lastTagIndex !== -1) {
            // Cut everything after the last closing tag
            result = result.substring(0, lastTagIndex + lastTag.length);
        }
    }
    
    result = result.trim();
    console.log("stripTrailingMetadata output length:", result?.length);
    return result;
};

export function WebsiteDesignSection({ generatedCode }: WebsiteDesignSectionProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedScreenSize, setSelectedScreenSize] = useState<string>('web');
    const [showSettings, setShowSettings] = useState(false);
    const { selectedElement, setSelectedElement, setIframeRef } = useDesignStore();
    const [renderedCode, setRenderedCode] = useState(generatedCode);
    const [isIframeReady, setIsIframeReady] = useState(false);

    useEffect(() => {
        if (iframeRef.current) {
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

    const getScreenSizeClass = (size: string) => {
        switch (size) {
            case 'mobile':
                return 'max-w-md';
            case 'tablet':
                return 'max-w-2xl';
            case 'laptop':
                return 'max-w-5xl';
            default:
                return 'w-full';
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setRenderedCode(generatedCode);
        }, 150);

        return () => window.clearTimeout(timer);
    }, [generatedCode]);

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
        
        if (renderedCode && renderedCode.length > 0 && renderedCode !== "undefined") {
            console.log("Processing code, length:", renderedCode.length);
            try {
                processedCode = stripTrailingMetadata(renderedCode);
                console.log("After stripTrailingMetadata, length:", processedCode.length);
                
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

        // CRITICAL FIX: Only update if code actually changed
        if (processedCode === lastCode) {
            console.log("Code hasn't changed, skipping update");
            return;
        }
        setLastCode(processedCode);
        setIsIframeReady(false);

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://cdn.tailwindcss.com"><\/script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"><\/script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
                <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
                <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"><\/script>
                <script src="https://unpkg.com/@popperjs/core@2"><\/script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer><\/script>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0;
                    }
                    [contenteditable="true"]:focus { outline: none; }
                </style>
            </head>
            <body>
                ${processedCode || "<div style='padding: 40px; text-align: center; color: #999;'>No design generated yet. Ask AI to create one.</div>"}
                <script>
                    console.log("Iframe loaded");
                    
                    document.addEventListener('DOMContentLoaded', () => {
                        console.log("Iframe DOMContentLoaded");
                        let hoverEL = null;
                        let selectedEL = null;

                        const handleMouseOver = (e) => {
                            if (selectedEL) return;
                            const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
                            if (!target) return;
                            
                            if (hoverEL && hoverEL === target) {
                                hoverEL.style.outline = "";
                            }
                            hoverEL = target;
                            hoverEL.style.outline = "2px dotted blue";
                            
                            window.parent.postMessage({ 
                                type: 'elementHover', 
                                tagName: target.tagName,
                                id: target.id,
                                className: target.className
                            }, '*');
                        };

                        const handleMouseOut = (e) => {
                            if (selectedEL) return;
                            if (hoverEL) {
                                hoverEL.style.outline = "";
                                hoverEL = null;
                            }
                        };

                        const handleClick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
                            if (!target) return;
                            
                            if (selectedEL && selectedEL !== target) {
                                selectedEL.style.outline = "";
                            }
                            
                            selectedEL = target;
                            selectedEL.style.outline = "2px solid red";
                            
                            console.log("Element selected:", selectedEL.tagName, selectedEL.src);
                            
                            window.parent.postMessage({ 
                                type: 'elementSelected',
                                element: {
                                    tagName: selectedEL.tagName,
                                    id: selectedEL.id,
                                    className: selectedEL.className,
                                    innerHTML: selectedEL.innerHTML,
                                    outerHTML: selectedEL.outerHTML,
                                    src: selectedEL.src || null,
                                    alt: selectedEL.alt || null,
                                    width: selectedEL.width || null,
                                    height: selectedEL.height || null,
                                    style: {
                                        borderRadius: selectedEL.style.borderRadius || '0px'
                                    }
                                }
                            }, '*');
                        };

                        document.addEventListener('mouseover', handleMouseOver);
                        document.addEventListener('mouseout', handleMouseOut);
                        document.addEventListener('click', handleClick);
                        
                        window.addEventListener('message', (event) => {
                            console.log("Iframe received message:", event.data);
                            
                            if (event.data.type === 'updateStyle' && selectedEL) {
                                selectedEL.style[event.data.property] = event.data.value;
                            } else if (event.data.type === 'addClass' && selectedEL) {
                                selectedEL.classList.add(event.data.className);
                            } else if (event.data.type === 'removeClass' && selectedEL) {
                                selectedEL.classList.remove(event.data.className);
                            } else if (event.data.type === 'updateImageSrc' && selectedEL) {
                                console.log("Updating image src to:", event.data.src);
                                if (selectedEL.tagName === 'IMG') {
                                    selectedEL.src = event.data.src;
                                    console.log("Image src updated successfully");
                                } else {
                                    console.warn("Selected element is not an IMG tag:", selectedEL.tagName);
                                }
                            }
                        });
                    });
                <\/script>
            </body>
            </html>
        `;

        console.log("Setting iframe srcdoc, length:", html.length);
        iframeRef.current.srcdoc = html;
        iframeRef.current.onload = () => setIsIframeReady(true);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'elementSelected') {
                setSelectedElement(event.data.element);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);

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
            />
            
            <div className="flex flex-1 overflow-hidden relative bg-gray-50">
                {/* Left Settings Panel */}
                <div
                    className={`bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 overflow-y-auto ${
                        showSettings ? 'w-96' : 'w-0'
                    }`}
                    style={{ 
                        height: 'calc(100vh - 120px)'
                    }}
                >
                    {showSettings && (
                        <>
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                                <h3 className="font-semibold">Settings</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-4">
                                {selectedElement?.tagName?.toLowerCase() === 'img' ? (
                                    <ImageSettingsAction selectedEl={selectedElement} />
                                ) : selectedElement ? (
                                    <ElementSettingsSection 
                                        selectedElement={selectedElement} 
                                        clearSelection={handleClearSelection}
                                    />
                                ) : (
                                    <p className="text-gray-500 text-sm">Select an element</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Center Design Preview */}
                <div className="flex-1 overflow-auto p-4">
                    <div className={`mx-auto ${getScreenSizeClass(selectedScreenSize)}`}>
                        <iframe
                            ref={iframeRef}
                            className="w-full border border-gray-200 bg-white rounded-lg shadow-sm transition-opacity duration-200"
                            style={{ minHeight: '90vh', opacity: isIframeReady ? 1 : 0.4 }}
                            title="Design Preview"
                            sandbox="allow-same-origin allow-scripts"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebsiteDesignSection;