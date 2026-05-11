import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import { overrideEffort } from '../../../services/effort.service.js';
import useToast from '../../../shared/hooks/useToast.js';

export default function EffortOverrideModal({ row, onClose, onSaved }) {
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (row) { setHours(row.estimatedHours); setReason(''); }
  }, [row]);

  async function save() {
    if (!reason.trim()) { toast.error('Reason required'); return; }
    await overrideEffort(row.id, Number(hours), reason.trim());
    toast.success('Estimate overridden');
    onSaved();
  }

  return (
    <Modal isOpen={!!row} onClose={onClose} title={`Override Effort — ${row?.name || ''}`} maxWidth={460}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save Override</button>
        </>
      }>
      <div className="form-row">
        <label>Current Estimate</label>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row?.estimatedHours}h</div>
      </div>
      <div className="form-row">
        <label>Override Hours</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Reason for override *</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this estimate is being adjusted…" />
      </div>
    </Modal>
  );
}
