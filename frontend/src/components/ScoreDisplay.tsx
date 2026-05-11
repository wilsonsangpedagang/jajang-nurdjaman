import { useEffect, useRef } from "react";
import type { ScoreBreakdown } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { getScoreLabel } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  breakdown: ScoreBreakdown;
  summary: string;
}

/* Breakdown → bar chart data with colours matching the mockup */
function buildBarData(breakdown: ScoreBreakdown) {
  return [
    { label: "COMP\nDENSITY",    shortLabel: "Comp Density",    value: breakdown.competitionDensity, color: "hsl(var(--bar-lavender))" },
    { label: "LOCATION\nAPPEAL", shortLabel: "Location Appeal", value: breakdown.locationAppeal,     color: "hsl(var(--bar-rose))"     },
    { label: "CONCEPT\nUNIQUE.", shortLabel: "Concept Unique.", value: breakdown.conceptUniqueness,  color: "hsl(var(--bar-plum))"     },
    { label: "MARKET\nDEMAND",   shortLabel: "Market Demand",   value: breakdown.marketDemand,       color: "hsl(var(--bar-lavender))" },
  ];
}

/* Custom tooltip */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { shortLabel: string }; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-card-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{payload[0].payload.shortLabel}</div>
      <div className="text-muted-foreground">{payload[0].value} / 100</div>
    </div>
  );
}

/* Custom X-axis tick — wrap multi-line labels */
function CustomTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!x || !y || !payload) return null;
  const lines = payload.value.split("\n");
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={0}
          dy={12 + i * 12}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={9}
          fontWeight={600}
          letterSpacing={0.5}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* Animated donut component */
function ScoreDonut({ score }: { score: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r     = 82;
  const circ  = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;

  /* Olive for viable, orange for moderate, rose for risk */
  const ringColor =
    score >= 70
      ? "hsl(var(--olive))"
      : score >= 45
      ? "hsl(var(--bvi-orange))"
      : "hsl(0 84% 60%)";

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDasharray = `0 ${circ}`;
    requestAnimationFrame(() => {
      if (!circleRef.current) return;
      circleRef.current.style.transition = "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)";
      circleRef.current.style.strokeDasharray = `${dash} ${circ}`;
    });
  }, [score, dash, circ]);

  return (
    <div className="relative h-52 w-52 flex-shrink-0">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke="hsl(var(--cream))"
          strokeWidth="18"
        />
        <circle
          ref={circleRef}
          cx="100" cy="100" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="18"
          strokeLinecap="round"
          style={{ strokeDasharray: `${dash} ${circ}` }}
        />
      </svg>
      {/* Score text — inside the donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="font-display text-2xl font-black leading-none text-foreground/30">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

export default function ScoreDisplay({ score, breakdown, summary }: ScoreDisplayProps) {
  const barData = buildBarData(breakdown);

  return (
    <div className="space-y-8">
      {/* ── Giant score row ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <ScoreDonut score={score} />
        <div>
          <div
            className="font-display leading-none font-black"
            style={{
              fontSize: "clamp(4rem, 10vw, 8rem)",
              color:
                score >= 70
                  ? "hsl(var(--olive))"
                  : score >= 45
                  ? "hsl(var(--bvi-orange))"
                  : "hsl(0 84% 60%)",
            }}
          >
            {score}%
          </div>
          <div className="mt-1 text-2xl font-bold text-foreground">BVI Score</div>
          <div className="mt-2 text-sm text-muted-foreground">{getScoreLabel(score)} viability</div>
        </div>
      </div>

      {/* ── Bar chart breakdown ─────────────────────────────────────────── */}
      <div>
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Score Breakdown
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top: 8, right: 0, left: -28, bottom: 24 }} barCategoryGap="22%">
            <XAxis
              dataKey="label"
              tick={CustomTick as unknown as React.ReactElement}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 8 }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── AI summary ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-card-border bg-white p-6">
        <div className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
          <span>🧠</span>
          <span>Critical<br />Market Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      </div>
    </div>
  );
}
