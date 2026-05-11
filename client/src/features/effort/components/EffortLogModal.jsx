import { useState, useEffect } from "react";
import Modal from "../../../shared/components/Modal.jsx";
import { logEffortHours } from "../../../services/effort.service.js";
import useToast from "../../../shared/hooks/useToast.js";

export default function EffortLogModal({ row, onClose, onSaved }) {
  const [manualHours, setManualHours] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [notes, setNotes] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (row) {
      setManualHours("");
      setUseManual(false);
      setNotes("");
    }
  }, [row]);

  async function save() {
    if (useManual) {
      const h = Number(manualHours);
      if (!Number.isFinite(h) || h <= 0) {
        toast.error("Enter a positive number of hours");
        return;
      }
      if (!row?.assignedEngineerId) {
        toast.error("Assign an engineer to this block before logging effort");
        return;
      }
      try {
        await logEffortHours({
          blockId: row.id,
          engineerId: row.assignedEngineerId,
          hoursLogged: h,
          notes,
        });
        toast.success("Hours logged; actual updated");
        onSaved();
      } catch (e) {
        toast.error(e.message || "Failed to log effort");
      }
    } else {
      // Auto-calculated from timestamps
      toast.success("Actual hours auto-calculated from block timeline");
      onSaved();
    }
  }

  const autoCalculatedHours = row?.actualHours || 0;

  return (
    <Modal
      isOpen={!!row}
      onClose={onClose}
      title={`Effort tracking — ${row?.name || ""}`}
      maxWidth={460}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={save}>
            {useManual ? "Log hours" : "Confirm"}
          </button>
        </>
      }
    >
      <div className="form-row">
        <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>Auto-calculated actual hours:</div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "var(--text-primary)" }}>{autoCalculatedHours}h</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Based on time between "In Progress" and "Completed" statuses
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
          <input 
            type="checkbox" 
            checked={useManual} 
            onChange={(e) => setUseManual(e.target.checked)}
          />
          Override with manual entry
        </label>
      </div>

      {useManual && (
        <div className="form-row">
          <label>Actual hours (override)</label>
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={manualHours}
            onChange={(e) => setManualHours(e.target.value)}
            placeholder="e.g. 4"
          />
          <div className="form-hint">
            Leave empty to use auto-calculated value.
          </div>
        </div>
      )}

      <div className="form-row">
        <label>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was worked on…"
        />
      </div>
    </Modal>
  );
}
