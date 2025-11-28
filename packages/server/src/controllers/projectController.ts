import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/response.utils";
import { prisma } from "../utils/prisma";
import { createProjectSchema } from "../validation/chatValidation";

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

            // Create or fetch existing project
            const projectRecord = await prisma.project.upsert({
                where: { projectId },
                update: {},
                create: { projectId, createdBy },
            });

            // Create frame (allow duplicates if already exists similar to previous behavior)
            let frameRecord = await prisma.frame.findFirst({ where: { projectId, frameId } });
            if (!frameRecord) {
                frameRecord = await prisma.frame.create({
                    data: { frameId, projectId },
                });
            }

            // Save initial chat message
            await prisma.chat.create({
                data: {
                    chatMessage: messages as unknown as any,
                    createdBy,
                    frameId,
                },
            });

            return sendSuccess(res, {
                project: projectRecord,
                frame: frameRecord,
                creditsRemaining: undefined,
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

            const projects = await prisma.project.findMany({
                where: { createdBy },
                orderBy: { id: "desc" },
                select: {
                    id: true,
                    projectId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

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
                const frames = await prisma.frame.findMany({
                    where: { projectId: project.projectId },
                    select: { frameId: true, designCode: true, createdAt: true },
                }) as FrameRecord[];

                const frameIds = frames.map((frame) => frame.frameId);

                let chatsByFrame: Record<string, ChatRecord[]> = {};

                if (frameIds.length > 0) {
                    const chats = await prisma.chat.findMany({
                        where: { frameId: { in: frameIds } },
                        select: { id: true, chatMessage: true, createdBy: true, createdAt: true, frameId: true },
                    }) as ChatRecord[];

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

            const project = await prisma.project.findFirst({ where: { projectId, createdBy } });

            if (!project) {
                return sendError(res, "Project not found", 404);
            }

            const frames = await prisma.frame.findMany({ where: { projectId }, select: { frameId: true } });

            const frameIds = frames
                .map((frame: any) => frame.frameId)
                .filter((frameId: any): frameId is string => Boolean(frameId));

            if (frameIds.length > 0) {
                await prisma.chat.deleteMany({ where: { frameId: { in: frameIds } } });
            }

            await prisma.frame.deleteMany({ where: { projectId } });

            await prisma.project.deleteMany({ where: { projectId } });

            return sendSuccess(res, null, "Project deleted successfully");
        } catch (error) {
            console.error("Delete project error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
}