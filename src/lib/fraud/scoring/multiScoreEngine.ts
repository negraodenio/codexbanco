import { FraudCategory, RedFlag, RiskScore, SemanticCategoryAnalysis } from "../types";
import { clampScore } from "../utils/id";
import { versionRegistry } from "../versions";

function severityImpact(flag: RedFlag): number {
  const base = flag.severity === "critical" ? 30 : flag.severity === "high" ? 20 : flag.severity === "medium" ? 10 : 4;
  const status = flag.status === "confirmed" ? 1.15 : flag.status === "corroborated" ? 1 : flag.status === "suspected" ? 0.65 : 0;
  return base * flag.confidence * status;
}

function scoreFor(name: RiskScore["scoreName"], flags: RedFlag[], weights: Record<string, number>): RiskScore {
  const components = Object.entries(weights).map(([category, weight]) => {
    const categoryFlags = flags.filter((flag) => flag.category === category);
    return {
      component: category,
      scoreImpact: categoryFlags.reduce((sum, flag) => sum + severityImpact(flag), 0),
      weight,
      evidenceCount: categoryFlags.reduce((sum, flag) => sum + flag.evidence.length, 0),
      explanation: `${categoryFlags.length} evidence-backed flags contributed to ${category}.`
    };
  });
  const penalties = flags
    .filter((flag) => flag.severity === "critical")
    .map((flag) => ({
      component: flag.flagType,
      scoreImpact: 12,
      weight: 1,
      evidenceCount: flag.evidence.length,
      explanation: "Critical evidence-backed penalty."
    }));
  const weighted = components.reduce((sum, item) => sum + item.scoreImpact * item.weight, 0);
  const penaltyScore = penalties.reduce((sum, item) => sum + item.scoreImpact, 0);
  const evidenceCount = flags.reduce((sum, flag) => sum + flag.evidence.length, 0);
  return {
    scoreName: name,
    score: clampScore(weighted + penaltyScore),
    calibration: "HEURISTIC_UNCALIBRATED",
    components,
    weights,
    penalties,
    evidenceCount,
    confidence: evidenceCount ? Math.min(0.95, 0.5 + evidenceCount * 0.03) : 0.35,
    scoreEngineVersion: versionRegistry.scoreEngineVersion
  };
}

export function calculateRiskScores(flags: RedFlag[], analyses: SemanticCategoryAnalysis[], extractionConfidence: number): RiskScore[] {
  const documentFraud = scoreFor("Document Fraud Score", flags, {
    [FraudCategory.DocumentAuthenticity]: 1.3,
    [FraudCategory.DigitalIntegrity]: 1.2,
    [FraudCategory.TemporalCoherence]: 0.8
  });
  const consistency = scoreFor("Application Consistency Score", flags, {
    [FraudCategory.IdentityConsistency]: 1.4,
    [FraudCategory.AddressConsistency]: 0.8,
    [FraudCategory.FinancialPlausibility]: 0.9
  });
  const financialCrime = scoreFor("Financial Crime Risk Score", flags, {
    [FraudCategory.AmlIndicators]: 1.4,
    [FraudCategory.FinancialPlausibility]: 1.1,
    [FraudCategory.IdentityConsistency]: 0.6
  });
  const extraction: RiskScore = {
    scoreName: "Extraction Confidence Score",
    score: clampScore(100 - extractionConfidence * 100),
    calibration: "HEURISTIC_UNCALIBRATED",
    components: [
      {
        component: "average_extraction_confidence_gap",
        scoreImpact: clampScore(100 - extractionConfidence * 100),
        weight: 1,
        evidenceCount: flags.reduce((sum, flag) => sum + flag.evidence.length, 0),
        explanation: "Lower extraction confidence increases review risk."
      }
    ],
    weights: { average_extraction_confidence_gap: 1 },
    penalties: [],
    evidenceCount: flags.reduce((sum, flag) => sum + flag.evidence.length, 0),
    confidence: 0.7,
    scoreEngineVersion: versionRegistry.scoreEngineVersion
  };
  const overall: RiskScore = {
    scoreName: "Overall Recommendation Score",
    score: clampScore(documentFraud.score * 0.35 + consistency.score * 0.35 + financialCrime.score * 0.15 + extraction.score * 0.15),
    calibration: "HEURISTIC_UNCALIBRATED",
    components: [
      { component: "document_fraud", scoreImpact: documentFraud.score, weight: 0.35, evidenceCount: documentFraud.evidenceCount, explanation: "Document authenticity and integrity risk." },
      { component: "application_consistency", scoreImpact: consistency.score, weight: 0.35, evidenceCount: consistency.evidenceCount, explanation: "Cross-document contradiction risk." },
      { component: "financial_crime", scoreImpact: financialCrime.score, weight: 0.15, evidenceCount: financialCrime.evidenceCount, explanation: "Separate AML/financial crime indicators." },
      { component: "extraction_confidence", scoreImpact: extraction.score, weight: 0.15, evidenceCount: extraction.evidenceCount, explanation: "Uncertainty from extraction confidence." }
    ],
    weights: { document_fraud: 0.35, application_consistency: 0.35, financial_crime: 0.15, extraction_confidence: 0.15 },
    penalties: [],
    evidenceCount: flags.reduce((sum, flag) => sum + flag.evidence.length, 0) + analyses.reduce((sum, analysis) => sum + analysis.evidenceReferences.length, 0),
    confidence: Math.min(0.9, (documentFraud.confidence + consistency.confidence + financialCrime.confidence + extraction.confidence) / 4),
    scoreEngineVersion: versionRegistry.scoreEngineVersion
  };
  return [documentFraud, consistency, financialCrime, extraction, overall];
}

export function recommendedDecision(overallScore: number) {
  if (overallScore >= 75) return "REJECTED" as const;
  if (overallScore >= 45) return "MANUAL_REVIEW_REQUIRED" as const;
  if (overallScore >= 25) return "MORE_DOCUMENTATION_REQUIRED" as const;
  return "APPROVED" as const;
}

