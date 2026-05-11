import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import businessRoutes from "./routes/business";
import analyzeRoutes from "./routes/analyze";

dotenv.config();

/* ── Startup: fail fast on missing required env vars ────────────────────── */
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "GOOGLE_MAPS_API_KEY"] as const;
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missing.join(", ")}`);
  console.error("[startup] Copy backend/.env.example to backend/.env and fill in all values.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/analyze", analyzeRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AP Analytics API running on http://localhost:${PORT}`);
});

export default app;
