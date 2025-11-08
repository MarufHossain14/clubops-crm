import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";
import { validateRequired, validateEmail, sanitizeString } from "../middleware/validator";

export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const members = await prisma.member.findMany({
    include: {
      org: true,
    },
  });
  res.json(members);
});

export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { memberId } = req.params;

  // Validate memberId
  const memberIdNum = Number(memberId);
  if (isNaN(memberIdNum) || memberIdNum <= 0) {
    throw new ApiError(400, 'Invalid memberId');
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberIdNum,
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

  if (!member) {
    throw new ApiError(404, 'Member not found');
  }

  res.json(member);
});

export const postUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    email,
    role,
    tags = [],
    orgId,
    lastSeenAt,
  } = req.body;

  // Validate required fields
  validateRequired(['fullName', 'email', 'role', 'orgId'], req.body);

  // Validate email format
  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  // Validate orgId
  const orgIdNum = Number(orgId);
  if (isNaN(orgIdNum) || orgIdNum <= 0) {
    throw new ApiError(400, 'Invalid orgId');
  }

  // Sanitize inputs
  const sanitizedFullName = sanitizeString(fullName);
  const sanitizedRole = sanitizeString(role);

  // Validate tags if provided
  if (tags && !Array.isArray(tags)) {
    throw new ApiError(400, 'Tags must be an array');
  }

  const newMember = await prisma.member.create({
    data: {
      fullName: sanitizedFullName,
      email: email.toLowerCase().trim(),
      role: sanitizedRole,
      tags: tags || [],
      orgId: orgIdNum,
      lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : null,
    },
    include: {
      org: true,
    },
  });

  res.status(201).json({ message: "Member Created Successfully", newMember });
});
