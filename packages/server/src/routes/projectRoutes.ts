import express from "express";

import { ProjectController } from "../controllers/projectController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, ProjectController.createProject);

export default router;
