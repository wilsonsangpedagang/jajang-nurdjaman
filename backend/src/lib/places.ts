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

const BLACKLISTED_TYPES = [
  "place_of_worship",
  "bank",
  "atm",
  "school",
  "university",
  "hospital",
  "local_government_office",
  "police",
  "fire_station",
  "cemetery",
  "post_office",
  "courthouse",
  "embassy",
  "city_hall",
  "gas_station",
  "parking",
];

function categoryToPlaceTypes(category: string): string[] {
  const mapping: Record<string, string[]> = {
    "Food & Beverage": ["restaurant", "cafe", "bakery", "meal_takeaway"],
    Retail: ["store", "clothing_store", "shopping_mall", "home_goods_store"],
    Beauty: ["beauty_salon", "hair_care", "spa"],
    Health: ["pharmacy", "gym", "health"],
    Education: ["school", "library"],
    Entertainment: ["movie_theater", "amusement_park", "bar", "night_club"],
    Services: ["laundry", "car_wash", "electrician", "plumber"],
    Technology: ["electronics_store", "computer_store"],
  };
  return mapping[category] || [];
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

  // If we have specific types from mapping, use them. 
  // Otherwise, or in addition, use the category name as a keyword.
  const searchParams = types.length > 0 ? types.map(t => ({ type: t })) : [{ keyword: category }];
  
  // Also always add a keyword search for the category to catch relevant places 
  // that might not have the correct Google "type"
  if (types.length > 0) {
    searchParams.push({ keyword: category });
  }

  for (const param of searchParams.slice(0, 4)) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radiusMeters, 50000)));
    url.searchParams.set("key", PLACES_API_KEY);
    
    if ("type" in param) {
      url.searchParams.set("type", param.type);
    } else {
      url.searchParams.set("keyword", param.keyword);
    }

    const response = await fetch(url.toString());
    if (!response.ok) continue;

    const data = (await response.json()) as GooglePlacesNearbyResponse;
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

    for (const place of data.results) {
      if (seen.has(place.place_id)) continue;
      
      // Filter out blacklisted types
      const isBlacklisted = place.types.some(t => BLACKLISTED_TYPES.includes(t));
      if (isBlacklisted) {
        // Only allow if the target type is explicitly in the place types
        // (e.g., if we ARE looking for a school, don't blacklist it)
        const isTargetType = "type" in param && place.types.includes(param.type);
        if (!isTargetType) continue;
      }

      seen.add(place.place_id);

      const dist = haversineDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      if (dist > radiusMeters) continue;

      allResults.push({
        name: place.name,
        type: place.types[0] || (("type" in param) ? param.type : "establishment"),
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
