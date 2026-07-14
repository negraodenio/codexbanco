export function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <span>{label}</span>
        <strong>{score}</strong>
      </div>
      <div className="score-bar" aria-hidden>
        <div className="score-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

