import { DocumentMetadata, MetadataIndicator } from "../types";

export function deriveForensicIndicators(metadata: DocumentMetadata): MetadataIndicator[] {
  return metadata.indicators;
}

