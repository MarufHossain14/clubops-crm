import { Router } from "express";
import { getAllSponsors, getSponsors } from "../controllers/sponsorController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/all", requireAuthMiddleware, getAllSponsors); // Get all sponsors
router.get("/", requireAuthMiddleware, getSponsors); // Get sponsors by orgId (optional query param)

export default router;

