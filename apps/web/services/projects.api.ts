import { API, BASE_URL } from "./api";

export type ProjectChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

export type CreateProjectPayload = {
    projectId: string;
    frameId: string;
    messages: ProjectChatMessage[];
};

export type ProjectCreationResult = {
    id?: string;
    projectId?: string;
    frameId?: string;
};

export type ProjectChatRecord = {
    id: number;
    chatMessage: unknown;
    createdBy: string;
    createdAt: string | null;
    frameId: string | null;
};

export type ProjectFrameRecord = {
    frameId: string;
    designCode: string | null;
    createdAt: string | null;
    chats: ProjectChatRecord[];
};

export type ProjectWithRelations = {
    id: number;
    projectId: string;
    createdAt: string | null;
    updatedAt: string | null;
    frames: ProjectFrameRecord[];
};

export async function createProject(payload: CreateProjectPayload, accessToken: string) {
    const response = await fetch(`${BASE_URL}${API.projects.create}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to create project";
        throw new Error(message);
    }

    const data = (body?.data ?? null) as ProjectCreationResult | null;

    return data;
}

export async function fetchProjects(accessToken: string) {
    const response = await fetch(`${BASE_URL}${API.projects.list}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to fetch projects";
        throw new Error(message);
    }

    const data = (body?.data ?? []) as ProjectWithRelations[];

    return data;
}

export async function deleteProject(projectId: string, accessToken: string) {
    const response = await fetch(`${BASE_URL}${API.projects.list}/${encodeURIComponent(projectId)}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.message ?? "Failed to delete project";
        throw new Error(message);
    }
}
