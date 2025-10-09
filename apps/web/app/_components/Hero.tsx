// HeroSection.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { HomeIcon, ImagePlus, LayoutDashboard, Send } from "lucide-react";

import { API, BASE_URL } from "@/service/api";
import { getAccessToken } from "@/lib/auth-storage";

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

const suggestions = [
    {
        label: "Dashboard",
        prompt: "Create an Analytics dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Hero Section",
        prompt: "Create a Hero Section",
        icon: HomeIcon,
    },
];

const generateProjectId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `project-${Date.now()}`;
};

const generateFrameId = () => `frame-${Math.random().toString(36).slice(2, 8)}`;

function HeroSection() {
    const [userInput, setUserInput] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput) {
            toast.error("Please describe what you want to design.");
            return;
        }

        const token = getAccessToken();

        if (!token) {
            toast.error("Please log in to create a project.");
            return;
        }

        setIsGenerating(true);

        const projectId = generateProjectId();
        const frameId = generateFrameId();
        const messages: ChatMessage[] = [
            {
                role: "user",
                content: trimmedInput,
            },
        ];

        try {
            const response = await fetch(`${BASE_URL}${API.projects.create}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId, frameId, messages }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                throw new Error(errorBody?.message ?? "Failed to create project");
            }

            await response.json();
            toast.success("Project created successfully");
            router.push(`/playground/${projectId}?frameId=${frameId}`);
        } catch (error) {
            console.error("Create project failed", error);
            toast.error(error instanceof Error ? error.message : "Failed to create project");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = () => {
        toast.info("Image upload coming soon");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4 py-12">
            <div className="w-full max-w-3xl space-y-8">
                {/* Header Section */}
                <div className="space-y-3 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        What should we Design?
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Generate, Edit and Explore Designs with AI
                    </p>
                </div>

                {/* Input Section */}
                <div className="space-y-3">
                    {/* Textarea */}
                    <div className="relative rounded-xl border border-input bg-card shadow-sm hover:border-primary/50 transition-colors overflow-hidden">
                        <textarea
                            placeholder="Describe your page design... e.g., 'A modern SaaS landing page with hero section'"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-transparent resize-none focus:outline-none text-base placeholder:text-muted-foreground"
                        />
                        {/* Action Buttons in Textarea */}
                        <div className="flex items-center justify-between border-t border-input bg-muted/30 px-4 py-3">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleImageUpload}
                                    title="Upload image reference"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <ImagePlus className="h-5 w-5" />
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleGenerate}
                                disabled={!userInput.trim() || isGenerating}
                                className="gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground px-1">
                            Quick Suggestions
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {suggestions.map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        onClick={() => setUserInput(suggestion.prompt)}
                                        className="h-auto py-3 px-4 justify-start hover:bg-primary/5 hover:border-primary transition-colors"
                                    >
                                        <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{suggestion.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {suggestion.prompt}
                                            </p>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;