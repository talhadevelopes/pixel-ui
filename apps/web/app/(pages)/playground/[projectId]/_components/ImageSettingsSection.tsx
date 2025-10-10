"use client";
import React, { useRef, useState } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale, // no lucide-react upscale, using Image icon
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

type Props = {
    selectedEl: HTMLImageElement;
};

const transformOptions = [
    { label: "Smart Crop", value: "smartcrop", icon: <Crop /> },
    { label: "Resize", value: "resize", icon: <Expand /> },
    { label: "Upscale", value: "upscale", icon: <ImageUpscale /> },
    { label: "BG Remove", value: "bgremove", icon: <ImageMinus /> },
];

//ig we should later move this to backend
var imageKit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
})

function ImageSettingsAction({ selectedEl }: Props) {
    const [altText, setAltText] = useState(selectedEl.alt || "");
    const [width, setWidth] = useState<number>(selectedEl.width || 300);
    const [selectedImage, setSelectedImage] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [height, setHeight] = useState<number>(selectedEl.height || 200);
    const [borderRadius, setBorderRadius] = useState(
        selectedEl.style.borderRadius || "0px"
    );
    const [preview, setPreview] = useState(selectedEl.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Toggle transform
    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) =>
            prev.includes(value)
                ? prev.filter((t) => t != value)
                : [...prev, value]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveUploadedFile = async () => {
        if(selectedImage) {
            setLoading(true);
            const imageRef = await imageKit.upload({
                file: selectedImage,
                fileName: Date.now() + ".png",
                isPublished: true
            });    

            //@ts-ignore
            selectedEl.setAttribute("src", imageRef.url);
            setLoading(false);

        }
        
    }
    const openFileDialog = () => {
        fileInputRef.current?.click(); 
    };

    return (
        <div className="w-96 shadow p-4 space-y-4">
            <h2 className="flex gap-2 items-center font-bold">
                <ImageIcon /> Image Settings
            </h2>
            
            {/* Preview (clickable) */}
            <div className="flex justify-center">
                <img
                    src={preview}
                    alt={altText}
                    className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80"
                    onClick={openFileDialog}
                />
            </div>
            
            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            
            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={saveUploadedFile}
                disabled={loading}
            >{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Image
            </Button>

            {/* Alt text */} 
            <div> 
                <label className="text-sm">Prompt</label> 
                <Input 
                    type="text" 
                    value={altText} 
                    onChange={(e) => setAltText(e.target.value)} 
                    placeholder="Enter alt text" 
                    className="mt-1" 
                /> 
            </div> 
            
            {/* This is Yet to be Implemented */} 
            <Button className="w-full"> 
                Generate AI Image 
            </Button> 
            
            {/* Transform Buttons */} 
            <div> 
                <label className="text-sm mb-1 block">AI Transforms</label> 
                <div className="flex gap-2 flex-wrap"> 
                    <TooltipProvider> 
                        {transformOptions.map((opt) => { 
                            const applied = activeTransforms.includes(opt.value); 
                            return ( 
                                <Tooltip key={opt.value}> 
                                    <TooltipTrigger asChild> 
                                        <Button 
                                            type="button" 
                                            variant={applied ? "default" : "outline"} 
                                            className="flex items-center justify-center p-2" 
                                            onClick={() => toggleTransform(opt.value)} 
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
                        <label className="text-sm">Width</label> 
                        <Input 
                            type="number" 
                            value={width} 
                            onChange={(e) => setWidth(Number(e.target.value))} 
                            className="mt-1" 
                        /> 
                    </div> 
                    <div className="flex-1"> 
                        <label className="text-sm">Height</label> 
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
                <label className="text-sm">Border Radius</label> 
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