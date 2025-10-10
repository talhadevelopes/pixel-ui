import { Button } from "@workspace/ui/components/button";
import { BookAIcon, Loader2, Save } from "lucide-react";

type PlaygroundHeaderProps = {
    projectId?: string;
    frameId?: string | null;
    messageCount?: number;
    onSave?: () => void;
    isSaving?: boolean;
};

export function PlaygroundHeader({ projectId, frameId, messageCount = 0, onSave, isSaving = false }: PlaygroundHeaderProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/60 px-6 py-5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookAIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">Playground</p>
                        <h1 className="text-lg font-semibold text-foreground">Project {projectId ?? "—"}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!onSave || isSaving}
                        onClick={onSave}
                        className="gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save preview
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                <span className="rounded-full border border-border/70 px-3 py-1">
                    Frame&nbsp;
                    <span className="font-medium text-foreground">{frameId ?? "Not selected"}</span>
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1">
                    Messages&nbsp;
                    <span className="font-medium text-foreground">{messageCount}</span>
                </span>
                <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    Changes are saved when you generate new designs
                </span>
            </div>
        </div>
    );
}