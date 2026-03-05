import dotenv from "dotenv";
dotenv.config();

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export interface PlaceResult {
  name: string;
  type: string;
  rating: number | null;
  userRatingsTotal: number | null;
  vicinity: string;
  placeId: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}

interface GooglePlacesNearbyResult {
  name: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  vicinity: string;
  place_id: string;
  geometry: {
    location: { lat: number; lng: number };
  };
}

interface GooglePlacesNearbyResponse {
  results: GooglePlacesNearbyResult[];
  next_page_token?: string;
  status: string;
}

function categoryToPlaceTypes(category: string): string[] {
  const mapping: Record<string, string[]> = {
    "Food & Beverage": ["restaurant", "cafe", "food", "meal_takeaway", "bakery"],
    Retail: ["store", "clothing_store", "shoe_store", "shopping_mall"],
    Beauty: ["beauty_salon", "hair_care", "spa"],
    Health: ["pharmacy", "hospital", "gym", "health"],
    Education: ["school", "university", "library"],
    Entertainment: ["movie_theater", "amusement_park", "bar", "night_club"],
    Services: ["laundry", "car_wash", "electrician", "plumber"],
    Technology: ["electronics_store", "computer_store"],
  };
  return mapping[category] || ["establishment"];
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchNearbyCompetitors(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: string
): Promise<PlaceResult[]> {
  const types = categoryToPlaceTypes(category);
  const allResults: PlaceResult[] = [];
  const seen = new Set<string>();

  for (const type of types.slice(0, 3)) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radiusMeters, 50000)));
    url.searchParams.set("type", type);
    url.searchParams.set("key", PLACES_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) continue;

    const data = (await response.json()) as GooglePlacesNearbyResponse;
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

    for (const place of data.results) {
      if (seen.has(place.place_id)) continue;
      seen.add(place.place_id);

      const dist = haversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      if (dist > radiusMeters) continue;

      allResults.push({
        name: place.name,
        type: place.types[0] || type,
        rating: place.rating ?? null,
        userRatingsTotal: place.user_ratings_total ?? null,
        vicinity: place.vicinity,
        placeId: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distanceMeters: Math.round(dist),
      });
    }
  }

  return allResults.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
