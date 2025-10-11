import express from "express";

import { ProjectController } from "../controllers/projectController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, ProjectController.createProject);
router.get("/", protect, ProjectController.getProjects);
router.delete("/:projectId", protect, ProjectController.deleteProject);

export default router;
