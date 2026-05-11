import { useEffect, useMemo, useState } from 'react';
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

  const dependencyImpactAlerts = useMemo(() => {
    if (blocks.length === 0) return [];

    const blockById = new Map(blocks.map((block) => [block.id, block]));
    const dependentsById = new Map(blocks.map((block) => [block.id, []]));

    blocks.forEach((block) => {
      (block.dependsOn || []).forEach((depId) => {
        if (!dependentsById.has(depId)) dependentsById.set(depId, []);
        dependentsById.get(depId).push(block.id);
      });
    });

    function getAllDependents(sourceId) {
      const visited = new Set();
      const queue = [...(dependentsById.get(sourceId) || [])];
      while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        queue.push(...(dependentsById.get(currentId) || []));
      }
      return Array.from(visited)
        .map((id) => blockById.get(id))
        .filter(Boolean);
    }

    return blocks
      .filter((block) => {
        const isCriticalPath = block.criticPath === true || block.criticalPath === true;
        return (
          isCriticalPath &&
          Number(block.actualHours || 0) > Number(block.estimatedHours || 0)
        );
      })
      .map((block) => {
        const delayHours = Number(block.actualHours || 0) - Number(block.estimatedHours || 0);
        const delayDays = Math.max(1, Math.ceil(delayHours / 8));
        const impactedBlocks = getAllDependents(block.id).filter(
          (dependent) => dependent.status !== 'Completed',
        );
        return {
          sourceBlock: block,
          delayDays,
          impactedBlocks,
        };
      })
      .filter((alert) => alert.impactedBlocks.length > 0);
  }, [blocks]);

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
      {dependencyImpactAlerts.map((alert) => (
        <div key={alert.sourceBlock.id} className="alert-banner">
          <div>
            <strong>{alert.sourceBlock.name}</strong> is delayed by{" "}
            <strong>{alert.delayDays} day{alert.delayDays > 1 ? "s" : ""}</strong>. This will delay{" "}
            <strong>{alert.impactedBlocks.map((b) => b.name).join(', ')}</strong>. Total project delay:{" "}
            <strong>{alert.delayDays} day{alert.delayDays > 1 ? "s" : ""}</strong>.
          </div>
        </div>
      ))}
      <KanbanBoard blocks={blocks} highlight={filter} onChanged={refresh} onShowLog={setLogBlock} />
      <WorkflowLogDrawer block={logBlock} onClose={() => setLogBlock(null)} />
    </PageWrapper>
  );
}
