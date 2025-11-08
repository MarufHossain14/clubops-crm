import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRSVPs = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.query;

  try {
    const where = eventId ? { eventId: Number(eventId) } : {};

    // Use dynamic access like in seed file - Prisma model name is "RSVP"
    const rsvpModel = (prisma as any)["RSVP"];
    const rsvps = await rsvpModel.findMany({
      where,
      include: {
        event: true,
        member: true,
      },
    });

    const transformedRSVPs = rsvps.map((rsvp: any) => ({
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
  } catch (error: any) {
    console.error("Error retrieving RSVPs:", error);
    res.status(500).json({ message: `Error retrieving RSVPs: ${error.message}` });
  }
};

export const getAllRSVPs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Use dynamic access like in seed file - Prisma model name is "RSVP"
    const rsvpModel = (prisma as any)["RSVP"];
    const rsvps = await rsvpModel.findMany({
      include: {
        event: true,
        member: true,
      },
    });

    const transformedRSVPs = rsvps.map((rsvp: any) => ({
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
  } catch (error: any) {
    console.error("Error retrieving all RSVPs:", error);
    res.status(500).json({ message: `Error retrieving RSVPs: ${error.message}` });
  }
};

