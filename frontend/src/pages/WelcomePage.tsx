import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { MapPin, Brain, BarChart3, Target, ArrowRight } from "lucide-react";

const surveySteps = [
  {
    icon:  Target,
    emoji: "🎯",
    title: "Business Identity",
    desc:  "Tell us about your business category, concept, and key offerings.",
  },
  {
    icon:  MapPin,
    emoji: "📍",
    title: "Location Selection",
    desc:  "Drop a pin on your intended location and set your competitive radius.",
  },
  {
    icon:  BarChart3,
    emoji: "📊",
    title: "Strategic Goals",
    desc:  "Select your primary business objectives to calibrate AI weighting.",
  },
  {
    icon:  Brain,
    emoji: "🧠",
    title: "AI Analysis",
    desc:  "Our AI scans competitors and generates your full analytics report.",
  },
];

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="container py-20">
        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-block rounded-full border border-card-border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground">
            AI Business Location Surveyor
          </div>
          <h1 className="font-display text-4xl font-black text-foreground sm:text-5xl">
            Welcome back,{" "}
            <span className="text-bvi-orange">
              {user?.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            AP Analytics evaluates the viability of your new business location using real competitor
            data and AI-generated strategic insights. Here&rsquo;s how the survey works:
          </p>
        </motion.div>

        {/* ── Step cards ────────────────────────────────────────────────── */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {surveySteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-card-border bg-white p-6 text-center"
            >
              <div className="mb-3 text-3xl">{step.emoji}</div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Step {i + 1}
              </div>
              <h3 className="font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <Link
            to="/survey"
            className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-80"
          >
            Start New Survey <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/history"
            className="rounded-full border border-card-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            View Past Analyses
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
