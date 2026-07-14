import { describe, expect, it } from "vitest";
import { DocumentType } from "../types";
import { selectSchema } from "./schemaSelector";
import { validateExtractionAgainstSchema } from "./schemaValidator";

describe("schema registry", () => {
  it("selects active schema by document classification", () => {
    const schema = selectSchema({
      documentType: DocumentType.Payslip,
      subtype: "PORTUGAL_MONTHLY_PAYSLIP",
      country: "PT",
      confidence: 0.9,
      confidenceBand: "high",
      classifier: "test",
      classifierVersion: "test",
      evidence: [],
      timestamp: new Date().toISOString()
    });
    expect(schema?.schemaId).toBe("PAYSLIP_PT_V1");
  });

  it("rejects missing required fields", () => {
    const schema = selectSchema({
      documentType: DocumentType.PortugueseId,
      country: "PT",
      confidence: 0.9,
      confidenceBand: "high",
      classifier: "test",
      classifierVersion: "test",
      evidence: [],
      timestamp: new Date().toISOString()
    });
    expect(schema).toBeTruthy();
    const results = validateExtractionAgainstSchema(
      {
        documentId: "doc_1",
        documentType: DocumentType.PortugueseId,
        schemaId: schema!.schemaId,
        fields: [],
        extractor: "test",
        extractorVersion: "test",
        validated: false
      },
      schema!
    );
    expect(results.some((result) => !result.passed && result.ruleId === "SCHEMA_REQUIRED_FIELD")).toBe(true);
  });
});

