import { Router } from "express";

import { getTeams } from "../controllers/teamController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/", requireAuthMiddleware, getTeams);

export default router;
