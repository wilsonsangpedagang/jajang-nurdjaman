import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import { formatDistance } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RADIUS_OPTIONS = [
  { label: "500 m", value: 500 },
  { label: "1 km",  value: 1000 },
  { label: "2 km",  value: 2000 },
  { label: "3 km",  value: 3000 },
  { label: "5 km",  value: 5000 },
  { label: "10 km", value: 10000 },
];

export default function Step3Location() {
  const { data, updateData, setStep } = useWizard();
  const [latitude, setLatitude]       = useState<number | null>(data.latitude);
  const [longitude, setLongitude]     = useState<number | null>(data.longitude);
  const [radiusMeters, setRadiusMeters] = useState(data.radiusMeters);
  const [error, setError]             = useState("");

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setError("");
  };

  const handleNext = () => {
    if (!latitude || !longitude) {
      setError("Please click on the map to set your business location.");
      return;
    }
    updateData({ latitude, longitude, radiusMeters });
    setStep(4);
  };

  return (
    <div className="space-y-8">
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Pinpoint your business location!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Click on the map to drop a pin at your intended storefront location.
        </p>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-card-border shadow-sm">
        <MapPicker
          latitude={latitude}
          longitude={longitude}
          radiusMeters={radiusMeters}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* ── Location confirmed ──────────────────────────────────────────── */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>
            Location set: {latitude.toFixed(5)}, {longitude.toFixed(5)} · Radius:{" "}
            {formatDistance(radiusMeters)}
          </span>
        </div>
      )}

      {/* ── Radius selector ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Analysis radius</span>
          <span className="text-sm font-semibold text-muted-foreground">
            {formatDistance(radiusMeters)}
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Define the geographic zone to scan for competitors.
        </p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRadiusMeters(opt.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                radiusMeters === opt.value
                  ? "border-foreground bg-foreground text-white"
                  : "border-card-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 rounded-full border border-card-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
