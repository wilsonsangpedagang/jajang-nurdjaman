import type { StrategicRoadmap } from "@/types";
import { Lightbulb, DollarSign, Megaphone } from "lucide-react";

interface RoadmapCardProps {
  roadmap: StrategicRoadmap;
}

const SECTIONS = [
  {
    key: "differentiation" as const,
    label: "Product Differentiation",
    icon: Lightbulb,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon_bg: "bg-violet-100",
    bullet: "text-violet-400",
  },
  {
    key: "pricing" as const,
    label: "Pricing Strategy",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon_bg: "bg-emerald-100",
    bullet: "text-emerald-400",
  },
  {
    key: "marketing" as const,
    label: "Marketing & Visibility",
    icon: Megaphone,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon_bg: "bg-blue-100",
    bullet: "text-blue-400",
  },
];

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Strategic Roadmap</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.key} className={`rounded-xl border p-5 ${section.bg} ${section.border}`}>
            <div className="mb-4 flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${section.icon_bg}`}>
                <section.icon className={`h-4 w-4 ${section.color}`} />
              </div>
              <h3 className={`font-semibold text-sm ${section.color}`}>{section.label}</h3>
            </div>
            <ol className="space-y-3">
              {roadmap[section.key].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm ${section.color}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground/80 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
