import { EvidenceReference, DocumentMetadata, MetadataIndicator } from "../types";
import { makeId, nowIso } from "../utils/id";

function pdfInfo(text: string, key: string): string | undefined {
  const match = text.match(new RegExp(`/${key}\\s*\\(([^)]{1,200})\\)`));
  return match?.[1];
}

export function extractDocumentMetadata(buffer: Buffer, documentId: string, detectedMimeType: string): DocumentMetadata {
  const indicators: MetadataIndicator[] = [];
  const evidence = (explanation: string): EvidenceReference => ({
    evidenceId: makeId("ev"),
    documentId,
    detector: "metadata-extractor",
    detectorVersion: "0.1.0",
    timestamp: nowIso(),
    explanation
  });

  if (detectedMimeType === "application/pdf") {
    const header = buffer.subarray(0, Math.min(buffer.length, 250_000)).toString("latin1");
    const version = header.match(/%PDF-(\d\.\d)/)?.[1];
    const creationDate = pdfInfo(header, "CreationDate");
    const modificationDate = pdfInfo(header, "ModDate");
    const producer = pdfInfo(header, "Producer");
    const creator = pdfInfo(header, "Creator");
    const hasDigitalSignature = /\/Sig\b|\/ByteRange\b/.test(header);
    const embeddedObjectCount = (header.match(/\/EmbeddedFile\b/g) ?? []).length;

    if (creationDate && modificationDate && creationDate > modificationDate) {
      indicators.push({
        indicatorId: makeId("mdi"),
        severity: "medium",
        description: "PDF creation date appears later than modification date.",
        evidence: [evidence("Creation and modification metadata are internally inconsistent.")]
      });
    }

    if (embeddedObjectCount > 0) {
      indicators.push({
        indicatorId: makeId("mdi"),
        severity: "medium",
        description: "PDF contains embedded objects requiring review.",
        evidence: [evidence("Embedded file markers were detected in the PDF structure.")]
      });
    }

    return {
      pdf: { version, creationDate, modificationDate, producer, creator, hasDigitalSignature, embeddedObjectCount },
      indicators
    };
  }

  if (detectedMimeType.startsWith("image/")) {
    indicators.push({
      indicatorId: makeId("mdi"),
      severity: "info",
      description: "Image forensic metadata requires external EXIF parser for production use.",
      evidence: [evidence("Image was accepted but deep EXIF parsing is not enabled in the local adapter.")]
    });
    return { image: { exifPresent: false }, indicators };
  }

  return { indicators };
}

