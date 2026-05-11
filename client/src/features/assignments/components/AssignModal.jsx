import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import { assignEngineer, MAX_BLOCKS_PER_ENGINEER } from '../../../services/assignments.service.js';
import useToast from '../../../shared/hooks/useToast.js';

export default function AssignModal({ isOpen, blocks, assignments, engineers, onClose, onSaved }) {
  const [blockId, setBlockId] = useState('');
  const [engId, setEngId] = useState('');
  const [suggestedEngineerId, setSuggestedEngineerId] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setBlockId('');
      setEngId('');
      setSuggestedEngineerId('');
    }
  }, [isOpen]);

  const unassignedBlocks = blocks.filter((b) => !b.assignedEngineerId);
  function loadFor(e) { return assignments.filter((a) => a.engineerId === e.id).length; }

  function getBlockedDependencyCount(engineerId) {
    const blockById = new Map(blocks.map((b) => [b.id, b]));
    const assignedBlocks = blocks.filter(
      (b) => b.assignedEngineerId === engineerId && b.status !== 'Completed',
    );
    return assignedBlocks.filter((b) => {
      const deps = b.dependsOn || [];
      if (deps.length === 0) return false;
      return deps.some((depId) => blockById.get(depId)?.status !== 'Completed');
    }).length;
  }

  function getSuggestedEngineerId(nextBlockId) {
    const selectedBlock = blocks.find((b) => b.id === nextBlockId);
    if (!selectedBlock) return '';
    const normalizedType = String(selectedBlock.type || '').trim().toLowerCase();

    const skilledEngineers = engineers.filter((engineer) => {
      const skills = Array.isArray(engineer.skills) ? engineer.skills : [];
      return skills.some((skill) => normalizedType.includes(String(skill).trim().toLowerCase()));
    });
    const candidateEngineers = skilledEngineers.length > 0 ? skilledEngineers : engineers;

    const ranked = candidateEngineers
      .map((engineer) => {
        const workload = loadFor(engineer);
        const sameTypeExperience = blocks.filter(
          (b) => b.assignedEngineerId === engineer.id && b.type === selectedBlock.type,
        ).length;
        const blockedDependencyCount = getBlockedDependencyCount(engineer.id);

        return {
          engineerId: engineer.id,
          workload,
          sameTypeExperience,
          blockedDependencyCount,
        };
      })
      .filter((candidate) => candidate.workload < MAX_BLOCKS_PER_ENGINEER)
      .sort((a, b) => {
        if (a.blockedDependencyCount !== b.blockedDependencyCount) {
          return a.blockedDependencyCount - b.blockedDependencyCount;
        }
        if (a.workload !== b.workload) {
          return a.workload - b.workload;
        }
        if (a.sameTypeExperience !== b.sameTypeExperience) {
          return b.sameTypeExperience - a.sameTypeExperience;
        }
        return 0;
      });

    return ranked[0]?.engineerId || '';
  }

  function handleBlockChange(nextBlockId) {
    setBlockId(nextBlockId);
    const nextSuggested = getSuggestedEngineerId(nextBlockId);
    setSuggestedEngineerId(nextSuggested);
    setEngId(nextSuggested || '');
  }

  async function save() {
    if (!blockId || !engId) { toast.error('Select a block and engineer'); return; }
    try {
      await assignEngineer(blockId, engId);
      toast.success('Engineer assigned');
      onSaved();
    } catch (e) { toast.error(e.message); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Engineer" maxWidth={460}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Assign</button>
      </>}>
      <div className="form-row">
        <label>1. Select Block (unassigned only)</label>
        <select value={blockId} onChange={(e) => handleBlockChange(e.target.value)}>
          <option value="">— choose block —</option>
          {unassignedBlocks.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.type}</option>)}
        </select>
      </div>
      {blockId && suggestedEngineerId && (
        <div className="form-hint" style={{ marginBottom: 8 }}>
          Suggested engineer selected automatically based on skill match, workload, past block type experience, and dependency availability.
        </div>
      )}
      <div className="form-row">
        <label>2. Select Engineer</label>
        <select value={engId} onChange={(e) => setEngId(e.target.value)}>
          <option value="">— choose engineer —</option>
          {engineers.map((e) => {
            const load = loadFor(e);
            const full = load >= MAX_BLOCKS_PER_ENGINEER;
            return <option key={e.id} value={e.id} disabled={full} title={full ? 'Engineer at full capacity' : ''}>
              {e.name} ({load}/{MAX_BLOCKS_PER_ENGINEER} blocks){full ? ' — FULL' : ''}
            </option>;
          })}
        </select>
        {engId && (() => {
          const e = engineers.find((x) => x.id === engId);
          const load = e ? loadFor(e) : 0;
          if (load >= 2) return <div className="form-hint" style={{ color: 'var(--accent-warning)' }}>⚠ Engineer near capacity ({load}/{MAX_BLOCKS_PER_ENGINEER})</div>;
          return null;
        })()}
      </div>
    </Modal>
  );
}
