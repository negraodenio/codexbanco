import { FraudCategory, RedFlag, SemanticCategoryAnalysis } from "../types";

const categories = Object.values(FraudCategory);

export function analyzeSemanticCategories(redFlags: RedFlag[]): SemanticCategoryAnalysis[] {
  return categories.map((category) => {
    const categoryFlags = redFlags.filter((flag) => flag.category === category);
    const criticality = categoryFlags.reduce((sum, flag) => {
      const severityWeight = flag.severity === "critical" ? 35 : flag.severity === "high" ? 24 : flag.severity === "medium" ? 14 : 6;
      return sum + severityWeight * flag.confidence;
    }, 0);
    const score = Math.min(100, Math.round(criticality));
    return {
      category,
      score,
      confidence: categoryFlags.length ? Math.min(0.95, 0.55 + categoryFlags.length * 0.1) : 0.4,
      observations: categoryFlags.length
        ? categoryFlags.map((flag) => `${flag.flagType}: ${flag.explanation}`)
        : ["No evidence-backed observation was generated for this category."],
      evidenceReferences: categoryFlags.flatMap((flag) => flag.evidence),
      limitations: categoryFlags.length
        ? ["Category score is heuristic and uncalibrated until confirmed outcome data exists."]
        : ["Insufficient evidence to make a positive claim in this category."],
      detector: "evidence-bounded-semantic-analyzer",
      version: "0.1.0"
    };
  });
}

