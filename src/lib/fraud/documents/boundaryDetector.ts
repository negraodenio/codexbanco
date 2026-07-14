import { ClassificationResult, DocumentType } from "../types";
import { classifyDocument } from "./documentClassifier";

export interface PageBoundary {
  pageStart: number;
  pageEnd: number;
  classification: ClassificationResult;
  confidence: number;
}

export function detectBoundaries(input: {
  documentId: string;
  filename: string;
  mimeType: string;
  pages: string[];
}): PageBoundary[] {
  if (input.pages.length <= 1) {
    return [
      {
        pageStart: 1,
        pageEnd: 1,
        classification: classifyDocument({ documentId: input.documentId, filename: input.filename, mimeType: input.mimeType, text: input.pages[0] }),
        confidence: 0.9
      }
    ];
  }

  const boundaries: PageBoundary[] = [];
  let currentStart = 1;
  let currentClassification = classifyDocument({ documentId: input.documentId, filename: input.filename, mimeType: input.mimeType, text: input.pages[0] });

  for (let index = 1; index < input.pages.length; index += 1) {
    const classification = classifyDocument({ documentId: input.documentId, filename: input.filename, mimeType: input.mimeType, text: input.pages[index] });
    const typeChanged = classification.documentType !== DocumentType.Unknown && classification.documentType !== currentClassification.documentType;
    if (typeChanged) {
      boundaries.push({ pageStart: currentStart, pageEnd: index, classification: currentClassification, confidence: 0.76 });
      currentStart = index + 1;
      currentClassification = classification;
    }
  }

  boundaries.push({ pageStart: currentStart, pageEnd: input.pages.length, classification: currentClassification, confidence: 0.76 });
  return boundaries;
}

