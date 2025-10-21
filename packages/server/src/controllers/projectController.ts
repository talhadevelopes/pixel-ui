import { NextFunction, Response } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import z from "zod";

import { AuthRequest } from "../middleware/auth";
import { chatTable, frameTable, projectTable, userTable } from "../db/schema";
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
            const userId = req.user?.userId;

            if (!createdBy || !userId) {
                return sendError(res, "Authenticated user email missing", 401);
            }

            // ✅ NEW: Check credits before creating project
            const [user] = await db
                .select()
                .from(userTable)
                .where(eq(userTable.id, userId))
                .limit(1);

            if (!user) {
                return sendError(res, "User not found", 404);
            }

            if (user.credits <= 0) {
                return sendError(
                    res,
                    "Insufficient credits. Please upgrade your plan or wait for daily reset.",
                    403
                );
            }

            // Create project (existing code)
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

            // ✅ NEW: Deduct 1 credit after successful creation
            await db
                .update(userTable)
                .set({
                    credits: user.credits - 1,
                })
                .where(eq(userTable.id, userId));

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
                creditsRemaining: user.credits - 1,
            }, "Project created successfully", 201);
        } catch (error) {
            console.error("Create project error:", error);
            return sendError(res, "Server Error", 500);
        }
    }

    static async getProjects(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const createdBy = req.user?.email;

            if (!createdBy) {
                return sendError(res, "Authenticated user email missing", 401);
            }

            const projects = await db
                .select({
                    id: projectTable.id,
                    projectId: projectTable.projectId,
                    createdAt: projectTable.createdAt,
                    updatedAt: projectTable.updatedAt,
                })
                .from(projectTable)
                .where(eq(projectTable.createdBy, createdBy))
                .orderBy(desc(projectTable.id));

            type FrameRecord = {
                frameId: string;
                designCode: string | null;
                createdAt: Date | null;
            };

            type ChatRecord = {
                id: number;
                chatMessage: unknown;
                createdBy: string;
                createdAt: Date | null;
                frameId: string | null;
            };

            const results: {
                id: number;
                projectId: string;
                createdAt: Date | null;
                updatedAt: Date | null;
                frames: {
                    frameId: string;
                    designCode: string | null;
                    createdAt: Date | null;
                    chats: ChatRecord[];
                }[];
            }[] = [];

            for (const project of projects) {
                const frames = await db
                    .select({
                        frameId: frameTable.frameId,
                        designCode: frameTable.designCode,
                        createdAt: frameTable.createdAt,
                    })
                    .from(frameTable)
                    .where(eq(frameTable.projectId, project.projectId)) as FrameRecord[];

                const frameIds = frames.map((frame) => frame.frameId);

                let chatsByFrame: Record<string, ChatRecord[]> = {};

                if (frameIds.length > 0) {
                    const chats = await db
                        .select({
                            id: chatTable.id,
                            chatMessage: chatTable.chatMessage,
                            createdBy: chatTable.createdBy,
                            createdAt: chatTable.createdAt,
                            frameId: chatTable.frameId,
                        })
                        .from(chatTable)
                        .where(inArray(chatTable.frameId, frameIds)) as ChatRecord[];

                    chatsByFrame = chats.reduce<Record<string, ChatRecord[]>>((acc, chat) => {
                        if (!chat.frameId) {
                            return acc;
                        }

                        if (!acc[chat.frameId]) {
                            acc[chat.frameId] = [];
                        }

                        acc[chat.frameId].push(chat);
                        return acc;
                    }, {});
                }

                results.push({
                    id: project.id,
                    projectId: project.projectId,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                    frames: frames.map((frame) => ({
                        frameId: frame.frameId,
                        designCode: frame.designCode,
                        createdAt: frame.createdAt,
                        chats: chatsByFrame[frame.frameId] ?? [],
                    })),
                });
            }

            return sendSuccess(res, results, "Projects fetched successfully");
        } catch (error) {
            console.error("Get projects error:", error);
            return sendError(res, "Server Error", 500);
        }
    }

    static async deleteProject(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const createdBy = req.user?.email;
            const { projectId } = req.params;

            if (!createdBy) {
                return sendError(res, "Authenticated user email missing", 401);
            }

            if (!projectId) {
                return sendError(res, "projectId is required", 400);
            }

            const project = await db
                .select()
                .from(projectTable)
                .where(and(
                    eq(projectTable.projectId, projectId),
                    eq(projectTable.createdBy, createdBy),
                ))
                .limit(1)
                .then((rows : any) => rows[0] ?? null);

            if (!project) {
                return sendError(res, "Project not found", 404);
            }

            const frames = await db
                .select({ frameId: frameTable.frameId })
                .from(frameTable)
                .where(eq(frameTable.projectId, projectId));

            const frameIds = frames
                .map((frame: any) => frame.frameId)
                .filter((frameId : any): frameId is string => Boolean(frameId));

            if (frameIds.length > 0) {
                await db
                    .delete(chatTable)
                    .where(inArray(chatTable.frameId, frameIds));
            }

            await db
                .delete(frameTable)
                .where(eq(frameTable.projectId, projectId));

            await db
                .delete(projectTable)
                .where(eq(projectTable.projectId, projectId));

            return sendSuccess(res, null, "Project deleted successfully");
        } catch (error) {
            console.error("Delete project error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
}