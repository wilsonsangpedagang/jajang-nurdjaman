import type { StrategicRoadmap } from "@/types";
import { Lightbulb, DollarSign, Megaphone } from "lucide-react";

interface RoadmapCardProps {
  roadmap: StrategicRoadmap;
}

const SECTIONS = [
  {
    key:      "differentiation" as const,
    label:    "Product Differentiation",
    icon:     Lightbulb,
    accent:   "text-bar-plum",
    iconBg:   "bg-bar-lavender/20",
    numBg:    "bg-bar-lavender/20 text-bar-plum",
  },
  {
    key:      "pricing" as const,
    label:    "Pricing Strategy",
    icon:     DollarSign,
    accent:   "text-emerald-600",
    iconBg:   "bg-emerald-50",
    numBg:    "bg-emerald-50 text-emerald-600",
  },
  {
    key:      "marketing" as const,
    label:    "Marketing & Visibility",
    icon:     Megaphone,
    accent:   "text-bvi-orange",
    iconBg:   "bg-sticky-yellow/30",
    numBg:    "bg-sticky-yellow/30 text-bvi-orange",
  },
];

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {SECTIONS.map((section) => (
        <div
          key={section.key}
          className="rounded-2xl border border-card-border bg-white p-6"
        >
          {/* Header */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.iconBg}`}>
              <section.icon className={`h-4 w-4 ${section.accent}`} />
            </div>
            <h3 className={`text-sm font-bold ${section.accent}`}>{section.label}</h3>
          </div>

          {/* Steps */}
          <ol className="space-y-3.5">
            {roadmap[section.key].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${section.numBg}`}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-foreground/80">{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
