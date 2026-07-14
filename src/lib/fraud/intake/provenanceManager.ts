import { DocumentProvenance } from "../types";
import { makeId, nowIso } from "../utils/id";
import { sha256Buffer } from "./documentHasher";
import { detectMimeType } from "./mimeDetector";

export interface BuildProvenanceInput {
  applicationId: string;
  originalFilename: string;
  declaredMimeType: string;
  buffer: Buffer;
  uploaderId?: string;
  sourceChannel?: string;
  correlationId?: string;
  traceId?: string;
}

export function estimatePageCount(buffer: Buffer, detectedMimeType: string): number {
  if (detectedMimeType !== "application/pdf") return 1;
  const text = buffer.toString("latin1");
  const pageMarkers = text.match(/\/Type\s*\/Page\b/g);
  return Math.max(1, pageMarkers?.length ?? 1);
}

export function buildDocumentProvenance(input: BuildProvenanceInput): DocumentProvenance {
  const detectedMimeType = detectMimeType(input.buffer, input.declaredMimeType);
  return {
    documentId: makeId("doc"),
    applicationId: input.applicationId,
    originalFilename: input.originalFilename,
    declaredMimeType: input.declaredMimeType,
    detectedMimeType,
    fileSize: input.buffer.byteLength,
    pageCount: estimatePageCount(input.buffer, detectedMimeType),
    sha256: sha256Buffer(input.buffer),
    uploadedAt: nowIso(),
    uploaderId: input.uploaderId,
    sourceChannel: input.sourceChannel ?? "web",
    correlationId: input.correlationId ?? makeId("corr"),
    traceId: input.traceId ?? makeId("trace")
  };
}

