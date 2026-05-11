import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─── Decorative: sticky note (top-right) ─────────────────────────────────── */
function StickyNote() {
  return (
    <div className="animate-float-sticky pointer-events-none absolute right-10 top-10 z-10 hidden lg:block xl:right-20">
      <div className="relative w-56 bg-sticky-yellow p-5 pt-8 shadow-2xl">
        {/* Push-pin */}
        <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 shadow-md" />
        <p className="font-handwritten text-[1.35rem] leading-snug text-gray-800 italic">
          Input your business details and get amazing analysis directly!
        </p>
      </div>
    </div>
  );
}

/* ─── Decorative: mini BVI preview card (bottom-left) ────────────────────── */
function MiniScoreCard() {
  const pct = 54;
  const r   = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="animate-float pointer-events-none absolute bottom-12 left-8 z-10 hidden lg:block xl:left-16">
      <div className="w-48 rounded-2xl border border-card-border bg-white p-4 shadow-xl">
        {/* Mini donut */}
        <div className="relative mx-auto h-16 w-16">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f0ebe0" strokeWidth="13" />
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="hsl(var(--bvi-orange))"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-bvi-orange">{pct}%</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-xs font-bold text-bvi-orange">Moderately Hard</div>
          <p className="mt-1 text-xs leading-tight text-muted-foreground line-clamp-3">
            The area shows noticeable competition due to nearby similar businesses. Entry is still possible, but differentiation will be important to stand out.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature cards data ──────────────────────────────────────────────────── */
const features = [
  { emoji: "📍", title: "Location Intelligence", desc: "Drop a pin and instantly scan your competitive landscape within a custom radius." },
  { emoji: "🧠", title: "AI-Powered SWOT", desc: "Gemini AI analyzes competitors and generates comprehensive SWOT reports tailored to your business." },
  { emoji: "📈", title: "Success Score", desc: "Get a predictive viability score based on competition density and location characteristics." },
  { emoji: "⚡", title: "Strategic Roadmap", desc: "Receive actionable recommendations for differentiation, pricing, and marketing strategies." },
  { emoji: "🛡️", title: "Data-Driven Decisions", desc: "Backed by real-time Google Places data for accurate competitor intelligence." },
  { emoji: "📊", title: "Visual Analytics", desc: "Beautiful charts and dashboards to communicate insights clearly." },
];

const steps = [
  { num: "01", title: "Describe Your Business", desc: "Enter your category, concept, and product catalog." },
  { num: "02", title: "Drop Your Pin", desc: "Select your intended location on an interactive map." },
  { num: "03", title: "Set Your Radius", desc: "Define your competitive impact zone from 0.5 km to 10 km." },
  { num: "04", title: "Get AI Insights", desc: "Receive your full analytics dashboard instantly." },
];

/* ─── Landing page ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar (landing-specific, white bg) ───────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-card-border bg-white/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-display text-lg font-black tracking-tight text-foreground">
            AP-Analytics
          </span>
          <div className="flex items-center gap-4">
            <Link
              to="/history"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Past Consults
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-full border border-foreground px-5 py-1.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-white"
            >
              Log In
            </Link>
            <Link
              to="/auth?mode=register"
              className="rounded-full bg-foreground px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <StickyNote />
        <MiniScoreCard />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-0"
        >
          <h1 className="font-display text-7xl font-black leading-none tracking-tight text-foreground sm:text-8xl lg:text-9xl">
            AP-Analytics
          </h1>
          <p className="mt-3 text-xl font-bold tracking-wide text-foreground sm:text-2xl">
            take care of your business!
          </p>
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted-foreground">
            A free-to-use web service that acts as your personal business consultant factoring in the important details!
          </p>
          <Link
            to="/auth?mode=register"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-80"
          >
            Get Your Consult Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="border-t border-card-border bg-white py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-4xl font-black text-foreground sm:text-5xl">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four simple steps to your business intelligence report
            </p>
          </motion.div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="font-display text-6xl font-black text-foreground/10 leading-none">
                  {step.num}
                </div>
                <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="border-t border-card-border bg-cream py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-4xl font-black text-foreground sm:text-5xl">
              Everything You Need to Decide
            </h2>
            <p className="mt-3 text-muted-foreground">
              Comprehensive analytics in one platform
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-card-border bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-3xl">{f.emoji}</div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      <section className="border-t border-card-border bg-charcoal py-24">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
              Ready to Analyze Your Location?
            </h2>
            <p className="mt-3 text-white/60">
              Join entrepreneurs who make data-driven location decisions
            </p>
            <Link
              to="/auth?mode=register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-charcoal transition-opacity hover:opacity-90"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-card-border bg-white py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display font-black tracking-tight text-foreground">
            AP-Analytics
          </span>
          <p>© 2026 AP Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
