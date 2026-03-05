import { createContext, useContext, useState, ReactNode } from "react";
import type { WizardData, Product } from "@/types";

interface WizardContextType {
  data: WizardData;
  step: number;
  setStep: (step: number) => void;
  updateData: (partial: Partial<WizardData>) => void;
  reset: () => void;
}

const defaultData: WizardData = {
  name: "",
  category: "",
  concept: "",
  products: [],
  goals: [],
  latitude: null,
  longitude: null,
  radiusMeters: 2000,
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(defaultData);
  const [step, setStep] = useState(1);

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const reset = () => {
    setData(defaultData);
    setStep(1);
  };

  return (
    <WizardContext.Provider value={{ data, step, setStep, updateData, reset }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

export type { Product };
