import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function UnassignedBlocksFlag({ blocks }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="alert-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={16} color="var(--accent-warning)" />
        <span><strong>{blocks.length}</strong> blocks unassigned — assign engineers to keep pipeline moving.</span>
      </div>
      <button className="btn btn-ghost" onClick={() => setDismissed(true)}><X size={14} /></button>
    </div>
  );
}
