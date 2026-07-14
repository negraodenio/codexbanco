import { ClassificationResult, DocumentType, EvidenceReference } from "../types";
import { confidenceBand, makeId, nowIso } from "../utils/id";

const classifierVersion = "0.1.0";

export function classifyDocument(input: {
  documentId: string;
  filename: string;
  mimeType: string;
  text?: string;
}): ClassificationResult {
  const source = `${input.filename} ${input.text ?? ""}`.toLowerCase();
  const evidence = (explanation: string): EvidenceReference => ({
    evidenceId: makeId("ev"),
    documentId: input.documentId,
    detector: "local-document-classifier",
    detectorVersion: classifierVersion,
    timestamp: nowIso(),
    explanation
  });

  const candidates: Array<[DocumentType, number, string, string?]> = [
    [DocumentType.PortugueseId, /cart[aã]o de cidad[aã]o|citizen|identification|nif/.test(source) ? 0.86 : 0, "PT", "PORTUGAL_ID"],
    [DocumentType.Payslip, /recibo de vencimento|payslip|sal[aá]rio|remunera/.test(source) ? 0.9 : 0, "PT", "PORTUGAL_MONTHLY_PAYSLIP"],
    [DocumentType.BankStatement, /extrato|statement|iban|saldo|bank/.test(source) ? 0.88 : 0, "PT", "SEPA_STATEMENT"],
    [DocumentType.EmploymentContract, /contrato de trabalho|employment contract|entidade empregadora/.test(source) ? 0.84 : 0, "PT", "PT_EMPLOYMENT"],
    [DocumentType.TaxDeclaration, /irs|declara[cç][aã]o de rendimentos|tax declaration/.test(source) ? 0.84 : 0, "PT", "PT_IRS"],
    [DocumentType.ProofOfAddress, /morada|comprovativo de morada|postal|utility bill/.test(source) ? 0.8 : 0, "PT", "PT_ADDRESS"],
    [DocumentType.Invoice, /fatura|invoice/.test(source) ? 0.75 : 0, "PT", "INVOICE"],
    [DocumentType.Passport, /passport|passaporte/.test(source) ? 0.83 : 0, "EU", "PASSPORT"]
  ];

  const best = candidates.sort((a, b) => b[1] - a[1])[0];
  const confidence = best?.[1] && best[1] > 0 ? best[1] : input.mimeType === "application/pdf" ? 0.35 : 0.2;
  const documentType = best?.[1] && best[1] > 0 ? best[0] : DocumentType.Unknown;

  return {
    documentType,
    subtype: documentType === DocumentType.Unknown ? undefined : best[3],
    country: documentType === DocumentType.Unknown ? undefined : best[2],
    confidence,
    confidenceBand: confidenceBand(confidence),
    classifier: "local-document-classifier",
    classifierVersion,
    evidence: [evidence(documentType === DocumentType.Unknown ? "No strong local keyword evidence matched a known document type." : `Keyword evidence matched ${documentType}.`)],
    timestamp: nowIso()
  };
}

