import { DecisionValue, HumanDecision, RiskScore } from "../types";
import { makeId, nowIso } from "../utils/id";
import { versionRegistry } from "../versions";

export function recordHumanDecision(input: {
  applicationId: string;
  systemRecommendation: DecisionValue;
  systemScores: RiskScore[];
  humanDecision: DecisionValue;
  reviewerId: string;
  reviewerRole: string;
  justification: string;
  overrideReason?: string;
}): HumanDecision {
  const isOverride = input.systemRecommendation !== input.humanDecision;
  if (!input.justification.trim()) {
    throw new Error("Human decision requires justification.");
  }
  if (isOverride && !input.overrideReason?.trim()) {
    throw new Error("Human override requires an override reason.");
  }

  return {
    decisionId: makeId("decision"),
    applicationId: input.applicationId,
    systemRecommendation: input.systemRecommendation,
    systemScores: input.systemScores,
    humanDecision: input.humanDecision,
    reviewerId: input.reviewerId,
    reviewerRole: input.reviewerRole,
    justification: input.justification,
    overrideReason: input.overrideReason,
    timestamp: nowIso(),
    modelVersion: versionRegistry.modelVersion,
    promptVersion: versionRegistry.promptVersion,
    ruleSetVersion: versionRegistry.ruleSetVersion,
    scoreEngineVersion: versionRegistry.scoreEngineVersion,
    pipelineVersion: versionRegistry.pipelineVersion
  };
}

