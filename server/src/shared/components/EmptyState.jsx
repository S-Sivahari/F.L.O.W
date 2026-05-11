import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title = 'Nothing here yet', message }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <Inbox size={32} />}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>{title}</div>
      {message && <div style={{ fontSize: 12 }}>{message}</div>}
    </div>
  );
}
