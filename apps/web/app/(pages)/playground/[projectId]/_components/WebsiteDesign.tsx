"use client";

import { useEffect, useMemo, useRef } from "react";

interface WebsiteDesignSectionProps {
    generatedCode: string;
}

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
  <div id="root"></div>
</body>
</html>`;

const stripFences = (code: string) =>
    code
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .trim();

const sanitizeScripts = (code: string) =>
    code
        .replace(/<script/gi, "<!-- script")
        .replace(/script>/gi, "script -->");

const stripTrailingMetadata = (code: string) => {
    return code
        .replace(/©\s?\d{4}[^<]*$/i, "")
        .replace(/\/\/\s?Theme Toggle Logic[\s\S]*/i, "")
        .trim();
};

export function WebsiteDesignSection({ generatedCode }: WebsiteDesignSectionProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const preparedCode = useMemo(() => {
        const stripped = stripTrailingMetadata(stripFences(generatedCode));
        return sanitizeScripts(stripped);
    }, [generatedCode]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentDocument;
        if (!doc) return;

        if (!doc.body || doc.body.childElementCount === 0) {
            doc.open();
            doc.write(baseDocument);
            doc.close();
        }

        const root = doc.getElementById("root");
        if (!root) return;

        root.innerHTML = preparedCode || "<div class='p-10 text-center text-muted-foreground'>Generated code will appear here once ready.</div>";
    }, [preparedCode]);

    return (
        <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-muted/20 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</h2>
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-border/70">
                <iframe
                    ref={iframeRef}
                    className="h-full w-full bg-white"
                    sandbox="allow-scripts allow-same-origin"
                    title="Generated website preview"
                />
            </div>
        </div>
    );
}

export default WebsiteDesignSection;