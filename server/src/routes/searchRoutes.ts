import { Router } from "express";
import { search } from "../controllers/searchController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/", requireAuthMiddleware, search);

export default router;
