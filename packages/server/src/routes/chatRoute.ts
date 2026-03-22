import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { protect } from "../middleware/authMiddleware";
import { creditResetMiddleware } from "../middleware/creditResetMiddleware";

const router = Router();
//reset credits before the chat
router.post("/completions", protect, creditResetMiddleware, ChatController.streamChat);

//chat history for a frame
router.put("/messages", protect, ChatController.updateChatMessage);

export default router;