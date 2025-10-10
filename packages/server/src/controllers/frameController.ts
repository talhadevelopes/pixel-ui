import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { AuthRequest } from "../middleware/auth";
import { chatTable, frameTable } from "../db/schema";
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

    // we need to update frame record so we are adding a put request
    static async updateFrameDetails(req: AuthRequest, res: Response, _next: NextFunction) {
        try {
            const { projectId, frameId } = req.query;
            const { designCode } = req.body;
            if (typeof projectId !== "string" || typeof frameId !== "string") {
                return sendError(res, "Missing projectId or frameId", 400);
            }
            await db.update(frameTable)
                .set({ designCode })
                .where(and(eq(frameTable.projectId, projectId), eq(frameTable.frameId, frameId)));
            return sendSuccess(res, { designCode }, "Frame updated successfully", 200);
        } catch (error) {
            console.error("Update frame error:", error);
            return sendError(res, "Server Error", 500);
        }
    }
}