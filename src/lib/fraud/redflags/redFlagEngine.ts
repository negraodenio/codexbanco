import { CrossDocumentCheck, FraudCategory, MetadataIndicator, RedFlag, ValidationResult } from "../types";
import { makeId, nowIso } from "../utils/id";

function categoryForRule(ruleId: string): string {
  const map: Record<string, string> = {
    PT_NIF_CHECKSUM: "INVALID_NIF_CHECKSUM",
    EMPLOYER_NIF_CHECKSUM: "INVALID_EMPLOYER_NIF_CHECKSUM",
    IBAN_MOD97: "IBAN_INVALID",
    DOCUMENT_EXPIRY_DATE: "DOCUMENT_EXPIRED",
    FUTURE_ISSUE_DATE: "FUTURE_ISSUE_DATE",
    DOB_PLAUSIBILITY: "DOB_MISMATCH",
    SALARY_ARITHMETIC: "BALANCE_CALCULATION_ANOMALY",
    SCHEMA_REQUIRED_FIELD: "REQUIRED_FIELD_MISSING",
    PT_POSTAL_CODE_FORMAT: "ADDRESS_FORMAT_ANOMALY"
  };
  return map[ruleId] ?? ruleId;
}

export function buildRedFlags(input: {
  validations: ValidationResult[];
  checks: CrossDocumentCheck[];
  forensicIndicators: MetadataIndicator[];
}): RedFlag[] {
  const flags: RedFlag[] = [];

  for (const validation of input.validations.filter((item) => !item.passed && item.evidence.length > 0)) {
    flags.push({
      flagId: makeId("flag"),
      flagType: categoryForRule(validation.ruleId),
      category: validation.category,
      severity: validation.severity,
      confidence: 0.92,
      evidence: validation.evidence,
      sourceDocumentIds: [...new Set(validation.evidence.map((item) => item.documentId).filter(Boolean))] as string[],
      sourcePages: [...new Set(validation.evidence.map((item) => item.page).filter((page): page is number => Boolean(page)))],
      detector: "evidence-red-flag-engine",
      detectorVersion: "0.1.0",
      ruleVersion: validation.ruleVersion,
      explanation: validation.description,
      status: validation.severity === "critical" ? "confirmed" : "corroborated",
      createdAt: nowIso()
    });
  }

  for (const check of input.checks.filter((item) => item.status === "contradiction")) {
    const evidence = [check.leftEvidence, check.rightEvidence].filter((item): item is NonNullable<typeof item> => Boolean(item));
    flags.push({
      flagId: makeId("flag"),
      flagType:
        check.checkId === "IDENTITY_NIF_CONSISTENCY"
          ? "NIF_MISMATCH"
          : check.checkId === "NAME_CONSISTENCY"
            ? "NAME_MISMATCH"
            : check.checkId === "IBAN_CONSISTENCY"
              ? "ACCOUNT_HOLDER_MISMATCH"
              : check.checkId,
      category: check.checkId.includes("IBAN") ? FraudCategory.FinancialPlausibility : FraudCategory.IdentityConsistency,
      severity: check.severity,
      confidence: check.confidence,
      evidence,
      sourceDocumentIds: [...new Set(evidence.map((item) => item.documentId).filter(Boolean))] as string[],
      sourcePages: [...new Set(evidence.map((item) => item.page).filter((page): page is number => Boolean(page)))],
      detector: "cross-document-engine",
      detectorVersion: "0.1.0",
      explanation: check.explanation,
      status: check.confidence >= 0.95 ? "confirmed" : "corroborated",
      createdAt: nowIso()
    });
  }

  for (const indicator of input.forensicIndicators.filter((item) => item.evidence.length > 0)) {
    flags.push({
      flagId: makeId("flag"),
      flagType: indicator.description.includes("metadata") ? "SUSPICIOUS_PDF_METADATA" : "POSSIBLE_IMAGE_EDITING",
      category: FraudCategory.DigitalIntegrity,
      severity: indicator.severity,
      confidence: 0.66,
      evidence: indicator.evidence,
      sourceDocumentIds: [...new Set(indicator.evidence.map((item) => item.documentId).filter(Boolean))] as string[],
      sourcePages: [],
      detector: "metadata-forensic-analyzer",
      detectorVersion: "0.1.0",
      explanation: indicator.description,
      status: "suspected",
      createdAt: nowIso()
    });
  }

  return flags;
}

