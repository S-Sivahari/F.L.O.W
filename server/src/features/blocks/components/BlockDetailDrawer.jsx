import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import { getWorkflowLog } from '../../../services/workflow.service.js';
import { mockUsers } from '../../../mock/mockUsers.js';
import { formatDate } from '../../../shared/utils/formatters.js';
import { STAGE_COLORS } from '../../../shared/constants/pipeline.js';

export default function BlockDetailDrawer({ block, onClose }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    if (block) getWorkflowLog(block.id).then(setLogs);
  }, [block]);

  if (!block) return null;
  const eng = mockUsers.find((u) => u.id === block.assignedEngineerId);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: 16 }}>{block.name}</h2>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{block.type}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div style={{ marginBottom: 16 }}><StatusBadge stage={block.status} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <Field label="Tech Node" value={block.techNode} />
            <Field label="Complexity" value={block.complexity} />
            <Field label="Base Hours" value={`${block.baseHours}h`} />
            <Field label="Estimated" value={`${block.estimatedHours}h`} />
            <Field label="Actual" value={`${block.actualHours || 0}h`} />
            <Field label="Area" value={`${block.estimatedArea} ${block.areaUnit}`} />
            <Field label="Engineer" value={eng?.name || 'Unassigned'} />
            <Field label="Created" value={formatDate(block.createdAt)} />
          </div>

          {block.description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13 }}>{block.description}</div>
            </div>
          )}

          <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Workflow History</div>
          <div className="timeline">
            {logs.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No history yet.</div>}
            {logs.map((l) => {
              const actor = mockUsers.find((u) => u.id === l.actorId);
              return (
                <div key={l.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: STAGE_COLORS[l.stage] }} />
                  <div className="timeline-content">
                    <div className="timeline-stage" style={{ color: STAGE_COLORS[l.stage] }}>{l.stage}</div>
                    <div className="timeline-meta">{actor?.name || 'System'} · {formatDate(l.timestamp)}</div>
                    {l.comment && <div className="timeline-comment">{l.comment}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}
