import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving organizations: ${error.message}` });
  }
};
