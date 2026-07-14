import type React from "react";

export function RiskGauge({ score }: { score: number }) {
  return (
    <div className="risk-gauge" style={{ "--score": score } as React.CSSProperties}>
      <div className="risk-gauge-inner">
        <div>
          <strong>{score}</strong>
          <div className="muted">risco</div>
        </div>
      </div>
    </div>
  );
}
