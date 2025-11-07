import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const search = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;

  // Validate query parameter
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    res.status(400).json({
      message: "Query parameter is required and must be at least 3 characters",
      volunteerTasks: [],
      events: [],
      members: []
    });
    return;
  }

  const searchTerm = query as string;

  try {
    // Case-insensitive search for volunteer tasks
    const volunteerTasks = await prisma.volunteerTask.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      include: {
        assignee: true,
        event: true,
        notes: true,
        attachments: true,
      },
    });

    // Case-insensitive search for events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { location: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        org: true,
        rsvps: true,
      },
    });

    // Case-insensitive search for members
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        org: true,
      },
    });

    res.json({ volunteerTasks, events, members });
  } catch (error: any) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({
        message: `Error performing search: ${error.message}`,
        volunteerTasks: [],
        events: [],
        members: []
      });
  }
};
