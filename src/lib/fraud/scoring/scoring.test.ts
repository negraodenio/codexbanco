import { describe, expect, it } from "vitest";
import { calculateRiskScores } from "./multiScoreEngine";
import { FraudCategory, RedFlag } from "../types";

describe("multi-score engine", () => {
  it("keeps scores decomposable and uncalibrated", () => {
    const flag: RedFlag = {
      flagId: "flag_1",
      flagType: "INVALID_NIF_CHECKSUM",
      category: FraudCategory.IdentityConsistency,
      severity: "critical",
      confidence: 0.98,
      evidence: [
        {
          evidenceId: "ev_1",
          documentId: "doc_1",
          field: "nif",
          value: "123456788",
          detector: "test",
          detectorVersion: "test",
          timestamp: new Date().toISOString(),
          explanation: "Invalid checksum."
        }
      ],
      sourceDocumentIds: ["doc_1"],
      sourcePages: [1],
      detector: "test",
      detectorVersion: "test",
      explanation: "Invalid checksum.",
      status: "confirmed",
      createdAt: new Date().toISOString()
    };
    const scores = calculateRiskScores([flag], [], 0.8);
    expect(scores).toHaveLength(5);
    expect(scores.every((score) => score.calibration === "HEURISTIC_UNCALIBRATED")).toBe(true);
    expect(scores.find((score) => score.scoreName === "Application Consistency Score")?.components.length).toBeGreaterThan(0);
  });
});

