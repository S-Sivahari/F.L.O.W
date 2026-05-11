import { STAGE_COLORS } from '../constants/pipeline.js';

export default function KanbanColumn({ stage, children, count }) {
  const color = STAGE_COLORS[stage];
  return (
    <div className="kanban-col">
      <div className="kanban-col-header" style={{ borderTopColor: color }}>
        <div className="kanban-col-title">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {stage}
        </div>
        <span className="kanban-col-count">{count}</span>
      </div>
      <div className="kanban-col-body">{children}</div>
    </div>
  );
}
