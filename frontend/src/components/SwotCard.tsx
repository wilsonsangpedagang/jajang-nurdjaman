import type { SwotAnalysis } from "@/types";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

interface SwotCardProps {
  swot: SwotAnalysis;
}

const QUADRANTS = [
  {
    key: "strengths" as const,
    label: "Strengths",
    icon: TrendingUp,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon_bg: "bg-emerald-100",
    bullet: "bg-emerald-500",
  },
  {
    key: "weaknesses" as const,
    label: "Weaknesses",
    icon: TrendingDown,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon_bg: "bg-rose-100",
    bullet: "bg-rose-500",
  },
  {
    key: "opportunities" as const,
    label: "Opportunities",
    icon: Zap,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon_bg: "bg-blue-100",
    bullet: "bg-blue-500",
  },
  {
    key: "threats" as const,
    label: "Threats",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon_bg: "bg-amber-100",
    bullet: "bg-amber-500",
  },
];

export default function SwotCard({ swot }: SwotCardProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">SWOT Analysis</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <div key={q.key} className={`rounded-xl border p-5 ${q.bg} ${q.border}`}>
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${q.icon_bg}`}>
                <q.icon className={`h-4 w-4 ${q.text}`} />
              </div>
              <h3 className={`font-semibold ${q.text}`}>{q.label}</h3>
            </div>
            <ul className="space-y-1.5">
              {swot[q.key].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${q.bullet}`} />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
