import { useEffect, useMemo, useState } from "react";
import useAuth from "../../../shared/hooks/useAuth.js";
import useToast from "../../../shared/hooks/useToast.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { STAGES } from "../../../shared/constants/pipeline.js";
import { getBlocks, deleteBlock } from "../../../services/blocks.service.js";
import { getApprovals } from "../../../services/approvals.service.js";
import { getAssignments } from "../../../services/assignments.service.js";
import {
  getUsers,
  deleteUser,
  updateUserRole,
  updateUserSkills,
  upsertUser,
} from "../../../services/users.service.js";
import {
  getLoginAttempts,
  forceBlockStage,
} from "../../../services/admin.service.js";
import { getWorkflowLog } from "../../../services/workflow.service.js";
import { subscribeToDataChanges } from "../../../services/api.js";
import BlockFormModal from "../../blocks/components/BlockFormModal.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("pending");
  const [users, setUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: ROLES.ENGINEER,
    skills: "",
  });
  const [skillsDraft, setSkillsDraft] = useState({});
  const [blockStageDraft, setBlockStageDraft] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState("ALL");

  async function refreshAll() {
    const [
      nextUsers,
      nextBlocks,
      nextApprovals,
      nextAssignments,
      nextAttempts,
    ] = await Promise.all([
      getUsers(),
      getBlocks(),
      getApprovals(),
      getAssignments(),
      getLoginAttempts(),
    ]);
    setUsers(nextUsers);
    setBlocks(nextBlocks);
    setApprovals(nextApprovals);
    setAssignments(nextAssignments);
    setAttempts(nextAttempts);
  }

  useEffect(() => {
    refreshAll();
    const unsubscribe = subscribeToDataChanges(() => {
      refreshAll();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadAudit() {
      if (blocks.length === 0) {
        setAuditLogs([]);
        return;
      }
      const allLogs = await Promise.all(
        blocks.map((block) => getWorkflowLog(block.id)),
      );
      if (!mounted) return;
      const flat = allLogs
        .flat()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 200);
      setAuditLogs(flat);
    }
    loadAudit();
    return () => {
      mounted = false;
    };
  }, [blocks]);

  const filteredAuditLogs = useMemo(() => {
    // Combine workflow logs and access attempts
    const workflowLogs = auditLogs.map(log => ({
      ...log,
      type: 'workflow',
      action: log.stage,
      actor: log.actorName || 'System',
      timestamp: log.timestamp,
      blockName: blocks.find((b) => b.id === log.blockId)?.name || 'Block',
    }));

    const accessLogs = attempts.map(attempt => ({
      ...attempt,
      type: attempt.status === 'ALLOWED' ? 'access_approved' : 'access_denied',
      action: attempt.status === 'ALLOWED' ? 'Access Approved' : 'Access Denied',
      actor: attempt.email,
      timestamp: attempt.createdAt,
      reason: attempt.reason || '—',
    }));

    const allLogs = [...workflowLogs, ...accessLogs].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (auditFilter === "ALL") return allLogs;
    if (auditFilter === "WORKFLOW") return workflowLogs;
    if (auditFilter === "ACCESS_DENIED") return accessLogs.filter(log => log.type === 'access_denied');
    if (auditFilter === "ACCESS_APPROVED") return accessLogs.filter(log => log.type === 'access_approved');
    return allLogs;
  }, [auditLogs, attempts, blocks, auditFilter]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "ALL") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const pendingUsers = useMemo(() => {
    return users.filter((u) => u.role === ROLES.PENDING);
  }, [users]);

  const activeUsers = useMemo(() => {
    return users.filter((u) => u.role !== ROLES.PENDING);
  }, [users]);

  const unassignedBlocks = useMemo(() => {
    return blocks.filter((b) => !b.assignedEngineerId);
  }, [blocks]);

  const blocksByStage = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      count: blocks.filter((b) => b.status === stage).length,
      blocks: blocks.filter((b) => b.status === stage),
    }));
  }, [blocks]);

  const engineers = useMemo(
    () => users.filter((u) => u.role === ROLES.ENGINEER),
    [users],
  );
  const managers = useMemo(
    () => users.filter((u) => u.role === ROLES.MANAGER),
    [users],
  );

  const analytics = useMemo(() => {
    const completed = blocks.filter((b) => b.status === "Completed");
    const effortVariance =
      completed.length === 0
        ? 0
        : completed.reduce((acc, block) => {
            const est = Number(block.estimatedHours || 0);
            const act = Number(block.actualHours || 0);
            if (!est) return acc;
            return acc + ((act - est) / est) * 100;
          }, 0) / completed.length;

    const stageCounts = STAGES.map((stage) => ({
      stage,
      count: blocks.filter((b) => b.status === stage).length,
    })).sort((a, b) => b.count - a.count);

    const engUtil = engineers.map((eng) => {
      const engAssignments = assignments.filter(
        (a) => a.engineerId === eng.id,
      ).length;
      const estHours = blocks
        .filter((b) => b.assignedEngineerId === eng.id)
        .reduce((s, b) => s + Number(b.estimatedHours || 0), 0);
      const actHours = blocks
        .filter((b) => b.assignedEngineerId === eng.id)
        .reduce((s, b) => s + Number(b.actualHours || 0), 0);
      return {
        ...eng,
        load: engAssignments,
        utilizationPct: Math.min(100, Math.round((engAssignments / 5) * 100)),
        variancePct: estHours
          ? Math.round(((actHours - estHours) / estHours) * 100)
          : 0,
      };
    });

    return {
      totalUsers: users.length,
      totalBlocks: blocks.length,
      onTimeCompletionRate:
        completed.length === 0
          ? 0
          : Math.round(
              (completed.filter(
                (b) =>
                  Number(b.actualHours || 0) <= Number(b.estimatedHours || 0),
              ).length /
                completed.length) *
                100,
            ),
      avgEffortVariancePct: Math.round(effortVariance),
      bottleneck: stageCounts[0]?.stage || "N/A",
      engineerUtilization: engUtil,
    };
  }, [assignments, blocks, engineers, users.length]);

  async function handleUpsertUser(event) {
    event.preventDefault();
    try {
      await upsertUser(form);
      toast.success("User registered and enabled");
      setForm({ name: "", email: "", role: ROLES.ENGINEER, skills: "" });
      setShowUserModal(false);
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleDeleteUser(target) {
    if (!confirm(`Are you sure you want to delete ${target.name}?`)) return;
    try {
      await deleteUser(target.id);
      toast.success("User deleted");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRejectPendingUser(target) {
    if (!confirm(`Are you sure you want to reject ${target.name} (${target.email})?\n\nThis will permanently remove them from the system and they will not be able to access the application.`)) return;
    try {
      await deleteUser(target.id);
      toast.success(`${target.name} has been rejected and removed from the system`);
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRoleChange(target, role) {
    try {
      await updateUserRole(target.id, role);
      toast.success(`Role changed to ${role}`);
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleSaveSkills(target) {
    try {
      const draft = skillsDraft[target.id] ?? target.skills?.join(", ") ?? "";
      await updateUserSkills(target.id, draft);
      toast.success("Skills updated");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleForceStage() {
    if (!selectedBlockId || !selectedStage) return;
    try {
      await forceBlockStage(selectedBlockId, {
        status: selectedStage,
        performedBy: user?.id,
        note: "Admin force stage override",
      });
      toast.success("Stage overridden");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleBlockStageChange(blockId, newStage) {
    try {
      await forceBlockStage(blockId, {
        status: newStage,
        performedBy: user?.id,
        note: "Admin stage change",
      });
      toast.success("Stage updated");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleDeleteBlock(blockId) {
    try {
      await deleteBlock(blockId);
      toast.success("Block deleted");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Control Center</h1>
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {[
          ["pending", `Pending Users ${pendingUsers.length > 0 ? `(${pendingUsers.length})` : ""}`],
          ["users", "User Management"],
          ["blocks", "Block Management"],
          ["overview", "System Overview"],
          ["audit", "Audit Log"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`chip ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pending" && (
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3>First-Time User Onboarding</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>
              Users who have logged in via Google OAuth but have not been assigned a role yet. 
              They cannot access any features until you assign them a role.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✓</div>
              <p>No pending users. All users have been assigned roles.</p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>First Login</th>
                    <th>Assign Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleRoleChange(u, e.target.value);
                              }
                            }}
                            style={{ minWidth: 150 }}
                          >
                            <option value="">Select Role</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                            <option value={ROLES.MANAGER}>Manager</option>
                            <option value={ROLES.ENGINEER}>Engineer</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRejectPendingUser(u)}
                          style={{ padding: "6px 12px", fontSize: 13 }}
                          title="Reject and remove this user"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>User Management</h3>
            <button
              className="btn btn-primary"
              onClick={() => setShowUserModal(true)}
            >
              + Add User
            </button>
          </div>

          <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Filter by Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: "6px 12px" }}
            >
              <option value="ALL">All Users</option>
              <option value={ROLES.PENDING}>Pending</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.MANAGER}>Manager</option>
              <option value={ROLES.ENGINEER}>Engineer</option>
            </select>
            <span style={{ marginLeft: 8, color: "var(--text-secondary)", fontSize: 13 }}>
              ({filteredUsers.length} users)
            </span>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Skills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        disabled={u.role === ROLES.PENDING || u.id === user?.id || u.role === ROLES.ADMIN}
                        title={u.id === user?.id ? "You cannot change your own role" : u.role === ROLES.ADMIN ? "Admin role cannot be changed" : ""}
                      >
                        <option value={ROLES.PENDING}>Pending</option>
                        <option value={ROLES.MANAGER}>Manager</option>
                        <option value={ROLES.ENGINEER}>Engineer</option>
                        <option value={ROLES.ADMIN}>Admin</option>
                      </select>
                    </td>
                    <td style={{ minWidth: 260 }}>
                      <input
                        value={skillsDraft[u.id] ?? (u.skills || []).join(", ")}
                        onChange={(e) =>
                          setSkillsDraft((prev) => ({
                            ...prev,
                            [u.id]: e.target.value,
                          }))
                        }
                        onBlur={() => handleSaveSkills(u)}
                        placeholder="Add skill tags"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteUser(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showUserModal && (
            <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16 }}>Pre-register User</h3>
                <form onSubmit={handleUpsertUser} className="form-grid">
                  <div className="form-row">
                    <label>Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Gmail *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Role *</label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value }))
                      }
                    >
                      <option value={ROLES.MANAGER}>Manager</option>
                      <option value={ROLES.ENGINEER}>Engineer</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Skills (comma separated)</label>
                    <input
                      value={form.skills}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, skills: e.target.value }))
                      }
                      placeholder="DRC, LVS, Current Mirror"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUserModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="submit">
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "blocks" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Block Management</h3>
            <button
              className="btn btn-primary"
              onClick={() => setFormOpen(true)}
            >
              + Create Block
            </button>
          </div>

          {unassignedBlocks.length > 0 && (
            <div className="alert-banner" style={{ marginBottom: 16 }}>
              <div>
                <strong>⚠️ {unassignedBlocks.length} Unassigned Block(s)</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  These blocks have no engineer assigned and need attention.
                </div>
              </div>
            </div>
          )}

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Block Name</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Assigned Engineer</th>
                  <th>Est. Hours</th>
                  <th>Actual Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id} style={{ background: !b.assignedEngineerId ? 'rgba(245, 158, 11, 0.05)' : 'inherit' }}>
                    <td>
                      <strong>{b.name}</strong>
                      {!b.assignedEngineerId && <span style={{ marginLeft: 8, color: 'var(--accent-warning)', fontSize: 11 }}>⚠️ UNASSIGNED</span>}
                    </td>
                    <td>{b.type}</td>
                    <td>
                      <span className="status-badge">
                        <span className="dot" style={{ background: `var(--stage-${b.status.toLowerCase().replace(' ', '-')})` }}></span>
                        {b.status}
                      </span>
                    </td>
                    <td>{b.assignedEngineer?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td>{b.estimatedHours || 0}h</td>
                    <td>{b.actualHours || 0}h</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedBlock(b);
                            setShowBlockModal(true);
                          }}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteBlock(b.id)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <BlockFormModal
            isOpen={formOpen}
            initial={null}
            onClose={() => setFormOpen(false)}
            onSaved={async () => {
              setFormOpen(false);
              await refreshAll();
            }}
          />

          {showBlockModal && selectedBlock && (
            <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                <h3 style={{ marginBottom: 16 }}>Block Details</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div><strong>Name:</strong> {selectedBlock.name}</div>
                  <div><strong>Type:</strong> {selectedBlock.type}</div>
                  <div><strong>Description:</strong> {selectedBlock.description || '—'}</div>
                  <div><strong>Technology Node:</strong> {selectedBlock.techNode || '—'}</div>
                  <div><strong>Complexity:</strong> <span className={`complexity-badge complexity-${selectedBlock.complexity}`}>{selectedBlock.complexity}</span></div>
                  <div><strong>Status:</strong> {selectedBlock.status}</div>
                  <div><strong>Assigned Engineer:</strong> {selectedBlock.assignedEngineer?.name || 'Unassigned'}</div>
                  <div><strong>Estimated Hours:</strong> {selectedBlock.estimatedHours || 0}h</div>
                  <div><strong>Actual Hours:</strong> {selectedBlock.actualHours || 0}h</div>
                  <div><strong>Estimated Area:</strong> {selectedBlock.estimatedArea || '—'} {selectedBlock.areaUnit || ''}</div>
                  <div><strong>Created:</strong> {new Date(selectedBlock.createdAt).toLocaleString()}</div>
                  <div><strong>Last Updated:</strong> {new Date(selectedBlock.updatedAt).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "overview" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>System-Wide Overview</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Total Blocks</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{blocks.length}</div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Unassigned</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: unassignedBlocks.length > 0 ? 'var(--accent-warning)' : 'inherit' }}>
                {unassignedBlocks.length}
              </div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Total Users</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{users.length}</div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Pending</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: pendingUsers.length > 0 ? 'var(--accent-warning)' : 'inherit' }}>
                {pendingUsers.length}
              </div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Engineers</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{engineers.length}</div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Managers</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{managers.length}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Blocks by Stage</h4>
              <div style={{ display: "grid", gap: 8 }}>
                {blocksByStage.map(({ stage, count, blocks: stageBlocks }) => (
                  <div key={stage} style={{ 
                    padding: 10, 
                    background: 'var(--bg-elevated)', 
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        background: `var(--stage-${stage.toLowerCase().replace(' ', '-')})` 
                      }}></span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{stage}</span>
                    </div>
                    <span style={{ 
                      background: 'var(--bg-surface)', 
                      padding: '2px 8px', 
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Effort Summary</h4>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ padding: 10, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Estimated</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {blocks.reduce((sum, b) => sum + (Number(b.estimatedHours) || 0), 0)}h
                  </div>
                </div>
                <div style={{ padding: 10, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Actual</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {blocks.reduce((sum, b) => sum + (Number(b.actualHours) || 0), 0)}h
                  </div>
                </div>
                <div style={{ padding: 10, background: "var(--bg-elevated)", borderRadius: 6, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Variance</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {(() => {
                      const est = blocks.reduce((sum, b) => sum + (Number(b.estimatedHours) || 0), 0);
                      const act = blocks.reduce((sum, b) => sum + (Number(b.actualHours) || 0), 0);
                      const variance = est > 0 ? Math.round(((act - est) / est) * 100) : 0;
                      return (
                        <span className={variance > 0 ? 'variance-neg' : variance < 0 ? 'variance-pos' : ''}>
                          {variance > 0 ? '+' : ''}{variance}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3>System Audit Log</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                Complete audit trail of all workflow transitions, approvals, rejections, and access attempts.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>Filter:</label>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                style={{ padding: "6px 12px" }}
              >
                <option value="ALL">All Events</option>
                <option value="WORKFLOW">Workflow Changes</option>
                <option value="ACCESS_APPROVED">Access Approved</option>
                <option value="ACCESS_DENIED">Access Denied</option>
              </select>
              <span style={{ marginLeft: 8, color: "var(--text-secondary)", fontSize: 13 }}>
                ({filteredAuditLogs.length} events)
              </span>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Block/Email</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: log.type === 'workflow' ? 'var(--accent-primary)' : log.type === 'access_approved' ? 'var(--accent-secondary)' : 'var(--accent-warning)',
                        color: '#fff'
                      }}>
                        {log.type === 'workflow' ? 'WORKFLOW' : log.type === 'access_approved' ? 'ACCESS' : 'ACCESS'}
                      </span>
                    </td>
                    <td>{log.blockName || log.email || '—'}</td>
                    <td>{log.action}</td>
                    <td>{log.actor}</td>
                    <td>{log.reason || log.status || '—'}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
