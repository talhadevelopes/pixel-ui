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
        try {
            const body = await response.clone().json();
            message = body?.message ?? message;
        } catch {
            // ignore JSON parse errors for streamed responses
        }
        throw new Error(message);
    }

    return response;
}

