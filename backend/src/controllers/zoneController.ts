import { Request, Response } from "express";
import { fetchZoneLive } from "../lib/zoneService";
import { runZoneClassification } from "../lib/mlPredictor";

const JAKARTA_BOUNDS = { latMin: -6.4, latMax: -5.9, lngMin: 106.5, lngMax: 107.1 };

export { fetchZoneLive };

export async function classifyZone(req: Request, res: Response): Promise<void> {
  const latRaw = req.query.lat as string | undefined;
  const lngRaw = req.query.lng as string | undefined;

  if (!latRaw || !lngRaw) {
    res.status(400).json({ error: "lat and lng query params required" });
    return;
  }

  const lat = parseFloat(latRaw);
  const lng = parseFloat(lngRaw);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "lat and lng must be valid numbers" });
    return;
  }

  if (lat < JAKARTA_BOUNDS.latMin || lat > JAKARTA_BOUNDS.latMax ||
      lng < JAKARTA_BOUNDS.lngMin || lng > JAKARTA_BOUNDS.lngMax) {
    res.status(400).json({ error: "Coordinates must be within Jakarta's bounding box (lat: -6.4 to -5.9, lng: 106.5 to 107.1)" });
    return;
  }

  // Primary: live RDTR FeatureServer
  try {
    const zone = await fetchZoneLive(lat, lng);
    res.json({ zone });
    return;
  } catch {
    // fall through to Python fallback
  }

  // Fallback: GeoPandas via Python subprocess
  try {
    const zone = await runZoneClassification(lat, lng);
    res.json({ zone });
  } catch {
    res.status(500).json({ error: "Zone classification unavailable" });
  }
}
