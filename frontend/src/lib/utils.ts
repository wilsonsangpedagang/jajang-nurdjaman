import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-500";
  if (score >= 45) return "text-amber-500";
  return "text-rose-500";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-rose-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Highly Viable";
  if (score >= 65) return "Viable";
  if (score >= 50) return "Moderately Viable";
  if (score >= 35) return "Challenging";
  return "High Risk";
}
