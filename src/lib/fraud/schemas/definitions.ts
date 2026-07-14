import { DocumentType, FraudSchema } from "../types";
import { versionRegistry } from "../versions";

const stamp = "2026-07-14T00:00:00.000Z";

export const schemaDefinitions: FraudSchema[] = [
  {
    schemaId: "PORTUGUESE_ID_V1",
    name: "Portuguese Citizen Identity Document",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.PortugueseId,
    country: "PT",
    status: "active",
    requiredFields: ["fullName", "nif", "dateOfBirth", "documentNumber", "expiryDate"],
    optionalFields: ["nationality", "issueDate", "issuer"],
    fieldTypes: {
      fullName: "string",
      nif: "nif",
      dateOfBirth: "date",
      documentNumber: "string",
      expiryDate: "date",
      nationality: "string",
      issueDate: "date",
      issuer: "string"
    },
    validationRules: ["PT_NIF_CHECKSUM", "DOCUMENT_EXPIRY_DATE", "DOB_PLAUSIBILITY", "FUTURE_ISSUE_DATE"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "PASSPORT_EU_V1",
    name: "EU Passport",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.Passport,
    country: "EU",
    status: "active",
    requiredFields: ["fullName", "documentNumber", "dateOfBirth", "expiryDate"],
    optionalFields: ["nationality", "issueDate", "issuer"],
    fieldTypes: {
      fullName: "string",
      documentNumber: "string",
      dateOfBirth: "date",
      expiryDate: "date",
      nationality: "string",
      issueDate: "date",
      issuer: "string"
    },
    validationRules: ["DOCUMENT_EXPIRY_DATE", "DOB_PLAUSIBILITY", "FUTURE_ISSUE_DATE"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "PAYSLIP_PT_V1",
    name: "Portugal Monthly Payslip",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.Payslip,
    country: "PT",
    status: "active",
    requiredFields: ["fullName", "nif", "employerName", "grossSalary", "netSalary", "payPeriod"],
    optionalFields: ["employerNif", "iban", "occupation"],
    fieldTypes: {
      fullName: "string",
      nif: "nif",
      employerName: "string",
      employerNif: "nif",
      grossSalary: "number",
      netSalary: "number",
      payPeriod: "string",
      iban: "iban",
      occupation: "string"
    },
    validationRules: ["PT_NIF_CHECKSUM", "EMPLOYER_NIF_CHECKSUM", "SALARY_ARITHMETIC", "IBAN_MOD97"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "BANK_STATEMENT_SEPA_V1",
    name: "SEPA Bank Statement",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.BankStatement,
    country: "PT",
    status: "active",
    requiredFields: ["accountHolder", "iban", "bankName", "accountBalance"],
    optionalFields: ["averageBalance", "transactionCount"],
    fieldTypes: {
      accountHolder: "string",
      iban: "iban",
      bankName: "string",
      accountBalance: "number",
      averageBalance: "number",
      transactionCount: "number"
    },
    validationRules: ["IBAN_MOD97", "BALANCE_PLAUSIBILITY"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "EMPLOYMENT_CONTRACT_PT_V1",
    name: "Portugal Employment Contract",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.EmploymentContract,
    country: "PT",
    status: "active",
    requiredFields: ["fullName", "employerName", "employmentStartDate", "contractType"],
    optionalFields: ["nif", "employerNif", "grossSalary", "occupation"],
    fieldTypes: {
      fullName: "string",
      employerName: "string",
      employmentStartDate: "date",
      contractType: "string",
      nif: "nif",
      employerNif: "nif",
      grossSalary: "number",
      occupation: "string"
    },
    validationRules: ["EMPLOYMENT_START_DATE", "PT_NIF_CHECKSUM", "EMPLOYER_NIF_CHECKSUM"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "IRS_DECLARATION_PT_V1",
    name: "Portugal Tax Declaration",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.TaxDeclaration,
    country: "PT",
    status: "active",
    requiredFields: ["fullName", "nif", "grossIncome"],
    optionalFields: ["taxYear"],
    fieldTypes: {
      fullName: "string",
      nif: "nif",
      grossIncome: "number",
      taxYear: "number"
    },
    validationRules: ["PT_NIF_CHECKSUM", "TAX_YEAR_PLAUSIBILITY"],
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    schemaId: "PROOF_OF_ADDRESS_PT_V1",
    name: "Portugal Proof of Address",
    version: versionRegistry.schemaVersion,
    documentType: DocumentType.ProofOfAddress,
    country: "PT",
    status: "active",
    requiredFields: ["fullName", "street", "postalCode", "municipality", "country"],
    optionalFields: ["nif"],
    fieldTypes: {
      fullName: "string",
      street: "string",
      postalCode: "string",
      municipality: "string",
      country: "string",
      nif: "nif"
    },
    validationRules: ["PT_POSTAL_CODE_FORMAT", "PT_NIF_CHECKSUM"],
    createdAt: stamp,
    updatedAt: stamp
  }
];

