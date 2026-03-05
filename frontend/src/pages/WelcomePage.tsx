import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Brain, BarChart3, Target, ArrowRight, Sparkles } from "lucide-react";

const surveySteps = [
  { icon: Target, title: "Business Identity", desc: "Tell us about your business category, concept, and key offerings" },
  { icon: MapPin, title: "Location Selection", desc: "Drop a pin on your intended location and set your competitive radius" },
  { icon: BarChart3, title: "Strategic Goals", desc: "Select your primary business objectives to calibrate AI weighting" },
  { icon: Brain, title: "AI Analysis", desc: "Our AI scans competitors and generates your full analytics report" },
];

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI Business Location Surveyor
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AP Analytics evaluates the viability of your new business location using real competitor data and AI-generated strategic insights. Here's how the survey works:
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {surveySteps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full text-center">
                <CardContent className="flex flex-col items-center pt-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 flex flex-col items-center gap-4">
          <Button size="lg" asChild>
            <Link to="/survey">
              Start New Survey <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/history">View Past Analyses</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
