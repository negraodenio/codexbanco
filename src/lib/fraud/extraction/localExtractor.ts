import { DocumentExtraction, DocumentType, ExtractedField, FieldProvenance, LogicalDocument } from "../types";
import { nowIso } from "../utils/id";

function match(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const found = text.match(pattern);
    if (found?.[1]) return found[1].trim();
  }
  return undefined;
}

function money(value?: string): number | undefined {
  if (!value) return undefined;
  return Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
}

export function localExtractFields(input: {
  documentId: string;
  logicalDocument?: LogicalDocument;
  documentType: DocumentType;
  schemaId: string;
  text: string;
}): DocumentExtraction {
  const provenance: FieldProvenance = {
    documentId: input.documentId,
    logicalDocumentId: input.logicalDocument?.logicalDocumentId,
    page: input.logicalDocument?.pageStart ?? 1,
    extractor: "local-regex-extractor",
    extractorVersion: "0.1.0",
    timestamp: nowIso()
  };
  const fields: ExtractedField[] = [];
  const add = (field: string, value: string | number | undefined, confidence = 0.72) => {
    if (value === undefined || value === "") return;
    fields.push({ field, value, normalizedValue: typeof value === "string" ? value.trim() : value, confidence, provenance });
  };

  add("fullName", match(input.text, [/nome[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{4,80})/i, /name[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{4,80})/i]));
  add("accountHolder", match(input.text, [/titular[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{4,80})/i, /account holder[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{4,80})/i]));
  add("nif", match(input.text, [/\bNIF[:\s]*(\d{9})\b/i, /\bcontribuinte[:\s]*(\d{9})\b/i]), 0.88);
  add("employerNif", match(input.text, [/NIF empregador[:\s]*(\d{9})/i, /employer nif[:\s]*(\d{9})/i]), 0.82);
  add("iban", match(input.text, [/\b(PT50\s?\d{4}\s?\d{4}\s?\d{11}\s?\d{2})\b/i, /\b([A-Z]{2}\d{2}[A-Z0-9\s]{10,30})\b/]), 0.86);
  add("dateOfBirth", match(input.text, [/nascimento[:\s]+(\d{4}-\d{2}-\d{2})/i, /birth[:\s]+(\d{4}-\d{2}-\d{2})/i]));
  add("issueDate", match(input.text, [/emiss[aã]o[:\s]+(\d{4}-\d{2}-\d{2})/i, /issue[:\s]+(\d{4}-\d{2}-\d{2})/i]));
  add("expiryDate", match(input.text, [/validade[:\s]+(\d{4}-\d{2}-\d{2})/i, /expir\w*[:\s]+(\d{4}-\d{2}-\d{2})/i]));
  add("documentNumber", match(input.text, [/documento[:\s]+([A-Z0-9-]{5,20})/i, /document number[:\s]+([A-Z0-9-]{5,20})/i]));
  add("employerName", match(input.text, [/empregador[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s&.'-]{3,80})/i, /employer[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s&.'-]{3,80})/i]));
  add("grossSalary", money(match(input.text, [/sal[aá]rio bruto[:\s]+([\d.,]+)/i, /gross salary[:\s]+([\d.,]+)/i])), 0.78);
  add("netSalary", money(match(input.text, [/sal[aá]rio l[ií]quido[:\s]+([\d.,]+)/i, /net salary[:\s]+([\d.,]+)/i])), 0.78);
  add("accountBalance", money(match(input.text, [/saldo[:\s]+([\d.,-]+)/i, /balance[:\s]+([\d.,-]+)/i])), 0.76);
  add("bankName", match(input.text, [/banco[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{3,80})/i, /bank[:\s]+([A-ZÀ-Ú][A-Za-zÀ-ú\s.'-]{3,80})/i]));
  add("street", match(input.text, [/morada[:\s]+([^,\n]{6,100})/i, /address[:\s]+([^,\n]{6,100})/i]));
  add("postalCode", match(input.text, [/\b(\d{4}-\d{3})\b/]));
  add("municipality", match(input.text, [/munic[ií]pio[:\s]+([A-Za-zÀ-ú\s.'-]{3,60})/i]));
  add("country", match(input.text, [/pa[ií]s[:\s]+([A-Za-zÀ-ú\s.'-]{2,60})/i]));
  add("employmentStartDate", match(input.text, [/in[ií]cio[:\s]+(\d{4}-\d{2}-\d{2})/i, /start date[:\s]+(\d{4}-\d{2}-\d{2})/i]));
  add("contractType", match(input.text, [/contrato[:\s]+([A-Za-zÀ-ú\s.'-]{3,60})/i]));
  add("payPeriod", match(input.text, [/per[ií]odo[:\s]+([A-Za-z0-9À-ú\s.'/-]{3,40})/i]));

  return {
    documentId: input.documentId,
    logicalDocumentId: input.logicalDocument?.logicalDocumentId,
    documentType: input.documentType,
    schemaId: input.schemaId,
    fields,
    rawTextDigest: String(input.text.length),
    extractor: "local-regex-extractor",
    extractorVersion: "0.1.0",
    validated: false
  };
}

