import { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal.jsx';
import { COMPLEXITY_LEVELS, COMPLEXITY_BASE_HOURS } from '../../../shared/constants/complexity.js';
import { computeEstimatedHours } from '../../../shared/utils/complexity.js';
import { createBlock, updateBlock } from '../../../services/blocks.service.js';
import useToast from '../../../shared/hooks/useToast.js';

const TYPES = [
  'Inverter', 'Current Mirror', 'Differential Pair', 'Bandgap Reference',
  'Operational Transconductance Amplifier (OTA)', 'Low Dropout Regulator (LDO)', 'Custom',
];
const TECH = ['28nm', '45nm', '65nm', '90nm', '130nm', '180nm'];

const empty = {
  name: '', type: 'Inverter', customType: '', description: '',
  techNode: '65nm', complexity: 'Medium', baseHours: 20,
  estimatedArea: 1000, areaUnit: 'µm²',
};

export default function BlockFormModal({ isOpen, initial, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (initial) {
      const isCustom = !TYPES.includes(initial.type);
      setForm({ ...empty, ...initial, type: isCustom ? 'Custom' : initial.type, customType: isCustom ? initial.type : '' });
    } else setForm(empty);
  }, [initial, isOpen]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleComplexityChange(c) {
    setForm((f) => ({ ...f, complexity: c, baseHours: COMPLEXITY_BASE_HOURS[c] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Block name required'); return; }
    setBusy(true);
    const payload = {
      ...form,
      type: form.type === 'Custom' ? form.customType : form.type,
      baseHours: Number(form.baseHours),
      estimatedArea: Number(form.estimatedArea),
    };
    delete payload.customType;
    try {
      if (initial) { 
        await updateBlock(initial.id, payload); 
        toast.success('Block updated'); 
      } else { 
        await createBlock(payload); 
        toast.success('Block created'); 
      }
      onSaved();
    } catch (error) { 
      console.error('Block save error:', error);
      toast.error(error.message || 'Failed to save block');
      // Still refresh data to sync with server
      setTimeout(() => onSaved(), 500);
    } finally {
      setBusy(false);
    }
  }

  const estHours = computeEstimatedHours(form.baseHours, form.complexity);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Block' : 'Add Layout Block'} maxWidth={620}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>{busy ? 'Saving…' : 'Save Block'}</button>
        </>
      }>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Block Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-grid">
          <div>
            <label>Block Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {form.type === 'Custom' && (
              <input style={{ marginTop: 8 }} placeholder="Custom type name" value={form.customType} onChange={(e) => set('customType', e.target.value)} />
            )}
          </div>
          <div>
            <label>Technology Node</label>
            <select value={form.techNode} onChange={(e) => set('techNode', e.target.value)}>
              {TECH.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Complexity</label>
            <select value={form.complexity} onChange={(e) => handleComplexityChange(e.target.value)}>
              {COMPLEXITY_LEVELS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="form-hint">≈ {estHours}h estimated</div>
          </div>
          <div>
            <label>Base Hours</label>
            <input type="number" value={form.baseHours} onChange={(e) => set('baseHours', e.target.value)} />
          </div>
          <div>
            <label>Estimated Area</label>
            <input type="number" value={form.estimatedArea} onChange={(e) => set('estimatedArea', e.target.value)} />
          </div>
          <div>
            <label>Area Unit</label>
            <select value={form.areaUnit} onChange={(e) => set('areaUnit', e.target.value)}>
              <option>µm²</option><option>mm²</option>
            </select>
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 14 }}>
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
