import { Button } from "@workspace/ui/components/button";
import { Clock, Code, Download, History, Laptop, ListTree, Monitor, SquareArrowOutUpRight, TabletSmartphone, Undo2, Redo2, Layers } from "lucide-react";
import { ViewCodeBlock } from "./ViewCodeBlock";
import { useEffect, useMemo, useState } from "react";
import { baseDocument } from "@/lib/html";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useAuthToken } from "@/services/auth.api";
import { fetchFrameHistory, fetchFrameSnapshot } from "@/services/frames.api";
import type { FrameSnapshotMeta } from "@/types/frames.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";

export function WebPageTools({ selectedScreenSize, onScreenSizeChange, generatedCode, currentCode, projectId, frameId, onPreviewHtml, onQuickAction, onTryAnother, onUndo, onRedo }: any) {
    const accessToken = useAuthToken();
    const [finalCode, setFinalCode] = useState<string>('');

    const [history, setHistory] = useState<FrameSnapshotMeta[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string>('current');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        const clean = (baseDocument.replace('{code}', currentCode || generatedCode || '') || '')
            .replaceAll("```html", '')
            .replace(/```/g, '')
            .replace(/\bhtml\b/, '');
        setFinalCode(clean);
    }, [currentCode, generatedCode]);
    useEffect(() => {
        const loadHistory = async () => {
            if (!accessToken || !projectId || !frameId) return;

            setIsLoadingHistory(true);
            try {
                const snapshots = await fetchFrameHistory({ projectId, frameId }, accessToken);
                console.log("📚 ----------HISTORY LOADED:", snapshots); // ADD THIS
                console.log("📚 ----------HISTORY LENGTH:", snapshots.length); // ADD THIS
                setHistory(snapshots);
            } catch (error) {
                console.error('Failed to load history:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadHistory();
    }, [accessToken, projectId, frameId]);


    const ViewInNewTab = () => {
        if (!finalCode) return;
        const html = finalCode;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

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
    };

    const handleExportNextPage = () => {
        const htmlEscaped = JSON.stringify(currentCode || '');
        const page = `import Head from 'next/head';
export default function Page() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com" defer></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js" defer></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js" defer></script>
      </Head>
      <main dangerouslySetInnerHTML={{ __html: ${htmlEscaped} }} />
    </>
  );
}`;
        const blob = new Blob([page], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'page.tsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const handleVersionChange = async (value: string) => {
        if (value === 'current') {
            // Reset to current/latest design
            setSelectedVersion('current');
            onPreviewHtml?.(generatedCode);
            const cleanCode = (baseDocument.replace('{code}', generatedCode) || '')
                .replaceAll("```html", '')
                .replace('```', '')
                .replace('html', '');
            setFinalCode(cleanCode);
            return;
        }

        const id = Number(value);
        if (!accessToken || !id) return;

        try {
            setSelectedVersion(value);
            const snap = await fetchFrameSnapshot(id, accessToken);
            onPreviewHtml?.(snap.designCode);
            const cleanCode = (baseDocument.replace('{code}', snap.designCode) || '')
                .replaceAll("```html", '')
                .replace('```', '')
                .replace('html', '');
            setFinalCode(cleanCode);
        } catch (e) {
            console.error('Failed to load snapshot:', e);
        }
    };

    const [compareCode, setCompareCode] = useState<string>("");

    return (
        <div className="p-2 shadow rounded-xl w-full flex items-center justify-between">
            <div className="flex gap-2">
                <Button variant={'ghost'} className={`${selectedScreenSize === 'web' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('web')} title="Desktop"><Monitor /></Button>
                <Button variant={'ghost'} className={`${selectedScreenSize === 'laptop' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('laptop')} title="Laptop"><Laptop /></Button>
                <Button variant={'ghost'} className={`${selectedScreenSize === 'tablet' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('tablet')} title="Tablet"><TabletSmartphone /></Button>
                <Button variant={'ghost'} className={`${selectedScreenSize === 'mobile' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('mobile')} title="Mobile"><ListTree /></Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onUndo?.()} title="Undo"><Undo2 /></Button>
                    <Button variant="ghost" onClick={() => onRedo?.()} title="Redo"><Redo2 /></Button>
                </div>

                {(history?.length ?? 0) > 0 && (
                    <Select value={selectedVersion} onValueChange={async (v) => {
                        await handleVersionChange(v);
                        if (v !== 'current') {
                            const id = Number(v);
                            if (accessToken && id) {
                                try {
                                    const snap = await fetchFrameSnapshot(id, accessToken);
                                    setCompareCode((snap?.designCode ?? '') as string);
                                } catch { }
                            }
                        } else {
                            setCompareCode('');
                        }
                    }}>
                        <SelectTrigger className="w-[220px]">
                            <History className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Version History" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Current Version</span>
                                </div>
                            </SelectItem>
                            {history.map((snapshot) => (
                                <SelectItem key={snapshot.id} value={String(snapshot.id)}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {snapshot.label || `Version #${snapshot.id}`}
                                        </span>
                                        {snapshot.createdAt && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(snapshot.createdAt).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'outline'}><Layers className="h-4 w-4 mr-2" />Diff</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw]">
                        <DialogHeader>
                            <DialogTitle>Diff: Current vs Selected Version</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-auto">
                            <div>
                                <h4 className="text-sm mb-2">Current</h4>
                                <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap text-xs">{currentCode}</pre>
                            </div>
                            <div>
                                <h4 className="text-sm mb-2">Selected</h4>
                                <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap text-xs">{compareCode}</pre>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant={'outline'} onClick={() => ViewInNewTab()}>View<SquareArrowOutUpRight /></Button>
                <Button onClick={() => handleDownload()} ><Download />Download</Button>
                <ViewCodeBlock code={currentCode} >
                    <Button><Code />Code</Button>
                </ViewCodeBlock>
            </div>
        </div>
    );
}