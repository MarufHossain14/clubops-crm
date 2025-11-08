import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";

export const search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;

  // Validate query parameter
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    throw new ApiError(400, "Query parameter is required and must be at least 3 characters");
  }

  const searchTerm = query.trim();

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
});
