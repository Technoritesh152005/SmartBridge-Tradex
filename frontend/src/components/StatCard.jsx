function StatCard({ label, value, subValue, positive }) {
  const subClass =
    positive === true ? 'positive' : positive === false ? 'negative' : 'text-muted';

  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subValue && <div className={`small mt-1 ${subClass}`}>{subValue}</div>}
    </div>
  );
}

export default StatCard;
