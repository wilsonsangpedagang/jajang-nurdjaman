import { Response } from "express";
import { prisma } from "../lib/prisma";
import { fetchNearbyCompetitors } from "../lib/places";
import { runMLAnalysis } from "../lib/mlPredictor";
import { AuthRequest } from "../middleware/auth";

export async function analyzeProfile(req: AuthRequest, res: Response): Promise<void> {
  const profileId = String(req.params.profileId);

  let profile;
  try {
    profile = await prisma.businessProfile.findFirst({
      where: { id: profileId, userId: req.userId! },
    });
  } catch (err) {
    console.error("analyzeProfile DB lookup error:", err);
    res.status(500).json({ error: "Failed to start analysis. Please try again." });
    return;
  }

  if (!profile) {
    res.status(404).json({ error: "Business profile not found" });
    return;
  }

  try {
    await prisma.businessProfile.update({
      where: { id: profileId },
      data: { status: "PROCESSING" },
    });
  } catch (err) {
    console.error("analyzeProfile status update error:", err);
    res.status(500).json({ error: "Failed to start analysis. Please try again." });
    return;
  }

  try {
    const competitors = await fetchNearbyCompetitors(
      profile.latitude,
      profile.longitude,
      profile.radiusMeters,
      profile.category
    );

    const addressResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${profile.latitude},${profile.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY ?? ""}`
    );
    const addressData = (await addressResponse.json()) as {
      results: Array<{ formatted_address: string }>;
    };
    const address = addressData.results[0]?.formatted_address || "Unknown location";

    const products = (profile.products as Array<{ name: string; price: number }>) || [];

    const analysisResult = await runMLAnalysis({
      businessName: profile.name,
      category: profile.category,
      concept: profile.concept,
      products,
      goals: profile.goals,
      location: { lat: profile.latitude, lng: profile.longitude, address },
      radiusMeters: profile.radiusMeters,
      competitors,
    });

    const updatedProfile = await prisma.businessProfile.update({
      where: { id: profileId },
      data: {
        status: "COMPLETED",
        analysisResult: JSON.parse(JSON.stringify({ ...analysisResult, competitors, address })),
      },
    });

    res.json({ profile: updatedProfile });
  } catch (err) {
    await prisma.businessProfile.update({
      where: { id: profileId },
      data: { status: "FAILED" },
    });
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}
