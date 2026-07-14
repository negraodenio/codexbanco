export type ConfidenceBand = "very_low" | "low" | "medium" | "high" | "very_high";
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type EvidenceStatus = "suspected" | "corroborated" | "confirmed" | "dismissed";
export type SchemaStatus = "draft" | "active" | "deprecated";
export type DecisionValue =
  | "APPROVED"
  | "REJECTED"
  | "MANUAL_REVIEW_REQUIRED"
  | "MORE_DOCUMENTATION_REQUIRED"
  | "ESCALATED";

export enum DocumentType {
  PortugueseId = "PORTUGUESE_ID",
  Passport = "PASSPORT",
  Payslip = "PAYSLIP",
  BankStatement = "BANK_STATEMENT",
  EmploymentContract = "EMPLOYMENT_CONTRACT",
  TaxDeclaration = "TAX_DECLARATION",
  ProofOfAddress = "PROOF_OF_ADDRESS",
  LoanApplication = "LOAN_APPLICATION",
  Invoice = "INVOICE",
  Unknown = "UNKNOWN"
}

export enum FraudCategory {
  DocumentAuthenticity = "DOCUMENT_AUTHENTICITY",
  IdentityConsistency = "IDENTITY_CONSISTENCY",
  FinancialPlausibility = "FINANCIAL_PLAUSIBILITY",
  DigitalIntegrity = "DIGITAL_INTEGRITY",
  AddressConsistency = "ADDRESS_CONSISTENCY",
  TemporalCoherence = "TEMPORAL_COHERENCE",
  AmlIndicators = "AML_INDICATORS"
}

export enum PipelineStage {
  Uploaded = "UPLOADED",
  Hashed = "HASHED",
  Classified = "CLASSIFIED",
  Split = "SPLIT",
  SchemaSelected = "SCHEMA_SELECTED",
  OcrStarted = "OCR_STARTED",
  OcrCompleted = "OCR_COMPLETED",
  Validated = "VALIDATED",
  CrossChecked = "CROSS_CHECKED",
  GraphBuilt = "GRAPH_BUILT",
  AiAnalyzed = "AI_ANALYZED",
  Scored = "SCORED",
  HumanReview = "HUMAN_REVIEW",
  Decided = "DECIDED",
  Failed = "FAILED"
}

export interface EvidenceReference {
  evidenceId: string;
  documentId?: string;
  page?: number;
  field?: string;
  value?: string | number | boolean;
  location?: BoundingBox;
  detector: string;
  detectorVersion: string;
  timestamp: string;
  explanation: string;
}

export type BoundingBox = [number, number, number, number];

export interface DocumentProvenance {
  documentId: string;
  applicationId: string;
  originalFilename: string;
  declaredMimeType: string;
  detectedMimeType: string;
  fileSize: number;
  pageCount: number;
  sha256: string;
  uploadedAt: string;
  uploaderId?: string;
  sourceChannel: string;
  correlationId: string;
  traceId: string;
}

export interface MetadataIndicator {
  indicatorId: string;
  severity: Severity;
  description: string;
  evidence: EvidenceReference[];
}

export interface DocumentMetadata {
  pdf?: {
    version?: string;
    creationDate?: string;
    modificationDate?: string;
    producer?: string;
    creator?: string;
    hasDigitalSignature?: boolean;
    embeddedObjectCount?: number;
  };
  image?: {
    exifPresent: boolean;
    width?: number;
    height?: number;
  };
  indicators: MetadataIndicator[];
}

export interface ClassificationResult {
  documentType: DocumentType;
  subtype?: string;
  country?: string;
  confidence: number;
  confidenceBand: ConfidenceBand;
  classifier: string;
  classifierVersion: string;
  evidence: EvidenceReference[];
  timestamp: string;
}

export interface LogicalDocument {
  logicalDocumentId: string;
  parentDocumentId: string;
  applicationId: string;
  pageStart: number;
  pageEnd: number;
  pageNumbers: number[];
  classification: ClassificationResult;
  splitConfidence: number;
  splitConfidenceBand: ConfidenceBand;
  requiresHumanReview: boolean;
}

export interface FieldProvenance {
  documentId: string;
  logicalDocumentId?: string;
  page?: number;
  boundingBox?: BoundingBox;
  extractor: string;
  extractorVersion: string;
  timestamp: string;
}

export interface ExtractedField<T = string | number | boolean | null> {
  field: string;
  value: T;
  normalizedValue?: T;
  confidence: number;
  provenance: FieldProvenance;
}

export interface DocumentExtraction {
  documentId: string;
  logicalDocumentId?: string;
  documentType: DocumentType;
  schemaId: string;
  fields: ExtractedField[];
  rawTextDigest?: string;
  extractor: string;
  extractorVersion: string;
  validated: boolean;
}

export interface FraudSchema {
  schemaId: string;
  name: string;
  version: string;
  documentType: DocumentType;
  country?: string;
  status: SchemaStatus;
  requiredFields: string[];
  optionalFields: string[];
  fieldTypes: Record<string, "string" | "number" | "boolean" | "date" | "iban" | "nif">;
  validationRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  resultId: string;
  ruleId: string;
  ruleVersion: string;
  category: FraudCategory;
  description: string;
  severity: Severity;
  inputFields: string[];
  passed: boolean;
  evidence: EvidenceReference[];
  timestamp: string;
}

export interface CrossDocumentCheck {
  checkId: string;
  status: "match" | "normalized_match" | "partial_match" | "contradiction" | "missing_corroboration";
  severity: Severity;
  confidence: number;
  leftEvidence?: EvidenceReference;
  rightEvidence?: EvidenceReference;
  explanation: string;
}

export type GraphNodeType =
  | "Application"
  | "Document"
  | "Page"
  | "Person"
  | "Organization"
  | "Employer"
  | "NIF"
  | "IBAN"
  | "Address"
  | "FinancialValue"
  | "Claim"
  | "Evidence"
  | "RedFlag"
  | "Rule"
  | "Model"
  | "Decision"
  | "HumanReviewer";

export type GraphRelationshipType =
  | "CONTAINS"
  | "ASSERTS"
  | "EXTRACTED_FROM"
  | "SUPPORTS"
  | "CONTRADICTS"
  | "MATCHES"
  | "BELONGS_TO"
  | "GENERATED"
  | "REVIEWED_BY"
  | "OVERRIDES"
  | "DECIDED_BY";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphRelationshipType;
  properties: Record<string, unknown>;
}

export interface EvidenceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RedFlag {
  flagId: string;
  flagType: string;
  category: FraudCategory;
  severity: Severity;
  confidence: number;
  evidence: EvidenceReference[];
  sourceDocumentIds: string[];
  sourcePages: number[];
  detector: string;
  detectorVersion: string;
  ruleVersion?: string;
  explanation: string;
  status: EvidenceStatus;
  createdAt: string;
}

export interface SemanticCategoryAnalysis {
  category: FraudCategory;
  score: number;
  confidence: number;
  observations: string[];
  evidenceReferences: EvidenceReference[];
  limitations: string[];
  detector: string;
  version: string;
}

export interface ScoreComponent {
  component: string;
  scoreImpact: number;
  weight: number;
  evidenceCount: number;
  explanation: string;
}

export interface RiskScore {
  scoreName: "Document Fraud Score" | "Application Consistency Score" | "Financial Crime Risk Score" | "Extraction Confidence Score" | "Overall Recommendation Score";
  score: number;
  calibration: "HEURISTIC_UNCALIBRATED" | "CALIBRATED";
  components: ScoreComponent[];
  weights: Record<string, number>;
  penalties: ScoreComponent[];
  evidenceCount: number;
  confidence: number;
  scoreEngineVersion: string;
}

export interface HumanDecision {
  decisionId: string;
  applicationId: string;
  systemRecommendation: DecisionValue;
  systemScores: RiskScore[];
  humanDecision: DecisionValue;
  reviewerId: string;
  reviewerRole: string;
  justification: string;
  overrideReason?: string;
  timestamp: string;
  modelVersion: string;
  promptVersion: string;
  ruleSetVersion: string;
  scoreEngineVersion: string;
  pipelineVersion: string;
}

export interface AuditEvent {
  eventId: string;
  applicationId: string;
  documentId?: string;
  eventType: string;
  actorType: "system" | "human" | "service";
  actorId: string;
  correlationId: string;
  traceId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  pipelineVersion: string;
}

export interface PipelineRunEvent {
  pipelineRunId: string;
  applicationId: string;
  correlationId: string;
  traceId: string;
  stage: PipelineStage;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  success?: boolean;
  retryCount: number;
  processor?: string;
  modelUsed?: string;
  tokenUsage?: number;
  estimatedCost?: number;
  errorCode?: string;
}

export interface LoanApplicationInvestigation {
  applicationId: string;
  applicantName: string;
  createdAt: string;
  documents: DocumentProvenance[];
  logicalDocuments: LogicalDocument[];
  extractions: DocumentExtraction[];
  validationResults: ValidationResult[];
  crossDocumentChecks: CrossDocumentCheck[];
  redFlags: RedFlag[];
  categoryAnalyses: SemanticCategoryAnalysis[];
  scores: RiskScore[];
  graph: EvidenceGraph;
  auditEvents: AuditEvent[];
  humanDecisions: HumanDecision[];
  pipelineEvents: PipelineRunEvent[];
}

