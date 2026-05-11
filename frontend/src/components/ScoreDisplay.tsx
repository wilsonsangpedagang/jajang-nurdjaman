import { useEffect, useRef, useState } from "react";
import type { ScoreBreakdown } from "@/types";
import { getScoreLabel } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  breakdown: ScoreBreakdown;
  summary: string;
}

const BARS = [
  { key: "competitionDensity" as const, label: "Competition Density", fromCls: "from-violet-500/70", toCls: "to-violet-400" },
  { key: "locationAppeal"     as const, label: "Location Appeal",     fromCls: "from-rose-500/70",   toCls: "to-rose-400"   },
  { key: "marketDemand"       as const, label: "Market Demand",       fromCls: "from-sky-500/70",    toCls: "to-sky-400"    },
  { key: "conceptUniqueness"  as const, label: "Concept Uniqueness",  fromCls: "from-amber-500/70",  toCls: "to-amber-400"  },
];

function ScoreRing({ score }: { score: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r    = 88;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const ringColor =
    score >= 70 ? "#22c55e"
    : score >= 45 ? "#f59e0b"
    : "#ef4444";

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDasharray = `0 ${circ}`;
    requestAnimationFrame(() => {
      if (!circleRef.current) return;
      circleRef.current.style.transition = "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)";
      circleRef.current.style.strokeDasharray = `${dash} ${circ}`;
    });
  }, [score, dash, circ]);

  return (
    <div className="relative h-52 w-52 flex-shrink-0">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
        {/* Arc */}
        <circle
          ref={circleRef}
          cx="100" cy="100" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={12}
          strokeLinecap="round"
          filter="url(#ring-glow)"
          style={{ strokeDasharray: `0 ${circ}` }}
        />
      </svg>
      {/* Score inside ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-5xl font-black leading-none tabular-nums"
          style={{ color: ringColor }}
        >
          {score}
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

export default function ScoreDisplay({ score, breakdown, summary }: ScoreDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8">
      {/* Score ring + label */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} />
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            BVI Score
          </div>
          <div
            className="font-display font-black leading-none"
            style={{
              fontSize: "clamp(3.5rem, 9vw, 6rem)",
              color: score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444",
            }}
          >
            {score}%
          </div>
          <div className="mt-1 text-lg font-semibold text-white">Business Viability Index</div>
          <div className="mt-1 text-sm text-slate-400">{getScoreLabel(score)} viability</div>
        </div>
      </div>

      {/* Horizontal bar breakdown */}
      <div>
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          Score Breakdown
        </div>
        <div className="space-y-3.5">
          {BARS.map((bar) => {
            const value = breakdown[bar.key];
            return (
              <div key={bar.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{bar.label}</span>
                  <span className="font-semibold tabular-nums text-white">{value}<span className="text-slate-500">/100</span></span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${bar.fromCls} ${bar.toCls} transition-[width] duration-1000 ease-out`}
                    style={{ width: mounted ? `${value}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">🧠</span>
          <span className="text-sm font-bold text-white">Market Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{summary}</p>
      </div>
    </div>
  );
}
