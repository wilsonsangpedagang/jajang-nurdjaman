import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { BUSINESS_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  "Food & Beverage": "🍽️",
  Retail: "🛍️",
  Beauty: "💅",
  Health: "🏥",
  Education: "📚",
  Entertainment: "🎭",
  Services: "🔧",
  Technology: "💻",
};

export default function Step1Category() {
  const { data, updateData, setStep } = useWizard();
  const [name, setName] = useState(data.name);
  const [category, setCategory] = useState(data.category);
  const [concept, setConcept] = useState(data.concept);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!name.trim()) { setError("Please enter your business name."); return; }
    if (!category) { setError("Please select a business category."); return; }
    if (!concept.trim()) { setError("Please describe your business concept."); return; }
    updateData({ name: name.trim(), category, concept: concept.trim() });
    setStep(2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Business Identity</CardTitle>
            <CardDescription>Tell us about your business concept</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="biz-name">Business Name</Label>
          <Input id="biz-name" placeholder="e.g. Warung Kopi Nusantara" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Business Category</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BUSINESS_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-sm font-medium transition-all hover:border-primary", category === cat ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground")}>
                <span className="text-2xl">{CATEGORY_ICONS[cat] || "🏢"}</span>
                <span className="leading-tight">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="concept">Business Concept</Label>
          <textarea id="concept" placeholder="Describe your business idea in 2-3 sentences. e.g. A specialty coffee shop focusing on single-origin Indonesian beans with a cozy co-working atmosphere..." value={concept} onChange={(e) => setConcept(e.target.value)} rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button onClick={handleNext}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
