import { DocumentType } from "../types";

export type ProcessorTask = "classification" | "ocr" | "extraction" | "forensics" | "semantic_analysis";

export interface ModelRouteDecision {
  selectedProcessor: string;
  reason: string;
  provider: "local" | "mistral" | "pixtral" | "native";
  modelVersion: string;
  fallbackPath: string[];
  confidence: number;
}

export function routeProcessor(input: {
  mimeType: string;
  documentType: DocumentType;
  textLayerAvailable: boolean;
  scanQuality?: number;
  pageCount: number;
  task: ProcessorTask;
  costMode?: "low" | "balanced" | "quality";
}): ModelRouteDecision {
  if (input.task === "forensics") {
    return {
      selectedProcessor: "metadata-forensic-analyzer",
      reason: "Forensic metadata extraction runs locally before OCR or LLM analysis.",
      provider: "local",
      modelVersion: "0.1.0",
      fallbackPath: [],
      confidence: 0.9
    };
  }

  if (input.textLayerAvailable && input.mimeType === "application/pdf") {
    return {
      selectedProcessor: "native-pdf-text-parser",
      reason: "PDF text layer is available, so native parsing is lower risk and lower cost than visual OCR.",
      provider: "native",
      modelVersion: "0.1.0",
      fallbackPath: ["mistral-ocr", "pixtral-visual-analysis"],
      confidence: 0.86
    };
  }

  if (input.mimeType.startsWith("image/") || input.scanQuality === undefined || input.scanQuality < 0.7) {
    return {
      selectedProcessor: "mistral-ocr",
      reason: "Visual or low-quality scan requires OCR provider integration.",
      provider: "mistral",
      modelVersion: "configured-by-env",
      fallbackPath: ["pixtral-visual-analysis", "manual-review"],
      confidence: 0.72
    };
  }

  return {
    selectedProcessor: "local-deterministic-extractor",
    reason: "Known document type with text available can use deterministic extraction before AI fallback.",
    provider: "local",
    modelVersion: "0.1.0",
    fallbackPath: ["mistral-ocr", "manual-review"],
    confidence: input.documentType === DocumentType.Unknown ? 0.35 : 0.78
  };
}

