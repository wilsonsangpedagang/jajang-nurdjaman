import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export async function createProfile(req: AuthRequest, res: Response): Promise<void> {
  const { name, category, concept, products, goals, latitude, longitude, radiusMeters } = req.body as {
    name: string;
    category: string;
    concept: string;
    products: Array<{ name: string; price: number }>;
    goals: string[];
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };

  const profile = await prisma.businessProfile.create({
    data: {
      userId: req.userId!,
      name,
      category,
      concept,
      products,
      goals,
      latitude,
      longitude,
      radiusMeters,
    },
  });

  res.status(201).json({ profile });
}

export async function getProfiles(req: AuthRequest, res: Response): Promise<void> {
  const profiles = await prisma.businessProfile.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  res.json({ profiles });
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const profile = await prisma.businessProfile.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({ profile });
}

export async function deleteProfile(req: AuthRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const profile = await prisma.businessProfile.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  await prisma.businessProfile.delete({ where: { id } });
  res.json({ message: "Profile deleted" });
}
