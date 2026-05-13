import { useState } from 'react';
import { ArrowRight, History } from 'lucide-react';
import useAuth from '../../../shared/hooks/useAuth.js';
import useToast from '../../../shared/hooks/useToast.js';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';
import { requestStageAdvancement } from '../../../services/workflow.service.js';
import { ROLES } from '../../../shared/constants/roles.js';
import { nextStage } from '../../../shared/constants/pipeline.js';

export default function BlockCard({ block, onChanged, onShowLog }) {
  const { user, role } = useAuth();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const eng = block.assignedEngineer;
  const isAssigned = block.assignedEngineerId === user?.id;
  const canAdvance = isAssigned;  // Only the assigned engineer can request stage advancement
  const isCompleted = block.status === 'Completed';
  const inProgress = block.status === 'In Progress';

  async function handleRequestAdvancement() {
    try {
      const result = await requestStageAdvancement(block.id, user.id);
      toast.success(`Requested advancement from ${result.currentStage} to ${result.requestedStage}. Awaiting manager approval.`);
      setConfirmOpen(false);
      onChanged();
    } catch (error) {
      toast.error(error.message || "Unable to request stage advancement");
    }
  }

  const next = nextStage(block.status);

  return (
    <div className="block-card">
      <div className="block-card-name">{block.name}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={`complexity-badge complexity-${block.complexity}`}>{block.complexity}</span>
        <span className="role-badge">{block.type.length > 18 ? block.type.slice(0, 18) + '…' : block.type}</span>
      </div>
      <div className="block-card-meta">
        <div className="block-card-engineer">
          {eng ? <><span className="avatar avatar-sm">{eng.avatarInitials}</span><span>{eng.name}</span></> : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
        </div>
        <span>{block.estimatedHours}h</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {canAdvance && next && (
          <button className="btn btn-primary" disabled={isCompleted}
            onClick={() => setConfirmOpen(true)} style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}>
            Request Advancement <ArrowRight size={12} />
          </button>
        )}
        {!inProgress && block.status !== 'Not Started' && (
          <button className="btn btn-ghost" onClick={onShowLog} style={{ fontSize: 11, padding: '6px 8px' }}>
            <History size={12} /> History
          </button>
        )}
      </div>

      <ConfirmDialog isOpen={confirmOpen} title="Request stage advancement?"
        message={next ? `Request to advance ${block.name} from ${block.status} to ${next}? This will require manager approval.` : 'Already at final stage'}
        onConfirm={handleRequestAdvancement} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}
