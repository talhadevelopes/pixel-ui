import { Router } from "express";
import { FrameController } from "../controllers/frameController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, FrameController.getFrameDetails);
router.put("/", protect, FrameController.updateFrameDetails);
router.get("/history", protect, FrameController.getFrameHistory);
router.get("/snapshots/:id", protect, FrameController.getSnapshotById);

export default router;
