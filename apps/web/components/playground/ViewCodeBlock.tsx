import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Copy, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "sonner";
import { useState } from "react";

export function ViewCodeBlock({ children, code }: any) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (!code) {
                toast.error("No code to copy");
                return;
            }
            
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            toast.success("Copied to clipboard!");
            
            // Reset the icon after 2 seconds
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy code");
        }
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Source Code</DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-2"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                    <DialogDescription>
                        HTML code for this design
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-auto bg-gray-50 rounded-lg p-4">
                    {code ? (
                        <SyntaxHighlighter language="html" style={prism}>
                            {code}
                        </SyntaxHighlighter>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            No code available
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}