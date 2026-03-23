import axios from "axios";
import { Response, NextFunction } from "express";
import { TextEncoder } from "util";
import z from "zod";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/response";
import { prisma } from "../utils/prisma";
import { PROMPT_TEMPLATE } from "../utils/prompt-template";
import { streamRequestSchema } from "../validation/chatValidation";

const generationCache: Map<string, number> = new Map();
const GENERATION_CACHE_TTL_MS = 10 * 60 * 1000;

export class ChatController {
  static async streamChat(
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) {
    try {
      const { frameId, messages, generationId } = streamRequestSchema.parse(
        req.body,
      );
      const createdBy = req.user?.email;
      const userId = req.user?.userId;

      console.log("[DEBUG] Starting streamChat");

      if (!createdBy || !userId) {
        return sendError(res, "Authenticated user email missing", 401);
      }

      if (!frameId || !messages || messages.length === 0) {
        return sendError(res, "Missing frameId or messages", 400);
      }

      let user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Bypassing user check for testing if mock user
      if (!user && userId === "test-user-id") {
        user = {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
          password: "",
          credits: 999,
          tier: "pro",
          dailyCreditsLimit: 999,
          lastCreditReset: new Date(),
          subscriptionId: null,
          subscriptionStatus: "active",
          subscriptionEndDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any;
      }

      if (!user) {
        return sendError(res, "User not found", 404);
      }

      if (user.credits <= 0) {
        const lastReset = user.lastCreditReset || new Date();
        const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        return sendError(
          res,
          "Insufficient credits. Please upgrade your plan or wait for daily reset.",
          403,
          undefined,
          {
            nextReset,
            credits: user.credits,
          },
        );
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      try {
        const lastUserMessage = [...messages]
          .reverse()
          .find((m) => m.role === "user");
        if (!lastUserMessage) {
          return sendError(res, "No user message found to generate code", 400);
        }

        const userInput = lastUserMessage.content;
        const formattedPrompt = PROMPT_TEMPLATE.replace(
          "{userInput}",
          userInput,
        );

        console.log(
          "📝 [DEBUG] Formatted prompt:",
          formattedPrompt.substring(0, 200),
        );
        console.log("[DEBUG] User input was:", userInput);
        console.log("[SECURE] Backend formatting prompt for user input");

        let isDuplicate = false;
        const cacheKey =
          generationId && userId ? `${userId}:${generationId}` : undefined;
        if (cacheKey) {
          const ts = generationCache.get(cacheKey);
          const nowMs = Date.now();
          if (ts && nowMs - ts < GENERATION_CACHE_TTL_MS) {
            isDuplicate = true;
          } else {
            generationCache.set(cacheKey, nowMs);
          }
        }

        const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${process.env.AI_API_KEY}`;

        const response = await axios.post(
          modelUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: formattedPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            responseType: "stream",
          },
        );

        console.log("[DEBUG] Gemini API request successful");

        const encoder = new TextEncoder();
        let fullResponse = "";

        response.data.on("data", (chunk: Buffer) => {
          const chunkStr = chunk.toString();
          console.log("[RAW CHUNK]:", chunkStr.substring(0, 100));
          const lines = chunkStr.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.substring(5).trim();

              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                  console.log(
                    "[DEBUG] Got text chunk:",
                    text.substring(0, 50),
                  );
                  fullResponse += text;
                  res.write(encoder.encode(text));
                }
              } catch (parseErr) {
                console.log("[DEBUG] Parse error (skipping):", parseErr);
              }
            }
          }
        });

        response.data.on("end", async () => {
          console.log("[DEBUG] Stream ended");
          console.log("[DEBUG] Full response length:", fullResponse.length);

          try {
            const trimmed = fullResponse.trim();
            if (trimmed.length === 0) {
              console.log(
                "[DEBUG] Empty response - no content was streamed",
              );
              res.end();
              return;
            }

            const substantialHtml =
              /```/.test(trimmed) ||
              /<\s*(section|div|header|main|footer|nav|ul|ol|article|aside|form|img|h1|h2|h3|h4|h5|h6|button|a|span|p|table|figure|canvas|svg)[\s>]/i.test(
                trimmed,
              );
            const meetsLength = trimmed.length >= 200;
            const shouldCharge = !isDuplicate && substantialHtml && meetsLength;

            await prisma.$transaction([
              prisma.chat.create({
                data: {
                  frameId,
                  createdBy,
                  chatMessage: [
                    {
                      role: "assistant",
                      content: trimmed,
                    },
                  ],
                },
              }),
              ...(shouldCharge
                ? [
                    prisma.user.update({
                      where: { id: userId },
                      data: { credits: { decrement: 1 } },
                    }),
                  ]
                : []),
            ]);

            if (shouldCharge) {
              console.log(
                `[DEBUG] Credit deducted. Response saved successfully`,
              );
            } else {
              console.log(
                `[DEBUG] Skipped credit deduction (duplicate or not substantial)`,
              );
            }
          } catch (dbErr) {
            console.error("[DEBUG] Error saving chat message:", dbErr);
          }
          res.end();
        });

        response.data.on("error", (err: Error) => {
          console.error("[DEBUG] Stream error:", err);
          res.status(500).end();
        });
      } catch (apiError: any) {
        if (apiError.response?.data) {
          let errorBody = "";
          for await (const chunk of apiError.response.data) {
            errorBody += chunk.toString();
          }
          console.error("REAL GEMINI ERROR:", errorBody);
        }
        return sendError(res, "Failed to connect to AI service", 500);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, "Invalid request data", 400);
      }
      console.error("[DEBUG] Chat stream error:", error);
      return sendError(res, "Server Error", 500);
    }
  }

  static async updateChatMessage(
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) {
    try {
      const { frameId } = req.query;
      const { chatMessage } = req.body;
      if (typeof frameId !== "string") {
        return sendError(res, "Missing frameId", 400);
      }
      await prisma.chat.updateMany({
        where: { frameId },
        data: { chatMessage },
      });
      return sendSuccess(
        res,
        { chatMessage },
        "Chat message updated successfully",
        200,
      );
    } catch (error) {
      console.error("Update chat message error:", error);
      return sendError(res, "Server Error", 500);
    }
  }
}
