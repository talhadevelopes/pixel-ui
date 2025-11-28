import axios from "axios";
import { FrameIdentifier, FrameDetails, FrameMessage, FrameSnapshotMeta, FrameSnapshot } from "@/types/frames.types";
import { API, BASE_URL } from "./api";

export async function fetchFrameDetails({ frameId, projectId }: FrameIdentifier, accessToken: string) {
    const query = new URLSearchParams({ frameId, projectId }).toString();
    try {
        const res = await axios.get(`${BASE_URL}${API.frames.base}?${query}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        const data = (body?.data ?? null) as FrameDetails | null;
        if (!data) throw new Error("Invalid frame response");
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to load frame";
        throw new Error(message);
    }
}

export async function fetchFrameHistory({ frameId, projectId }: FrameIdentifier, accessToken: string) {
    const query = new URLSearchParams({ frameId, projectId }).toString();
    try {
        const res = await axios.get(`${BASE_URL}${API.frames.base}/history?${query}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        const data = (body?.data ?? []) as FrameSnapshotMeta[];
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to load frame history";
        throw new Error(message);
    }
}

export async function fetchFrameSnapshot(id: number, accessToken: string) {
    try {
        const res = await axios.get(`${BASE_URL}${API.frames.base}/snapshots/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        const data = (body?.data ?? null) as FrameSnapshot | null;
        if (!data) throw new Error("Invalid snapshot response");
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to load snapshot";
        throw new Error(message);
    }
}

export type UpdateFrameDesignPayload = FrameIdentifier & {
    designCode: string;
};

export async function updateFrameDesign({ frameId, projectId, designCode }: UpdateFrameDesignPayload, accessToken: string) {
    const query = new URLSearchParams({ frameId, projectId }).toString();
    try {
        const res = await axios.put(`${BASE_URL}${API.frames.base}?${query}`, { designCode }, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        return body?.data ?? null;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to save frame";
        throw new Error(message);
    }
}

export type SaveFrameMessagesPayload = {
    frameId: string;
    messages: FrameMessage[];
};

export async function saveFrameMessages({ frameId, messages }: SaveFrameMessagesPayload, accessToken: string) {
    try {
        const res = await axios.put(`${BASE_URL}${API.chat.messages}?frameId=${frameId}`, { chatMessage: messages }, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        return body?.data ?? null;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to save messages";
        throw new Error(message);
    }
}

