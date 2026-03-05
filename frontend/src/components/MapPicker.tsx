import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

export default function MapPicker({ latitude, longitude, radiusMeters, onLocationChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    if (!apiKey || apiKey === "your-google-maps-api-key") {
      setLoadError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    loader.load().then(() => {
      setIsLoaded(true);
    }).catch((err: unknown) => {
      setLoadError(`Failed to load Google Maps: ${String(err)}`);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const center = latitude && longitude ? { lat: latitude, lng: longitude } : DEFAULT_CENTER;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: latitude && longitude ? 15 : 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });

    mapInstanceRef.current = map;

    if (latitude && longitude) {
      placeMarkerAndCircle(map, { lat: latitude, lng: longitude });
    }

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarkerAndCircle(map, { lat, lng });
        onLocationChange(lat, lng);
      }
    });
  }, [isLoaded]);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  function placeMarkerAndCircle(map: google.maps.Map, pos: { lat: number; lng: number }) {
    if (markerRef.current) markerRef.current.setMap(null);
    if (circleRef.current) circleRef.current.setMap(null);

    const marker = new google.maps.Marker({
      position: pos,
      map,
      draggable: true,
      title: "Your business location",
      animation: google.maps.Animation.DROP,
    });

    const circle = new google.maps.Circle({
      center: pos,
      radius: radiusMeters,
      map,
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });

    marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        circle.setCenter({ lat, lng });
        onLocationChange(lat, lng);
      }
    });

    markerRef.current = marker;
    circleRef.current = circle;
  }

  if (loadError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border bg-muted/50 text-center p-6">
        <MapPin className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border bg-muted/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="map-container h-[400px] w-full rounded-xl border" />
  );
}
