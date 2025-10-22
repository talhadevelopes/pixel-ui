import { Button } from "@workspace/ui/components/button";
import { Clock, Code, Download, History, Monitor, SquareArrowOutUpRight, TabletSmartphone } from "lucide-react";
import { ViewCodeBlock } from "./ViewCodeBlock";
import { useEffect, useMemo, useState } from "react";
import { baseDocument } from "@/utils/htmlTemplate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useAuthToken } from "@/services/auth.api";
import { fetchFrameHistory, fetchFrameSnapshot } from "@/services/frames.api";
import type { FrameSnapshotMeta } from "@/types/frames.types";

export function WebPageTools({ selectedScreenSize, onScreenSizeChange, generatedCode, projectId, frameId, onPreviewHtml }: any) {
    const accessToken = useAuthToken();
    const [finalCode, setFinalCode] = useState<string>('');

    const [history, setHistory] = useState<FrameSnapshotMeta[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string>('current');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        const cleanCode = (baseDocument.replace('{code}', generatedCode) || '').replaceAll("```html", '').replace('```', '').replace('html', '');
        setFinalCode(cleanCode);
    }, [generatedCode]);
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

    return (
        <div className="p-2 shadow rounded-xl w-full flex items-center justify-between">
            <div className="flex gap-2">
                <Button variant={'ghost'} className={`${selectedScreenSize === 'web' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('web')}><Monitor /></Button>
                <Button variant={'ghost'} className={`${selectedScreenSize === 'mobile' ? 'border-primary' : ''}`} onClick={() => onScreenSizeChange('mobile')}><TabletSmartphone /></Button>
            </div>
            <div className="flex gap-2">
                {(history?.length ?? 0) > 0 && (

                    <Select value={selectedVersion} onValueChange={handleVersionChange}>
                        <SelectTrigger className="w-[200px]">
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

                <Button variant={'outline'} onClick={() => ViewInNewTab()}>View<SquareArrowOutUpRight /></Button>
                <Button onClick={() => handleDownload()} ><Download />Download</Button>
                <ViewCodeBlock code={finalCode} >
                    <Button><Code />Code</Button>
                </ViewCodeBlock>
            </div>
        </div>
    )
}