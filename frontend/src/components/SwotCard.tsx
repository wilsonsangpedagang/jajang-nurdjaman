import type { SwotAnalysis } from "@/types";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

interface SwotCardProps {
  swot: SwotAnalysis;
}

const QUADRANTS = [
  {
    key:        "strengths" as const,
    label:      "Strengths",
    icon:       TrendingUp,
    accentText: "text-emerald-400",
    accentBg:   "bg-emerald-500/10",
    borderLeft: "border-l-emerald-500",
    bullet:     "bg-emerald-400",
  },
  {
    key:        "weaknesses" as const,
    label:      "Weaknesses",
    icon:       TrendingDown,
    accentText: "text-rose-400",
    accentBg:   "bg-rose-500/10",
    borderLeft: "border-l-rose-500",
    bullet:     "bg-rose-400",
  },
  {
    key:        "opportunities" as const,
    label:      "Opportunities",
    icon:       Zap,
    accentText: "text-violet-400",
    accentBg:   "bg-violet-500/10",
    borderLeft: "border-l-violet-500",
    bullet:     "bg-violet-400",
  },
  {
    key:        "threats" as const,
    label:      "Threats",
    icon:       AlertTriangle,
    accentText: "text-orange-400",
    accentBg:   "bg-orange-500/10",
    borderLeft: "border-l-orange-400",
    bullet:     "bg-orange-400",
  },
];

export default function SwotCard({ swot }: SwotCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {QUADRANTS.map((q) => (
        <div
          key={q.key}
          className={`rounded-2xl border border-white/10 border-l-4 ${q.borderLeft} bg-white/5 p-6 backdrop-blur-xl`}
        >
          {/* Header */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${q.accentBg}`}>
              <q.icon className={`h-4 w-4 ${q.accentText}`} />
            </div>
            <span className={`text-sm font-bold ${q.accentText}`}>{q.label}</span>
          </div>

          {/* Items */}
          <ul className="space-y-2.5">
            {swot[q.key].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className={`mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${q.bullet}`} />
                <span className="leading-relaxed text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
