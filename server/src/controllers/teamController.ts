import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

export const getTeams = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const orgs = await prisma.org.findMany({
    include: {
      members: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      events: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      sponsors: {
        select: {
          id: true,
          name: true,
          tier: true,
          stage: true,
        },
      },
    },
  });

  res.json(orgs);
});
