import { Edit2, Trash2, Eye } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import { canAccess } from '../../../shared/utils/roleGuard.js';
import { mockUsers } from '../../../mock/mockUsers.js';

export default function BlockTable({ blocks, loading, role, onEdit, onDelete, onView }) {
  const columns = [
    { key: 'idx', label: '#', sortable: false, render: (_r, i) => <span style={{ color: 'var(--text-muted)' }}>{i + 1}</span> },
    { key: 'name', label: 'Block Name', render: (r) => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{r.name}</span> },
    { key: 'type', label: 'Type' },
    { key: 'techNode', label: 'Tech' },
    { key: 'complexity', label: 'Complexity', render: (r) => <span className={`complexity-badge complexity-${r.complexity}`}>{r.complexity}</span> },
    { key: 'estimatedArea', label: 'Est. Area', render: (r) => `${r.estimatedArea} ${r.areaUnit}` },
    { key: 'assignedEngineerId', label: 'Engineer', render: (r) => {
        const e = mockUsers.find((u) => u.id === r.assignedEngineerId);
        return e ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="avatar avatar-sm">{e.avatarInitials}</span>{e.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>;
    }},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge stage={r.status} /> },
    { key: 'actions', label: 'Actions', sortable: false, render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-ghost" onClick={() => onView(r)} title="View"><Eye size={14} /></button>
        {canAccess(role, 'edit:block') && <button className="btn btn-ghost" onClick={() => onEdit(r)} title="Edit"><Edit2 size={14} /></button>}
        {canAccess(role, 'delete:block') && <button className="btn btn-ghost" onClick={() => onDelete(r)} title="Delete"><Trash2 size={14} color="var(--accent-danger)" /></button>}
      </div>
    )},
  ];
  return <DataTable columns={columns} data={blocks} loading={loading} emptyMessage="No blocks match your filters." />;
}
