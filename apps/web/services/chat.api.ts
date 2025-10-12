import { API, BASE_URL } from "./api";

export type ChatCompletionMessage = {
    role: string;
    content: string;
};

export type CreateChatCompletionPayload = {
    accessToken: string;
    frameId: string;
    messages: ChatCompletionMessage[];
};

export async function createChatCompletion({ accessToken, frameId, messages }: CreateChatCompletionPayload): Promise<Response> {
    const response = await fetch(`${BASE_URL}${API.chat.completions}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ frameId, messages }),
    });

    if (!response.ok) {
        let message = "Failed to fetch AI response";
        const body = await response.clone().json().catch(() => null);

        if (body?.message) {
            message = body.message;
        }

        const error = new Error(message) as Error & {
            status?: number;
            data?: unknown;
        };
        error.status = response.status;
        error.data = body?.data ?? null;

        throw error;
    }

    return response;
}

