import z from "zod";

export const streamRequestSchema = z.object({
  frameId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  generationId: z.string().optional(),
});

export const createProjectSchema = z.object({
    projectId: z.string().min(1, "projectId is required"),
    frameId: z.string().min(1, "frameId is required"),
    messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })).min(1, "messages must contain at least one item"),
});