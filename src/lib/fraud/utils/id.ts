export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function confidenceBand(confidence: number) {
  if (confidence >= 0.95) return "very_high" as const;
  if (confidence >= 0.8) return "high" as const;
  if (confidence >= 0.55) return "medium" as const;
  if (confidence >= 0.3) return "low" as const;
  return "very_low" as const;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

