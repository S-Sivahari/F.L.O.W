import StatCard from '../../dashboard/components/StatCard.jsx';

export default function TotalEffortSummary({ rows, blocks }) {
  const est = rows.reduce((s, r) => s + r.estimatedHours, 0);
  const act = rows.reduce((s, r) => s + r.actualHours, 0);
  const variance = act - est;
  const completed = blocks.filter((b) => b.status === 'Completed').length;
  const pct = blocks.length ? Math.round((completed / blocks.length) * 100) : 0;
  return (
    <div className="stat-grid">
      <StatCard label="Total Estimated" value={`${est}h`} />
      <StatCard label="Total Actual" value={`${act}h`} />
      <StatCard label="Variance" value={<span className={variance > 0 ? 'variance-neg' : 'variance-pos'}>{variance > 0 ? '+' : ''}{variance}h</span>} />
      <StatCard label="% Complete" value={`${pct}%`} delta={`${completed} of ${blocks.length} blocks`} />
    </div>
  );
}
