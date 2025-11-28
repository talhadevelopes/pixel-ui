import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Copy, Check, Download } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "sonner";
import { useState } from "react";
import { getNextJsCode } from "@/lib/code-templates";

export function ViewCodeBlock({ children, code, nextJsCode }: any) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "nextjs">("html");

  const currentCode = activeTab === "html" ? code : getNextJsCode(code);
  const currentLanguage = activeTab === "html" ? "html" : "typescript";
  const currentFileName = activeTab === "html" ? "index.html" : "page.tsx";

  const handleCopy = async () => {
    try {
      if (!currentCode) {
        toast.error("No code to copy");
        return;
      }

      await navigator.clipboard.writeText(currentCode);
      setIsCopied(true);
      toast.success("Copied to clipboard!");

      // Reset the icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy code");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${currentFileName}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Source Code</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                {activeTab === "html" ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download TSX
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogDescription>
            {activeTab === "html"
              ? "HTML code for this design"
              : "Next.js page component"}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "html"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("html")}
          >
            HTML
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "nextjs"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("nextjs")}
          >
            Next.js
          </button>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          {currentCode ? (
            <SyntaxHighlighter language={currentLanguage} style={prism}>
              {currentCode}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No code available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
