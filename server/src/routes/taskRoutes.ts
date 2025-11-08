import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getTasks,
  getUserTasks,
  updateTaskStatus,
} from "../controllers/taskController";
import { requireAuthMiddleware } from "../middleware/auth";

const router = Router();

// Protect all routes - require authentication
router.get("/all", requireAuthMiddleware, getAllTasks); // Get all tasks (for priority filtering)
router.get("/", requireAuthMiddleware, getTasks); // Get tasks by eventId
router.post("/", requireAuthMiddleware, createTask);
router.patch("/:taskId/status", requireAuthMiddleware, updateTaskStatus);
router.get("/member/:memberId", requireAuthMiddleware, getUserTasks);

export default router;
