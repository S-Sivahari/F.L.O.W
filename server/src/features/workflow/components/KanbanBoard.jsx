import KanbanColumn from '../../../shared/components/KanbanColumn.jsx';
import BlockCard from './BlockCard.jsx';
import { STAGES } from '../../../shared/constants/pipeline.js';

export default function KanbanBoard({ blocks, highlight, onChanged, onShowLog }) {
  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const items = blocks.filter((b) => b.status === stage);
        const dim = highlight && highlight !== stage;
        return (
          <div key={stage} style={{ opacity: dim ? 0.4 : 1, transition: 'opacity 200ms' }}>
            <KanbanColumn stage={stage} count={items.length}>
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
