export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Product {
  name: string;
  price: number;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  category: string;
  concept: string;
  products: Product[];
  goals: string[];
  latitude: number;
  longitude: number;
  radiusMeters: number;
  analysisResult: AnalysisResult | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ScoreBreakdown {
  competitionDensity: number;
  locationAppeal: number;
  marketDemand: number;
  conceptUniqueness: number;
}

export interface StrategicRoadmap {
  differentiation: string[];
  pricing: string[];
  marketing: string[];
}

export interface Competitor {
  name: string;
  type: string;
  rating: number | null;
  userRatingsTotal: number | null;
  vicinity: string;
  placeId: string;
  lat: number;
  lng: number;
  distanceMeters: number;
}

export interface ZoneResult {
  zone_label: "MERAH" | "KUNING" | "HIJAU" | "UNKNOWN";
  zone_type: string | null;
  zone_name: string;
  green_zone_ratio: number;
  commercial_ratio: number;
  mixed_use_ratio: number;
  is_restricted: boolean;
}

export interface AnalysisResult {
  swot: SwotAnalysis;
  successScore: number;
  scoreBreakdown: ScoreBreakdown;
  strategicRoadmap: StrategicRoadmap;
  summary: string;
  competitors: Competitor[];
  address: string;
  zone?: ZoneResult;
}

export interface WizardData {
  name: string;
  category: string;
  concept: string;
  products: Product[];
  goals: string[];
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
}

export const BUSINESS_CATEGORIES = [
  "Food & Beverage",
  "Retail",
  "Beauty",
  "Health",
  "Education",
  "Entertainment",
  "Services",
  "Technology",
] as const;

export const STRATEGIC_GOALS = [
  { id: "quality", label: "Quality & Value-driven", description: "Focus on premium quality and customer value" },
  { id: "volume", label: "Volume-driven", description: "Maximize customer volume and turnover" },
  { id: "niche", label: "Niche Market", description: "Target a specific customer segment" },
  { id: "community", label: "Community-focused", description: "Build loyal local community base" },
  { id: "digital", label: "Digital-first", description: "Leverage online channels and delivery" },
  { id: "affordable", label: "Affordability Leader", description: "Compete on price and accessibility" },
] as const;
