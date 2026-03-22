"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { SwatchBook, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input, Button } from "@workspace/ui";
import { useDesignStore } from "@/store/useDesignStore";

interface Props {
    selectedElement: any;
    clearSelection: () => void;
}

const C = {
    navy: "#0B1740", primary: "#2563EB", primaryBg: "#EBF2FF",
    border: "#E0E8FA", muted: "#8A9AC0", bg: "#ffffff", pageBg: "#F8FAFF",
    error: "#EF4444", errorBg: "#FEE2E2",
};

const label = (text: string) => (
    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{text}</div>
);

const ElementSettingsSection: React.FC<Props> = ({ selectedElement, clearSelection }) => {
    const [align, setAlign] = useState("left");
    const [fontSize, setFontSize] = useState("16px");
    const [color, setColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [borderRadius, setBorderRadius] = useState("0px");
    const [paddingValues, setPaddingValues] = useState({ top: "0", right: "0", bottom: "0", left: "0" });
    const [marginValues, setMarginValues] = useState({ top: "0", right: "0", bottom: "0", left: "0" });
    const [elementClasses, setElementClasses] = useState<string[]>([]);
    const [newClass, setNewClass] = useState("");

    const { iframeRef } = useDesignStore();

    const getIframeElement = () => {
        if (!iframeRef?.current?.contentWindow?.document || !selectedElement) return null;
        const doc = iframeRef.current.contentWindow.document;
        if (selectedElement.id) { const el = doc.getElementById(selectedElement.id); if (el) return el; }
        const els = doc.getElementsByTagName(selectedElement.tagName);
        for (let i = 0; i < els.length; i++) { if (els[i].className === selectedElement.className) return els[i]; }
        return null;
    };

    useEffect(() => {
        if (!selectedElement) {
            setAlign("left"); setFontSize("16px"); setColor("#000000");
            setBackgroundColor("#ffffff"); setBorderRadius("0px");
            setPaddingValues({ top: "0", right: "0", bottom: "0", left: "0" });
            setMarginValues({ top: "0", right: "0", bottom: "0", left: "0" });
            setElementClasses([]);
            return;
        }
        const el = getIframeElement();
        if (!el) return;
        const view = el.ownerDocument?.defaultView;
        const cs = view?.getComputedStyle(el);
        const st = el.style || {};
        setAlign(st.textAlign || cs?.textAlign || "left");
        setFontSize(st.fontSize || cs?.fontSize || "16px");
        setColor(st.color || cs?.color || "#000000");
        setBackgroundColor(st.backgroundColor || cs?.backgroundColor || "#ffffff");
        setBorderRadius(st.borderRadius || cs?.borderRadius || "0px");
        setPaddingValues({
            top: (st.paddingTop || cs?.paddingTop || "0px").replace("px", ""),
            right: (st.paddingRight || cs?.paddingRight || "0px").replace("px", ""),
            bottom: (st.paddingBottom || cs?.paddingBottom || "0px").replace("px", ""),
            left: (st.paddingLeft || cs?.paddingLeft || "0px").replace("px", ""),
        });
        setMarginValues({
            top: (st.marginTop || cs?.marginTop || "0px").replace("px", ""),
            right: (st.marginRight || cs?.marginRight || "0px").replace("px", ""),
            bottom: (st.marginBottom || cs?.marginBottom || "0px").replace("px", ""),
            left: (st.marginLeft || cs?.marginLeft || "0px").replace("px", ""),
        });
        setElementClasses((selectedElement.className || "").split(" ").filter((c: string) => c.trim() !== ""));
    }, [selectedElement, iframeRef]);

    const send = (property: string, value: string) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) return;
        switch (property) {
            case "textAlign": setAlign(value); break;
            case "fontSize": setFontSize(value); break;
            case "color": setColor(value); break;
            case "backgroundColor": setBackgroundColor(value); break;
            case "borderRadius": setBorderRadius(value); break;
        }
        iframeRef.current.contentWindow.postMessage({ type: "updateStyle", property, value }, "*");
    };

    type BoxSide = "top" | "right" | "bottom" | "left";

    const handleSpacing = (type: "padding" | "margin", side: BoxSide, e: ChangeEvent<HTMLInputElement>) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) return;
        const num = e.target.value.replace(/[^0-9.]/g, "") || "0";
        const prop = `${type}${side.charAt(0).toUpperCase()}${side.slice(1)}`;
        if (type === "padding") setPaddingValues(p => ({ ...p, [side]: num }));
        else setMarginValues(p => ({ ...p, [side]: num }));
        iframeRef.current.contentWindow.postMessage({ type: "updateStyle", property: prop, value: `${num}px` }, "*");
    };

    const addClass = () => {
        if (!selectedElement || !newClass.trim() || !iframeRef?.current?.contentWindow) return;
        const updated = [...new Set([...elementClasses, newClass.trim()])];
        iframeRef.current.contentWindow.postMessage({ type: "addClass", className: newClass.trim() }, "*");
        setElementClasses(updated);
        setNewClass("");
    };

    const removeClass = (cls: string) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage({ type: "removeClass", className: cls }, "*");
        setElementClasses(prev => prev.filter(c => c !== cls));
    };

    if (!selectedElement) {
        return (
            <div style={{ padding: 16, textAlign: "center", color: C.muted, fontSize: 13 }}>
                <p>No element selected</p>
                <p style={{ fontSize: 11, marginTop: 6 }}>Click any element in the preview to edit it</p>
            </div>
        );
    }

    const alignBtn = (val: string, Icon: React.FC<any>) => (
        <button onClick={() => send("textAlign", val)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: `1px solid ${align === val ? C.primary : C.border}`, background: align === val ? C.primaryBg : C.bg, color: align === val ? C.primary : C.muted, cursor: "pointer" }}>
            <Icon size={15} />
        </button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: "'DM Sans', sans-serif" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.navy }}>
                    <SwatchBook size={14} color={C.primary} />
                    {selectedElement.tagName} Settings
                </div>
                <button onClick={clearSelection}
                    style={{ fontSize: 11, fontWeight: 500, color: C.muted, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
                    Clear
                </button>
            </div>

            {/* Text Alignment */}
            <div>
                {label("Text alignment")}
                <div style={{ display: "flex", gap: 6 }}>
                    {alignBtn("left", AlignLeft)}
                    {alignBtn("center", AlignCenter)}
                    {alignBtn("right", AlignRight)}
                </div>
            </div>

            {/* Font size + Text color */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
                <div>
                    {label("Font size")}
                    <Select value={fontSize} onValueChange={(v) => send("fontSize", v)}>
                        <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                        <SelectContent>
                            {["12px", "16px", "20px", "24px", "32px"].map(s => (
                                <SelectItem key={s} value={s}>{s === "12px" ? "Small" : s === "16px" ? "Normal" : s === "20px" ? "Large" : s === "24px" ? "X-Large" : "XX-Large"}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    {label("Text color")}
                    <input type="color" value={color} onChange={(e) => send("color", e.target.value)}
                        style={{ width: 40, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer", padding: 2 }} />
                </div>
            </div>

            {/* Background + Border radius */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "end" }}>
                <div>
                    {label("Background")}
                    <input type="color" value={backgroundColor} onChange={(e) => send("backgroundColor", e.target.value)}
                        style={{ width: 40, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer", padding: 2 }} />
                </div>
                <div>
                    {label("Border radius")}
                    <Select value={borderRadius} onValueChange={(v) => send("borderRadius", v)}>
                        <SelectTrigger><SelectValue placeholder="Radius" /></SelectTrigger>
                        <SelectContent>
                            {([["0px", "None"], ["4px", "Small"], ["8px", "Medium"], ["16px", "Large"], ["9999px", "Full"]] as [string, string][]).map(([v, l]) => (
                                <SelectItem key={v} value={v}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Padding */}
            <div>
                {label("Padding (px)")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(["top", "right", "bottom", "left"] as BoxSide[]).map(side => (
                        <Input key={side} type="number" min={0} value={paddingValues[side]}
                            onChange={(e) => handleSpacing("padding", side, e)}
                            placeholder={side.charAt(0).toUpperCase() + side.slice(1)} />
                    ))}
                </div>
            </div>

            {/* Margin */}
            <div>
                {label("Margin (px)")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(["top", "right", "bottom", "left"] as BoxSide[]).map(side => (
                        <Input key={side} type="number" value={marginValues[side]}
                            onChange={(e) => handleSpacing("margin", side, e)}
                            placeholder={side.charAt(0).toUpperCase() + side.slice(1)} />
                    ))}
                </div>
            </div>

            {/* Custom classes */}
            <div>
                {label("Custom classes")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, minHeight: 28 }}>
                    {elementClasses.length > 0 ? elementClasses.map(cls => (
                        <span key={cls} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: C.primaryBg, color: C.primary, borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                            {cls}
                            <button onClick={() => removeClass(cls)}
                                style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: C.primary, padding: 0, marginLeft: 2 }}>
                                <X size={11} />
                            </button>
                        </span>
                    )) : (
                        <span style={{ fontSize: 12, color: C.muted }}>No classes applied</span>
                    )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Input value={newClass} onChange={(e) => setNewClass(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addClass()}
                        placeholder="e.g. text-blue-500" />
                    <Button type="button" onClick={addClass} disabled={!newClass.trim()} variant="outline">Add</Button>
                </div>
            </div>
        </div>
    );
};

export default ElementSettingsSection;