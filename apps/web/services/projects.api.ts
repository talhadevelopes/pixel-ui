import axios from "axios";
import { CreateProjectPayload, ProjectCreationResult, ProjectWithRelations } from "@/types/projects.types";
import { API, BASE_URL } from "./api";

export async function createProject(payload: CreateProjectPayload, accessToken: string) {
    try {
        const res = await axios.post(`${BASE_URL}${API.projects.create}`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const body = res?.data ?? null;
        const data = (body?.data ?? null) as ProjectCreationResult | null;
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to create project";
        throw new Error(message);
    }
}

export async function fetchProjects(accessToken: string) {
    try {
        const res = await axios.get(`${BASE_URL}${API.projects.list}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = res?.data ?? null;
        const data = (body?.data ?? []) as ProjectWithRelations[];
        return data;
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to fetch projects";
        throw new Error(message);
    }
}

export async function deleteProject(projectId: string, accessToken: string) {
    try {
        await axios.delete(`${BASE_URL}${API.projects.list}/${encodeURIComponent(projectId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "Failed to delete project";
        throw new Error(message);
    }
}
