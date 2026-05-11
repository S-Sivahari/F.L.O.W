import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EffortSummaryChart({ blocks }) {
  const data = blocks.slice(0, 8).map((b) => ({
    name: b.name.length > 10 ? b.name.slice(0, 10) + '…' : b.name,
    Estimated: b.estimatedHours,
    Actual: b.actualHours || 0,
  }));
  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 14 }}>Effort: Estimated vs Actual</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Estimated" fill="var(--accent-primary)" radius={[4,4,0,0]} />
          <Bar dataKey="Actual" fill="var(--accent-warning)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
