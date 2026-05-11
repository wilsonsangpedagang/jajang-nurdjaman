import type { StrategicRoadmap } from "@/types";
import { Lightbulb, DollarSign, Megaphone } from "lucide-react";

interface RoadmapCardProps {
  roadmap: StrategicRoadmap;
}

const SECTIONS = [
  {
    key:       "differentiation" as const,
    label:     "Product Differentiation",
    icon:      Lightbulb,
    accentText:  "text-violet-400",
    accentBg:    "bg-violet-500/10",
    nodeBg:      "bg-violet-500/20 text-violet-300",
    lineCls:     "bg-violet-500/20",
    pillBorder:  "border-violet-500/30",
  },
  {
    key:       "pricing" as const,
    label:     "Pricing Strategy",
    icon:      DollarSign,
    accentText:  "text-emerald-400",
    accentBg:    "bg-emerald-500/10",
    nodeBg:      "bg-emerald-500/20 text-emerald-300",
    lineCls:     "bg-emerald-500/20",
    pillBorder:  "border-emerald-500/30",
  },
  {
    key:       "marketing" as const,
    label:     "Marketing & Visibility",
    icon:      Megaphone,
    accentText:  "text-orange-400",
    accentBg:    "bg-orange-500/10",
    nodeBg:      "bg-orange-500/20 text-orange-300",
    lineCls:     "bg-orange-500/20",
    pillBorder:  "border-orange-500/30",
  },
];

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {SECTIONS.map((section) => (
        <div
          key={section.key}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          {/* Column header */}
          <div className={`mb-5 flex items-center gap-2 rounded-full border ${section.pillBorder} ${section.accentBg} px-3 py-1.5 w-fit`}>
            <section.icon className={`h-3.5 w-3.5 ${section.accentText}`} />
            <span className={`text-xs font-bold ${section.accentText}`}>{section.label}</span>
          </div>

          {/* Timeline steps */}
          <ol className="space-y-0">
            {roadmap[section.key].map((tip, i) => {
              const isLast = i === roadmap[section.key].length - 1;
              return (
                <li key={i} className="relative flex gap-3 pb-5">
                  {/* Connector line — skip on last item */}
                  {!isLast && (
                    <div className={`absolute left-[10px] top-6 bottom-0 w-0.5 ${section.lineCls}`} />
                  )}
                  {/* Step node */}
                  <div
                    className={`relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${section.nodeBg}`}
                  >
                    {i + 1}
                  </div>
                  {/* Step text */}
                  <span className="pt-0.5 text-sm leading-relaxed text-slate-300">{tip}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
