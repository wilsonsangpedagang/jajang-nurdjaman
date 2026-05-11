import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [searchParams]  = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const { login, register }         = useAuth();
  const navigate                    = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/welcome");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; errors?: Array<{ msg: string }> } } })?.response?.data;
      const msg = data?.error ?? data?.errors?.[0]?.msg;
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Left decorative panel (desktop only) ─────────────────────── */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-charcoal lg:flex">
        {/* Sticky note decoration */}
        <div className="absolute right-10 top-16 rotate-2">
          <div className="relative w-44 bg-sticky-yellow p-4 pt-7 shadow-xl">
            <div className="absolute left-1/2 top-2.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-red-500 shadow" />
            <p className="font-handwritten text-lg italic leading-snug text-gray-800">
              Your business consultant, ready when you are!
            </p>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="font-display text-5xl font-black text-white">AP-Analytics</h1>
          <p className="mt-3 text-sm text-white/50">take care of your business!</p>
        </div>

        {/* Bottom mini-card */}
        <div className="absolute bottom-12 left-10 -rotate-2">
          <div className="w-44 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
            <div className="text-3xl font-black text-white/20">BVI</div>
            <p className="mt-1 text-xs text-white/30">Business Viability Index</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Back link */}
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "register" : "login"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Heading */}
              <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                {isRegister ? "Create account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isRegister
                  ? "Start analyzing business locations with AI."
                  : "Sign in to your AP Analytics account."}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {isRegister && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isRegister ? "Min. 8 characters" : "Your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={isRegister ? 8 : 1}
                      className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 pr-11 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isRegister ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => { setIsRegister(!isRegister); setError(""); }}
                  className="font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  {isRegister ? "Sign in" : "Sign up for free"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
