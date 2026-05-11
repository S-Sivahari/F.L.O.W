import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import AssignmentTable from '../components/AssignmentTable.jsx';
import AssignModal from '../components/AssignModal.jsx';
import EngineerCapacityBar from '../components/EngineerCapacityBar.jsx';
import UnassignedBlocksFlag from '../components/UnassignedBlocksFlag.jsx';
import { getBlocks } from '../../../services/blocks.service.js';
import { getAssignments, unassign, getEngineers } from '../../../services/assignments.service.js';
import useAuth from '../../../shared/hooks/useAuth.js';
import { canAccess } from '../../../shared/utils/roleGuard.js';
import useToast from '../../../shared/hooks/useToast.js';
import ConfirmDialog from '../../../shared/components/ConfirmDialog.jsx';

export default function AssignmentsPage() {
  const { role } = useAuth();
  const toast = useToast();
  const [blocks, setBlocks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [open, setOpen] = useState(false);
  const [toUnassign, setToUnassign] = useState(null);

  async function refresh() {
    setBlocks(await getBlocks());
    setAssignments(await getAssignments());
    setEngineers(await getEngineers());
  }
  useEffect(() => { refresh(); }, []);

  async function doUnassign() {
    await unassign(toUnassign.blockId);
    toast.success('Engineer unassigned');
    setToUnassign(null);
    refresh();
  }

  const unassignedBlocks = blocks.filter((b) => !b.assignedEngineerId);

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Resource Assignments</h1>
        {canAccess(role, 'assign:engineer') && (
          <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={14} /> Assign Engineer</button>
        )}
      </div>

      {unassignedBlocks.length > 0 && <UnassignedBlocksFlag blocks={unassignedBlocks} />}

      <h3 style={{ fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Engineer Capacity</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {engineers.map((e) => (
          <EngineerCapacityBar key={e.id} engineer={e} assignments={assignments} />
        ))}
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Assignments</h3>
      <div className="card" style={{ padding: 0 }}>
        <AssignmentTable assignments={assignments} blocks={blocks} canUnassign={canAccess(role, 'assign:engineer')} onUnassign={setToUnassign} />
      </div>

      <AssignModal isOpen={open} blocks={blocks} assignments={assignments} engineers={engineers}
        onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refresh(); }} />

      <ConfirmDialog isOpen={!!toUnassign} title="Unassign engineer?" message="The block will be returned to the unassigned pool." confirmLabel="Unassign" danger onConfirm={doUnassign} onCancel={() => setToUnassign(null)} />
    </PageWrapper>
  );
}
