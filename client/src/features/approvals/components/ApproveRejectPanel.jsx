import useAuth from '../../../shared/hooks/useAuth.js';
import useToast from '../../../shared/hooks/useToast.js';
import { useState } from 'react';
import { approveBlock, rejectBlock } from '../../../services/approvals.service.js';

export default function ApproveRejectPanel({ approval, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const [reject, setReject] = useState(false);
  const [comment, setComment] = useState('');

  async function approve() {
    await approveBlock(approval.id, user.id);
    toast.success('Approved');
    onChanged();
  }
  async function doReject() {
    if (!comment.trim()) { toast.error('Comment required'); return; }
    await rejectBlock(approval.id, user.id, comment.trim());
    toast.warning('Rejected');
    setReject(false); setComment('');
    onChanged();
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-success" onClick={approve}>Approve</button>
        <button className="btn btn-danger" onClick={() => setReject(!reject)}>Reject</button>
      </div>
      {reject && (
        <div className="rejection-panel" style={{ marginTop: 8 }}>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reason for rejection…" />
          <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={doReject}>Submit</button>
        </div>
      )}
    </div>
  );
}
