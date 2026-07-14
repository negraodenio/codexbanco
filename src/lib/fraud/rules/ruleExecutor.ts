import { DocumentExtraction, EvidenceReference, FraudCategory, ValidationResult } from "../types";
import { makeId, nowIso } from "../utils/id";
import { isFutureDate, isExpired, isPlausibleDateOfBirth } from "../validators/dateValidator";
import { salaryArithmeticIsPlausible } from "../validators/financialValidator";
import { isValidIban } from "../validators/ibanValidator";
import { isValidPortugueseNif } from "../validators/nifValidator";
import { getRule } from "./ruleRegistry";

function fieldValue(extraction: DocumentExtraction, field: string) {
  return extraction.fields.find((item) => item.field === field);
}

function evidenceFor(extraction: DocumentExtraction, field: string, detector = "rule-executor"): EvidenceReference[] {
  const found = fieldValue(extraction, field);
  if (!found) return [];
  return [
    {
      evidenceId: makeId("ev"),
      documentId: found.provenance.documentId,
      page: found.provenance.page,
      field,
      value: String(found.value),
      location: found.provenance.boundingBox,
      detector,
      detectorVersion: "0.1.0",
      timestamp: nowIso(),
      explanation: `Rule used field ${field} from document evidence.`
    }
  ];
}

function result(ruleId: string, passed: boolean, evidence: EvidenceReference[], overrideCategory?: FraudCategory): ValidationResult {
  const rule = getRule(ruleId);
  if (!rule) throw new Error(`Unknown rule ${ruleId}`);
  return {
    resultId: makeId("val"),
    ruleId,
    ruleVersion: rule.ruleVersion,
    category: overrideCategory ?? rule.category,
    description: rule.description,
    severity: rule.severity,
    inputFields: rule.inputFields,
    passed,
    evidence,
    timestamp: nowIso()
  };
}

export function executeDeterministicRules(extraction: DocumentExtraction): ValidationResult[] {
  const results: ValidationResult[] = [];
  const nif = fieldValue(extraction, "nif")?.value;
  const employerNif = fieldValue(extraction, "employerNif")?.value;
  const iban = fieldValue(extraction, "iban")?.value;
  const expiryDate = fieldValue(extraction, "expiryDate")?.value;
  const issueDate = fieldValue(extraction, "issueDate")?.value;
  const dob = fieldValue(extraction, "dateOfBirth")?.value;
  const gross = fieldValue(extraction, "grossSalary")?.value;
  const net = fieldValue(extraction, "netSalary")?.value;
  const postalCode = fieldValue(extraction, "postalCode")?.value;
  const accountBalance = fieldValue(extraction, "accountBalance")?.value;

  if (typeof nif === "string") results.push(result("PT_NIF_CHECKSUM", isValidPortugueseNif(nif), evidenceFor(extraction, "nif")));
  if (typeof employerNif === "string") {
    results.push(result("EMPLOYER_NIF_CHECKSUM", isValidPortugueseNif(employerNif), evidenceFor(extraction, "employerNif")));
  }
  if (typeof iban === "string") results.push(result("IBAN_MOD97", isValidIban(iban), evidenceFor(extraction, "iban")));
  if (typeof expiryDate === "string") results.push(result("DOCUMENT_EXPIRY_DATE", !isExpired(expiryDate), evidenceFor(extraction, "expiryDate")));
  if (typeof issueDate === "string") results.push(result("FUTURE_ISSUE_DATE", !isFutureDate(issueDate), evidenceFor(extraction, "issueDate")));
  if (typeof dob === "string") results.push(result("DOB_PLAUSIBILITY", isPlausibleDateOfBirth(dob), evidenceFor(extraction, "dateOfBirth")));
  if (typeof gross === "number" || typeof net === "number") {
    results.push(result("SALARY_ARITHMETIC", salaryArithmeticIsPlausible(gross as number | undefined, net as number | undefined), [
      ...evidenceFor(extraction, "grossSalary"),
      ...evidenceFor(extraction, "netSalary")
    ]));
  }
  if (typeof postalCode === "string") {
    results.push(result("PT_POSTAL_CODE_FORMAT", /^\d{4}-\d{3}$/.test(postalCode), evidenceFor(extraction, "postalCode")));
  }
  if (typeof accountBalance === "number") {
    results.push(result("BALANCE_PLAUSIBILITY", Number.isFinite(accountBalance), evidenceFor(extraction, "accountBalance")));
  }

  return results;
}

