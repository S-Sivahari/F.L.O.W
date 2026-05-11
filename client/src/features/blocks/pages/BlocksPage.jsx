import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import PageWrapper from "../../../shared/components/PageWrapper.jsx";
import BlockTable from "../components/BlockTable.jsx";
import BlockFormModal from "../components/BlockFormModal.jsx";
import BlockDetailDrawer from "../components/BlockDetailDrawer.jsx";
import { getBlocks, deleteBlock } from "../../../services/blocks.service.js";
import useAuth from "../../../shared/hooks/useAuth.js";
import { canAccess } from "../../../shared/utils/roleGuard.js";
import useToast from "../../../shared/hooks/useToast.js";
import ConfirmDialog from "../../../shared/components/ConfirmDialog.jsx";
import { COMPLEXITY_LEVELS } from "../../../shared/constants/complexity.js";
import { STAGES } from "../../../shared/constants/pipeline.js";
import { subscribeToDataChanges } from "../../../services/api.js";

const TECH = ["28nm", "45nm", "65nm", "90nm", "130nm", "180nm"];

export default function BlocksPage() {
  const { role } = useAuth();
  const toast = useToast();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [complexF, setComplexF] = useState("");
  const [techF, setTechF] = useState("");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  async function refresh() {
    setLoading(true);
    setBlocks(await getBlocks());
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToDataChanges(() => {
      refresh();
    });
    return unsubscribe;
  }, []);

  const filtered = useMemo(
    () =>
      blocks.filter(
        (b) =>
          (!search ||
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.type.toLowerCase().includes(search.toLowerCase())) &&
          (!statusF || b.status === statusF) &&
          (!complexF || b.complexity === complexF) &&
          (!techF || b.techNode === techF),
      ),
    [blocks, search, statusF, complexF, techF],
  );

  async function confirmDelete() {
    await deleteBlock(toDelete.id);
    toast.success("Block deleted");
    setToDelete(null);
    refresh();
  }

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Layout Blocks</h1>
        {canAccess(role, "create:block") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={14} /> Add Block
          </button>
        )}
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by name or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="">All statuses</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={complexF} onChange={(e) => setComplexF(e.target.value)}>
          <option value="">All complexity</option>
          {COMPLEXITY_LEVELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={techF} onChange={(e) => setTechF(e.target.value)}>
          <option value="">All tech nodes</option>
          {TECH.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <BlockTable
          blocks={filtered}
          loading={loading}
          role={role}
          onEdit={(b) => {
            setEditing(b);
            setFormOpen(true);
          }}
          onDelete={(b) => setToDelete(b)}
          onView={(b) => setDrawer(b)}
        />
      </div>

      <BlockFormModal
        isOpen={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          refresh();
        }}
      />
      <BlockDetailDrawer block={drawer} onClose={() => setDrawer(null)} />
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete block?"
        message={
          toDelete
            ? `Permanently delete ${toDelete.name}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </PageWrapper>
  );
}
