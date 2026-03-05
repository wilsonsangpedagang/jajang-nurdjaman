import type { ScoreBreakdown } from "@/types";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getScoreColor, getScoreBg, getScoreLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  breakdown: ScoreBreakdown;
  summary: string;
}

export default function ScoreDisplay({ score, breakdown, summary }: ScoreDisplayProps) {
  const radarData = [
    { subject: "Low Competition", value: breakdown.competitionDensity },
    { subject: "Location Appeal", value: breakdown.locationAppeal },
    { subject: "Market Demand", value: breakdown.marketDemand },
    { subject: "Concept Uniqueness", value: breakdown.conceptUniqueness },
  ];

  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBg(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Business Viability Score</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
          <div className="relative mb-4">
            <svg viewBox="0 0 200 200" className="h-48 w-48 -rotate-90">
              <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
              <circle
                cx="100" cy="100" r="80"
                fill="none"
                stroke={score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#f43f5e"}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 502.65} 502.65`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-5xl font-bold", scoreColor)}>{score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className={cn("inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-white", scoreBg)}>
            {scoreLabel}
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-center">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Tooltip formatter={(value: number) => [`${value}/100`]} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {radarData.map((item) => (
              <div key={item.subject} className="rounded-lg bg-muted/50 p-2.5 text-center">
                <div className={cn("text-lg font-bold", getScoreColor(item.value))}>{item.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{item.subject}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
