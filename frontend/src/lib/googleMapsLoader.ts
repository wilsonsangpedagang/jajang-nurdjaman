import { Loader } from "@googlemaps/js-api-loader";

// Single shared loader instance for the whole app.
// Both MapPicker and CompetitorMap must use this — the SDK throws if Loader
// is constructed twice with different options on the same page.
export const mapsLoader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  version: "weekly",
  libraries: ["places", "geometry"],
});
