"use client";

import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Crop, Expand, Image as ImageUpscale, ImageMinus, Loader2 } from "lucide-react";
import { Tooltip, Input, Button, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui";
import ImageKit from "imagekit";
import { useDesignStore } from "@/store/designStore";

type Props = { selectedEl: HTMLImageElement };

const C = {
  navy: "#0B1740", primary: "#2563EB", primaryBg: "#EBF2FF",
  border: "#E0E8FA", muted: "#8A9AC0", bg: "#ffffff", pageBg: "#F8FAFF",
};

const label = (text: string) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{text}</div>
);

const transformOptions = [
  { label: "Smart Crop", value: "smartcrop", icon: <Crop size={15} />,         transformation: "fo-auto"      },
  { label: "Resize",     value: "resize",    icon: <Expand size={15} />,        transformation: "e-dropshadow" },
  { label: "Upscale",    value: "upscale",   icon: <ImageUpscale size={15} />,  transformation: "e-upscale"    },
  { label: "BG Remove",  value: "bgremove",  icon: <ImageMinus size={15} />,    transformation: "e-bgremove"   },
];

const imageKit = new ImageKit({
  publicKey:   process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY   || "",
  privateKey:  process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY  || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

function ImageSettingsAction({ selectedEl }: Props) {
  const { iframeRef } = useDesignStore();
  const [altText, setAltText]             = useState(selectedEl?.alt || "");
  const [width, setWidth]                 = useState<number>(selectedEl?.width || 300);
  const [height, setHeight]               = useState<number>(selectedEl?.height || 200);
  const [borderRadius, setBorderRadius]   = useState(selectedEl?.style?.borderRadius || "0px");
  const [preview, setPreview]             = useState(selectedEl?.src || "");
  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedEl?.src) {
      setPreview(selectedEl.src);
      setAltText(selectedEl.alt || "");
      setWidth(selectedEl.width || 300);
      setHeight(selectedEl.height || 200);
      setBorderRadius(selectedEl.style?.borderRadius || "0px");
    }
  }, [selectedEl]);

  const sendToIframe = (src: string) => {
    if (iframeRef?.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "updateImageSrc", src }, "*");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      sendToIframe(result);
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);
    reader.readAsDataURL(file);
  };

  const ApplyTransformation = (t: string) => {
    if (!selectedEl) return;
    setLoading(true);
    const newUrl = preview.includes(t) ? preview.replaceAll(`${t},`, "") : `${preview}${t},`;
    setPreview(newUrl);
    sendToIframe(newUrl);
    setLoading(false);
  };

  const GenerateAiImage = () => {
    setLoading(true);
    const url = `https://ik.imagekit.io/on7jjaueg/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`;
    const img = new Image();
    img.onload = () => { setPreview(url); sendToIframe(url); setLoading(false); };
    img.onerror = () => setLoading(false);
    img.src = url;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.navy }}>
        <ImageIcon size={14} color={C.primary} /> Image Settings
      </div>

      {/* Preview / upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 160,
          border: `2px dashed ${C.border}`, borderRadius: 12,
          cursor: "pointer", overflow: "hidden",
          background: preview ? "transparent" : C.pageBg,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = C.primary)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
      >
        {preview ? (
          <img src={preview} alt={altText || "preview"} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 10 }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <ImageIcon size={32} color={C.muted} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: C.navy, margin: 0 }}>Add Image</p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Click to upload</p>
          </div>
        )}
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

      {/* Prompt / alt text */}
      <div>
        {label("Prompt")}
        <Input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Enter prompt for AI image generation" />
      </div>

      {/* Generate */}
      <Button onClick={GenerateAiImage} disabled={loading} style={{ width: "100%" }}>
        {loading && <Loader2 size={14} style={{ marginRight: 6, animation: "spin 0.8s linear infinite" }} />}
        Generate AI Image
      </Button>

      {/* AI Transforms */}
      <div>
        {label("AI transforms")}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TooltipProvider>
            {transformOptions.map((opt) => {
              const applied = preview.includes(opt.transformation);
              return (
                <Tooltip key={opt.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => ApplyTransformation(opt.transformation)}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        border: `1px solid ${applied ? C.primary : C.border}`,
                        background: applied ? C.primaryBg : C.bg,
                        color: applied ? C.primary : C.muted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {opt.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{opt.label}{applied ? " (Applied)" : ""}</TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      {/* Resize inputs — only when resize active */}
      {activeTransforms.includes("resize") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            {label("Width")}
            <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </div>
          <div>
            {label("Height")}
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </div>
        </div>
      )}

      {/* Border radius */}
      <div>
        {label("Border radius")}
        <Input type="text" value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} placeholder="e.g. 8px or 50%" />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default ImageSettingsAction;