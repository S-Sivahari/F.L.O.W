import KanbanColumn from '../../../shared/components/KanbanColumn.jsx';
import BlockCard from './BlockCard.jsx';
import { STAGES } from '../../../shared/constants/pipeline.js';

export default function KanbanBoard({ blocks, highlight, onChanged, onShowLog }) {
  const stageMetrics = STAGES.reduce((acc, stage) => {
    const items = blocks.filter((b) => b.status === stage);
    const assignedEngineers = new Set(items.map((b) => b.assignedEngineerId).filter(Boolean));
    const engineerCount = assignedEngineers.size;
    const loadPerEngineer = engineerCount > 0 ? items.length / engineerCount : items.length;
    acc[stage] = { items, engineerCount, loadPerEngineer };
    return acc;
  }, {});

  const maxLoad = Math.max(...STAGES.map((stage) => stageMetrics[stage].loadPerEngineer), 1);

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const { items, engineerCount, loadPerEngineer } = stageMetrics[stage];
        const dim = highlight && highlight !== stage;
        const heatLevel = Math.min(1, loadPerEngineer / maxLoad);
        const heatHint =
          items.length === 0
            ? ''
            : `${items.length} blocks · ${engineerCount || 0} engineers`;
        return (
          <div key={stage} style={{ opacity: dim ? 0.4 : 1, transition: 'opacity 200ms' }}>
            <KanbanColumn
              stage={stage}
              count={items.length}
              heatLevel={heatLevel}
              heatHint={heatHint}
            >
              {items.map((b) => (
                <BlockCard key={b.id} block={b} onChanged={onChanged} onShowLog={() => onShowLog(b)} />
              ))}
              {items.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No blocks</div>}
            </KanbanColumn>
          </div>
        );
      })}
    </div>
  );
}
