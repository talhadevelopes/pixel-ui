import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { AuthRequest } from "../middleware/auth";
import { chatTable, frameTable, projectTable } from "../db/schema";
import { db } from "../utils/drizzle";
import { sendError, sendSuccess } from "../types/response";

const createProjectSchema = z.object({
    projectId: z.string().min(1, "projectId is required"),
    frameId: z.string().min(1, "frameId is required"),
    messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })).min(1, "messages must contain at least one item"),
});

export class ProjectController {
    static async createProject(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const parseResult = createProjectSchema.safeParse(req.body);

            if (!parseResult.success) {
                return sendError(res, "Validation Error", 400, parseResult.error.errors);
            }

            const { projectId, frameId, messages } = parseResult.data;

            const createdBy = req.user?.email;

            if (!createdBy) {
                return sendError(res, "Authenticated user email missing", 401);
            }

            const [project] = await db.insert(projectTable)
                .values({
                    projectId,
                    createdBy,
                })
                .onConflictDoNothing({ target: projectTable.projectId })
                .returning();

            const [frame] = await db.insert(frameTable)
                .values({
                    frameId,
                    projectId,
                })
                .onConflictDoNothing()
                .returning();

            const [chat] = await db.insert(chatTable)
                .values({
                    chatMessage: messages,
                    createdBy,
                    frameId: frameId,
                })
                .returning();

            const projectRecord = project ?? (await db.select()
                .from(projectTable)
                .where(eq(projectTable.projectId, projectId))
                .limit(1))[0] ?? null;

            const frameRecord = frame ?? (await db.select()
                .from(frameTable)
                .where(and(
                    eq(frameTable.projectId, projectId),
                    eq(frameTable.frameId, frameId),
                ))
                .limit(1))[0] ?? null;

            return sendSuccess(res, {
                project: projectRecord,
                frame: frameRecord,
                chat,
            }, "Project created successfully", 201);
        } catch (error) {
            console.error("Create project error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
}