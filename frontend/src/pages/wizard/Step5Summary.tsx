import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "@/contexts/WizardContext";
import { STRATEGIC_GOALS } from "@/types";
import { businessApi, analyzeApi } from "@/lib/api";
import { ArrowLeft, Sparkles, MapPin, ShoppingBag, Target, Briefcase } from "lucide-react";
import { formatPrice, formatDistance } from "@/lib/utils";

function SummaryBlock({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-card-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export default function Step5Summary() {
  const { data, setStep, reset } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const { data: profileData }  = await businessApi.create(data);
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
    <div className="space-y-6">
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Review your consult details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm all parameters before submitting to AI analysis.
        </p>
      </div>

      {/* ── Summary grid ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryBlock icon={Briefcase} label="Business Identity">
          <Row label="Name">{data.name}</Row>
          <Row label="Category">
            <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs">
              {data.category}
            </span>
          </Row>
          <div className="pt-1">
            <div className="text-xs text-muted-foreground">Concept</div>
            <p className="mt-1 text-xs leading-relaxed text-foreground">{data.concept}</p>
          </div>
        </SummaryBlock>

        <SummaryBlock icon={MapPin} label="Location">
          <Row label="Latitude">
            <code className="font-mono text-xs">{data.latitude?.toFixed(6)}</code>
          </Row>
          <Row label="Longitude">
            <code className="font-mono text-xs">{data.longitude?.toFixed(6)}</code>
          </Row>
          <Row label="Scan Radius">{formatDistance(data.radiusMeters)}</Row>
        </SummaryBlock>

        <SummaryBlock icon={ShoppingBag} label={`Products (${data.products.length})`}>
          {data.products.map((p, i) => (
            <Row key={i} label={p.name}>{formatPrice(p.price)}</Row>
          ))}
        </SummaryBlock>

        <SummaryBlock icon={Target} label="Strategic Goals">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.goals.map((g) => (
              <span
                key={g}
                className="rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1 text-xs font-medium"
              >
                {STRATEGIC_GOALS.find((s) => s.id === g)?.label || g}
              </span>
            ))}
          </div>
        </SummaryBlock>
      </div>

      {/* ── Submitting state ────────────────────────────────────────────── */}
      {isSubmitting && (
        <div className="rounded-2xl border border-card-border bg-cream p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
          <p className="font-semibold text-foreground">
            Scanning competitors &amp; generating AI analysis…
          </p>
          <p className="mt-1 text-xs text-muted-foreground">This may take 15–30 seconds</p>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(4)}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full border border-card-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Run AI Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}
