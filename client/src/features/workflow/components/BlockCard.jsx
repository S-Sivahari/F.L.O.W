import { useState } from 'react';
import { ArrowRight, History } from 'lucide-react';
import useAuth from '../../../shared/hooks/useAuth.js';
import useToast from '../../../shared/hooks/useToast.js';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';
import { advanceStage } from '../../../services/workflow.service.js';
import { submitForReview } from '../../../services/approvals.service.js';
import { ROLES } from '../../../shared/constants/roles.js';
import { nextStage } from '../../../shared/constants/pipeline.js';

export default function BlockCard({ block, onChanged, onShowLog }) {
  const { user, role } = useAuth();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const eng = block.assignedEngineer;
  const isAssigned = block.assignedEngineerId === user?.id;
  const isMgr = role === ROLES.MANAGER || role === ROLES.ADMIN;
  const canAdvance = isAssigned || isMgr;
  const inReview = block.status === 'Review';
  const isCompleted = block.status === 'Completed';
  const inProgress = block.status === 'In Progress';
  const showSubmitReview = isAssigned && block.status === 'In Progress';

  async function handleAdvance() {
    await advanceStage(block.id, user.id);
    toast.success(`Advanced ${block.name}`);
    setConfirmOpen(false);
    onChanged();
  }

  async function handleSubmitReview() {
    await submitForReview(block.id, user.id);
    toast.success(`${block.name} submitted for review`);
    setSubmittingReview(false);
    onChanged();
  }

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
        {canAdvance && !showSubmitReview && (
          <button className="btn btn-primary" disabled={inReview || isCompleted}
            title={inReview ? 'Submit for review via Approvals' : ''}
            onClick={() => setConfirmOpen(true)} style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}>
            Advance Stage <ArrowRight size={12} />
          </button>
        )}
        {showSubmitReview && (
          <button className="btn btn-secondary" onClick={() => setSubmittingReview(true)} style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}>
            Submit for Review
          </button>
        )}
        {!inProgress && block.status !== 'Not Started' && (
          <button className="btn btn-ghost" onClick={onShowLog} style={{ fontSize: 11, padding: '6px 8px' }}>
            <History size={12} /> History
          </button>
        )}
      </div>

      <ConfirmDialog isOpen={confirmOpen} title="Advance stage?"
        message={`Advance ${block.name} from ${block.status} to ${nextStage(block.status)}?`}
        onConfirm={handleAdvance} onCancel={() => setConfirmOpen(false)} />
      <ConfirmDialog isOpen={submittingReview} title="Submit for review?"
        message={`Submit ${block.name} to manager review queue?`}
        onConfirm={handleSubmitReview} onCancel={() => setSubmittingReview(false)} />
    </div>
  );
}
