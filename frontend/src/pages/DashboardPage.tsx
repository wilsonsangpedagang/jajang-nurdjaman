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
import ZoneBanner from "@/components/ZoneBanner";
import { MapPin, Users, ArrowLeft, Download, Calendar, Building2, Star, TrendingUp } from "lucide-react";
import { formatDistance, formatPrice, cn } from "@/lib/utils";

/* ─── Glass card wrapper ───────────────────────────────────────────────────── */
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

/* ─── Section heading ──────────────────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{children}</h2>
  );
}

/* ─── Competitor grid (dark) ───────────────────────────────────────────────── */
function CompetitorGrid({ competitors }: { competitors: Competitor[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? competitors : competitors.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Nearby Competitors ({competitors.length})</h3>
        {competitors.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-white/30 hover:text-white"
          >
            {showAll ? "Show less" : `Show all ${competitors.length}`}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((c, i) => (
          <GlassCard key={i} className="p-4">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <Building2 className="h-4 w-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{c.name}</div>
                <div className="text-xs capitalize text-slate-500">{c.type.replace(/_/g, " ")}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatDistance(c.distanceMeters)}
              </div>
              {c.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{c.rating}</span>
                  {c.userRatingsTotal && (
                    <span className="text-slate-500">({c.userRatingsTotal.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
            <div className="mt-1 truncate text-xs text-slate-500">{c.vicinity}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated section wrapper ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── DashboardPage ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile]       = useState<BusinessProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState("");

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

  const consultNum = profile
    ? allProfiles.findIndex((p) => p.id === profile.id) + 1 || 1
    : null;

  /* ── Loading state (dark skeleton) ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="container py-16">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-xl bg-white/5" />
            <div className="h-4 w-72 animate-pulse rounded-xl bg-white/5" />
            <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
              <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ─────────────────────────────────────────────────────────── */
  if (error || !profile || !profile.analysisResult) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-slate-400">{error || "Analysis not available."}</p>
          <Link
            to="/history"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900"
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Zone banner — above navbar, full-width gradient strip */}
      {result.zone && <ZoneBanner zone={result.zone} />}

      <Navbar consultLabel={consultNum ? `Consult #${consultNum}` : "Consult"} />

      {/* Sticky dark info header */}
      <div className="sticky top-14 z-20 border-b border-white/[0.06] bg-slate-900/90 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/history"
              className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Analyses
            </Link>
            <h1 className="font-display text-2xl font-black text-white sm:text-3xl">{profile.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 font-medium text-slate-300">
                {profile.category}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {result.address || `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {competitors.length} competitors
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

        {/* Hero grid: Score (left) + Map + Stats (right) */}
        <div className="container py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">

            {/* Left column */}
            <div className="space-y-6">
              <FadeUp delay={0}>
                <GlassCard className="p-6 sm:p-8">
                  <ScoreDisplay
                    score={result.successScore}
                    breakdown={result.scoreBreakdown}
                    summary={result.summary}
                  />
                </GlassCard>
              </FadeUp>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <FadeUp delay={0.08}>
                <GlassCard className="overflow-hidden">
                  <div className="p-4 pb-0">
                    <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Competitor Map
                    </div>
                  </div>
                  <CompetitorMap
                    latitude={profile.latitude}
                    longitude={profile.longitude}
                    radiusMeters={profile.radiusMeters}
                    competitors={competitors}
                    zone={result.zone}
                  />
                  <div className="p-4 pt-0" />
                </GlassCard>
              </FadeUp>

              <FadeUp delay={0.16}>
                <GlassCard className="p-5">
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Quick Stats
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Users,      label: "Competitors", value: competitors.length },
                      { icon: MapPin,     label: "Radius",      value: `${(profile.radiusMeters / 1000).toFixed(1)}km` },
                      { icon: TrendingUp, label: "Appeal",      value: `${result.scoreBreakdown.locationAppeal}/100` },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                        <stat.icon className="mx-auto mb-1.5 h-4 w-4 text-slate-500" />
                        <div className="text-lg font-bold text-white">{stat.value}</div>
                        <div className="text-[10px] text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeUp>
            </div>
          </div>
        </div>

        {/* SWOT */}
        <FadeUp delay={0.24}>
          <div className="border-t border-white/[0.06] py-10">
            <div className="container space-y-6">
              <SectionHeading>SWOT Analysis</SectionHeading>
              <SwotCard swot={result.swot} />
            </div>
          </div>
        </FadeUp>

        {/* Roadmap */}
        <FadeUp delay={0.32}>
          <div className="border-t border-white/[0.06] py-10">
            <div className="container space-y-6">
              <SectionHeading>Strategic Roadmap</SectionHeading>
              <RoadmapCard roadmap={result.strategicRoadmap} />
            </div>
          </div>
        </FadeUp>

        {/* Competitor grid */}
        <FadeUp delay={0.4}>
          <div className="border-t border-white/[0.06] py-10">
            <div className="container space-y-6">
              <SectionHeading>Competitor Landscape</SectionHeading>
              <CompetitorGrid competitors={competitors} />
            </div>
          </div>
        </FadeUp>

        {/* Product catalog */}
        {profile.products.length > 0 && (
          <FadeUp delay={0.48}>
            <div className="border-t border-white/[0.06] py-10">
              <div className="container space-y-6">
                <SectionHeading>Product Catalog</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.products.map((p, i) => (
                    <GlassCard key={i} className="flex items-center justify-between px-5 py-4">
                      <span className="font-medium text-sm text-white">{p.name}</span>
                      <span className="text-sm text-slate-400">{formatPrice(p.price)}</span>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        <div className="h-16" />
      </motion.div>
    </div>
  );
}
