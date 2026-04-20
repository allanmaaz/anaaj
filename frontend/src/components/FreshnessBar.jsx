export default function FreshnessBar({ score }) {
  const color =
    score >= 75 ? 'linear-gradient(90deg,#34d399,#5ce0f0)' :
    score >= 50 ? 'linear-gradient(90deg,#fbbf24,#34d399)' :
                  'linear-gradient(90deg,#fb7185,#fbbf24)';
  return (
    <div className="freshness-bar-wrap">
      <span className="freshness-label">Freshness</span>
      <div className="freshness-bar">
        <div className="freshness-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="freshness-score">{score}</span>
    </div>
  );
}
