import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, ProjectController.createProject);
router.get("/", protect, ProjectController.getProjects);
router.delete("/:projectId", protect, ProjectController.deleteProject);

export default router;
