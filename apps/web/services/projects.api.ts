import { CreateProjectPayload, ProjectCreationResult, ProjectWithRelations } from "@/types/projects.types";
import { API, BASE_URL } from "./api";

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
