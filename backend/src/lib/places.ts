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
  "food & beverage": ["restaurant", "cafe", "bar", "bakery"],
  "retail": ["shopping_mall", "supermarket", "clothing_store", "electronics_store", "convenience_store"],
  "beauty": ["beauty_salon", "hair_care", "spa"],
  "health": ["doctor", "hospital", "pharmacy", "dentist", "physiotherapist"],
  "education": ["school", "university", "library"],
  "entertainment": ["movie_theater", "amusement_park", "night_club", "bowling_alley"],
  "services": ["laundry", "car_repair", "plumber", "electrician"],
  "technology": ["electronics_store"],
};

const BLACKLISTED_TYPES = ["place_of_worship", "bank"];

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
  console.log("FETCH_COMPETITORS_START:", { lat, lng, radiusMeters, category });
  const normalizedCategory = category.toLowerCase();
  const targetTypes = CATEGORY_MAP[normalizedCategory] || [];
  const allResults: PlaceResult[] = [];
  const seen = new Set<string>();

  const searchTasks = targetTypes.length > 0 
    ? targetTypes.map(type => ({ type })) 
    : [{ keyword: category }];

  const resultsArray = await Promise.all(
    searchTasks.map(async (task) => {
      const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
      url.searchParams.set("location", `${lat},${lng}`);
      url.searchParams.set("radius", String(Math.min(radiusMeters, 50000)));
      url.searchParams.set("key", PLACES_API_KEY);

      if ("type" in task) {
        url.searchParams.set("type", task.type);
      } else {
        url.searchParams.set("keyword", task.keyword);
      }

      console.log("GOOGLE_PLACES_REQUEST_URL:", url.toString());

      try {
        const response = await fetch(url.toString());
        const data = await response.json() as GooglePlacesNearbyResponse;
        
        console.log("GOOGLE_PLACES_RESPONSE_STATUS:", data.status, "FOR_TASK:", JSON.stringify(task));

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          console.error("GOOGLE_PLACES_ERROR_DATA:", data);
          return [];
        }

        return data.results || [];
      } catch (error) {
        console.error("GOOGLE_PLACES_FETCH_ERROR:", error);
        return [];
      }
    })
  );

  for (const results of resultsArray) {
    for (const place of results) {
      if (seen.has(place.place_id)) continue;

      const isBlacklisted = place.types.some(t => BLACKLISTED_TYPES.includes(t));
      if (isBlacklisted) {
        console.log("SKIPPING_BLACKLISTED_PLACE:", place.name, "TYPES:", place.types);
        continue;
      }

      seen.add(place.place_id);

      const dist = haversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      
      if (dist > radiusMeters) {
        console.log("SKIPPING_TOO_FAR_PLACE:", place.name, "DIST:", Math.round(dist), "LIMIT:", radiusMeters);
        continue;
      }

      console.log("ADDING_COMPETITOR:", place.name, "DIST:", Math.round(dist));

      allResults.push({
        name: place.name,
        type: place.types[0] || "establishment",
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

  console.log("FINAL_COMPETITOR_COUNT:", allResults.length);

  return allResults.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
