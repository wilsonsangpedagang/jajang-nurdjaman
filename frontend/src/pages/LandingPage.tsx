import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, MapPin, Brain, TrendingUp, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MapPin, title: "Location Intelligence", desc: "Drop a pin and instantly scan your competitive landscape within a custom radius." },
  { icon: Brain, title: "AI-Powered SWOT", desc: "Gemini AI analyzes competitors and generates comprehensive SWOT reports tailored to your business." },
  { icon: TrendingUp, title: "Success Score", desc: "Get a predictive viability score based on competition density and location characteristics." },
  { icon: Zap, title: "Strategic Roadmap", desc: "Receive actionable recommendations for differentiation, pricing, and marketing strategies." },
  { icon: Shield, title: "Data-Driven Decisions", desc: "Backed by real-time Google Places data for accurate competitor intelligence." },
  { icon: BarChart3, title: "Visual Analytics", desc: "Beautiful charts and dashboards to communicate insights clearly." },
];

const steps = [
  { num: "01", title: "Describe Your Business", desc: "Enter your category, concept, and product catalog." },
  { num: "02", title: "Drop Your Pin", desc: "Select your intended location on an interactive map." },
  { num: "03", title: "Set Your Radius", desc: "Define your competitive impact zone from 0.5km to 10km." },
  { num: "04", title: "Get AI Insights", desc: "Receive your full analytics dashboard instantly." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            AP Analytics
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth?mode=register">Get Started <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </nav>

      <section className="container py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI-Powered Business Location Analysis
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Know Before You <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Open</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AP Analytics is your AI-powered business surveyor. Evaluate any location's viability, analyze your competition, and get a strategic roadmap — before you sign the lease.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth?mode=register">Start Free Analysis <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Real-time competitor data", "AI-generated insights"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y bg-muted/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Four simple steps to your business intelligence report</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="relative">
                <div className="text-5xl font-bold text-muted-foreground/20">{step.num}</div>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Everything You Need to Decide</h2>
          <p className="mt-3 text-muted-foreground">Comprehensive analytics in one platform</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Ready to Analyze Your Location?</h2>
          <p className="mt-3 text-primary-foreground/70">Join entrepreneurs who make data-driven location decisions</p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link to="/auth?mode=register">Get Started for Free <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            AP Analytics
          </div>
          <p>© 2026 AP Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
