-- 02_SEED_REGISTRIES.sql
-- Initial schema, model, and deterministic rule registries.

insert into public.model_registry (model_id, provider, model_version, purpose, status)
values
  ('local-document-classifier', 'local', '0.1.0', 'document classification', 'active'),
  ('local-regex-extractor', 'local', '0.1.0', 'structured extraction fallback', 'active'),
  ('metadata-forensic-analyzer', 'local', '0.1.0', 'document metadata and forensic indicators', 'active'),
  ('cross-document-engine', 'local', '0.1.0', 'cross-document consistency checks', 'active'),
  ('evidence-red-flag-engine', 'local', '0.1.0', 'evidence-first red flag generation', 'active'),
  ('evidence-bounded-semantic-analyzer', 'local', '0.1.0', 'semantic category analysis without unsupported claims', 'active')
on conflict (model_id) do update set
  provider = excluded.provider,
  model_version = excluded.model_version,
  purpose = excluded.purpose,
  status = excluded.status;

insert into public.document_schemas (schema_id, name, version, document_type, country, status, definition, created_at, updated_at)
values
  ('PORTUGUESE_ID_V1', 'Portuguese Citizen Identity Document', '2026.07.14', 'PORTUGUESE_ID', 'PT', 'active',
   '{"requiredFields":["fullName","nif","dateOfBirth","documentNumber","expiryDate"],"optionalFields":["nationality","issueDate","issuer"],"validationRules":["PT_NIF_CHECKSUM","DOCUMENT_EXPIRY_DATE","DOB_PLAUSIBILITY","FUTURE_ISSUE_DATE"]}'::jsonb, now(), now()),
  ('PASSPORT_EU_V1', 'EU Passport', '2026.07.14', 'PASSPORT', 'EU', 'active',
   '{"requiredFields":["fullName","documentNumber","dateOfBirth","expiryDate"],"optionalFields":["nationality","issueDate","issuer"],"validationRules":["DOCUMENT_EXPIRY_DATE","DOB_PLAUSIBILITY","FUTURE_ISSUE_DATE"]}'::jsonb, now(), now()),
  ('PAYSLIP_PT_V1', 'Portugal Monthly Payslip', '2026.07.14', 'PAYSLIP', 'PT', 'active',
   '{"requiredFields":["fullName","nif","employerName","grossSalary","netSalary","payPeriod"],"optionalFields":["employerNif","iban","occupation"],"validationRules":["PT_NIF_CHECKSUM","EMPLOYER_NIF_CHECKSUM","SALARY_ARITHMETIC","IBAN_MOD97"]}'::jsonb, now(), now()),
  ('BANK_STATEMENT_SEPA_V1', 'SEPA Bank Statement', '2026.07.14', 'BANK_STATEMENT', 'PT', 'active',
   '{"requiredFields":["accountHolder","iban","bankName","accountBalance"],"optionalFields":["averageBalance","transactionCount"],"validationRules":["IBAN_MOD97","BALANCE_PLAUSIBILITY"]}'::jsonb, now(), now()),
  ('EMPLOYMENT_CONTRACT_PT_V1', 'Portugal Employment Contract', '2026.07.14', 'EMPLOYMENT_CONTRACT', 'PT', 'active',
   '{"requiredFields":["fullName","employerName","employmentStartDate","contractType"],"optionalFields":["nif","employerNif","grossSalary","occupation"],"validationRules":["EMPLOYMENT_START_DATE","PT_NIF_CHECKSUM","EMPLOYER_NIF_CHECKSUM"]}'::jsonb, now(), now()),
  ('IRS_DECLARATION_PT_V1', 'Portugal Tax Declaration', '2026.07.14', 'TAX_DECLARATION', 'PT', 'active',
   '{"requiredFields":["fullName","nif","grossIncome"],"optionalFields":["taxYear"],"validationRules":["PT_NIF_CHECKSUM","TAX_YEAR_PLAUSIBILITY"]}'::jsonb, now(), now()),
  ('PROOF_OF_ADDRESS_PT_V1', 'Portugal Proof of Address', '2026.07.14', 'PROOF_OF_ADDRESS', 'PT', 'active',
   '{"requiredFields":["fullName","street","postalCode","municipality","country"],"optionalFields":["nif"],"validationRules":["PT_POSTAL_CODE_FORMAT","PT_NIF_CHECKSUM"]}'::jsonb, now(), now())
on conflict (schema_id) do update set
  name = excluded.name,
  version = excluded.version,
  document_type = excluded.document_type,
  country = excluded.country,
  status = excluded.status,
  definition = excluded.definition,
  updated_at = now();

insert into public.rule_registry (rule_id, rule_version, category, description, severity, input_fields)
values
  ('PT_NIF_CHECKSUM', '2026.07.14', 'IDENTITY_CONSISTENCY', 'Portuguese NIF checksum must be valid.', 'critical', array['nif']),
  ('EMPLOYER_NIF_CHECKSUM', '2026.07.14', 'IDENTITY_CONSISTENCY', 'Employer NIF checksum must be valid.', 'high', array['employerNif']),
  ('IBAN_MOD97', '2026.07.14', 'FINANCIAL_PLAUSIBILITY', 'IBAN must pass MOD-97 validation.', 'critical', array['iban']),
  ('DOCUMENT_EXPIRY_DATE', '2026.07.14', 'TEMPORAL_COHERENCE', 'Identity document must not be expired.', 'high', array['expiryDate']),
  ('FUTURE_ISSUE_DATE', '2026.07.14', 'TEMPORAL_COHERENCE', 'Issue date must not be in the future.', 'high', array['issueDate']),
  ('DOB_PLAUSIBILITY', '2026.07.14', 'TEMPORAL_COHERENCE', 'Applicant date of birth must be plausible.', 'high', array['dateOfBirth']),
  ('SALARY_ARITHMETIC', '2026.07.14', 'FINANCIAL_PLAUSIBILITY', 'Net salary must be plausible relative to gross salary.', 'high', array['grossSalary','netSalary']),
  ('PT_POSTAL_CODE_FORMAT', '2026.07.14', 'ADDRESS_CONSISTENCY', 'Portuguese postal code must use NNNN-NNN format.', 'medium', array['postalCode']),
  ('BALANCE_PLAUSIBILITY', '2026.07.14', 'FINANCIAL_PLAUSIBILITY', 'Account balance must be a finite numeric value.', 'medium', array['accountBalance']),
  ('DUPLICATE_DOCUMENT_HASH', '2026.07.14', 'DIGITAL_INTEGRITY', 'Duplicate document hash detected.', 'high', array['sha256']),
  ('NIF_MISMATCH', '2026.07.14', 'IDENTITY_CONSISTENCY', 'NIF values contradict across documents.', 'critical', array['nif']),
  ('NAME_MISMATCH', '2026.07.14', 'IDENTITY_CONSISTENCY', 'Names contradict across documents.', 'high', array['fullName','accountHolder']),
  ('DOB_MISMATCH', '2026.07.14', 'IDENTITY_CONSISTENCY', 'Date of birth contradicts across documents.', 'critical', array['dateOfBirth']),
  ('SALARY_INCONSISTENCY', '2026.07.14', 'FINANCIAL_PLAUSIBILITY', 'Salary values contradict across documents.', 'high', array['grossSalary','netSalary']),
  ('EMPLOYER_MISMATCH', '2026.07.14', 'IDENTITY_CONSISTENCY', 'Employer values contradict across documents.', 'medium', array['employerName']),
  ('ACCOUNT_HOLDER_MISMATCH', '2026.07.14', 'FINANCIAL_PLAUSIBILITY', 'Bank account holder does not match applicant.', 'high', array['accountHolder','fullName']),
  ('ADDRESS_MISMATCH', '2026.07.14', 'ADDRESS_CONSISTENCY', 'Address values contradict across documents.', 'medium', array['street','postalCode']),
  ('CREATION_MODIFICATION_ANOMALY', '2026.07.14', 'DIGITAL_INTEGRITY', 'Document metadata has creation/modification anomaly.', 'medium', array['metadata']),
  ('SUSPICIOUS_PDF_METADATA', '2026.07.14', 'DIGITAL_INTEGRITY', 'PDF metadata contains suspicious indicators.', 'medium', array['metadata']),
  ('POSSIBLE_IMAGE_EDITING', '2026.07.14', 'DIGITAL_INTEGRITY', 'Image editing indicators require review.', 'medium', array['imageMetadata']),
  ('REQUIRED_FIELD_MISSING', '2026.07.14', 'DOCUMENT_AUTHENTICITY', 'Required field is missing.', 'high', array['schema']),
  ('UNKNOWN_ISSUER', '2026.07.14', 'DOCUMENT_AUTHENTICITY', 'Issuer is unknown or absent.', 'medium', array['issuer']),
  ('TEMPLATE_ANOMALY', '2026.07.14', 'DOCUMENT_AUTHENTICITY', 'Template anomaly detected.', 'medium', array['template']),
  ('IMPOSSIBLE_EMPLOYMENT_TIMELINE', '2026.07.14', 'TEMPORAL_COHERENCE', 'Employment timeline is impossible.', 'high', array['employmentStartDate']),
  ('OVERLAPPING_CONTRADICTORY_PERIODS', '2026.07.14', 'TEMPORAL_COHERENCE', 'Contradictory periods overlap.', 'high', array['period']),
  ('AI_UNSUPPORTED_CLAIM', '2026.07.14', 'DOCUMENT_AUTHENTICITY', 'AI observation lacked evidence reference.', 'critical', array['evidence']),
  ('DOCUMENT_PROMPT_INJECTION', '2026.07.14', 'DIGITAL_INTEGRITY', 'Document text contains instruction-like prompt injection content.', 'high', array['rawText'])
on conflict (rule_id, rule_version) do update set
  category = excluded.category,
  description = excluded.description,
  severity = excluded.severity,
  input_fields = excluded.input_fields;

