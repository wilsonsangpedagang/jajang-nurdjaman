#!/usr/bin/env node
/**
 * AP Analytics — interactive setup script.
 * Runs before dev servers start. Handles:
 *   1. Creating .env files from examples if missing
 *   2. Prompting for any missing/placeholder API keys
 *   3. Auto-generating JWT_SECRET
 *   4. Detecting and stopping Docker backend if it is occupying port 4000
 *      (Docker backend conflicts with the local tsx dev server)
 */

import { createInterface } from "readline";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync, spawnSync } from "child_process";
import { createConnection } from "net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendEnvPath = resolve(__dirname, "backend/.env");
const frontendEnvPath = resolve(__dirname, "frontend/.env");

// ── Ensure .env files exist (copy from example if not) ──────────────────────
if (!existsSync(backendEnvPath)) {
  copyFileSync(resolve(__dirname, "backend/.env.example"), backendEnvPath);
  console.log("  Created backend/.env from .env.example");
}
if (!existsSync(frontendEnvPath)) {
  copyFileSync(resolve(__dirname, "frontend/.env.example"), frontendEnvPath);
  console.log("  Created frontend/.env from .env.example");
}

// ── Parse a .env file into a key→value map ──────────────────────────────────
function parseEnv(filePath) {
  const map = {};
  for (const raw of readFileSync(filePath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    map[key] = val;
  }
  return map;
}

// ── Write / update a single key in a .env file (in-place) ───────────────────
function setEnvKey(filePath, key, value) {
  let content = readFileSync(filePath, "utf8");
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const regex = new RegExp(`^([ \t]*${key}[ \t]*=).*`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `$1"${escaped}"`);
  } else {
    content = content.trimEnd() + `\n${key}="${escaped}"\n`;
  }
  writeFileSync(filePath, content, "utf8");
}

// ── Placeholder detection ────────────────────────────────────────────────────
const PLACEHOLDERS = new Set([
  "your-google-maps-api-key",
  "change-me-to-a-long-random-secret",
  "change-me-in-production",
]);

function isMissing(val) {
  return !val || PLACEHOLDERS.has(val);
}

// ── Check if a port is in use ────────────────────────────────────────────────
function isPortInUse(port) {
  return new Promise((resolve) => {
    const conn = createConnection({ port, host: "127.0.0.1" });
    conn.on("connect", () => { conn.destroy(); resolve(true); });
    conn.on("error", () => resolve(false));
  });
}

// ── Check if the Docker backend container is running ────────────────────────
function isDockerBackendRunning() {
  try {
    const result = spawnSync("docker", [
      "inspect", "--format", "{{.State.Running}}", "ap_analytics_backend",
    ], { encoding: "utf8" });
    return result.stdout.trim() === "true";
  } catch {
    return false;
  }
}

// ── Stop Docker backend container ────────────────────────────────────────────
function stopDockerBackend() {
  try {
    spawnSync("docker", ["stop", "ap_analytics_backend"], { encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
}

// ── Port 4000 conflict check ─────────────────────────────────────────────────
const port4000Busy = await isPortInUse(4000);
if (port4000Busy) {
  if (isDockerBackendRunning()) {
    console.log("⚠  Docker backend container is running on port 4000.");
    console.log("   Stopping it so the local tsx dev server can bind to that port...");
    const stopped = stopDockerBackend();
    if (stopped) {
      console.log("✓  Docker backend stopped. Local dev server will use port 4000.\n");
    } else {
      console.warn("   Could not stop Docker backend automatically.");
      console.warn("   Run: docker stop ap_analytics_backend\n");
    }
  } else {
    console.warn("⚠  Port 4000 is already in use by something other than Docker.");
    console.warn("   The backend may fail to start. Free port 4000 and retry.\n");
  }
}

// ── Read current env values ──────────────────────────────────────────────────
const be = parseEnv(backendEnvPath);
const fe = parseEnv(frontendEnvPath);

const needsGoogleKey =
  isMissing(be.GOOGLE_MAPS_API_KEY) || isMissing(fe.VITE_GOOGLE_MAPS_API_KEY);
const needsJwtSecret = isMissing(be.JWT_SECRET);

// ── Nothing to do — skip prompts ─────────────────────────────────────────────
if (!needsGoogleKey && !needsJwtSecret) {
  console.log("✓  Environment already configured — starting servers...\n");
  process.exit(0);
}

// ── Interactive prompts ──────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

console.log();
console.log("┌──────────────────────────────────────────────┐");
console.log("│        AP Analytics — Environment Setup       │");
console.log("└──────────────────────────────────────────────┘");
console.log("One or more required keys are missing.");
console.log("Fill them in below, then the servers will start automatically.");
console.log("Press Ctrl-C to cancel.\n");

// ── Google Maps API key ──────────────────────────────────────────────────────
if (needsGoogleKey) {
  console.log("  [1/1] Google Maps API Key");
  console.log("        Needs: Maps JavaScript API, Places API (New), Geocoding API");
  console.log("        Get it at → https://console.cloud.google.com/apis/credentials\n");

  let key = "";
  while (!key.trim()) {
    key = await ask("  Paste key and press Enter: ");
    if (!key.trim()) console.log("  Key cannot be empty. Try again.\n");
  }

  setEnvKey(backendEnvPath, "GOOGLE_MAPS_API_KEY", key.trim());
  setEnvKey(frontendEnvPath, "VITE_GOOGLE_MAPS_API_KEY", key.trim());
  console.log("  ✓  Saved to backend/.env and frontend/.env\n");
}

// ── JWT secret (auto-generated, no prompt needed) ────────────────────────────
if (needsJwtSecret) {
  const secret = randomBytes(40).toString("hex");
  setEnvKey(backendEnvPath, "JWT_SECRET", secret);
  console.log("  ✓  JWT_SECRET auto-generated and saved to backend/.env\n");
}

rl.close();

console.log("──────────────────────────────────────────────────");
console.log("  Setup complete. Starting AP Analytics...");
console.log("──────────────────────────────────────────────────\n");
