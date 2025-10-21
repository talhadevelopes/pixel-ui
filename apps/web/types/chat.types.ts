export type ChatCompletionMessage = {
    role: string;
    content: string;
};

export type CreateChatCompletionPayload = {
    accessToken: string;
    frameId: string;
    messages: ChatCompletionMessage[];
};