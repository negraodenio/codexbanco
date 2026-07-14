import { CrossDocumentCheck, DocumentExtraction, EvidenceReference, ExtractedField, Severity } from "../types";
import { makeId, nowIso } from "../utils/id";
import { normalizeIban } from "../validators/ibanValidator";
import { normalizeNif } from "../validators/nifValidator";
import { normalizeName, normalizeText, similarity } from "./entityNormalizer";

function evidence(field: ExtractedField, explanation: string): EvidenceReference {
  return {
    evidenceId: makeId("ev"),
    documentId: field.provenance.documentId,
    page: field.provenance.page,
    field: field.field,
    value: String(field.value),
    location: field.provenance.boundingBox,
    detector: "cross-document-engine",
    detectorVersion: "0.1.0",
    timestamp: nowIso(),
    explanation
  };
}

function collect(extractions: DocumentExtraction[], names: string[]): ExtractedField[] {
  return extractions.flatMap((extraction) => extraction.fields.filter((field) => names.includes(field.field)));
}

function compareExact(fields: ExtractedField[], checkId: string, severity: Severity, normalizer: (value: string) => string): CrossDocumentCheck[] {
  const checks: CrossDocumentCheck[] = [];
  for (let i = 0; i < fields.length; i += 1) {
    for (let j = i + 1; j < fields.length; j += 1) {
      const left = fields[i];
      const right = fields[j];
      if (left.provenance.documentId === right.provenance.documentId) continue;
      const leftValue = normalizer(String(left.value));
      const rightValue = normalizer(String(right.value));
      checks.push({
        checkId,
        status: leftValue === rightValue ? "match" : "contradiction",
        severity: leftValue === rightValue ? "info" : severity,
        confidence: leftValue === rightValue ? 0.98 : 0.97,
        leftEvidence: evidence(left, `Left side of ${checkId}.`),
        rightEvidence: evidence(right, `Right side of ${checkId}.`),
        explanation: leftValue === rightValue ? `${checkId} matched across documents.` : `${checkId} contradicted across documents.`
      });
    }
  }
  return checks;
}

export function runCrossDocumentChecks(extractions: DocumentExtraction[]): CrossDocumentCheck[] {
  const checks: CrossDocumentCheck[] = [];
  checks.push(...compareExact(collect(extractions, ["nif"]), "IDENTITY_NIF_CONSISTENCY", "critical", normalizeNif));
  checks.push(...compareExact(collect(extractions, ["iban"]), "IBAN_CONSISTENCY", "high", normalizeIban));
  checks.push(...compareExact(collect(extractions, ["employerName"]), "EMPLOYER_CONSISTENCY", "medium", normalizeText));
  checks.push(...compareExact(collect(extractions, ["postalCode"]), "POSTAL_CODE_CONSISTENCY", "medium", normalizeText));
  checks.push(...compareExact(collect(extractions, ["dateOfBirth"]), "DOB_CONSISTENCY", "critical", normalizeText));

  const names = collect(extractions, ["fullName", "accountHolder"]);
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const left = names[i];
      const right = names[j];
      if (left.provenance.documentId === right.provenance.documentId) continue;
      const score = similarity(String(left.value), String(right.value));
      checks.push({
        checkId: "NAME_CONSISTENCY",
        status: score >= 0.9 ? "normalized_match" : score >= 0.55 ? "partial_match" : "contradiction",
        severity: score >= 0.55 ? "info" : "high",
        confidence: Math.max(0.5, score),
        leftEvidence: evidence(left, "Left identity name evidence."),
        rightEvidence: evidence(right, "Right identity name evidence."),
        explanation: score >= 0.55 ? "Name evidence is compatible after normalization." : "Name evidence conflicts across documents."
      });
    }
  }

  return checks;
}

