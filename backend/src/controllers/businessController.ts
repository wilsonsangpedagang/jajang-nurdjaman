import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export async function createProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
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
  } catch (err) {
    console.error("createProfile error:", err);
    res.status(500).json({ error: "Failed to create profile. Please try again." });
  }
}

export async function getProfiles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const profiles = await prisma.businessProfile.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    res.json({ profiles });
  } catch (err) {
    console.error("getProfiles error:", err);
    res.status(500).json({ error: "Failed to fetch profiles." });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const profile = await prisma.businessProfile.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json({ profile });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
}

export async function deleteProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
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
  } catch (err) {
    console.error("deleteProfile error:", err);
    res.status(500).json({ error: "Failed to delete profile." });
  }
}
