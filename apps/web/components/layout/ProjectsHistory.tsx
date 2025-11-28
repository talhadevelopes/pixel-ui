"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { deleteProject, fetchProjects } from "@/services/projects.api";
import { useAuthToken } from "@/services/auth.api";
import { ProjectDisplay, ProjectWithRelations } from "@workspace/types";

export function ProjectHistory() {
  const accessToken = useAuthToken();
  const queryClient = useQueryClient();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );

  const { data, isLoading, isError, error } = useQuery<
    ProjectWithRelations[],
    Error
  >({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return fetchProjects(accessToken);
    },
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (projectId) => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      await deleteProject(projectId, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    },
  });

  const projects = useMemo<ProjectDisplay[]>(() => {
    if (!data) {
      return [];
    }

    return data.map((project) => ({
      id: project.id,
      projectId: project.projectId,
      createdAt: project.createdAt,
      frameCount: project.frames.length,
      firstFrameId: project.frames[0]?.frameId ?? null,
    }));
  }, [data]);

  const handleDelete = useCallback(
    async (projectId: string) => {
      if (deletingProjectId) {
        return;
      }

      try {
        setDeletingProjectId(projectId);
        await deleteMutation.mutateAsync(projectId);
      } catch (mutationError) {
        console.error("Failed to delete project", mutationError);
      } finally {
        setDeletingProjectId(null);
      }
    },
    [deleteMutation, deletingProjectId]
  );

  if (!accessToken) {
    return (
      <div className="rounded-md bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
        Please log in to view your projects.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-md bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/10 px-3 py-8 text-center text-sm text-destructive">
        {error?.message ?? "Failed to load projects"}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
        No projects yet. Create your first project to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const relativeDate = project.createdAt
          ? new Date(project.createdAt).toLocaleString()
          : null;

        const href = project.firstFrameId
          ? `/playground/${project.projectId}?frameId=${encodeURIComponent(project.firstFrameId)}`
          : `/playground/${project.projectId}`;

        const isDeleting =
          deletingProjectId === project.projectId && deleteMutation.isPending;

        return (
          <div
            key={project.id}
            className="group flex items-center rounded-md bg-muted/40 px-3 py-3 text-sm transition-colors hover:bg-accent"
          >
            <Link href={href} className="flex flex-1 flex-col gap-1">
              <span className="font-medium">{project.projectId}</span>
              <span className="text-xs text-muted-foreground">
                {relativeDate
                  ? `Created ${relativeDate}`
                  : "Creation date unavailable"}
                {` • ${project.frameCount} frame${project.frameCount === 1 ? "" : "s"}`}
              </span>
            </Link>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void handleDelete(project.projectId);
              }}
              className="ml-3 hidden items-center rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive focus:outline-none focus:ring-1 focus:ring-destructive/50 disabled:opacity-50 group-hover:flex"
              disabled={isDeleting}
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
