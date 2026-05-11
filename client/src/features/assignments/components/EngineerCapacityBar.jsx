import { MAX_BLOCKS_PER_ENGINEER } from '../../../services/assignments.service.js';

export default function EngineerCapacityBar({ engineer, assignments }) {
  const load = assignments.filter((a) => a.engineerId === engineer.id).length;
  const pct = (load / MAX_BLOCKS_PER_ENGINEER) * 100;
  let color = 'var(--accent-secondary)';
  if (load === 2) color = 'var(--accent-warning)';
  if (load >= 3) color = 'var(--accent-danger)';
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="avatar">{engineer.avatarInitials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{engineer.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{load} / {MAX_BLOCKS_PER_ENGINEER} blocks</div>
        </div>
      </div>
      <div className="capacity-bar"><div className="capacity-bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}
