// routes/chatRoute.ts
import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { protect } from "../middleware/auth";
import { creditResetMiddleware } from "../middleware/creditReset";

const router = Router();

// ✅ UPDATED: Added creditResetMiddleware to reset credits before chat
router.post("/completions", protect, creditResetMiddleware, ChatController.streamChat);

// PUT /api/v1/chat/messages - Persist chat history for a frame
router.put("/messages", protect, ChatController.updateChatMessage);

export default router;