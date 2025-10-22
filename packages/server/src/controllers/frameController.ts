import { NextFunction, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { AuthRequest } from "../middleware/auth";
import { chatTable, frameTable, frameHistoryTable } from "../db/schema";
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

export class FrameController {
    static async getFrameDetails(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const { projectId, frameId } = req.query;
            if (typeof projectId !== "string" || typeof frameId !== "string") {
                return sendError(res, "Missing projectId or frameId", 400);
            }

            const [frame] = await db.select()
                .from(frameTable)
                .where(and(eq(frameTable.projectId, projectId), eq(frameTable.frameId, frameId)))
                .limit(1);

            if (!frame) {
                return sendError(res, "Frame not found", 404);
            }

            const chatResult = await db.select()
                .from(chatTable)
                .where(eq(chatTable.frameId, frameId));

            const chatMessages = chatResult.length > 0 ? chatResult[0]?.chatMessage ?? [] : [];

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
            await db.update(frameTable)
                .set({ designCode })
                .where(and(eq(frameTable.projectId, projectId), eq(frameTable.frameId, frameId)));
            let label: string | null = labelBody ? String(labelBody).trim().slice(0, 120) : null;
            if (!label) {
                try {
                    const latestChat = await db
                        .select({ id: chatTable.id, chatMessage: chatTable.chatMessage })
                        .from(chatTable)
                        .where(eq(chatTable.frameId, frameId))
                        .orderBy(desc(chatTable.id))
                        .limit(1);
                    const chatArray = (latestChat?.[0]?.chatMessage ?? []) as Array<{ role?: string; content?: string }>;
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
                await db.insert(frameHistoryTable).values({
                    projectId,
                    frameId,
                    designCode: String(designCode ?? ""),
                    label: label ?? null,
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

            const rows = await db
                .select({
                    id: frameHistoryTable.id,
                    label: frameHistoryTable.label,
                    createdAt: frameHistoryTable.createdAt,
                })
                .from(frameHistoryTable)
                .where(and(eq(frameHistoryTable.projectId, projectId), eq(frameHistoryTable.frameId, frameId)))
                .orderBy(desc(frameHistoryTable.id));

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

            const rows = await db
                .select()
                .from(frameHistoryTable)
                .where(eq(frameHistoryTable.id, id))
                .limit(1);

            const snapshot = rows?.[0] ?? null;
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