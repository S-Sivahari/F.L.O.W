import { STAGE_COLORS } from '../constants/pipeline.js';

export default function KanbanColumn({ stage, children, count, heatLevel = 0, heatHint = '' }) {
  const color = STAGE_COLORS[stage];
  const clampedHeat = Math.max(0, Math.min(1, heatLevel));
  const glow = `0 0 ${10 + Math.round(clampedHeat * 24)}px rgba(239, 68, 68, ${0.15 + clampedHeat * 0.35})`;
  const tint = `linear-gradient(180deg, rgba(239, 68, 68, ${clampedHeat * 0.18}) 0%, rgba(239, 68, 68, 0) 40%)`;

  return (
    <div className="kanban-col"style={{backgroundImage: undefined,boxShadow: 'none',}}
>
      <div className="kanban-col-header" style={{ borderTopColor: color }}>
        <div className="kanban-col-title">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {stage}
        </div>
        <span className="kanban-col-count">{count}</span>
      </div>
      {heatHint && (
        <div className="kanban-col-heat-hint">
          {heatHint}
        </div>
      )}
      <div className="kanban-col-body">{children}</div>
    </div>
  );
}
