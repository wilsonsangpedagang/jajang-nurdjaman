import { useEffect, useRef, useState } from "react";
import { mapsLoader } from "@/lib/googleMapsLoader";
import { MapPin } from "lucide-react";
import api from "@/lib/api";
import type { ZoneResult } from "@/types";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

const ZONE_BADGE: Record<string, { bg: string; text: string; border: string; message: string }> = {
  MERAH: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    message: "Zona Merah — Jalur Hijau. Usaha komersial dilarang di lokasi ini (Perda DKI No. 8/2007). Risiko penertiban Satpol PP.",
  },
  KUNING: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    message: "Zona Kuning — Penggunaan campuran. Diperlukan izin khusus untuk usaha komersial.",
  },
  HIJAU: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    message: "Zona Hijau — Kawasan komersial. Lokasi diizinkan untuk usaha.",
  },
};

export default function MapPicker({ latitude, longitude, radiusMeters, onLocationChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  // Keep onLocationChange in a ref so the click listener never goes stale
  const onLocationChangeRef = useRef(onLocationChange);
  const zoneDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoneResult, setZoneResult] = useState<ZoneResult | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    if (!apiKey || apiKey === "your-google-maps-api-key") {
      setLoadError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    mapsLoader.load().then(() => {
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

    clickListenerRef.current = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarkerAndCircle(map, { lat, lng });
        onLocationChangeRef.current(lat, lng);
        lookupZoneDebounced(lat, lng);
      }
    });

    return () => {
      if (clickListenerRef.current) {
        google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      if (zoneDebounceRef.current) {
        clearTimeout(zoneDebounceRef.current);
      }
      mapInstanceRef.current = null;
    };
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  function lookupZoneDebounced(lat: number, lng: number) {
    if (zoneDebounceRef.current) clearTimeout(zoneDebounceRef.current);
    zoneDebounceRef.current = setTimeout(() => {
      setZoneLoading(true);
      api.get<{ zone: ZoneResult }>(`/zone?lat=${lat}&lng=${lng}`)
        .then(({ data }) => setZoneResult(data.zone))
        .catch(() => setZoneResult(null))
        .finally(() => setZoneLoading(false));
    }, 800);
  }

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
        onLocationChangeRef.current(lat, lng);
        lookupZoneDebounced(lat, lng);
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

  const badge = zoneResult ? ZONE_BADGE[zoneResult.zone_label] : null;

  return (
    <div className="space-y-0">
      <div ref={mapRef} className="map-container h-[400px] w-full rounded-xl border" />

      {/* Zone badge — shown below the map after a pin is placed */}
      {zoneLoading && (
        <div className="mt-3 h-10 animate-pulse rounded-xl border bg-muted/40" />
      )}
      {!zoneLoading && badge && zoneResult && (
        <div className={`mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${badge.bg} ${badge.border} ${badge.text}`}>
          <span className="mt-0.5 flex-shrink-0 text-base">
            {zoneResult.zone_label === "MERAH" ? "🚫" : zoneResult.zone_label === "KUNING" ? "⚠️" : "✅"}
          </span>
          <div>
            <span className="font-semibold">{zoneResult.zone_name}</span>
            <p className="mt-0.5 text-xs leading-relaxed opacity-90">{badge.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
