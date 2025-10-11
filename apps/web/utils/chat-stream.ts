export type StreamParseResult = {
    raw: string;
    code?: string;
};

export type ChatStreamOptions = {
    onPartialCode?: (code: string) => void;
};

export async function parseChatCompletionStream(response: Response, options?: ChatStreamOptions) {
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Streaming reader unavailable");
    }

    const decoder = new TextDecoder();
    let raw = "";
    let codeBuffer = "";
    let isCode = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        raw += chunk;

        if (!isCode && raw.includes("```html")) {
            isCode = true;
            const index = raw.indexOf("```html") + 7;
            codeBuffer += raw.slice(index);
            options?.onPartialCode?.(stripCodeFences(codeBuffer));
        } else if (isCode) {
            codeBuffer += chunk;
            options?.onPartialCode?.(stripCodeFences(codeBuffer));
        }
    }

    const code = codeBuffer ? stripCodeFences(codeBuffer) : undefined;

    return {
        raw: raw.trim(),
        code,
    } satisfies StreamParseResult;
}

export function stripCodeFences(code: string) {
    return code.replace(/```html/gi, "").replace(/```/g, "").trim();
}
