import type { SwotAnalysis } from "@/types";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

interface SwotCardProps {
  swot: SwotAnalysis;
}

const QUADRANTS = [
  {
    key:       "strengths" as const,
    label:     "Strengths",
    icon:      TrendingUp,
    cardBg:    "bg-white",
    accent:    "text-emerald-600",
    iconBg:    "bg-emerald-50",
    bullet:    "bg-emerald-400",
    tag:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key:       "weaknesses" as const,
    label:     "Weaknesses",
    icon:      TrendingDown,
    cardBg:    "bg-white",
    accent:    "text-rose-600",
    iconBg:    "bg-rose-50",
    bullet:    "bg-rose-400",
    tag:       "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    key:       "opportunities" as const,
    label:     "Opportunities",
    icon:      Zap,
    cardBg:    "bg-white",
    accent:    "text-bar-plum",
    iconBg:    "bg-bar-lavender/20",
    bullet:    "bg-bar-lavender",
    tag:       "bg-bar-lavender/20 text-bar-plum border-bar-lavender/40",
  },
  {
    key:       "threats" as const,
    label:     "Threats",
    icon:      AlertTriangle,
    cardBg:    "bg-white",
    accent:    "text-bvi-orange",
    iconBg:    "bg-sticky-yellow/30",
    bullet:    "bg-bvi-orange",
    tag:       "bg-sticky-yellow/30 text-bvi-orange border-sticky-yellow/50",
  },
];

export default function SwotCard({ swot }: SwotCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {QUADRANTS.map((q) => (
        <div
          key={q.key}
          className={`rounded-2xl border border-card-border ${q.cardBg} p-6`}
        >
          {/* Header */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${q.iconBg}`}>
              <q.icon className={`h-4 w-4 ${q.accent}`} />
            </div>
            <span className={`text-sm font-bold ${q.accent}`}>{q.label}</span>
          </div>

          {/* Items */}
          <ul className="space-y-2">
            {swot[q.key].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${q.bullet}`} />
                <span className="leading-relaxed text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
