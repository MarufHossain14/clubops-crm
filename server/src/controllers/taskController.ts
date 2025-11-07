import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        notes: true,
        attachments: true,
      },
    });
    res.json(tasks);
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
