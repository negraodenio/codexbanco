import { AlertTriangle, CheckCircle2, GitBranch, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RiskGauge } from "@/components/RiskGauge";
import { ScoreBar } from "@/components/ScoreBar";
import { getDemoInvestigation } from "@/lib/data/localRepository";

export default async function InvestigationPage() {
  const app = await getDemoInvestigation();
  const overall = app.scores.find((score) => score.scoreName === "Overall Recommendation Score")?.score ?? 0;

  return (
    <AppShell>
      <section className="workspace-header">
        <div>
          <p className="eyebrow">Loan review detail</p>
          <h1>{app.applicantName}</h1>
          <p className="muted">{app.applicationId} · {app.documents.length} documentos · {app.redFlags.length} flags com evidência</p>
        </div>
        <RiskGauge score={overall} />
      </section>

      <section className="grid four" style={{ marginBottom: 16 }}>
        {app.scores.slice(0, 4).map((score) => (
          <div className="card metric" key={score.scoreName}>
            <span className="muted">{score.scoreName}</span>
            <span className="value">{score.score}</span>
            <small>{score.calibration.replace("_", " ")}</small>
          </div>
        ))}
      </section>

      <section className="grid two">
        <div className="grid">
          <div className="panel">
            <h2><AlertTriangle size={18} aria-hidden /> Red flags</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Severidade</th>
                  <th>Estado</th>
                  <th>Evidência</th>
                  <th>Explicação</th>
                </tr>
              </thead>
              <tbody>
                {app.redFlags.map((flag) => (
                  <tr key={flag.flagId}>
                    <td>{flag.flagType}</td>
                    <td><span className={`pill ${flag.severity}`}>{flag.severity}</span></td>
                    <td>{flag.status}</td>
                    <td>{flag.evidence.length}</td>
                    <td>{flag.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2><ShieldCheck size={18} aria-hidden /> Sete categorias</h2>
            <div className="grid">
              {app.categoryAnalyses.map((analysis) => (
                <ScoreBar key={analysis.category} label={analysis.category} score={analysis.score} />
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Campos extraídos por documento</h2>
            <div className="grid">
              {app.extractions.map((extraction) => (
                <div key={`${extraction.documentId}-${extraction.logicalDocumentId}`} className="card">
                  <h3>{extraction.documentType} · {extraction.schemaId}</h3>
                  <div className="field-list">
                    {extraction.fields.map((field) => (
                      <div className="field-row" key={`${field.field}-${field.value}`}>
                        <strong>{field.field}</strong>
                        <span>{String(field.value)}</span>
                        <span>{Math.round(field.confidence * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Contradições cross-document</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Confiança</th>
                  <th>Explicação</th>
                </tr>
              </thead>
              <tbody>
                {app.crossDocumentChecks.map((check, index) => (
                  <tr key={`${check.checkId}-${index}`}>
                    <td>{check.checkId}</td>
                    <td>{check.status}</td>
                    <td>{Math.round(check.confidence * 100)}%</td>
                    <td>{check.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid">
          <div className="panel">
            <h2><GitBranch size={18} aria-hidden /> Evidence graph</h2>
            <div className="graph">
              {app.graph.nodes.slice(0, 16).map((node) => (
                <div className="graph-node" key={node.id}>
                  <strong>{node.type}</strong>
                  <div>{node.label}</div>
                </div>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 12 }}>{app.graph.nodes.length} nós · {app.graph.edges.length} relações</p>
          </div>

          <div className="panel">
            <h2>Timeline do pipeline</h2>
            <div className="timeline">
              {app.pipelineEvents.map((event) => (
                <div className="timeline-row" key={event.pipelineRunId}>
                  <span className="muted">{event.durationMs ?? 0} ms</span>
                  <span>{event.stage} · {event.processor ?? "system"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel decision-box">
            <h2>Decisão humana</h2>
            {app.humanDecisions.map((decision) => (
              <div key={decision.decisionId}>
                <p><strong>{decision.humanDecision}</strong> por {decision.reviewerRole}</p>
                <p className="muted">{decision.justification}</p>
              </div>
            ))}
            <textarea aria-label="Justificação obrigatória" placeholder="Justificação obrigatória para decisão ou override" />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="button" type="button"><CheckCircle2 size={16} aria-hidden /> Aprovar</button>
              <button className="button" type="button"><AlertTriangle size={16} aria-hidden /> Escalar</button>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

