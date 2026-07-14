import { analyzeSemanticCategories } from "../analysis/semanticFraudAnalyzer";
import { AuditTrail } from "../audit/auditTrail";
import { runCrossDocumentChecks } from "../consistency/crossDocumentEngine";
import { processDocumentPacket } from "../documents/documentPacketProcessor";
import { localExtractFields } from "../extraction/localExtractor";
import { buildEvidenceGraph } from "../graph/graphBuilder";
import { buildDocumentProvenance } from "../intake/provenanceManager";
import { extractDocumentMetadata } from "../intake/metadataExtractor";
import { PipelineRunTracker } from "../observability/pipelineRun";
import { buildRedFlags } from "../redflags/redFlagEngine";
import { routeProcessor } from "../routing/modelRouter";
import { executeDeterministicRules } from "../rules/ruleExecutor";
import { selectSchema } from "../schemas/schemaSelector";
import { validateExtractionAgainstSchema } from "../schemas/schemaValidator";
import { calculateRiskScores, recommendedDecision } from "../scoring/multiScoreEngine";
import { detectDocumentPromptInjection } from "../security/promptInjection";
import { DocumentExtraction, DocumentProvenance, LoanApplicationInvestigation, PipelineStage, ValidationResult } from "../types";
import { makeId } from "../utils/id";

export interface PipelineFileInput {
  originalFilename: string;
  declaredMimeType: string;
  buffer: Buffer;
  text?: string;
}

export async function runFraudPipeline(input: {
  applicationId?: string;
  applicantName: string;
  files: PipelineFileInput[];
  uploaderId?: string;
}): Promise<LoanApplicationInvestigation & { systemRecommendation: ReturnType<typeof recommendedDecision> }> {
  const applicationId = input.applicationId ?? makeId("app");
  const audit = new AuditTrail();
  const tracker = new PipelineRunTracker();
  const documents: DocumentProvenance[] = [];
  const logicalDocuments: LoanApplicationInvestigation["logicalDocuments"] = [];
  const extractions: DocumentExtraction[] = [];
  const validationResults: ValidationResult[] = [];
  const forensicIndicators: ReturnType<typeof extractDocumentMetadata>["indicators"] = [];

  for (const file of input.files) {
    const provenance = buildDocumentProvenance({
      applicationId,
      originalFilename: file.originalFilename,
      declaredMimeType: file.declaredMimeType,
      buffer: file.buffer,
      uploaderId: input.uploaderId
    });
    documents.push(provenance);
    audit.append({
      applicationId,
      documentId: provenance.documentId,
      eventType: "document_hashed",
      actorType: "system",
      actorId: "fraud-pipeline",
      correlationId: provenance.correlationId,
      traceId: provenance.traceId,
      metadata: { sha256: provenance.sha256, detectedMimeType: provenance.detectedMimeType }
    });

    const metadataRun = tracker.start({
      applicationId,
      correlationId: provenance.correlationId,
      traceId: provenance.traceId,
      stage: PipelineStage.Hashed,
      processor: "metadata-extractor"
    });
    const metadata = extractDocumentMetadata(file.buffer, provenance.documentId, provenance.detectedMimeType);
    forensicIndicators.push(...metadata.indicators);
    tracker.finish(metadataRun);

    const text = file.text ?? file.buffer.toString("utf8");
    const injection = detectDocumentPromptInjection({ documentId: provenance.documentId, text });
    if (injection) validationResults.push(injection);

    const logical = processDocumentPacket({
      applicationId,
      documentId: provenance.documentId,
      filename: provenance.originalFilename,
      mimeType: provenance.detectedMimeType,
      pageCount: provenance.pageCount,
      text
    });
    logicalDocuments.push(...logical);
    audit.append({
      applicationId,
      documentId: provenance.documentId,
      eventType: "document_classified_and_split",
      actorType: "system",
      actorId: "fraud-pipeline",
      correlationId: provenance.correlationId,
      traceId: provenance.traceId,
      metadata: { logicalDocuments: logical.length }
    });

    for (const logicalDocument of logical) {
      const schema = selectSchema(logicalDocument.classification);
      if (!schema) continue;
      const route = routeProcessor({
        mimeType: provenance.detectedMimeType,
        documentType: logicalDocument.classification.documentType,
        textLayerAvailable: Boolean(text.trim()),
        pageCount: logicalDocument.pageNumbers.length,
        task: "extraction"
      });
      const run = tracker.start({
        applicationId,
        correlationId: provenance.correlationId,
        traceId: provenance.traceId,
        stage: PipelineStage.SchemaSelected,
        processor: route.selectedProcessor,
        modelUsed: route.modelVersion
      });
      const extraction = localExtractFields({
        documentId: provenance.documentId,
        logicalDocument,
        documentType: logicalDocument.classification.documentType,
        schemaId: schema.schemaId,
        text
      });
      const schemaResults = validateExtractionAgainstSchema(extraction, schema);
      const ruleResults = executeDeterministicRules(extraction);
      extraction.validated = [...schemaResults, ...ruleResults].every((result) => result.passed);
      extractions.push(extraction);
      validationResults.push(...schemaResults, ...ruleResults);
      tracker.finish(run);
    }
  }

  const crossDocumentChecks = runCrossDocumentChecks(extractions);
  const redFlags = buildRedFlags({ validations: validationResults, checks: crossDocumentChecks, forensicIndicators });
  const categoryAnalyses = analyzeSemanticCategories(redFlags);
  const averageConfidence =
    extractions.flatMap((extraction) => extraction.fields).reduce((sum, field, _index, fields) => sum + field.confidence / Math.max(1, fields.length), 0) || 0.35;
  const scores = calculateRiskScores(redFlags, categoryAnalyses, averageConfidence);
  const graph = buildEvidenceGraph({ applicationId, documents, extractions, checks: crossDocumentChecks, redFlags });
  const overall = scores.find((score) => score.scoreName === "Overall Recommendation Score")?.score ?? 0;
  const systemRecommendation = recommendedDecision(overall);

  audit.append({
    applicationId,
    eventType: "score_calculated",
    actorType: "system",
    actorId: "fraud-pipeline",
    correlationId: documents[0]?.correlationId ?? makeId("corr"),
    traceId: documents[0]?.traceId ?? makeId("trace"),
    metadata: { overall, systemRecommendation }
  });

  return {
    applicationId,
    applicantName: input.applicantName,
    createdAt: new Date().toISOString(),
    documents,
    logicalDocuments,
    extractions,
    validationResults,
    crossDocumentChecks,
    redFlags,
    categoryAnalyses,
    scores,
    graph,
    auditEvents: audit.list(),
    humanDecisions: [],
    pipelineEvents: tracker.list(),
    systemRecommendation
  };
}

