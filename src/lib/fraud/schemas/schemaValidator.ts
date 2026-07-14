import { DocumentExtraction, EvidenceReference, FraudCategory, FraudSchema, ValidationResult } from "../types";
import { makeId, nowIso } from "../utils/id";
import { versionRegistry } from "../versions";

function typeMatches(value: unknown, expected: FraudSchema["fieldTypes"][string]): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "boolean") return typeof value === "boolean";
  if (expected === "date") return typeof value === "string" && !Number.isNaN(Date.parse(value));
  if (expected === "iban") return typeof value === "string" && /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(value.replace(/\s/g, ""));
  if (expected === "nif") return typeof value === "string" && /^\d{9}$/.test(value.replace(/\D/g, ""));
  return typeof value === "string" && value.trim().length > 0;
}

export function validateExtractionAgainstSchema(extraction: DocumentExtraction, schema: FraudSchema): ValidationResult[] {
  const byField = new Map(extraction.fields.map((field) => [field.field, field]));
  const results: ValidationResult[] = [];

  for (const required of schema.requiredFields) {
    const field = byField.get(required);
    const evidence: EvidenceReference[] = field
      ? [
          {
            evidenceId: makeId("ev"),
            documentId: field.provenance.documentId,
            page: field.provenance.page,
            field: required,
            value: String(field.value),
            location: field.provenance.boundingBox,
            detector: "schema-validator",
            detectorVersion: "0.1.0",
            timestamp: nowIso(),
            explanation: `Required field ${required} was ${field.value ? "present" : "empty"}.`
          }
        ]
      : [];

    results.push({
      resultId: makeId("val"),
      ruleId: "SCHEMA_REQUIRED_FIELD",
      ruleVersion: versionRegistry.schemaVersion,
      category: FraudCategory.DocumentAuthenticity,
      description: `Required field ${required} must be present.`,
      severity: "high",
      inputFields: [required],
      passed: Boolean(field?.value),
      evidence,
      timestamp: nowIso()
    });
  }

  for (const field of extraction.fields) {
    const expected = schema.fieldTypes[field.field];
    if (!expected) continue;
    results.push({
      resultId: makeId("val"),
      ruleId: "SCHEMA_FIELD_TYPE",
      ruleVersion: versionRegistry.schemaVersion,
      category: FraudCategory.DocumentAuthenticity,
      description: `Field ${field.field} must match ${expected}.`,
      severity: "medium",
      inputFields: [field.field],
      passed: typeMatches(field.value, expected),
      evidence: [
        {
          evidenceId: makeId("ev"),
          documentId: field.provenance.documentId,
          page: field.provenance.page,
          field: field.field,
          value: String(field.value),
          location: field.provenance.boundingBox,
          detector: "schema-validator",
          detectorVersion: "0.1.0",
          timestamp: nowIso(),
          explanation: `Field ${field.field} was checked against schema type ${expected}.`
        }
      ],
      timestamp: nowIso()
    });
  }

  return results;
}
