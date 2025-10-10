// controllers/chatController.ts
import axios from "axios";
import { Response, NextFunction } from "express";
import { TextEncoder } from "util";
import z from "zod";

import { AuthRequest } from "../middleware/auth";
import { chatTable } from "../db/schema";
import { db } from "../utils/drizzle";
import { sendError, sendSuccess } from "../types/response";
import { eq } from "drizzle-orm";

const streamRequestSchema = z.object({
  frameId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export class ChatController {
  static async streamChat(req: AuthRequest, res: Response, _next: NextFunction) {
    try {
      const { frameId, messages } = streamRequestSchema.parse(req.body);
      const createdBy = req.user?.email;

      if (!createdBy) {
        return sendError(res, "Authenticated user email missing", 401);
      }

      if (!frameId || !messages || messages.length === 0) {
        return sendError(res, "Missing frameId or messages", 400);
      }

      // Set response headers for streaming
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      try {
        // Make the streaming request to OpenRouter
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "google/gemini-2.5-flash-preview-09-2025",
            messages,
            stream: true,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "My Node.js App",
            },
            responseType: "stream",
          }
        );

        const encoder = new TextEncoder();
        let fullResponse = "";

        // Handle the streaming response
        response.data.on("data", (chunk: Buffer) => {
          const lines = chunk.toString().split("\n");

          for (const line of lines) {
            if (line.includes("[DONE]")) {
              return;
            }

            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.replace("data:", ""));
                const text = data.choices[0]?.delta?.content;

                if (text) {
                  fullResponse += text;
                  res.write(encoder.encode(text));
                }
              } catch (err) {
                console.error("Error parsing stream", err);
              }
            }
          }
        });

        response.data.on("end", async () => {
          try {
            const trimmed = fullResponse.trim();
            if (trimmed.length === 0) {
              return;
            }

            // Save chat message to database
            await db.insert(chatTable).values({
              frameId,
              createdBy,
              chatMessage: [
                {
                  role: "assistant",
                  content: trimmed,
                },
              ],
            });
          } catch (dbErr) {
            console.error("Error saving chat message:", dbErr);
          }
          res.end();
        });

        response.data.on("error", (err: Error) => {
          console.error("Stream error", err);
          res.status(500).end();
        });
      } catch (apiError) {
        console.error("API request error:", apiError);
        return sendError(res, "Failed to connect to AI service", 500);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, "Invalid request data", 400);
      }
      console.error("Chat stream error:", error);
      return sendError(res, "Server Error", 500);
    }
  }

  //create a put requst to update chat column in the database
  static async updateChatMessage(req: AuthRequest, res: Response, _next: NextFunction) {
    try {
      const { frameId } = req.query;
      const { chatMessage } = req.body;
      if (typeof frameId !== "string") {
        return sendError(res, "Missing frameId", 400);
      }
      await db.update(chatTable)
        .set({ chatMessage })
        .where(eq(chatTable.frameId, frameId));
      return sendSuccess(res, { chatMessage }, "Chat message updated successfully", 200);
    } catch (error) {
      console.error("Update chat message error:", error);
      return sendError(res, "Server Error", 500);
    }
  }
}