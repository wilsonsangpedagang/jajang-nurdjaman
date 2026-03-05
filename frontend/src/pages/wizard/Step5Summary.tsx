import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/contexts/WizardContext";
import { STRATEGIC_GOALS } from "@/types";
import { businessApi, analyzeApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, MapPin, ShoppingBag, Target, Briefcase } from "lucide-react";
import { formatPrice, formatDistance } from "@/lib/utils";

export default function Step5Summary() {
  const { data, setStep, reset } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const { data: profileData } = await businessApi.create(data);
      const { data: analysisData } = await analyzeApi.run(profileData.profile.id);
      reset();
      navigate(`/dashboard/${analysisData.profile.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Survey Summary</CardTitle>
              <CardDescription>Review all parameters before submitting to AI analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Business Identity
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary">{data.category}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Concept</span>
                  <p className="mt-1 text-xs leading-relaxed">{data.concept}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitude</span>
                  <span className="font-medium font-mono text-xs">{data.latitude?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitude</span>
                  <span className="font-medium font-mono text-xs">{data.longitude?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scan Radius</span>
                  <span className="font-medium">{formatDistance(data.radiusMeters)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Products ({data.products.length})
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
                {data.products.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="font-medium">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />
                Strategic Goals
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 flex flex-wrap gap-2">
                {data.goals.map((g) => (
                  <Badge key={g} variant="secondary">
                    {STRATEGIC_GOALS.find((s) => s.id === g)?.label || g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          {isSubmitting && (
            <div className="rounded-xl border bg-blue-50 p-4 text-center">
              <div className="mb-2 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
              <p className="text-sm font-medium text-blue-700">Scanning competitors & generating AI analysis...</p>
              <p className="text-xs text-blue-500 mt-1">This may take 15-30 seconds</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Run AI Analysis</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
