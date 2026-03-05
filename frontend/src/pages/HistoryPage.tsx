import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { businessApi } from "@/lib/api";
import type { BusinessProfile } from "@/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ArrowRight, PlusCircle, Trash2, BarChart3 } from "lucide-react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

function StatusBadge({ status }: { status: BusinessProfile["status"] }) {
  const variants: Record<BusinessProfile["status"], "success" | "warning" | "danger" | "secondary"> = {
    COMPLETED: "success",
    PROCESSING: "warning",
    FAILED: "danger",
    PENDING: "secondary",
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
}

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="mt-1 text-muted-foreground">All your business location analyses</p>
          </div>
          <Button asChild>
            <Link to="/survey"><PlusCircle className="h-4 w-4" /> New Survey</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 text-center">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No analyses yet</h2>
            <p className="mt-2 text-muted-foreground">Run your first survey to see results here</p>
            <Button className="mt-6" asChild>
              <Link to="/survey">Start Your First Analysis</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, i) => {
              const result = profile.analysisResult as AnalysisResult | null;
              const score = result?.successScore;
              return (
                <motion.div key={profile.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="group transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate font-semibold">{profile.name}</h3>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{profile.category}</Badge>
                            <StatusBadge status={profile.status} />
                          </div>
                        </div>
                        {score !== undefined && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
                            <div className="text-xs text-muted-foreground">{getScoreLabel(score)}</div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{result?.address || `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {profile.status === "COMPLETED" ? (
                          <Button size="sm" asChild>
                            <Link to={`/dashboard/${profile.id}`}>View Report <ArrowRight className="h-3.5 w-3.5" /></Link>
                          </Button>
                        ) : (
                          <Badge variant={profile.status === "FAILED" ? "danger" : "warning"}>{profile.status}</Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
