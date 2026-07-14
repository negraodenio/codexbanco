import { LogicalDocument } from "../types";
import { confidenceBand, makeId } from "../utils/id";
import { PageBoundary } from "./boundaryDetector";

export function buildLogicalDocuments(input: {
  applicationId: string;
  parentDocumentId: string;
  boundaries: PageBoundary[];
}): LogicalDocument[] {
  return input.boundaries.map((boundary) => ({
    logicalDocumentId: makeId("ldoc"),
    parentDocumentId: input.parentDocumentId,
    applicationId: input.applicationId,
    pageStart: boundary.pageStart,
    pageEnd: boundary.pageEnd,
    pageNumbers: Array.from({ length: boundary.pageEnd - boundary.pageStart + 1 }, (_, index) => boundary.pageStart + index),
    classification: boundary.classification,
    splitConfidence: boundary.confidence,
    splitConfidenceBand: confidenceBand(boundary.confidence),
    requiresHumanReview: boundary.confidence < 0.8 || boundary.classification.confidence < 0.55
  }));
}

