import { recordHumanDecision } from "../fraud/governance/humanDecision";
import { runFraudPipeline } from "../fraud/pipeline/fraudPipeline";
import { LoanApplicationInvestigation } from "../fraud/types";
import { recommendedDecision } from "../fraud/scoring/multiScoreEngine";

let cached: Promise<LoanApplicationInvestigation> | undefined;

const sampleId = "app_demo_001";

export async function getDemoInvestigation(): Promise<LoanApplicationInvestigation> {
  cached ??= runFraudPipeline({
    applicationId: sampleId,
    applicantName: "Denio Negrao",
    uploaderId: "reviewer_demo",
    files: [
      {
        originalFilename: "cartao-cidadao.pdf",
        declaredMimeType: "application/pdf",
        buffer: Buffer.from(
          `%PDF-1.7
          /Producer (Local Demo)
          Nome: Denio Negrao
          NIF: 123456789
          Nascimento: 1988-05-02
          Documento: CC1234567
          Emissao: 2020-01-01
          Validade: 2029-01-01`
        ),
        text: "Cartao de Cidadao Nome: Denio Negrao NIF: 123456789 Nascimento: 1988-05-02 Documento: CC1234567 Emissao: 2020-01-01 Validade: 2029-01-01"
      },
      {
        originalFilename: "recibo-vencimento.pdf",
        declaredMimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7 Recibo de vencimento"),
        text:
          "Recibo de vencimento Nome: Denio Negrao NIF: 123456788 Empregador: Atlas Finance Lda NIF empregador: 509442013 Salario bruto: 3200,00 Salario liquido: 4500,00 Periodo: 2026-06"
      },
      {
        originalFilename: "extrato-bancario.pdf",
        declaredMimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7 Extrato bancario /EmbeddedFile"),
        text:
          "Extrato bancario Titular: Denio Negraoo IBAN: PT50000201231234567890154 Banco: Banco Demo Saldo: 845,20 Morada: Rua das Flores 10 1000-001 Municipio: Lisboa Pais: Portugal"
      },
      {
        originalFilename: "contrato-trabalho.pdf",
        declaredMimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7 Contrato de trabalho"),
        text:
          "Contrato de trabalho Nome: Denio Negrao NIF: 123456789 Empregador: Atlas Finance Lda Inicio: 2028-01-01 Contrato: Sem termo Salario bruto: 3200,00"
      }
    ]
  }).then((investigation) => {
    const overall = investigation.scores.find((score) => score.scoreName === "Overall Recommendation Score")?.score ?? 0;
    const systemRecommendation = recommendedDecision(overall);
    const humanDecision = recordHumanDecision({
      applicationId: investigation.applicationId,
      systemRecommendation,
      systemScores: investigation.scores,
      humanDecision: "MANUAL_REVIEW_REQUIRED",
      reviewerId: "reviewer_demo",
      reviewerRole: "Senior Fraud Analyst",
      justification: "Demo review opened because identity and financial evidence need corroboration before final decision.",
      overrideReason: systemRecommendation === "MANUAL_REVIEW_REQUIRED" ? undefined : "Manual governance requires review for demo case."
    });
    return { ...investigation, humanDecisions: [humanDecision] };
  });
  return cached;
}

export async function getApplication(id: string): Promise<LoanApplicationInvestigation | undefined> {
  const demo = await getDemoInvestigation();
  return id === demo.applicationId ? demo : undefined;
}

export async function getKpis() {
  const app = await getDemoInvestigation();
  const flagsWithEvidence = app.redFlags.filter((flag) => flag.evidence.length > 0).length;
  const overall = app.scores.find((score) => score.scoreName === "Overall Recommendation Score")?.score ?? 0;
  return {
    totalApplications: 1,
    processingVolume: app.documents.length,
    highRiskRate: overall >= 70 ? 1 : 0,
    confirmedFraudRate: null,
    falsePositiveRate: null,
    falseNegativeRate: null,
    manualReviewRate: app.humanDecisions.some((decision) => decision.humanDecision === "MANUAL_REVIEW_REQUIRED") ? 1 : 0,
    humanOverrideRate: app.humanDecisions.filter((decision) => decision.humanDecision !== decision.systemRecommendation).length,
    averageProcessingTimeMs: Math.round(app.pipelineEvents.reduce((sum, event) => sum + (event.durationMs ?? 0), 0) / Math.max(1, app.pipelineEvents.length)),
    p50LatencyMs: percentile(app.pipelineEvents.map((event) => event.durationMs ?? 0), 0.5),
    p95LatencyMs: percentile(app.pipelineEvents.map((event) => event.durationMs ?? 0), 0.95),
    extractionConfidenceDistribution: app.extractions.flatMap((extraction) => extraction.fields.map((field) => field.confidence)),
    scoreDistribution: app.scores.map((score) => ({ name: score.scoreName, score: score.score })),
    topRedFlags: app.redFlags.slice(0, 8).map((flag) => ({ type: flag.flagType, severity: flag.severity })),
    topContradictionTypes: app.crossDocumentChecks.filter((check) => check.status === "contradiction").map((check) => check.checkId),
    processingFailureRate: app.pipelineEvents.filter((event) => event.success === false).length / Math.max(1, app.pipelineEvents.length),
    decisionAgreementRate: app.humanDecisions.filter((decision) => decision.humanDecision === decision.systemRecommendation).length / Math.max(1, app.humanDecisions.length),
    evidenceCompletenessRate: flagsWithEvidence / Math.max(1, app.redFlags.length),
    modelUsageDistribution: app.pipelineEvents.reduce<Record<string, number>>((acc, event) => {
      const key = event.processor ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
    rulesTriggeredByVersion: app.validationResults.reduce<Record<string, number>>((acc, result) => {
      acc[result.ruleVersion] = (acc[result.ruleVersion] ?? 0) + 1;
      return acc;
    }, {}),
    humanReviewCompletionRate: app.humanDecisions.length > 0 ? 1 : 0
  };
}

function percentile(values: number[], percentileValue: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * percentileValue))];
}

