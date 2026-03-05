import { useWizard } from "@/contexts/WizardContext";
import Navbar from "@/components/Navbar";
import Step1Category from "./wizard/Step1Category";
import Step2Products from "./wizard/Step2Products";
import Step3Location from "./wizard/Step3Location";
import Step4Goals from "./wizard/Step4Goals";
import Step5Summary from "./wizard/Step5Summary";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const STEPS = [
  { num: 1, label: "Business" },
  { num: 2, label: "Products" },
  { num: 3, label: "Location" },
  { num: 4, label: "Goals" },
  { num: 5, label: "Confirm" },
];

export default function WizardPage() {
  const { step } = useWizard();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${step > s.num ? "border-primary bg-primary text-primary-foreground" : step === s.num ? "border-primary text-primary" : "border-muted text-muted-foreground"}`}>
                      {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                    </div>
                    <span className={`mt-1.5 hidden text-xs sm:block ${step === s.num ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 transition-all ${step > s.num ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {step === 1 && <Step1Category />}
            {step === 2 && <Step2Products />}
            {step === 3 && <Step3Location />}
            {step === 4 && <Step4Goals />}
            {step === 5 && <Step5Summary />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
