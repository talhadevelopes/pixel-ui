import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "sonner";


export function ViewCodeBlock({children, code}: any) {

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        toast.success("Copied Successfully");

    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[80vw] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Source Code <Copy/></DialogTitle>
                    <DialogDescription>
<SyntaxHighlighter language="html" style={prism}>
{code}
</SyntaxHighlighter>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
       
    )
}