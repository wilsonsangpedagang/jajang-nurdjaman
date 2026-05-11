import { spawn, ChildProcess } from "child_process";
import path from "path";
import { EventEmitter } from "events";

export interface MLAnalysisInput {
  businessName: string;
  category: string;
  concept: string;
  products: Array<{ name: string; price: number }>;
  goals: string[];
  location: { lat: number; lng: number; address: string };
  radiusMeters: number;
  competitors: Competitor[];
}

export interface Competitor {
  name: string;
  type: string;
  rating: number | null;
  userRatingsTotal: number | null;
  vicinity: string;
  distanceMeters: number;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AnalysisResult {
  swot: SwotAnalysis;
  successScore: number;
  scoreBreakdown: {
    competitionDensity: number;
    locationAppeal: number;
    marketDemand: number;
    conceptUniqueness: number;
  };
  strategicRoadmap: {
    differentiation: string[];
    pricing: string[];
    marketing: string[];
  };
  summary: string;
}

const ML_TIMEOUT_MS = 60_000;

let pythonProcess: ChildProcess | null = null;
const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(50);

function getPythonProcess() {
  if (!pythonProcess) {
    // Works from both src/lib (dev/tsx) and dist/lib (compiled):
    // both resolve to backend/src/lib/bvi_predictor.py
    const scriptPath = path.resolve(__dirname, "../../src/lib/bvi_predictor.py");
    const fallbackPath = path.join(__dirname, "bvi_predictor.py");
    const resolvedScript = require("fs").existsSync(scriptPath) ? scriptPath : fallbackPath;

    const pythonCmd = process.platform === "win32" ? "py" : "python3";

    pythonProcess = spawn(pythonCmd, [resolvedScript]);

    let buffer = "";
    pythonProcess.stdout?.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) {
          try {
            const result = JSON.parse(line);
            eventEmitter.emit("prediction", result);
          } catch (e) {
            console.error("Failed to parse python output:", line);
          }
        }
      }
    });

    pythonProcess.stderr?.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      pythonProcess = null;
      // Reject all in-flight requests so their Promises don't hang forever
      eventEmitter.emit("process_closed");
    });
  }
  return pythonProcess;
}

// Start the python process eagerly so the model loads in the background
getPythonProcess();

export async function runMLAnalysis(input: MLAnalysisInput): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const proc = getPythonProcess();
    if (!proc || !proc.stdin) {
      return reject(new Error("Python process not available."));
    }

    const requestId = Date.now().toString() + Math.random().toString();
    let settled = false;

    const cleanup = () => {
      eventEmitter.removeListener("prediction", predictionHandler);
      eventEmitter.removeListener("process_closed", closedHandler);
    };

    const predictionHandler = (result: any) => {
      if (result.id !== requestId) return;
      if (settled) return;
      settled = true;
      cleanup();
      if (result.status === "error") {
        reject(new Error("ML Model Error: " + result.message));
      } else {
        const preds = result.predictions;
        resolve({
          successScore: Math.round(preds.success_score),
          scoreBreakdown: {
            competitionDensity: Math.round(preds.competition_density_score),
            locationAppeal: Math.round(preds.location_appeal_score),
            marketDemand: Math.round(preds.market_demand_score),
            conceptUniqueness: Math.round(preds.concept_uniqueness_score)
          },
          swot: {
            strengths: ["Locally validated concept", "Data-driven positioning"],
            weaknesses: ["Requires continuous market monitoring", "New entrant risks"],
            opportunities: ["Local demand identified", "Potential for unique offerings"],
            threats: ["Existing local competition", "Changing consumer preferences"]
          },
          strategicRoadmap: {
            differentiation: ["Emphasize unique aspects of your concept"],
            pricing: ["Monitor local averages closely"],
            marketing: ["Focus on localized outreach"]
          },
          summary: `Based on a local ML analysis, the business has a success score of ${Math.round(preds.success_score)}/100. Consider the score breakdown for targeted improvements.`
        });
      }
    };

    const closedHandler = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Python process closed unexpectedly."));
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("ML analysis timed out after 60s."));
    }, ML_TIMEOUT_MS);

    // Ensure timer doesn't block Node.js from exiting
    if (timer.unref) timer.unref();

    eventEmitter.on("prediction", predictionHandler);
    eventEmitter.on("process_closed", closedHandler);

    // Add requestId to input so python passes it back
    proc.stdin.write(JSON.stringify({ id: requestId, ...input }) + "\n");
  });
}
