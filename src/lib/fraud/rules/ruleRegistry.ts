import { FraudCategory, Severity } from "../types";
import { versionRegistry } from "../versions";

export interface RuleDefinition {
  ruleId: string;
  ruleVersion: string;
  category: FraudCategory;
  description: string;
  severity: Severity;
  inputFields: string[];
}

export const ruleDefinitions: RuleDefinition[] = [
  ["PT_NIF_CHECKSUM", "IDENTITY_CONSISTENCY", "Portuguese NIF checksum must be valid.", "critical", ["nif"]],
  ["EMPLOYER_NIF_CHECKSUM", "IDENTITY_CONSISTENCY", "Employer NIF checksum must be valid.", "high", ["employerNif"]],
  ["IBAN_MOD97", "FINANCIAL_PLAUSIBILITY", "IBAN must pass MOD-97 validation.", "critical", ["iban"]],
  ["DOCUMENT_EXPIRY_DATE", "TEMPORAL_COHERENCE", "Identity document must not be expired.", "high", ["expiryDate"]],
  ["FUTURE_ISSUE_DATE", "TEMPORAL_COHERENCE", "Issue date must not be in the future.", "high", ["issueDate"]],
  ["DOB_PLAUSIBILITY", "TEMPORAL_COHERENCE", "Applicant date of birth must be plausible.", "high", ["dateOfBirth"]],
  ["SALARY_ARITHMETIC", "FINANCIAL_PLAUSIBILITY", "Net salary must be plausible relative to gross salary.", "high", ["grossSalary", "netSalary"]],
  ["PT_POSTAL_CODE_FORMAT", "ADDRESS_CONSISTENCY", "Portuguese postal code must use NNNN-NNN format.", "medium", ["postalCode"]],
  ["BALANCE_PLAUSIBILITY", "FINANCIAL_PLAUSIBILITY", "Account balance must be a finite numeric value.", "medium", ["accountBalance"]],
  ["DUPLICATE_DOCUMENT_HASH", "DIGITAL_INTEGRITY", "Duplicate document hash detected.", "high", ["sha256"]],
  ["NIF_MISMATCH", "IDENTITY_CONSISTENCY", "NIF values contradict across documents.", "critical", ["nif"]],
  ["NAME_MISMATCH", "IDENTITY_CONSISTENCY", "Names contradict across documents.", "high", ["fullName", "accountHolder"]],
  ["DOB_MISMATCH", "IDENTITY_CONSISTENCY", "Date of birth contradicts across documents.", "critical", ["dateOfBirth"]],
  ["SALARY_INCONSISTENCY", "FINANCIAL_PLAUSIBILITY", "Salary values contradict across documents.", "high", ["grossSalary", "netSalary"]],
  ["EMPLOYER_MISMATCH", "IDENTITY_CONSISTENCY", "Employer values contradict across documents.", "medium", ["employerName"]],
  ["ACCOUNT_HOLDER_MISMATCH", "FINANCIAL_PLAUSIBILITY", "Bank account holder does not match applicant.", "high", ["accountHolder", "fullName"]],
  ["ADDRESS_MISMATCH", "ADDRESS_CONSISTENCY", "Address values contradict across documents.", "medium", ["street", "postalCode"]],
  ["CREATION_MODIFICATION_ANOMALY", "DIGITAL_INTEGRITY", "Document metadata has creation/modification anomaly.", "medium", ["metadata"]],
  ["SUSPICIOUS_PDF_METADATA", "DIGITAL_INTEGRITY", "PDF metadata contains suspicious indicators.", "medium", ["metadata"]],
  ["POSSIBLE_IMAGE_EDITING", "DIGITAL_INTEGRITY", "Image editing indicators require review.", "medium", ["imageMetadata"]],
  ["REQUIRED_FIELD_MISSING", "DOCUMENT_AUTHENTICITY", "Required field is missing.", "high", ["schema"]],
  ["UNKNOWN_ISSUER", "DOCUMENT_AUTHENTICITY", "Issuer is unknown or absent.", "medium", ["issuer"]],
  ["TEMPLATE_ANOMALY", "DOCUMENT_AUTHENTICITY", "Template anomaly detected.", "medium", ["template"]],
  ["IMPOSSIBLE_EMPLOYMENT_TIMELINE", "TEMPORAL_COHERENCE", "Employment timeline is impossible.", "high", ["employmentStartDate"]],
  ["OVERLAPPING_CONTRADICTORY_PERIODS", "TEMPORAL_COHERENCE", "Contradictory periods overlap.", "high", ["period"]],
  ["AI_UNSUPPORTED_CLAIM", "DOCUMENT_AUTHENTICITY", "AI observation lacked evidence reference.", "critical", ["evidence"]],
  ["DOCUMENT_PROMPT_INJECTION", "DIGITAL_INTEGRITY", "Document text contains instruction-like prompt injection content.", "high", ["rawText"]]
].map(([ruleId, category, description, severity, inputFields]) => ({
  ruleId: String(ruleId),
  ruleVersion: versionRegistry.ruleSetVersion,
  category: category as FraudCategory,
  description: String(description),
  severity: severity as Severity,
  inputFields: inputFields as string[]
}));

export function getRule(ruleId: string): RuleDefinition | undefined {
  return ruleDefinitions.find((rule) => rule.ruleId === ruleId);
}

