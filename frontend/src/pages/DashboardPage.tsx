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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Star, ArrowLeft, Download, Calendar, Building2 } from "lucide-react";
import { formatDistance, formatPrice } from "@/lib/utils";

function CompetitorGrid({ competitors }: { competitors: Competitor[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? competitors : competitors.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Nearby Competitors ({competitors.length})</h3>
        {competitors.length > 8 && (
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show less" : `Show all ${competitors.length}`}
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((c, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <div className="flex items-start gap-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Building2 className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{c.type.replace(/_/g, " ")}</div>
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
                  {c.userRatingsTotal && <span className="text-muted-foreground">({c.userRatingsTotal.toLocaleString()})</span>}
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

export default function DashboardPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileId) return;
    businessApi.get(profileId)
      .then(({ data }) => setProfile(data.profile))
      .catch(() => setError("Failed to load analysis results."))
      .finally(() => setIsLoading(false));
  }, [profileId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading your analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !profile.analysisResult) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">{error || "Analysis not available."}</p>
          <Button className="mt-4" asChild><Link to="/history">Back to History</Link></Button>
        </div>
      </div>
    );
  }

  const result = profile.analysisResult as AnalysisResult;
  const competitors = result.competitors || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground" asChild>
                <Link to="/history"><ArrowLeft className="h-4 w-4" /> All Analyses</Link>
              </Button>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{profile.category}</Badge>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{result.address || `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{competitors.length} competitors found</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="swot">SWOT</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-8">
              <ScoreDisplay score={result.successScore} breakdown={result.scoreBreakdown} summary={result.summary} />
              <SwotCard swot={result.swot} />
              <RoadmapCard roadmap={result.strategicRoadmap} />
            </TabsContent>

            <TabsContent value="swot" className="mt-6">
              <SwotCard swot={result.swot} />
            </TabsContent>

            <TabsContent value="competitors" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <CompetitorMap latitude={profile.latitude} longitude={profile.longitude} radiusMeters={profile.radiusMeters} competitors={competitors} />
                </CardContent>
              </Card>
              <CompetitorGrid competitors={competitors} />
            </TabsContent>

            <TabsContent value="roadmap" className="mt-6 space-y-6">
              <RoadmapCard roadmap={result.strategicRoadmap} />
              <Card>
                <CardHeader>
                  <CardTitle>Your Product Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium text-sm">{p.name}</span>
                        <span className="text-sm text-muted-foreground">{formatPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
