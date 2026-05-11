import { useState } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import {
  addDependency,
  removeDependency,
  wouldCreateCycle,
} from '../../../services/dependencies.service.js';
import useToast from '../../../shared/hooks/useToast.js';
import { X } from 'lucide-react';

export default function DependencyModal({
  isOpen = false,
  blockId = null,
  blocks = [],
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [selectedDependency, setSelectedDependency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  if (!isOpen || !blockId) return null;

  const currentBlock = blocks.find((b) => b.id === blockId);
  if (!currentBlock) return null;

  const currentDependencies = blocks.filter((b) =>
    (currentBlock.dependsOn || []).includes(b.id)
  );

  const availableBlocks = blocks.filter(
    (b) => b.id !== blockId && !(currentBlock.dependsOn || []).includes(b.id)
  );

  const handleAddDependency = async () => {
    if (!selectedDependency) { setError('Please select a block'); return; }
    if (wouldCreateCycle(blockId, selectedDependency)) {
      setError('This would create a circular dependency — not allowed');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await addDependency(blockId, selectedDependency);
      toast.success('Dependency added');
      setSelectedDependency('');
      onSuccess();
    } catch (err) {
      const msg = err.message || 'Failed to add dependency';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDependency = async (depId) => {
    setIsLoading(true);
    setError('');
    try {
      await removeDependency(blockId, depId);
      toast.success('Dependency removed');
      onSuccess();
    } catch (err) {
      const msg = err.message || 'Failed to remove dependency';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
        Cancel
      </button>
      <button
        className="btn btn-primary"
        onClick={handleAddDependency}
        disabled={isLoading || !selectedDependency}
      >
        {isLoading ? 'Adding...' : 'Add dependency'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage dependencies" footer={footer} maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label>Current block</label>
          <div style={{
            padding: '10px 12px', background: 'var(--bg-base)',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            fontSize: 13, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)', fontWeight: 500,
          }}>
            {currentBlock.name}
          </div>
        </div>

        {currentDependencies.length > 0 && (
          <div>
            <label>Current dependencies ({currentDependencies.length})</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentDependencies.map((dep) => (
                <div key={dep.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--bg-base)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                  fontSize: 13,
                }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{dep.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dep.status}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveDependency(dep.id)}
                    disabled={isLoading}
                    title="Remove dependency"
                    style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: 'transparent', border: 'none',
                      color: 'var(--accent-danger)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label>Add new dependency</label>
          <select
            value={selectedDependency}
            onChange={(e) => { setSelectedDependency(e.target.value); setError(''); }}
            style={{
              width: '100%', padding: '8px 10px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-base)', color: 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            <option value="">
              {availableBlocks.length === 0 ? 'No available blocks' : 'Select a block...'}
            </option>
            {availableBlocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name} — {block.status}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)',
            color: '#ef4444', fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          A block cannot progress until all its dependencies are completed.
        </p>
      </div>
    </Modal>
  );
}