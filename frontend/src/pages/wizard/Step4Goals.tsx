import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { STRATEGIC_GOALS } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Target, CheckCircle } from "lucide-react";
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
    if (goals.length === 0) { setError("Please select at least one strategic goal."); return; }
    updateData({ goals });
    setStep(5);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Strategic Goals</CardTitle>
            <CardDescription>Select your primary objectives — these calibrate how AP Analytics weights your results</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {STRATEGIC_GOALS.map((goal) => {
            const selected = goals.includes(goal.id);
            return (
              <button key={goal.id} onClick={() => toggleGoal(goal.id)} className={cn("relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary", selected ? "border-primary bg-primary/5" : "")}>
                <div className={cn("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all", selected ? "border-primary bg-primary text-primary-foreground" : "border-muted")}>
                  {selected && <CheckCircle className="h-3 w-3" />}
                </div>
                <div>
                  <div className="font-medium text-sm">{goal.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {goals.length > 0 && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Selected: {goals.map((g) => STRATEGIC_GOALS.find((s) => s.id === g)?.label).filter(Boolean).join(" · ")}
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext}>
            Review Summary <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
