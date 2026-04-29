import { mockUsers } from '../../../mock/mockUsers.js';
import { formatDate } from '../../../shared/utils/formatters.js';

export default function RejectionFeedback({ approval, blocks }) {
  const mgr = mockUsers.find((u) => u.id === approval.reviewedBy);
  const block = blocks?.find((b) => b.id === approval.blockId);
  return (
    <div className="rejection-feedback">
      {block && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>{block.name}</div>}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
        Rejected by {mgr?.name || 'Manager'} · {formatDate(approval.reviewedAt)}
      </div>
      <div style={{ fontSize: 13 }}>{approval.comment}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Block returned to In Progress.</div>
    </div>
  );
}
