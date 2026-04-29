import { useEffect, useState } from 'react';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import ApprovalQueue from '../components/ApprovalQueue.jsx';
import RejectionFeedback from '../components/RejectionFeedback.jsx';
import { getApprovals } from '../../../services/approvals.service.js';
import { getBlocks } from '../../../services/blocks.service.js';
import useAuth from '../../../shared/hooks/useAuth.js';
import { ROLES } from '../../../shared/constants/roles.js';
import { formatDate } from '../../../shared/utils/formatters.js';
import EmptyState from '../../../shared/components/EmptyState.jsx';

export default function ApprovalsPage() {
  const { user, role } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  async function refresh() {
    setApprovals(await getApprovals());
    setBlocks(await getBlocks());
  }
  useEffect(() => { refresh(); }, []);

  if (role === ROLES.ENGINEER) {
    const mine = approvals.filter((a) => a.engineerId === user?.id);
    return (
      <PageWrapper>
        <div className="page-header"><h1>My Approval Requests</h1></div>
        <div className="card" style={{ padding: 0 }}>
          {mine.length === 0 ? <EmptyState message="You haven't submitted any blocks for review." /> : (
            <table className="data-table">
              <thead><tr><th>Block</th><th>Submitted</th><th>Status</th><th>Manager Feedback</th></tr></thead>
              <tbody>
                {mine.map((a) => {
                  const block = blocks.find((b) => b.id === a.blockId);
                  return (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{block?.name}</td>
                      <td>{formatDate(a.submittedAt)}</td>
                      <td>
                        {a.status === 'Pending' && <span style={{ color: 'var(--accent-warning)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="pulse-dot" /> Awaiting review</span>}
                        {a.status === 'Approved' && <span style={{ color: 'var(--accent-secondary)' }}>✓ Completed</span>}
                        {a.status === 'Rejected' && <span style={{ color: 'var(--accent-danger)' }}>✗ Rejected</span>}
                      </td>
                      <td>{a.status === 'Rejected' ? <RejectionFeedback approval={a} blocks={blocks} /> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </PageWrapper>
    );
  }

  // manager / admin
  const pending = approvals.filter((a) => a.status === 'Pending');
  const past = approvals.filter((a) => a.status !== 'Pending');

  return (
    <PageWrapper>
      <div className="page-header"><h1>Approval Queue <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{pending.length} pending</span></h1></div>
      <div className="card" style={{ padding: 0 }}>
        <ApprovalQueue approvals={pending} blocks={blocks} onChanged={refresh} mode="active" />
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={() => setHistoryOpen((v) => !v)}>
          {historyOpen ? '▾' : '▸'} Approval History ({past.length})
        </button>
        {historyOpen && (
          <div className="card" style={{ padding: 0, marginTop: 12 }}>
            <ApprovalQueue approvals={past} blocks={blocks} onChanged={refresh} mode="history" />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
