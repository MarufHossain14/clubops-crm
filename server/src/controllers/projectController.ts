import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        org: true,
        rsvps: true,
        volunteerTasks: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Transform events to match frontend Project interface
    const projects = events.map((event) => ({
      id: event.id,
      title: event.title,
      name: event.title, // Some components use 'name' instead of 'title'
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      location: event.location || undefined,
      status: event.status,
      capacity: event.capacity || undefined,
      orgId: event.orgId,
      org: event.org,
      rsvps: event.rsvps,
      volunteerTasks: event.volunteerTasks,
    }));

    res.json(projects);
  } catch (error: any) {
    console.error("Error retrieving events:", error);
    res
      .status(500)
      .json({ message: `Error retrieving events: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, startsAt, endsAt, location, status, capacity, orgId } = req.body;
  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        location: location || null,
        status,
        capacity: capacity || null,
        orgId,
      },
      include: {
        org: true,
      },
    });
    res.status(201).json(newEvent);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating an event: ${error.message}` });
  }
};
