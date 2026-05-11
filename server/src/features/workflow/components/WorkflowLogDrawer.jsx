import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getWorkflowLog } from '../../../services/workflow.service.js';
import { mockUsers } from '../../../mock/mockUsers.js';
import { formatDate } from '../../../shared/utils/formatters.js';
import { STAGE_COLORS } from '../../../shared/constants/pipeline.js';

export default function WorkflowLogDrawer({ block, onClose }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    if (block) getWorkflowLog(block.id).then(setLogs);
  }, [block]);
  if (!block) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2 style={{ fontSize: 16 }}>{block.name} — History</h2>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="timeline">
            {logs.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No transitions logged.</div>}
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
