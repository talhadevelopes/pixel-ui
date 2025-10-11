import { API, BASE_URL } from "./api";

export type FrameMessage = {
    role: string;
    content: string;
};

export type FrameDetails = {
    frameId: string;
    projectId: string;
    designCode: string | null;
    chatMessages: FrameMessage[] | null;
};

export type FrameIdentifier = {
    frameId: string;
    projectId: string;
};

export async function fetchFrameDetails({ frameId, projectId }: FrameIdentifier, accessToken: string) {
    const query = new URLSearchParams({ frameId, projectId }).toString();
    const response = await fetch(`${BASE_URL}${API.frames.base}?${query}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to load frame";
        throw new Error(message);
    }

    const data = (body?.data ?? null) as FrameDetails | null;

    if (!data) {
        throw new Error("Invalid frame response");
    }

    return data;
}

export type UpdateFrameDesignPayload = FrameIdentifier & {
    designCode: string;
};

export async function updateFrameDesign({ frameId, projectId, designCode }: UpdateFrameDesignPayload, accessToken: string) {
    const query = new URLSearchParams({ frameId, projectId }).toString();
    const response = await fetch(`${BASE_URL}${API.frames.base}?${query}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ designCode }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to save frame";
        throw new Error(message);
    }

    return body?.data ?? null;
}

export type SaveFrameMessagesPayload = {
    frameId: string;
    messages: FrameMessage[];
};

export async function saveFrameMessages({ frameId, messages }: SaveFrameMessagesPayload, accessToken: string) {
    const response = await fetch(`${BASE_URL}${API.chat.messages}?frameId=${frameId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ chatMessage: messages }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to save messages";
        throw new Error(message);
    }

    return body?.data ?? null;
}

