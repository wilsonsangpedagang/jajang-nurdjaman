import { useEffect, useRef, useState } from "react";
import { mapsLoader } from "@/lib/googleMapsLoader";
import type { Competitor } from "@/types";
import { MapPin } from "lucide-react";
import { formatDistance } from "@/lib/utils";

interface CompetitorMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  competitors: Competitor[];
}

export default function CompetitorMap({ latitude, longitude, radiusMeters, competitors }: CompetitorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  // Load Google Maps SDK once (shared singleton — avoids "called with different options" error)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    if (!apiKey || apiKey === "your-google-maps-api-key") {
      setLoadError("Google Maps API key not configured.");
      return;
    }
    mapsLoader.load().then(() => setIsLoaded(true)).catch(() => setLoadError("Failed to load map."));
  }, []);

  // Initialize map once the SDK is ready
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Business location marker
    new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map,
      title: "Your Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
      zIndex: 10,
    });

    return () => {
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render circle and competitor markers whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    circleRef.current = new google.maps.Circle({
      center: { lat: latitude, lng: longitude },
      radius: radiusMeters,
      map,
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.6,
      strokeWeight: 2,
    });

    // Clear previous competitor markers
    for (const m of markersRef.current) m.setMap(null);
    markersRef.current = [];

    const infoWindow = infoWindowRef.current;

    for (const competitor of competitors) {
      const marker = new google.maps.Marker({
        position: { lat: competitor.lat, lng: competitor.lng },
        map,
        title: competitor.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#f59e0b",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setSelectedCompetitor(competitor);
        if (infoWindow) {
          infoWindow.setContent(`
            <div style="padding:4px;max-width:180px">
              <div style="font-weight:600;font-size:13px;margin-bottom:2px">${competitor.name}</div>
              <div style="font-size:11px;color:#666">${competitor.type.replace(/_/g, " ")}</div>
              ${competitor.rating ? `<div style="font-size:11px;margin-top:4px">⭐ ${competitor.rating} (${competitor.userRatingsTotal?.toLocaleString() || 0} reviews)</div>` : ""}
              <div style="font-size:11px;color:#666;margin-top:2px">${formatDistance(competitor.distanceMeters)} away</div>
            </div>
          `);
          infoWindow.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      for (const m of markersRef.current) m.setMap(null);
      markersRef.current = [];
    };
  }, [latitude, longitude, radiusMeters, competitors]);

  if (loadError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-muted/50">
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-muted/50">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="h-64 w-full rounded-xl border" />
      {selectedCompetitor && (
        <div className="flex items-start gap-3 rounded-xl border bg-amber-50 p-3">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <div className="font-medium text-sm">{selectedCompetitor.name}</div>
            <div className="text-xs text-muted-foreground">
              {selectedCompetitor.type.replace(/_/g, " ")} · {formatDistance(selectedCompetitor.distanceMeters)} away
              {selectedCompetitor.rating && ` · ⭐ ${selectedCompetitor.rating}`}
            </div>
            <div className="text-xs text-muted-foreground">{selectedCompetitor.vicinity}</div>
          </div>
        </div>
      )}
    </div>
  );
}
