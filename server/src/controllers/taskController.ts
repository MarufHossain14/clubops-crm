import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";
import { validateRequired, sanitizeString } from "../middleware/validator";

// Helper function to transform task
const transformTask = (task: any) => ({
  id: task.id,
  title: task.title,
  status: task.status,
  priority: task.priority || undefined,
  dueAt: task.dueAt ? task.dueAt.toISOString() : undefined,
  eventId: task.eventId,
  orgId: task.orgId,
  assigneeMemberId: task.assigneeMemberId || undefined,
  assignee: task.assignee ? {
    userId: task.assignee.id,
    username: task.assignee.fullName,
    email: task.assignee.email,
    profilePictureUrl: undefined,
  } : undefined,
  event: task.event,
  notes: (task.notes || []).map((note: any) => ({
    id: note.id,
    authorMemberId: note.authorMemberId,
    volunteerTaskId: note.volunteerTaskId || undefined,
    content: note.content,
    createdAt: note.createdAt ? note.createdAt.toISOString() : undefined,
    author: note.author ? {
      id: note.author.id,
      fullName: note.author.fullName,
      email: note.author.email,
    } : undefined,
  })),
  attachments: (task.attachments || []).map((attachment: any) => ({
    id: attachment.id,
    volunteerTaskId: attachment.volunteerTaskId || undefined,
    uploadedByMemberId: attachment.uploadedByMemberId || undefined,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    uploadedAt: attachment.uploadedAt ? attachment.uploadedAt.toISOString() : undefined,
    uploadedBy: attachment.uploadedBy ? {
      id: attachment.uploadedBy.id,
      fullName: attachment.uploadedBy.fullName,
      email: attachment.uploadedBy.email,
    } : undefined,
  })),
  description: undefined,
  tags: undefined,
  points: undefined,
  comments: (task.notes || []).map((note: any) => ({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt ? note.createdAt.toISOString() : undefined,
  })),
  author: undefined,
  startDate: undefined,
  dueDate: task.dueAt ? task.dueAt.toISOString() : undefined,
});

export const getAllTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tasks = await prisma.volunteerTask.findMany({
    include: {
      assignee: true,
      event: true,
      notes: {
        include: {
          author: true,
        },
      },
      attachments: {
        include: {
          uploadedBy: true,
        },
      },
    },
  });

  const transformedTasks = tasks.map(transformTask);
  res.json(transformedTasks);
});

export const getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.query;

  // Validate eventId
  if (!eventId) {
    throw new ApiError(400, "eventId is required");
  }

  const eventIdNum = Number(eventId);
  if (isNaN(eventIdNum) || eventIdNum <= 0) {
    throw new ApiError(400, "eventId must be a valid positive number");
  }

  const tasks = await prisma.volunteerTask.findMany({
    where: {
      eventId: eventIdNum,
    },
    include: {
      assignee: true,
      event: true,
      notes: {
        include: {
          author: true,
        },
      },
      attachments: {
        include: {
          uploadedBy: true,
        },
      },
    },
  });

  const transformedTasks = tasks.map(transformTask);
  res.json(transformedTasks);
});

export const createTask = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    status,
    priority,
    dueAt,
    eventId,
    orgId,
    assigneeMemberId,
  } = req.body;

  // Validate required fields
  validateRequired(['title', 'status', 'eventId', 'orgId'], req.body);

  // Validate and sanitize title
  const sanitizedTitle = sanitizeString(title);

  // Validate dates if provided
  let dueDate: Date | null = null;
  if (dueAt) {
    dueDate = new Date(dueAt);
    if (isNaN(dueDate.getTime())) {
      throw new ApiError(400, 'Invalid due date format');
    }
  }

  // Validate IDs
  const eventIdNum = Number(eventId);
  const orgIdNum = Number(orgId);

  if (isNaN(eventIdNum) || eventIdNum <= 0) {
    throw new ApiError(400, 'Invalid eventId');
  }

  if (isNaN(orgIdNum) || orgIdNum <= 0) {
    throw new ApiError(400, 'Invalid orgId');
  }

  const newTask = await prisma.volunteerTask.create({
    data: {
      title: sanitizedTitle,
      status,
      priority: priority || null,
      dueAt: dueDate,
      eventId: eventIdNum,
      orgId: orgIdNum,
      assigneeMemberId: assigneeMemberId ? Number(assigneeMemberId) : null,
    },
    include: {
      assignee: true,
      event: true,
    },
  });

  res.status(201).json(newTask);
});

export const updateTaskStatus = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  // Validate taskId
  const taskIdNum = Number(taskId);
  if (isNaN(taskIdNum) || taskIdNum <= 0) {
    throw new ApiError(400, 'Invalid taskId');
  }

  // Validate status
  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const updatedTask = await prisma.volunteerTask.update({
    where: {
      id: taskIdNum,
    },
    data: {
      status: status,
    },
    include: {
      assignee: true,
      event: true,
    },
  });

  res.json(updatedTask);
});

export const getUserTasks = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const { memberId } = req.params;

  // Validate memberId
  const memberIdNum = Number(memberId);
  if (isNaN(memberIdNum) || memberIdNum <= 0) {
    throw new ApiError(400, 'Invalid memberId');
  }

  const tasks = await prisma.volunteerTask.findMany({
    where: {
      assigneeMemberId: memberIdNum,
    },
    include: {
      assignee: true,
      event: true,
    },
  });

  res.json(tasks);
});
