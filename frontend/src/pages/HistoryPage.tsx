import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { businessApi } from "@/lib/api";
import type { BusinessProfile } from "@/types";
import Navbar from "@/components/Navbar";
import { MapPin, Calendar, ArrowRight, PlusCircle, Trash2 } from "lucide-react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import type { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

/* ─── Status badge ─────────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<BusinessProfile["status"], string> = {
  COMPLETED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-sticky-yellow/30 text-bvi-orange border-sticky-yellow/50",
  FAILED:     "bg-rose-50 text-rose-700 border-rose-200",
  PENDING:    "bg-muted text-muted-foreground border-card-border",
};

function StatusPill({ status }: { status: BusinessProfile["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

/* ─── HistoryPage ─────────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    businessApi.list()
      .then(({ data }) => setProfiles(data.profiles))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;
    await businessApi.delete(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="container py-12">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
              Previous Consults
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              All your business location analyses
            </p>
          </div>
          <Link
            to="/survey"
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            <PlusCircle className="h-4 w-4" /> New Survey
          </Link>
        </div>

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>

        /* ── Empty state ────────────────────────────────────────────────── */
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-card-border bg-white py-28 text-center">
            <div className="mb-4 text-5xl opacity-30">📊</div>
            <h2 className="text-lg font-bold text-foreground">No analyses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run your first survey to see results here
            </p>
            <Link
              to="/survey"
              className="mt-6 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Start Your First Analysis
            </Link>
          </div>

        /* ── Profile grid ───────────────────────────────────────────────── */
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, i) => {
              const result = profile.analysisResult as AnalysisResult | null;
              const score  = result?.successScore;

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="group rounded-2xl border border-card-border bg-white p-5 transition-shadow hover:shadow-md">
                    {/* Top row */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-foreground">{profile.name}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {profile.category}
                          </span>
                          <StatusPill status={profile.status} />
                        </div>
                      </div>

                      {/* Score badge */}
                      {score !== undefined && (
                        <div className="flex-shrink-0 text-right">
                          <div
                            className={cn(
                              "font-display text-3xl font-black leading-none",
                              getScoreColor(score)
                            )}
                          >
                            {score}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {getScoreLabel(score)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="mb-4 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {result?.address ||
                            `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        {new Date(profile.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {profile.status === "COMPLETED" ? (
                        <Link
                          to={`/dashboard/${profile.id}`}
                          className="flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                        >
                          View Report <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <StatusPill status={profile.status} />
                      )}
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="rounded-full p-2 text-muted-foreground/40 transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
