import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const members = await prisma.member.findMany({
      include: {
        org: true,
      },
    });
    res.json(members);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving members: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { memberId } = req.params;
  try {
    const member = await prisma.member.findUnique({
      where: {
        id: Number(memberId),
      },
      include: {
        org: true,
        rsvps: {
          include: {
            event: true,
          },
        },
      },
    });

    res.json(member);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving member: ${error.message}` });
  }
};

export const postUser = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      role,
      tags = [],
      orgId,
      lastSeenAt,
    } = req.body;
    const newMember = await prisma.member.create({
      data: {
        fullName,
        email,
        role,
        tags,
        orgId,
        lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : null,
      },
      include: {
        org: true,
      },
    });
    res.json({ message: "Member Created Successfully", newMember });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating member: ${error.message}` });
  }
};
