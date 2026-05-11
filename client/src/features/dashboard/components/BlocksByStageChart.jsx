import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { STAGES, STAGE_COLORS } from '../../../shared/constants/pipeline.js';

export default function BlocksByStageChart({ blocks }) {
  const data = STAGES.map((s) => ({
    stage: s,
    count: blocks.filter((b) => b.status === s).length,
  }));

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 14 }}>Blocks by Stage</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
          <YAxis type="category" dataKey="stage" stroke="var(--text-muted)" fontSize={11} width={90} />
          <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((d) => <Cell key={d.stage} fill={STAGE_COLORS[d.stage]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
