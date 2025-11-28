import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/response.utils";
import { prisma } from "../utils/prisma";

export class FrameController {
    static async getFrameDetails(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const { projectId, frameId } = req.query;
            if (typeof projectId !== "string" || typeof frameId !== "string") {
                return sendError(res, "Missing projectId or frameId", 400);
            }

            const frame = await prisma.frame.findFirst({ where: { projectId, frameId } });

            if (!frame) {
                return sendError(res, "Frame not found", 404);
            }

            const chat = await prisma.chat.findFirst({ where: { frameId }, orderBy: { id: "asc" } });

            const chatMessages = chat?.chatMessage ?? [];

            const response = {
                ...frame,
                chatMessages,
            };

            return sendSuccess(res, response, "Success", 200);
        } catch (error) {
            console.error("Create project error:", error);
            return sendError(res, "Server Error", 500);
        }
    }

    static async updateFrameDetails(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const { projectId, frameId } = req.query;
            const { designCode, label: labelBody } = req.body as { designCode?: string; label?: string };
            if (typeof projectId !== "string" || typeof frameId !== "string") {
                return sendError(res, "Missing projectId or frameId", 400);
            }
            await prisma.frame.updateMany({ where: { projectId, frameId }, data: { designCode } });
            let label: string | null = labelBody ? String(labelBody).trim().slice(0, 120) : null;
            if (!label) {
                try {
                    const latestChat = await prisma.chat.findFirst({
                        where: { frameId },
                        orderBy: { id: "desc" },
                        select: { id: true, chatMessage: true },
                    });
                    const chatArray = (latestChat?.chatMessage ?? []) as Array<{ role?: string; content?: string }>;
                    for (let i = chatArray.length - 1; i >= 0; i--) {
                        const m = chatArray[i];
                        if (m?.role === "user" && typeof m?.content === "string" && m.content.trim().length > 0) {
                            label = m.content.trim().slice(0, 120);
                            break;
                        }
                    }
                } catch (_) {
                }
            }
            try {
                await prisma.frameHistory.create({
                    data: {
                        projectId,
                        frameId,
                        designCode: String(designCode ?? ""),
                        label: label ?? null,
                    },
                });
            } catch (err) {
                console.error("Failed to insert frame history snapshot:", err);
            }
            return sendSuccess(res, { designCode }, "Frame updated successfully", 200);
        } catch (error) {
            console.error("Update frame error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
    static async getFrameHistory(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const { projectId, frameId } = req.query;
            if (typeof projectId !== "string" || typeof frameId !== "string") {
                return sendError(res, "Missing projectId or frameId", 400);
            }

            const rows = await prisma.frameHistory.findMany({
                where: { projectId, frameId },
                select: { id: true, label: true, createdAt: true },
                orderBy: { id: "desc" },
            });

            return sendSuccess(res, rows, "Success", 200);
        } catch (error) {
            console.error("Get frame history error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
    static async getSnapshotById(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const rawId = req.params?.id;
            const id = Number(rawId);
            if (!Number.isInteger(id)) {
                return sendError(res, "Invalid snapshot id", 400);
            }

            const snapshot = await prisma.frameHistory.findUnique({ where: { id } });

            if (!snapshot) {
                return sendError(res, "Snapshot not found", 404);
            }

            return sendSuccess(res, snapshot, "Success", 200);
        } catch (error) {
            console.error("Get snapshot error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
}