const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

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

const CATEGORY_MAP: Record<string, string[]> = {
  "f&b": ["restaurant", "cafe", "bar", "bakery"],
  retail: ["shopping_mall", "supermarket", "clothing_store", "electronics_store", "convenience_store"],
  beauty: ["beauty_salon", "hair_care", "spa"],
  health: ["doctor", "hospital", "pharmacy", "dentist", "physiotherapist"],
  education: ["school", "university", "library"],
  entertainment: ["movie_theater", "amusement_park", "night_club", "bowling_alley"],
  services: ["laundry", "car_repair", "plumber", "electrician"],
  technology: ["electronics_store"],
};

const BLACKLISTED_TYPES = ["point_of_interest", "place_of_worship", "bank"];

export async function fetchNearbyCompetitors(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: string
): Promise<PlaceResult[]> {
  const normalizedCategory = category.toLowerCase();
  const targetTypes = CATEGORY_MAP[normalizedCategory] || [];
  const allResults: PlaceResult[] = [];
  const seen = new Set<string>();

  // Use the Old Places API (nearbysearch)
  // Note: Old API only supports ONE type per request. We iterate through mapped types.
  // If no mapped types, we search by keyword (category name) as a fallback.
  const searchTasks = targetTypes.length > 0 
    ? targetTypes.map(type => ({ type })) 
    : [{ keyword: category }];

  for (const task of searchTasks) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radiusMeters, 50000)));
    url.searchParams.set("key", PLACES_API_KEY);

    if ("type" in task) {
      url.searchParams.set("type", task.type);
    } else {
      url.searchParams.set("keyword", task.keyword);
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) continue;

      const data = (await response.json()) as GooglePlacesNearbyResponse;
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

      for (const place of data.results) {
        if (seen.has(place.place_id)) continue;

        // Exclusion Logic: Exclude blacklisted types
        // Note: If the user category IS one of these (e.g. they search for 'bank'), 
        // we might want to allow it, but the request says to exclude them as a fallback rule.
        const isBlacklisted = place.types.some(t => BLACKLISTED_TYPES.includes(t));
        if (isBlacklisted) {
          // If we are searching for a specific type and that type is blacklisted, we still skip it
          // per the requirement "exclude places like...".
          continue;
        }

        seen.add(place.place_id);

        const dist = haversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
        if (dist > radiusMeters) continue;

        allResults.push({
          name: place.name,
          type: place.types[0] || (("type" in task) ? task.type : "establishment"),
          rating: place.rating ?? null,
          userRatingsTotal: place.user_ratings_total ?? null,
          vicinity: place.vicinity,
          placeId: place.place_id,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          distanceMeters: Math.round(dist),
        });
      }
    } catch (error) {
      console.error(`Error fetching competitors for ${JSON.stringify(task)}:`, error);
    }
  }

  return allResults.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
