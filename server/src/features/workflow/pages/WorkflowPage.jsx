import { useEffect, useState } from 'react';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import WorkflowLogDrawer from '../components/WorkflowLogDrawer.jsx';
import { STAGES } from '../../../shared/constants/pipeline.js';
import { getBlocks } from '../../../services/blocks.service.js';

export default function WorkflowPage() {
  const [blocks, setBlocks] = useState([]);
  const [filter, setFilter] = useState(null);
  const [logBlock, setLogBlock] = useState(null);

  async function refresh() { setBlocks(await getBlocks()); }
  useEffect(() => { refresh(); }, []);

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Workflow Board</h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STAGES.map((s) => (
            <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(filter === s ? null : s)}>{s}</button>
          ))}
        </div>
      </div>
      <KanbanBoard blocks={blocks} highlight={filter} onChanged={refresh} onShowLog={setLogBlock} />
      <WorkflowLogDrawer block={logBlock} onClose={() => setLogBlock(null)} />
    </PageWrapper>
  );
}
