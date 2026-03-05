import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import { formatDistance } from "@/lib/utils";

const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

export default function Step3Location() {
  const { data, updateData, setStep } = useWizard();
  const [latitude, setLatitude] = useState<number | null>(data.latitude);
  const [longitude, setLongitude] = useState<number | null>(data.longitude);
  const [radiusMeters, setRadiusMeters] = useState(data.radiusMeters);
  const [error, setError] = useState("");

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setError("");
  };

  const handleNext = () => {
    if (!latitude || !longitude) { setError("Please click on the map to set your business location."); return; }
    updateData({ latitude, longitude, radiusMeters });
    setStep(4);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Location Selection</CardTitle>
            <CardDescription>Click on the map to pin your intended storefront location</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <MapPicker latitude={latitude} longitude={longitude} radiusMeters={radiusMeters} onLocationChange={handleLocationChange} />

        <div className="space-y-2">
          <Label>Competitive Analysis Radius — <span className="font-semibold text-primary">{formatDistance(radiusMeters)}</span></Label>
          <p className="text-xs text-muted-foreground">Define the geographic zone to scan for competitors</p>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setRadiusMeters(opt.value)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:border-primary ${radiusMeters === opt.value ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {latitude && longitude && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>Location set: {latitude.toFixed(6)}, {longitude.toFixed(6)} · Radius: {formatDistance(radiusMeters)}</span>
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
