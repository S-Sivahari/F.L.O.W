import { STAGE_COLORS } from '../constants/pipeline.js';

export default function StatusBadge({ stage }) {
  const color = STAGE_COLORS[stage] || 'var(--text-muted)';
  return (
    <span className="status-badge" style={{ color, borderColor: color }}>
      <span className="dot" />
      <span style={{ color: 'var(--text-primary)' }}>{stage}</span>
    </span>
  );
}
