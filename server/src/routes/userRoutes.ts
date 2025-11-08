import { Router } from "express";

import { getUser, getUsers, postUser } from "../controllers/userController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/", requireAuthMiddleware, getUsers);
router.post("/", requireAuthMiddleware, postUser);
router.get("/:memberId", requireAuthMiddleware, getUser);

export default router;
