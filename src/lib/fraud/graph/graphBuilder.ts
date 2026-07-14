import { CrossDocumentCheck, DocumentExtraction, DocumentProvenance, EvidenceGraph, RedFlag } from "../types";
import { makeId } from "../utils/id";

export function buildEvidenceGraph(input: {
  applicationId: string;
  documents: DocumentProvenance[];
  extractions: DocumentExtraction[];
  checks: CrossDocumentCheck[];
  redFlags: RedFlag[];
}): EvidenceGraph {
  const nodes: EvidenceGraph["nodes"] = [
    { id: input.applicationId, type: "Application", label: `Application ${input.applicationId}`, properties: {} }
  ];
  const edges: EvidenceGraph["edges"] = [];

  for (const document of input.documents) {
    nodes.push({
      id: document.documentId,
      type: "Document",
      label: document.originalFilename,
      properties: { sha256: document.sha256, mimeType: document.detectedMimeType, pageCount: document.pageCount }
    });
    edges.push({ id: makeId("edge"), source: input.applicationId, target: document.documentId, type: "CONTAINS", properties: {} });
  }

  for (const extraction of input.extractions) {
    for (const field of extraction.fields) {
      const nodeType = field.field.toLowerCase().includes("iban")
        ? "IBAN"
        : field.field.toLowerCase().includes("nif")
          ? "NIF"
          : field.field.toLowerCase().includes("salary") || field.field.toLowerCase().includes("balance")
            ? "FinancialValue"
            : field.field.toLowerCase().includes("address") || field.field.toLowerCase().includes("postal")
              ? "Address"
              : field.field.toLowerCase().includes("employer")
                ? "Employer"
                : "Claim";
      const id = `${extraction.documentId}:${field.field}:${String(field.value)}`;
      nodes.push({ id, type: nodeType, label: `${field.field}: ${String(field.value)}`, properties: { confidence: field.confidence } });
      edges.push({ id: makeId("edge"), source: extraction.documentId, target: id, type: "ASSERTS", properties: { field: field.field } });
    }
  }

  for (const check of input.checks) {
    const checkNodeId = `${check.checkId}:${makeId("claim")}`;
    nodes.push({ id: checkNodeId, type: "Claim", label: check.checkId, properties: { status: check.status, confidence: check.confidence } });
    for (const side of [check.leftEvidence, check.rightEvidence]) {
      if (!side?.documentId) continue;
      edges.push({
        id: makeId("edge"),
        source: side.documentId,
        target: checkNodeId,
        type: check.status === "contradiction" ? "CONTRADICTS" : "SUPPORTS",
        properties: { field: side.field, value: side.value }
      });
    }
  }

  for (const flag of input.redFlags) {
    nodes.push({ id: flag.flagId, type: "RedFlag", label: flag.flagType, properties: { severity: flag.severity, status: flag.status } });
    for (const documentId of flag.sourceDocumentIds) {
      edges.push({ id: makeId("edge"), source: documentId, target: flag.flagId, type: "GENERATED", properties: { detector: flag.detector } });
    }
  }

  return { nodes, edges };
}

