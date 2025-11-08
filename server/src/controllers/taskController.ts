import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("getAllTasks endpoint called");
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

    console.log(`Found ${tasks.length} tasks`);
    const transformedTasks = tasks.map(transformTask);
    res.json(transformedTasks);
  } catch (error: any) {
    console.error("Error retrieving all volunteer tasks:", error);
    res
      .status(500)
      .json({ message: `Error retrieving volunteer tasks: ${error.message}` });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.query;

  // Validate eventId
  if (!eventId) {
    res.status(400).json({ message: "eventId is required" });
    return;
  }

  const eventIdNum = Number(eventId);
  if (isNaN(eventIdNum)) {
    res.status(400).json({ message: "eventId must be a valid number" });
    return;
  }

  try {
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
  } catch (error: any) {
    console.error("Error retrieving volunteer tasks:", error);
    res
      .status(500)
      .json({ message: `Error retrieving volunteer tasks: ${error.message}` });
  }
};

export const createTask = async (
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
  try {
    const newTask = await prisma.volunteerTask.create({
      data: {
        title,
        status,
        priority: priority || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        eventId,
        orgId,
        assigneeMemberId: assigneeMemberId || null,
      },
      include: {
        assignee: true,
        event: true,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a volunteer task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.volunteerTask.update({
      where: {
        id: Number(taskId),
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
  } catch (error: any) {
    res.status(500).json({ message: `Error updating volunteer task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { memberId } = req.params;
  try {
    const tasks = await prisma.volunteerTask.findMany({
      where: {
        assigneeMemberId: Number(memberId),
      },
      include: {
        assignee: true,
        event: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving member's volunteer tasks: ${error.message}` });
  }
};
