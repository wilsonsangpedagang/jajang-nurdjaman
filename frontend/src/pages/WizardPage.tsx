import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "@/contexts/WizardContext";
import { useAuth } from "@/contexts/AuthContext";
import { businessApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Step1Category from "./wizard/Step1Category";
import Step2Products from "./wizard/Step2Products";
import Step3Location from "./wizard/Step3Location";
import Step4Goals from "./wizard/Step4Goals";
import Step5Summary from "./wizard/Step5Summary";
import { LogOut } from "lucide-react";

const STEPS = [
  { num: 1, label: "Business Identity" },
  { num: 2, label: "Products" },
  { num: 3, label: "Location" },
  { num: 4, label: "Goals" },
  { num: 5, label: "Confirm" },
];

/* ─── Right panel: accumulated wizard data summary ───────────────────────── */
function RightPanel() {
  const { data, step } = useWizard();

  const hasProducts = data.products.length > 0;
  const hasLocation = data.latitude !== null && data.longitude !== null;

  return (
    <aside className="hidden w-72 flex-shrink-0 overflow-y-auto bg-charcoal p-6 lg:flex lg:flex-col">
      {/* Business name */}
      {data.name && (
        <div className="mb-5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/40">
            Business
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <div className="text-sm font-semibold text-white">{data.name}</div>
            {data.category && (
              <div className="mt-0.5 text-xs text-white/50">{data.category}</div>
            )}
          </div>
        </div>
      )}

      {/* Product list */}
      {hasProducts && (
        <div className="mb-5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/40">
            Product name(s)
          </div>
          <div className="space-y-2">
            {data.products.map((p, i) => (
              <div key={i} className="rounded-xl bg-white/10 px-4 py-3">
                <div className="text-sm font-semibold text-white">{p.name}</div>
                {p.price > 0 && (
                  <div className="mt-0.5 text-xs text-white/50">
                    {formatPrice(p.price)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {hasLocation && (
        <div className="mb-5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/40">
            Location
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <div className="text-xs text-white/70">
              {data.latitude!.toFixed(5)}, {data.longitude!.toFixed(5)}
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              {(data.radiusMeters / 1000).toFixed(1)} km radius
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      {data.goals.length > 0 && (
        <div className="mb-5">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/40">
            Goals
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.goals.map((g) => (
              <span
                key={g}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data.name && !hasProducts && !hasLocation && data.goals.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-3 text-3xl opacity-30">📋</div>
          <p className="text-xs text-white/30 leading-relaxed">
            Your answers will appear here as you fill in each step.
          </p>
        </div>
      )}

      {/* Step progress */}
      <div className="mt-auto pt-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
          Progress
        </div>
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= s.num ? "bg-white" : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 text-xs text-white/40">
          Step {step} of {STEPS.length}
        </div>
      </div>
    </aside>
  );
}

/* ─── WizardPage ──────────────────────────────────────────────────────────── */
export default function WizardPage() {
  const { step } = useWizard();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [consultNum, setConsultNum] = useState<number | null>(null);

  useEffect(() => {
    businessApi.list()
      .then(({ data }) => setConsultNum((data.profiles?.length ?? 0) + 1))
      .catch(() => setConsultNum(1));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-charcoal">

      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-charcoal px-6">
        <Link
          to="/welcome"
          className="font-display text-base font-black text-white tracking-tight"
        >
          AP-Analytics
        </Link>

        <nav className="flex items-center gap-1">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            Consult #{consultNum ?? "…"}
          </span>
          <Link
            to="/welcome"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Profile
          </Link>
          <Link
            to="/history"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Previous Consults
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-white/40 sm:block">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── 3-panel body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — step indicator */}
        <aside className="hidden w-52 flex-shrink-0 flex-col border-r border-white/10 bg-charcoal p-6 lg:flex">
          {/* Avatar placeholder */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl">
              🧑‍💼
            </div>
            <span className="text-center text-xs font-medium text-white/50">
              {user?.name?.split(" ")[0]}
            </span>
          </div>

          {/* Step list */}
          <nav className="space-y-1">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  step === s.num
                    ? "bg-white/15 text-white"
                    : step > s.num
                    ? "text-white/40"
                    : "text-white/20"
                }`}
              >
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step > s.num
                      ? "bg-white text-charcoal"
                      : step === s.num
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/30"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className="text-xs font-medium leading-tight">{s.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Center — form area */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-2xl px-6 py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {step === 1 && <Step1Category />}
                {step === 2 && <Step2Products />}
                {step === 3 && <Step3Location />}
                {step === 4 && <Step4Goals />}
                {step === 5 && <Step5Summary />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Right panel — live summary */}
        <RightPanel />
      </div>
    </div>
  );
}
