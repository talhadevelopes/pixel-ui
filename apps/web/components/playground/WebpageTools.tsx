import { Button } from "@workspace/ui/components/button";
import { Code, Download, Monitor, SquareArrowOutUpRight, TabletSmartphone } from "lucide-react";
import { ViewCodeBlock } from "./ViewCodeBlock";
import { useEffect, useState } from "react";
import { baseDocument } from "@/utils/htmlTemplate";

export function WebPageTools({selectedScreenSize, onScreenSizeChange, generatedCode}: any) {
    
    const [finalCode, setFinalCode] = useState<string>('');
    useEffect(() => {
        const cleanCode = (baseDocument.replace('{code}', generatedCode) || '').replaceAll("```html", '').replace('```', '').replace('html', '');


        setFinalCode(cleanCode);
    }, [generatedCode]);
    const ViewInNewTab = () => {
        if(!finalCode) return;
        const cleanCode = (baseDocument.replace('{code}', generatedCode) || '').replaceAll("```html", '').replace('```', '').replace('html', '');
        const html = baseDocument.replace('{code}', cleanCode);
        const blob = new Blob([finalCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }

    const handleDownload = () => {
        const blob = new Blob([finalCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    return (
        <div className="p-2 shadow rounded-xl w-full flex items-center justify-between">
            <div className="flex gap-2">
                <Button variant={'ghost'} className={`${selectedScreenSize === 'web' ? 'border-primary' : ''}`} onClick={()=> onScreenSizeChange('web')}><Monitor/></Button>
                <Button variant={'ghost'} className={`${selectedScreenSize === 'mobile' ? 'border-primary' : ''}`} onClick={()=> onScreenSizeChange('mobile')}><TabletSmartphone/></Button>
            </div>
            <div className="flex gap-2">
                <Button variant={'outline'} onClick={()=> ViewInNewTab()}>View<SquareArrowOutUpRight/></Button>
                <Button onClick={()=> handleDownload()} ><Download/>Download</Button>
                <ViewCodeBlock code={finalCode} >
                <Button><Code/>Code</Button>
                </ViewCodeBlock>
            </div>
        </div>
    )
}