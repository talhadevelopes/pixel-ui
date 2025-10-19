"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale,
    ImageMinus,
    Loader2,
} from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import ImageKit from "imagekit";
import { useDesignStore } from "@/app/store/designStore";  // Import the store

type Props = {
    selectedEl: HTMLImageElement;
};

const transformOptions = [
    { label: "Smart Crop", value: "smartcrop", icon: <Crop />, transformation: 'fo-auto' },
    { label: "Resize", value: "resize", icon: <Expand />, transformation: 'e-dropshadow' },
    { label: "Upscale", value: "upscale", icon: <ImageUpscale />, transformation: 'e-upscale' },
    { label: "BG Remove", value: "bgremove", icon: <ImageMinus />, transformation: 'e-bgremove' },
];

const imageKit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

function ImageSettingsAction({ selectedEl }: Props) {
    const { iframeRef } = useDesignStore();  // Get iframe ref from store
    const [altText, setAltText] = useState(selectedEl?.alt || "");
    const [width, setWidth] = useState<number>(selectedEl?.width || 300);
    const [selectedImage, setSelectedImage] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [height, setHeight] = useState<number>(selectedEl?.height || 200);
    const [borderRadius, setBorderRadius] = useState(
        selectedEl?.style?.borderRadius || "0px"
    );
    const [preview, setPreview] = useState(selectedEl?.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Update preview when selectedEl changes
    useEffect(() => {
        if (selectedEl?.src) {
            setPreview(selectedEl.src);
            setAltText(selectedEl.alt || "");
            setWidth(selectedEl.width || 300);
            setHeight(selectedEl.height || 200);
            setBorderRadius(selectedEl.style?.borderRadius || "0px");
        }
    }, [selectedEl]);

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setLoading(true);
            
            // Immediately show the image when selected
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setPreview(result);
                
                // FIXED: Send to iframe's contentWindow instead of window.parent
                if (iframeRef?.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'updateImageSrc',
                        src: result
                    }, '*');
                    console.log('Image update message sent to iframe');
                } else {
                    console.error('Iframe ref not available');
                }
                
                setLoading(false);
            };
            reader.onerror = () => {
                console.error('Error reading file');
                setLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) =>
            prev.includes(value)
                ? prev.filter((t) => t !== value)
                : [...prev, value]
        );
    };

    const ApplyTransformation = (transformationValue: string) => {
        if (!selectedEl) return;
        
        setLoading(true);
        try {
            let newUrl: string;
            if (!preview.includes(transformationValue)) {
                newUrl = `${preview}${transformationValue},`;
            } else {
                newUrl = preview.replaceAll(`${transformationValue},`, '');
            }
            
            setPreview(newUrl);
            
            // FIXED: Send to iframe's contentWindow instead of window.parent
            if (iframeRef?.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'updateImageSrc',
                    src: newUrl
                }, '*');
                console.log('Transformation update message sent to iframe');
            } else {
                console.error('Iframe ref not available');
            }
        } catch (error) {
            console.error('Error applying transformation:', error);
        } finally {
            setLoading(false);
        }
    };

    const GenerateAiImage = () => {
        setLoading(true);
        const url = `https://ik.imagekit.io/on7jjaueg/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`;
        
        const img = new Image();
        img.onload = () => {
            setPreview(url);
            
            // FIXED: Send to iframe's contentWindow instead of window.parent
            if (iframeRef?.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'updateImageSrc',
                    src: url
                }, '*');
                console.log('AI image update message sent to iframe');
            } else {
                console.error('Iframe ref not available');
            }
            
            setLoading(false);
        };
        img.onerror = () => {
            console.error("Image failed to load");
            setLoading(false);
        };
        img.src = url;
    };

    return (
        <div className="space-y-4 p-4">
            <h2 className="flex gap-2 items-center font-bold text-lg">
                <ImageIcon className="h-5 w-5" /> Image Settings
            </h2>
            
            {/* Preview Square - Click to add image */}
            <div 
                className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                onClick={openFileDialog}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt={altText || "Selected image"}
                        className="w-full h-full object-contain rounded-lg"
                    />
                ) : (
                    <div className="text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-600">Add Image</p>
                        <p className="text-xs text-gray-400 mt-1">Click to upload</p>
                    </div>
                )}
            </div>
            
            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Alt text / Prompt */} 
            <div> 
                <label className="text-sm font-medium">Prompt</label> 
                <Input 
                    type="text" 
                    value={altText} 
                    onChange={(e) => setAltText(e.target.value)} 
                    placeholder="Enter prompt for AI image generation" 
                    className="mt-1" 
                /> 
            </div> 
            
            {/* Generate AI Image */} 
            <Button 
                className="w-full" 
                onClick={GenerateAiImage} 
                disabled={loading}
            > 
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate AI Image 
            </Button> 
            
            {/* Transform Buttons */} 
            <div> 
                <label className="text-sm font-medium mb-2 block">AI Transforms</label> 
                <div className="flex gap-2 flex-wrap"> 
                    <TooltipProvider> 
                        {transformOptions.map((opt) => { 
                            const applied = activeTransforms.includes(opt.value); 
                            return ( 
                                <Tooltip key={opt.value}> 
                                    <TooltipTrigger asChild> 
                                        <Button 
                                            type="button" 
                                            variant={preview.includes(opt.transformation) ? "default" : "outline"} 
                                            size="icon"
                                            onClick={() => ApplyTransformation(opt.transformation)} 
                                        > 
                                            {opt.icon} 
                                        </Button> 
                                    </TooltipTrigger> 
                                    <TooltipContent> 
                                        {opt.label} {applied && "(Applied)"} 
                                    </TooltipContent> 
                                </Tooltip> 
                            );
                        })} 
                    </TooltipProvider> 
                </div> 
            </div> 
            
            {/* Conditional Resize Inputs */} 
            {activeTransforms.includes("resize") && ( 
                <div className="flex gap-2"> 
                    <div className="flex-1"> 
                        <label className="text-sm font-medium">Width</label> 
                        <Input 
                            type="number" 
                            value={width} 
                            onChange={(e) => setWidth(Number(e.target.value))} 
                            className="mt-1" 
                        /> 
                    </div> 
                    <div className="flex-1"> 
                        <label className="text-sm font-medium">Height</label> 
                        <Input 
                            type="number" 
                            value={height} 
                            onChange={(e) => setHeight(Number(e.target.value))} 
                            className="mt-1" 
                        /> 
                    </div> 
                </div>
            )} 

            {/* Border Radius */} 
            <div> 
                <label className="text-sm font-medium">Border Radius</label> 
                <Input 
                    type="text" 
                    value={borderRadius} 
                    onChange={(e) => setBorderRadius(e.target.value)} 
                    placeholder="e.g. 8px or 50%" 
                    className="mt-1" 
                /> 
            </div> 
        </div>
    ); 
}

export default ImageSettingsAction;