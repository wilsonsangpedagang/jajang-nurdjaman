import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { businessApi } from "@/lib/api";
import type { BusinessProfile, AnalysisResult, Competitor } from "@/types";
import Navbar from "@/components/Navbar";
import SwotCard from "@/components/SwotCard";
import ScoreDisplay from "@/components/ScoreDisplay";
import RoadmapCard from "@/components/RoadmapCard";
import CompetitorMap from "@/components/CompetitorMap";
import { MapPin, Users, Star, ArrowLeft, Download, Calendar, Building2 } from "lucide-react";
import { formatDistance, formatPrice } from "@/lib/utils";

/* ─── Competitor grid ─────────────────────────────────────────────────────── */
function CompetitorGrid({ competitors }: { competitors: Competitor[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? competitors : competitors.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Nearby Competitors ({competitors.length})</h3>
        {competitors.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-full border border-card-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {showAll ? "Show less" : `Show all ${competitors.length}`}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((c, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border border-card-border bg-white p-4">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sticky-yellow/30">
                <Building2 className="h-4 w-4 text-bvi-orange" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{c.name}</div>
                <div className="text-xs capitalize text-muted-foreground">
                  {c.type.replace(/_/g, " ")}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatDistance(c.distanceMeters)}
              </div>
              {c.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{c.rating}</span>
                  {c.userRatingsTotal && (
                    <span className="text-muted-foreground">
                      ({c.userRatingsTotal.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="truncate text-xs text-muted-foreground">{c.vicinity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section divider ──────────────────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">{children}</h2>
  );
}

/* ─── DashboardPage ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile]   = useState<BusinessProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!profileId) return;
    Promise.all([businessApi.get(profileId), businessApi.list()])
      .then(([{ data }, { data: listData }]) => {
        setProfile(data.profile);
        setAllProfiles(listData.profiles ?? []);
      })
      .catch(() => setError("Failed to load analysis results."))
      .finally(() => setIsLoading(false));
  }, [profileId]);

  /* Derive consult number */
  const consultNum = profile
    ? allProfiles.findIndex((p) => p.id === profile.id) + 1 || 1
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your analysis…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !profile.analysisResult) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">{error || "Analysis not available."}</p>
          <Link
            to="/history"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const result      = profile.analysisResult as AnalysisResult;
  const competitors = result.competitors || [];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar consultLabel={consultNum ? `Consult #${consultNum}` : "Consult"} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ── Header row ───────────────────────────────────────────────── */}
        <div className="border-b border-card-border bg-white">
          <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                to="/history"
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All Analyses
              </Link>
              <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                {profile.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-card-border px-3 py-0.5 text-xs font-medium">
                  {profile.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {result.address || `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {competitors.length} competitors
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 self-start rounded-full border border-card-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* ── BVI Score hero ───────────────────────────────────────────── */}
        <section className="border-b border-card-border bg-cream py-16">
          <div className="container">
            <ScoreDisplay
              score={result.successScore}
              breakdown={result.scoreBreakdown}
              summary={result.summary}
            />
          </div>
        </section>

        {/* ── SWOT ─────────────────────────────────────────────────────── */}
        <section className="border-b border-card-border bg-white py-14">
          <div className="container space-y-6">
            <SectionHeading>SWOT Analysis</SectionHeading>
            <SwotCard swot={result.swot} />
          </div>
        </section>

        {/* ── Roadmap ──────────────────────────────────────────────────── */}
        <section className="border-b border-card-border bg-cream py-14">
          <div className="container space-y-6">
            <SectionHeading>Strategic Roadmap</SectionHeading>
            <RoadmapCard roadmap={result.strategicRoadmap} />
          </div>
        </section>

        {/* ── Competitors ──────────────────────────────────────────────── */}
        <section className="border-b border-card-border bg-white py-14">
          <div className="container space-y-8">
            <SectionHeading>Competitor Landscape</SectionHeading>
            <div className="overflow-hidden rounded-2xl border border-card-border">
              <CompetitorMap
                latitude={profile.latitude}
                longitude={profile.longitude}
                radiusMeters={profile.radiusMeters}
                competitors={competitors}
              />
            </div>
            <CompetitorGrid competitors={competitors} />
          </div>
        </section>

        {/* ── Product catalog ──────────────────────────────────────────── */}
        <section className="bg-cream py-14">
          <div className="container space-y-6">
            <SectionHeading>Your Product Catalog</SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.products.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-card-border bg-white px-5 py-4"
                >
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
