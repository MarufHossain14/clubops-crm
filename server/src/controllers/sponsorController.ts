import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSponsors = async (req: Request, res: Response): Promise<void> => {
  const { orgId } = req.query;

  try {
    const where = orgId ? { orgId: Number(orgId) } : {};

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
  } catch (error: any) {
    console.error("Error retrieving sponsors:", error);
    res.status(500).json({ message: `Error retrieving sponsors: ${error.message}` });
  }
};

export const getAllSponsors = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error: any) {
    console.error("Error retrieving all sponsors:", error);
    res.status(500).json({ message: `Error retrieving sponsors: ${error.message}` });
  }
};

