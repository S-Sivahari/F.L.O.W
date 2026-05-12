import React, { useState } from 'react';
import useAuth from '../../../shared/hooks/useAuth.js';
import useToast from '../../../shared/hooks/useToast.js';
import { approveBlock, rejectBlock } from '../../../services/approvals.service.js';
import { formatDate } from '../../../shared/utils/formatters.js';
import EmptyState from '../../../shared/components/EmptyState.jsx';

export default function ApprovalQueue({ approvals, blocks, onChanged, mode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [rejectingId, setRejectingId] = useState(null);
  const [comment, setComment] = useState('');

  async function onApprove(a) {
    await approveBlock(a.id, user.id);
    toast.success('Block approved');
    onChanged();
  }
  async function onReject(a) {
    if (!comment.trim()) { toast.error('Rejection reason required'); return; }
    await rejectBlock(a.id, user.id, comment.trim());
    toast.warning('Block rejected');
    setRejectingId(null); setComment('');
    onChanged();
  }

  if (approvals.length === 0) {
    return <EmptyState message={mode === 'active' ? 'No pending approvals.' : 'No past approvals.'} />;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead><tr>
          <th>Block</th><th>Engineer</th><th>Type</th><th>Submitted</th><th>Status</th>
          {mode === 'active' && <th>Actions</th>}
        </tr></thead>
        <tbody>
          {approvals.map((a) => {
            const block = blocks.find((b) => b.id === a.blockId);
            return (
              <React.Fragment key={a.id}>
                <tr>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{block?.name || '—'}</td>
                  <td>{a.engineerName || 'Engineer'}</td>
                  <td>{block?.type}</td>
                  <td>{formatDate(a.submittedAt)}</td>
                  <td>
                    {a.status === 'Pending' && <span style={{ color: 'var(--accent-warning)' }}>Pending</span>}
                    {a.status === 'Approved' && <span style={{ color: 'var(--accent-secondary)' }}>Approved</span>}
                    {a.status === 'Rejected' && <span style={{ color: 'var(--accent-danger)' }}>Rejected</span>}
                  </td>
                  {mode === 'active' && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success" onClick={() => onApprove(a)}>✓ Approve</button>
                        <button className="btn btn-danger" onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}>✗ Reject</button>
                      </div>
                    </td>
                  )}
                </tr>
                {rejectingId === a.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="rejection-panel">
                        <textarea placeholder="Rejection reason (required)…" value={comment} onChange={(e) => setComment(e.target.value)} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn btn-danger" onClick={() => onReject(a)}>Submit Rejection</button>
                          <button className="btn btn-secondary" onClick={() => { setRejectingId(null); setComment(''); }}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
