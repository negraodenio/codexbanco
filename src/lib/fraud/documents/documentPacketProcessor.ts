import { LogicalDocument } from "../types";
import { detectBoundaries } from "./boundaryDetector";
import { buildLogicalDocuments } from "./documentSplitter";
import { splitTextIntoPseudoPages } from "./pageSequenceResolver";

export function processDocumentPacket(input: {
  applicationId: string;
  documentId: string;
  filename: string;
  mimeType: string;
  pageCount: number;
  text: string;
}): LogicalDocument[] {
  const pages = splitTextIntoPseudoPages(input.text, input.pageCount);
  const boundaries = detectBoundaries({
    documentId: input.documentId,
    filename: input.filename,
    mimeType: input.mimeType,
    pages
  });
  return buildLogicalDocuments({
    applicationId: input.applicationId,
    parentDocumentId: input.documentId,
    boundaries
  });
}

