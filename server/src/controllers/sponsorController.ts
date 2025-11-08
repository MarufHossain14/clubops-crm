import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";

export const getSponsors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orgId } = req.query;

  const where: { orgId?: number } = {};

  // Validate orgId if provided
  if (orgId) {
    const orgIdNum = Number(orgId);
    if (isNaN(orgIdNum) || orgIdNum <= 0) {
      throw new ApiError(400, 'Invalid orgId');
    }
    where.orgId = orgIdNum;
  }

  const sponsors = await prisma.sponsor.findMany({
    where,
    include: {
      org: true,
    },
  });

  const transformedSponsors = sponsors.map((sponsor) => ({
    id: sponsor.id,
    orgId: sponsor.orgId,
    name: sponsor.name,
    contactEmail: sponsor.contactEmail || undefined,
    tier: sponsor.tier || undefined,
    stage: sponsor.stage,
    pledged: sponsor.pledged ? sponsor.pledged.toNumber() : undefined,
    received: sponsor.received ? sponsor.received.toNumber() : undefined,
    org: sponsor.org,
  }));

  res.json(transformedSponsors);
});

export const getAllSponsors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sponsors = await prisma.sponsor.findMany({
    include: {
      org: true,
    },
  });

  const transformedSponsors = sponsors.map((sponsor) => ({
    id: sponsor.id,
    orgId: sponsor.orgId,
    name: sponsor.name,
    contactEmail: sponsor.contactEmail || undefined,
    tier: sponsor.tier || undefined,
    stage: sponsor.stage,
    pledged: sponsor.pledged ? sponsor.pledged.toNumber() : undefined,
    received: sponsor.received ? sponsor.received.toNumber() : undefined,
    org: sponsor.org,
  }));

  res.json(transformedSponsors);
});

