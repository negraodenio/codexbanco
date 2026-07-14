import { AppShell } from "@/components/AppShell";
import { ScoreBar } from "@/components/ScoreBar";
import { getKpis } from "@/lib/data/localRepository";

export default async function KpiPage() {
  const kpis = await getKpis();
  return (
    <AppShell>
      <section className="workspace-header">
        <div>
          <p className="eyebrow">Management dashboard</p>
          <h1>KPIs de risco e operação</h1>
          <p className="muted">Métricas que não confundem rejeição com falso positivo sem ground truth.</p>
        </div>
      </section>

      <section className="grid four" style={{ marginBottom: 16 }}>
        <div className="card metric"><span className="muted">Aplicações</span><span className="value">{kpis.totalApplications}</span></div>
        <div className="card metric"><span className="muted">Documentos processados</span><span className="value">{kpis.processingVolume}</span></div>
        <div className="card metric"><span className="muted">Manual review</span><span className="value">{Math.round(kpis.manualReviewRate * 100)}%</span></div>
        <div className="card metric"><span className="muted">Evidence completeness</span><span className="value">{Math.round(kpis.evidenceCompletenessRate * 100)}%</span></div>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2>Distribuição de scores</h2>
          <div className="grid">
            {kpis.scoreDistribution.map((item) => (
              <ScoreBar key={item.name} label={item.name} score={item.score} />
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Latência</h2>
          <div className="grid three">
            <div className="card metric"><span className="muted">Média</span><span className="value">{kpis.averageProcessingTimeMs} ms</span></div>
            <div className="card metric"><span className="muted">P50</span><span className="value">{kpis.p50LatencyMs} ms</span></div>
            <div className="card metric"><span className="muted">P95</span><span className="value">{kpis.p95LatencyMs} ms</span></div>
          </div>
        </div>
        <div className="panel">
          <h2>Top red flags</h2>
          <table className="table">
            <thead><tr><th>Tipo</th><th>Severidade</th></tr></thead>
            <tbody>
              {kpis.topRedFlags.map((flag) => (
                <tr key={`${flag.type}-${flag.severity}`}><td>{flag.type}</td><td><span className={`pill ${flag.severity}`}>{flag.severity}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Uso de processadores</h2>
          <table className="table">
            <thead><tr><th>Processador</th><th>Execuções</th></tr></thead>
            <tbody>
              {Object.entries(kpis.modelUsageDistribution).map(([processor, count]) => (
                <tr key={processor}><td>{processor}</td><td>{count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

