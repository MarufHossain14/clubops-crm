import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/", requireAuthMiddleware, getProjects);
router.post("/", requireAuthMiddleware, createProject);

export default router;
