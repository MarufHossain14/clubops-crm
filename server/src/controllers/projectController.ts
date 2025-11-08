import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";
import { validateRequired, sanitizeString } from "../middleware/validator";

export const getProjects = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
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
});

export const createProject = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, startsAt, endsAt, location, status, capacity, orgId } = req.body;

  // Validate required fields
  validateRequired(['title', 'startsAt', 'endsAt', 'status', 'orgId'], req.body);

  // Validate dates
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  if (endDate < startDate) {
    throw new ApiError(400, 'End date must be after start date');
  }

  // Validate capacity if provided
  if (capacity !== undefined && (capacity < 0 || !Number.isInteger(capacity))) {
    throw new ApiError(400, 'Capacity must be a positive integer');
  }

  // Sanitize input
  const sanitizedTitle = sanitizeString(title);
  const sanitizedLocation = location ? sanitizeString(location) : null;

  const newEvent = await prisma.event.create({
    data: {
      title: sanitizedTitle,
      startsAt: startDate,
      endsAt: endDate,
      location: sanitizedLocation,
      status,
      capacity: capacity || null,
      orgId: Number(orgId),
    },
    include: {
      org: true,
    },
  });

  res.status(201).json(newEvent);
});
