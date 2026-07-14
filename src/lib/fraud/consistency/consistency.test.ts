import { describe, expect, it } from "vitest";
import { runCrossDocumentChecks } from "./crossDocumentEngine";
import { DocumentType } from "../types";

describe("cross-document checks", () => {
  it("detects NIF contradiction with both evidence sides", () => {
    const checks = runCrossDocumentChecks([
      {
        documentId: "doc_1",
        documentType: DocumentType.PortugueseId,
        schemaId: "PORTUGUESE_ID_V1",
        extractor: "test",
        extractorVersion: "test",
        validated: true,
        fields: [{ field: "nif", value: "123456789", confidence: 1, provenance: { documentId: "doc_1", extractor: "test", extractorVersion: "test", timestamp: "now" } }]
      },
      {
        documentId: "doc_2",
        documentType: DocumentType.Payslip,
        schemaId: "PAYSLIP_PT_V1",
        extractor: "test",
        extractorVersion: "test",
        validated: true,
        fields: [{ field: "nif", value: "123456788", confidence: 1, provenance: { documentId: "doc_2", extractor: "test", extractorVersion: "test", timestamp: "now" } }]
      }
    ]);
    const contradiction = checks.find((check) => check.status === "contradiction");
    expect(contradiction?.leftEvidence?.value).toBe("123456789");
    expect(contradiction?.rightEvidence?.value).toBe("123456788");
  });
});

