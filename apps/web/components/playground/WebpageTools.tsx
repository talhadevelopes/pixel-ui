import { Button } from "@workspace/ui/components/button";
import { BookAIcon, Code, Download, Monitor, SquareArrowOutUpRight, TabletSmartphone } from "lucide-react";
import { ViewCodeBlock } from "./ViewCodeBlock";
import { useEffect, useState } from "react";

const baseDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Generated design preview" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>
</head>
<body>
  <div id="root">
  {code}</div>
</body>
</html>`;

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