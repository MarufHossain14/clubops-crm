import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";

export const getRSVPs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.query;

  const where = eventId ? { eventId: Number(eventId) } : {};

  // Validate eventId if provided
  if (eventId) {
    const eventIdNum = Number(eventId);
    if (isNaN(eventIdNum) || eventIdNum <= 0) {
      throw new ApiError(400, 'Invalid eventId');
    }
    where.eventId = eventIdNum;
  }

  // Prisma client uses camelCase, so RSVP becomes rSVP
  const rsvps = await (prisma as any).rSVP.findMany({
    where,
    include: {
      event: true,
      member: true,
    },
  });

  const transformedRSVPs = rsvps.map((rsvp) => ({
    id: rsvp.id,
    eventId: rsvp.eventId,
    memberId: rsvp.memberId,
    status: rsvp.status,
    checkedIn: rsvp.checkedIn,
    event: rsvp.event,
    member: {
      id: rsvp.member.id,
      fullName: rsvp.member.fullName,
      email: rsvp.member.email,
      role: rsvp.member.role,
    },
  }));

  res.json(transformedRSVPs);
});

export const getAllRSVPs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Prisma client uses camelCase, so RSVP becomes rSVP
  const rsvps = await (prisma as any).rSVP.findMany({
    include: {
      event: true,
      member: true,
    },
  });

  const transformedRSVPs = rsvps.map((rsvp) => ({
    id: rsvp.id,
    eventId: rsvp.eventId,
    memberId: rsvp.memberId,
    status: rsvp.status,
    checkedIn: rsvp.checkedIn,
    event: rsvp.event,
    member: {
      id: rsvp.member.id,
      fullName: rsvp.member.fullName,
      email: rsvp.member.email,
      role: rsvp.member.role,
    },
  }));

  res.json(transformedRSVPs);
});

