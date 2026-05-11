export default function StatCard({ label, value, delta, icon, pulse }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">
        {pulse && <span className="pulse-dot" />}
        {icon} {label}
      </div>
      <div className="stat-card-value">{value}</div>
      {delta && <div className="stat-card-delta">{delta}</div>}
    </div>
  );
}
