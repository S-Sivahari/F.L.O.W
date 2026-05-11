import { useEffect, useState } from 'react';
import useAuth from '../../../shared/hooks/useAuth.js';
import useToast from '../../../shared/hooks/useToast.js';
import { getApprovals, approveBlock, rejectBlock } from '../../../services/approvals.service.js';
import { getBlocks } from '../../../services/blocks.service.js';
import { relativeTime } from '../../../shared/utils/formatters.js';
import EmptyState from '../../../shared/components/EmptyState.jsx';

export default function PendingApprovalsList() {
  const { user } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);
  const [comment, setComment] = useState('');

  async function refresh() {
    const all = await getApprovals();
    setPending(all.filter((a) => a.status === 'Pending'));
    setBlocks(await getBlocks());
  }
  useEffect(() => { refresh(); }, []);

  async function onApprove(a) {
    await approveBlock(a.id, user.id);
    toast.success('Block approved');
    refresh();
  }
  async function onReject(a) {
    if (!comment.trim()) { toast.error('Rejection comment required'); return; }
    await rejectBlock(a.id, user.id, comment.trim());
    toast.warning('Block rejected and returned');
    setRejectingId(null); setComment('');
    refresh();
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 14, marginBottom: 14 }}>Pending Approvals</h3>
      {pending.length === 0 ? <EmptyState message="No items awaiting review." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map((a) => {
            const block = blocks.find((b) => b.id === a.blockId);
            return (
              <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{block?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a.engineerName || 'Engineer'} · submitted {relativeTime(a.submittedAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" onClick={() => onApprove(a)}>✓ Approve</button>
                    <button className="btn btn-danger" onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}>✗ Reject</button>
                  </div>
                </div>
                {rejectingId === a.id && (
                  <div className="rejection-panel" style={{ marginTop: 10 }}>
                    <textarea placeholder="Rejection reason (required)…" value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={() => onReject(a)}>Submit Rejection</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
