import DataTable from '../../../shared/components/DataTable.jsx';
import { mockUsers } from '../../../mock/mockUsers.js';
import { formatDate } from '../../../shared/utils/formatters.js';

export default function AssignmentTable({ assignments, blocks, canUnassign, onUnassign }) {
  const rows = assignments.map((a) => {
    const block = blocks.find((b) => b.id === a.blockId);
    const eng = mockUsers.find((u) => u.id === a.engineerId);
    return { ...a, blockName: block?.name || '—', blockType: block?.type || '—', engineerName: eng?.name || '—', engineerInitials: eng?.avatarInitials || '?' };
  });
  const columns = [
    { key: 'blockName', label: 'Block Name', render: (r) => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{r.blockName}</span> },
    { key: 'blockType', label: 'Type' },
    { key: 'engineerName', label: 'Engineer', render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="avatar avatar-sm">{r.engineerInitials}</span>{r.engineerName}</span> },
    { key: 'assignedAt', label: 'Date Assigned', render: (r) => formatDate(r.assignedAt) },
    ...(canUnassign ? [{ key: 'actions', label: 'Actions', sortable: false, render: (r) => (
      <button className="btn btn-secondary" onClick={() => onUnassign(r)}>Unassign</button>
    )}] : []),
  ];
  return <DataTable columns={columns} data={rows} emptyMessage="No assignments yet." />;
}
