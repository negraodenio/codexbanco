export const versionRegistry = {
  pipelineVersion: process.env.FRAUD_PIPELINE_VERSION ?? "2026.07.14",
  modelId: "local-evidence-analyzer",
  modelVersion: "0.1.0",
  promptVersion: "no-llm-0.1.0",
  ruleSetVersion: process.env.FRAUD_RULESET_VERSION ?? "2026.07.14",
  scoreEngineVersion: process.env.FRAUD_SCORE_ENGINE_VERSION ?? "2026.07.14",
  schemaVersion: "2026.07.14"
} as const;

