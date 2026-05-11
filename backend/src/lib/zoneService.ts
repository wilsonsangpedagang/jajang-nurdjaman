/**
 * Live RDTR zone lookup against Jakarta's public ArcGIS FeatureServer.
 * No authentication required.  Zone data is additive and is NEVER fed to model.predict().
 */

export interface ZoneResult {
  zone_label: "MERAH" | "KUNING" | "HIJAU" | "UNKNOWN";
  zone_type: string | null;
  zone_name: string;
  green_zone_ratio: number;
  commercial_ratio: number;
  mixed_use_ratio: number;
  is_restricted: boolean;
}

// Confirmed working — Jakarta Open Data RDTR (no auth)
const PRIMARY_RDTR =
  "https://jakartasatu.jakarta.go.id/server/rest/services/GISTARU/RDTR_GISTARU/MapServer/0/query";

// Official tataruang.jakarta.go.id endpoint — try as secondary if primary fails
const SECONDARY_RDTR =
  "https://tataruang.jakarta.go.id/server/rest/services/RDTR/ZONASI_RDTR/FeatureServer/0/query";

/** RDTR KODZON → zone label, based on live field inspection (2026-05-11) */
const ZONE_CODE_MAP: Record<string, "MERAH" | "KUNING" | "HIJAU"> = {
  // HIJAU — Perdagangan, Jasa, Industri
  K: "HIJAU", KS: "HIJAU", KB: "HIJAU", KK: "HIJAU",
  I: "HIJAU", IB: "HIJAU", IK: "HIJAU",
  // MERAH — Ruang Terbuka Hijau, Sungai, Pemakaman, Pertanian
  RTH: "MERAH", RP: "MERAH", PM: "MERAH", TP: "MERAH",
  SW: "MERAH", SWL: "MERAH", SWR: "MERAH",
  // KUNING — Perumahan, Pelayanan Umum, Badan Jalan, Khusus
  R: "KUNING", RK: "KUNING", RT: "KUNING", RS: "KUNING",
  SPU: "KUNING", BJ: "KUNING", KH: "KUNING", PL: "KUNING",
};

function labelFromCode(kodzon: string): "MERAH" | "KUNING" | "HIJAU" | null {
  return ZONE_CODE_MAP[kodzon.toUpperCase()] ?? null;
}

function labelFromName(namzon: string): "MERAH" | "KUNING" | "HIJAU" {
  const n = namzon.toLowerCase();
  if (/ruang terbuka hijau|rekreasi publik|pertanian|sungai|pemakaman|hutan|jalur hijau|sempadan/.test(n)) return "MERAH";
  if (/perdagangan|dan jasa|komersial|industri|perkantoran/.test(n)) return "HIJAU";
  return "KUNING";
}

function resolveLabel(kodzon: string, namzon: string): "MERAH" | "KUNING" | "HIJAU" {
  return labelFromCode(kodzon) ?? labelFromName(namzon);
}

function buildQueryUrl(base: string, lng: number, lat: number, distance?: number): string {
  const params = new URLSearchParams({
    geometryType: "esriGeometryPoint",
    geometry: `${lng},${lat}`,
    spatialRel: "esriSpatialRelIntersects",
    inSR: "4326",
    outFields: "KODZON,NAMZON,KODSZN,NAMSZN,WADMKD",
    f: "geojson",
    resultRecordCount: distance ? "30" : "5",
  });
  if (distance) {
    params.set("distance", String(distance));
    params.set("units", "esriSRUnit_Meter");
  }
  return `${base}?${params.toString()}`;
}

async function queryRdtr(base: string, lng: number, lat: number, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const [pointRes, nearbyRes] = await Promise.all([
      fetch(buildQueryUrl(base, lng, lat), { signal: controller.signal }),
      fetch(buildQueryUrl(base, lng, lat, 500), { signal: controller.signal }),
    ]);
    clearTimeout(timer);
    const [pointData, nearbyData] = await Promise.all([
      pointRes.json() as Promise<{ features?: any[] }>,
      nearbyRes.json() as Promise<{ features?: any[] }>,
    ]);
    return {
      pointFeatures: pointData.features ?? [],
      nearbyFeatures: nearbyData.features ?? [],
    };
  } catch {
    clearTimeout(timer);
    throw new Error("RDTR query failed");
  }
}

function buildResult(
  pointFeatures: any[],
  nearbyFeatures: any[]
): ZoneResult {
  if (pointFeatures.length === 0 && nearbyFeatures.length === 0) {
    return makeUnknown("Lokasi di luar area RDTR Jakarta");
  }

  let zone_label: "MERAH" | "KUNING" | "HIJAU" | "UNKNOWN" = "UNKNOWN";
  let zone_type: string | null = null;
  let zone_name = "Tidak Ada Data";

  if (pointFeatures.length > 0) {
    const p = pointFeatures[0].properties ?? {};
    const kodzon = String(p.KODZON ?? "");
    const namzon = String(p.NAMZON ?? "");
    zone_label = resolveLabel(kodzon, namzon);
    zone_type = p.NAMSZN ?? (kodzon.toLowerCase() || null);
    zone_name = p.NAMZON ?? zone_type ?? "Tidak Diketahui";
  } else {
    // Approximate from nearest nearby feature
    const p = nearbyFeatures[0].properties ?? {};
    const kodzon = String(p.KODZON ?? "");
    const namzon = String(p.NAMZON ?? "");
    zone_label = resolveLabel(kodzon, namzon);
    zone_type = p.NAMSZN ?? (kodzon.toLowerCase() || null);
    zone_name = `${p.NAMZON ?? "Area sekitar"} (estimasi)`;
  }

  const total = nearbyFeatures.length || 1;
  let merahCount = 0, hijauCount = 0, kuningCount = 0;
  for (const feat of nearbyFeatures) {
    const p = feat.properties ?? {};
    const l = resolveLabel(String(p.KODZON ?? ""), String(p.NAMZON ?? ""));
    if (l === "MERAH") merahCount++;
    else if (l === "HIJAU") hijauCount++;
    else kuningCount++;
  }

  return {
    zone_label,
    zone_type,
    zone_name: String(zone_name),
    green_zone_ratio: +(merahCount / total).toFixed(3),
    commercial_ratio: +(hijauCount / total).toFixed(3),
    mixed_use_ratio:  +(kuningCount / total).toFixed(3),
    is_restricted: zone_label === "MERAH",
  };
}

function makeUnknown(zone_name: string): ZoneResult {
  return {
    zone_label: "UNKNOWN",
    zone_type: null,
    zone_name,
    green_zone_ratio: 0,
    commercial_ratio: 0,
    mixed_use_ratio: 0,
    is_restricted: false,
  };
}

/**
 * Fetches live RDTR zone data for a lat/lng coordinate.
 * Tries primary endpoint first, falls back to secondary.
 * Throws if both fail (let callers handle fallback to Python).
 */
export async function fetchZoneLive(lat: number, lng: number): Promise<ZoneResult> {
  for (const endpoint of [PRIMARY_RDTR, SECONDARY_RDTR]) {
    try {
      const { pointFeatures, nearbyFeatures } = await queryRdtr(endpoint, lng, lat);
      return buildResult(pointFeatures, nearbyFeatures);
    } catch {
      // try next endpoint
    }
  }
  throw new Error("All RDTR endpoints unavailable");
}
