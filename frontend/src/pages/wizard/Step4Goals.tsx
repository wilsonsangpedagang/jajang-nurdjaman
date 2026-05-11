import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { STRATEGIC_GOALS } from "@/types";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Step4Goals() {
  const { data, updateData, setStep } = useWizard();
  const [goals, setGoals] = useState<string[]>(data.goals);
  const [error, setError] = useState("");

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
    setError("");
  };

  const handleNext = () => {
    if (goals.length === 0) {
      setError("Please select at least one strategic goal.");
      return;
    }
    updateData({ goals });
    setStep(5);
  };

  return (
    <div className="space-y-8">
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">What are your strategic goals?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your primary objectives — these calibrate how AP Analytics weights your results.
        </p>
      </div>

      {/* ── Goal grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {STRATEGIC_GOALS.map((goal) => {
          const selected = goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                selected
                  ? "border-foreground bg-foreground/5 shadow-sm"
                  : "border-card-border bg-white hover:border-foreground/20"
              )}
            >
              {/* Checkbox circle */}
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  selected ? "border-foreground bg-foreground" : "border-muted-foreground/30"
                )}
              >
                {selected && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{goal.label}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {goal.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected summary ────────────────────────────────────────────── */}
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {goals.map((g) => (
            <span
              key={g}
              className="rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground"
            >
              {STRATEGIC_GOALS.find((s) => s.id === g)?.label || g}
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 rounded-full border border-card-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Review Summary <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
