import { ClassificationResult } from "../types";
import { schemaRegistry } from "./schemaRegistry";

export function selectSchema(classification: ClassificationResult) {
  return schemaRegistry.activeFor(classification.documentType, classification.country);
}

