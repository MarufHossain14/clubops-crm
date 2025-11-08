import { Router } from "express";
import { getAllRSVPs, getRSVPs } from "../controllers/rsvpController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/all", requireAuthMiddleware, getAllRSVPs); // Get all RSVPs
router.get("/", requireAuthMiddleware, getRSVPs); // Get RSVPs by eventId (optional query param)

export default router;

