import { Router } from "express";
import {
  analyzeEventRisks,
  generateEmail,
  getAllEventsWithRisks,
} from "../controllers/aiController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
// Event risk analysis
router.get("/events/:eventId/risks", requireAuthMiddleware, analyzeEventRisks);
router.get("/events/risks", requireAuthMiddleware, getAllEventsWithRisks);

// Email generation
router.post("/email/generate", requireAuthMiddleware, generateEmail);

export default router;
