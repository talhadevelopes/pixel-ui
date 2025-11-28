import axios from "axios";
import { API, BASE_URL } from "./api";
import { CreateChatCompletionPayload } from "@workspace/types";

export async function createChatCompletion({ accessToken, frameId, messages, generationId }: CreateChatCompletionPayload): Promise<Response> {
    const encoder = new TextEncoder();
    let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controllerRef = controller;
        },
    });

    let lastLen = 0;
    // Fire the request asynchronously and push chunks into the stream
    axios({
        url: `${BASE_URL}${API.chat.completions}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        data: { frameId, messages, generationId },
        responseType: "text",
        onDownloadProgress: (e: any) => {
            try {
                const target = (e?.event?.target || e?.target) as XMLHttpRequest | undefined;
                const text = (target && (target as any).responseText) || "";
                const next = text.slice(lastLen);
                if (next && controllerRef) {
                    controllerRef.enqueue(encoder.encode(next));
                }
                lastLen = text.length;
            } catch (_) {
                // ignore progress errors
            }
        },
    })
        .then(() => {
            if (controllerRef) controllerRef.close();
        })
        .catch((err) => {
            const error = new Error(
                err?.response?.data?.message || err?.message || "Failed to fetch AI response"
            ) as Error & { status?: number; data?: unknown };
            error.status = err?.response?.status;
            error.data = err?.response?.data?.data ?? null;
            if (controllerRef) controllerRef.error(error);
        });

    // Return a Response-like object exposing the stream so existing parsers work
    return { body: stream } as unknown as Response;
}

