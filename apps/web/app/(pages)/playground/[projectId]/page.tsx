"use client";

import { useSearchParams } from "next/navigation";

export default function PlaygroundPage({ params }: { params: { projectId: string } }) {
    const searchParams = useSearchParams();
    const frameId = searchParams.get("frameId");

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Playground</h1>
            <div className="space-y-1 text-sm text-muted-foreground">
                <p>Project ID: <span className="font-medium text-foreground">{params.projectId}</span></p>
                {frameId ? (
                    <p>Frame ID: <span className="font-medium text-foreground">{frameId}</span></p>
                ) : (
                    <p>No frame selected.</p>
                )}
            </div>
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                Playground content goes here.
            </div>
        </div>
    );
}
