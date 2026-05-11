import { X, ChevronRight } from 'lucide-react';
import { STAGE_COLORS } from '../../../shared/constants/pipeline.js';
import '../styles/node-details-drawer.css';

export default function NodeDetailsDrawer({
  isOpen = false,
  nodeId = null,
  blocks = [],
  onClose = () => {},
  onManageDependencies = () => {},
}) {
  if (!isOpen || !nodeId) return null;

  const block = blocks.find((b) => b.id === nodeId);
  if (!block) return null;

  const dependencies = blocks.filter((b) => block.dependsOn.includes(b.id));
  const dependents = blocks.filter((b) => (b.dependsOn || []).includes(nodeId));
  const assignedEngineer = blocks.length > 0 && block.assignedEngineerId
    ? `Engineer ${block.assignedEngineerId}` // In real app, would fetch engineer name
    : 'Unassigned';

  const stageColor = STAGE_COLORS[block.status] || '#555e74';

  return (
    <>
      <div className="node-details-overlay" onClick={onClose} />
      <div className="node-details-drawer">
        <div className="drawer-header">
          <h2>Block Details</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Block Summary */}
          <div className="section">
            <div className="block-header">
              <div
                className="status-badge"
                style={{ backgroundColor: stageColor }}
              >
                {block.status}
              </div>
              <h3>{block.name}</h3>
            </div>
            <p className="block-description">{block.description}</p>
            <div className="block-meta">
              <div className="meta-item">
                <span className="meta-label">Type:</span>
                <span className="meta-value">{block.type}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Tech Node:</span>
                <span className="meta-value">{block.techNode}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assigned To:</span>
                <span className="meta-value">{assignedEngineer}</span>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="section">
            <h4 className="section-title">Depends On ({dependencies.length})</h4>
            {dependencies.length === 0 ? (
              <p className="empty-state">No dependencies</p>
            ) : (
              <div className="dependency-list">
                {dependencies.map((dep) => (
                  <div key={dep.id} className="dependency-item">
                    <div
                      className="dep-status"
                      style={{
                        backgroundColor: STAGE_COLORS[dep.status] || '#555e74',
                      }}
                    />
                    <div className="dep-info">
                      <div className="dep-name">{dep.name}</div>
                      <div className="dep-status-label">{dep.status}</div>
                    </div>
                    <ChevronRight size={14} className="dep-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dependents (what this unlocks) */}
          <div className="section">
            <h4 className="section-title">Unlocks ({dependents.length})</h4>
            {dependents.length === 0 ? (
              <p className="empty-state">No dependent blocks</p>
            ) : (
              <div className="dependency-list">
                {dependents.map((dep) => (
                  <div key={dep.id} className="dependency-item">
                    <div
                      className="dep-status"
                      style={{
                        backgroundColor: STAGE_COLORS[dep.status] || '#555e74',
                      }}
                    />
                    <div className="dep-info">
                      <div className="dep-name">{dep.name}</div>
                      <div className="dep-status-label">{dep.status}</div>
                    </div>
                    <ChevronRight size={14} className="dep-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="section actions-section">
            <button
              className="action-btn"
              onClick={() => onManageDependencies(nodeId)}
            >
              Manage Dependencies
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
