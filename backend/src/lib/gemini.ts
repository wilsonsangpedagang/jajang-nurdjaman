import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiAnalysisInput {
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

export async function runGeminiAnalysis(input: GeminiAnalysisInput): Promise<AnalysisResult> {
  const prompt = buildPrompt(input);

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const data = (await response.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  const rawText = data.candidates[0]?.content?.parts[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini");

  return JSON.parse(rawText) as AnalysisResult;
}

function buildPrompt(input: GeminiAnalysisInput): string {
  const competitorSummary = input.competitors
    .slice(0, 20)
    .map(
      (c) =>
        `- ${c.name} (${c.type}), ${(c.distanceMeters / 1000).toFixed(2)}km away, rating: ${c.rating ?? "N/A"}`
    )
    .join("\n");

  return `You are an expert business analyst and market strategist for MSMEs. Analyze the following business concept and return a JSON response ONLY (no markdown, no explanation).

BUSINESS PROFILE:
- Business Name: ${input.businessName}
- Category: ${input.category}
- Concept: ${input.concept}
- Key Products/Services: ${input.products.map((p) => `${p.name} (IDR ${p.price.toLocaleString()})`).join(", ")}
- Strategic Goals: ${input.goals.join(", ")}
- Location: ${input.location.address} (lat: ${input.location.lat}, lng: ${input.location.lng})
- Analysis Radius: ${input.radiusMeters / 1000}km

COMPETITORS FOUND (${input.competitors.length} total within radius):
${competitorSummary || "No direct competitors found."}

Return this exact JSON structure:
{
  "swot": {
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "opportunities": ["string", ...],
    "threats": ["string", ...]
  },
  "successScore": <number 0-100>,
  "scoreBreakdown": {
    "competitionDensity": <number 0-100, higher = less competition>,
    "locationAppeal": <number 0-100>,
    "marketDemand": <number 0-100>,
    "conceptUniqueness": <number 0-100>
  },
  "strategicRoadmap": {
    "differentiation": ["actionable tip", ...],
    "pricing": ["actionable tip", ...],
    "marketing": ["actionable tip", ...]
  },
  "summary": "2-3 sentence executive summary of viability"
}

Provide 3-5 items per SWOT category and 3 tips per roadmap category. Base success score on competition density, concept uniqueness, and market demand signals.`;
}
