// routes/chatRoutes.ts
import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { protect } from "../middleware/auth";

const router = Router();

// POST /api/v1/chat/completions - Stream chat completions
router.post("/completions", protect, ChatController.streamChat);

// PUT /api/v1/chat/messages - Persist chat history for a frame
router.put("/messages", protect, ChatController.updateChatMessage);

export default router;