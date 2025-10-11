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

