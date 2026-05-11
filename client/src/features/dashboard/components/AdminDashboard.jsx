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
  setUserActive,
  updateUserRole,
  updateUserSkills,
  upsertUser,
} from "../../../services/users.service.js";
import {
  bulkReassignEngineer,
  getLoginAttempts,
  forceBlockStage,
} from "../../../services/admin.service.js";
import { getWorkflowLog } from "../../../services/workflow.service.js";

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: ROLES.ENGINEER, skills: "" });
  const [skillsDraft, setSkillsDraft] = useState({});
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [reassignFrom, setReassignFrom] = useState("");
  const [reassignTo, setReassignTo] = useState("");

  async function refreshAll() {
    const [nextUsers, nextBlocks, nextApprovals, nextAssignments, nextAttempts] =
      await Promise.all([
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
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadAudit() {
      if (blocks.length === 0) {
        setAuditLogs([]);
        return;
      }
      const allLogs = await Promise.all(blocks.map((block) => getWorkflowLog(block.id)));
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
      const engAssignments = assignments.filter((a) => a.engineerId === eng.id).length;
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
        variancePct: estHours ? Math.round(((actHours - estHours) / estHours) * 100) : 0,
      };
    });

    return {
      totalUsers: users.length,
      totalBlocks: blocks.length,
      onTimeCompletionRate:
        completed.length === 0
          ? 0
          : Math.round(
              (completed.filter((b) => Number(b.actualHours || 0) <= Number(b.estimatedHours || 0)).length /
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
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleToggleActive(target) {
    try {
      await setUserActive(target.id, !target.active);
      toast.success(target.active ? "User deactivated" : "User activated");
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

  async function handleDeleteBlock(blockId) {
    try {
      await deleteBlock(blockId);
      toast.success("Block deleted");
      await refreshAll();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleBulkReassign() {
    if (!reassignFrom || !reassignTo || reassignFrom === reassignTo) {
      toast.error("Pick two different engineers");
      return;
    }
    try {
      const response = await bulkReassignEngineer(reassignFrom, reassignTo);
      toast.success(response.message || "Reassigned");
      setReassignFrom("");
      setReassignTo("");
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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          ["users", "User Management"],
          ["blocks", "Block Controls"],
          ["reassign", "Engineer Reassignment"],
          ["attempts", "Access Denied"],
          ["audit", "Audit Log"],
          ["analytics", "Global Analytics"],
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

      {tab === "users" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Pre-register users</h3>
          <form onSubmit={handleUpsertUser} className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Gmail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value={ROLES.MANAGER}>Manager</option>
                <option value={ROLES.ENGINEER}>Engineer</option>
              </select>
            </div>
            <div className="form-row">
              <label>Skills (comma separated)</label>
              <input
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                placeholder="DRC, LVS, Current Mirror"
              />
            </div>
            <div style={{ alignSelf: "end" }}>
              <button className="btn btn-primary" type="submit">Save User</button>
            </div>
          </form>

          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Skills</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)}>
                      <option value={ROLES.MANAGER}>Manager</option>
                      <option value={ROLES.ENGINEER}>Engineer</option>
                      <option value={ROLES.ADMIN}>Admin</option>
                    </select>
                  </td>
                  <td style={{ minWidth: 260 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        value={skillsDraft[u.id] ?? (u.skills || []).join(", ")}
                        onChange={(e) =>
                          setSkillsDraft((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                        placeholder="Add skill tags"
                      />
                      <button className="btn btn-secondary" onClick={() => handleSaveSkills(u)}>
                        Save
                      </button>
                    </div>
                  </td>
                  <td>{u.active ? "Active" : "Inactive"}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleToggleActive(u)}>
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "blocks" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Full block control</h3>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <label>Block</label>
              <select value={selectedBlockId} onChange={(e) => setSelectedBlockId(e.target.value)}>
                <option value="">Select block</option>
                {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Force Stage</label>
              <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ alignSelf: "end", display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={handleForceStage}>Force Move</button>
            </div>
          </div>

          <table className="data-table">
            <thead><tr><th>Block</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.status}</td>
                  <td>{b.assignedEngineer?.name || "Unassigned"}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteBlock(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reassign" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Bulk reassign engineer blocks</h3>
          <div className="form-grid">
            <div className="form-row">
              <label>From Engineer</label>
              <select value={reassignFrom} onChange={(e) => setReassignFrom(e.target.value)}>
                <option value="">Select engineer</option>
                {engineers.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>To Engineer</label>
              <select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                <option value="">Select engineer</option>
                {engineers.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div style={{ alignSelf: "end" }}>
              <button className="btn btn-primary" onClick={handleBulkReassign}>Reassign All</button>
            </div>
          </div>
        </div>
      )}

      {tab === "attempts" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Access denied attempts</h3>
          <table className="data-table">
            <thead><tr><th>Email</th><th>Status</th><th>Reason</th><th>When</th></tr></thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.email}</td>
                  <td>{a.status}</td>
                  <td>{a.reason || "—"}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "audit" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>System audit log</h3>
          <table className="data-table">
            <thead><tr><th>Block</th><th>Action</th><th>Actor</th><th>Time</th></tr></thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{blocks.find((b) => b.id === log.blockId)?.name || "Block"}</td>
                  <td>{log.stage}</td>
                  <td>{log.actorName || "System"}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "analytics" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Global analytics</h3>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-label">Total users</div><div className="stat-value">{analytics.totalUsers}</div></div>
            <div className="stat-card"><div className="stat-label">Managers</div><div className="stat-value">{managers.length}</div></div>
            <div className="stat-card"><div className="stat-label">Engineers</div><div className="stat-value">{engineers.length}</div></div>
            <div className="stat-card"><div className="stat-label">On-time completion</div><div className="stat-value">{analytics.onTimeCompletionRate}%</div></div>
            <div className="stat-card"><div className="stat-label">Avg effort variance</div><div className="stat-value">{analytics.avgEffortVariancePct}%</div></div>
            <div className="stat-card"><div className="stat-label">Top bottleneck</div><div className="stat-value">{analytics.bottleneck}</div></div>
          </div>
          <h4 style={{ marginBottom: 8 }}>Engineer utilization</h4>
          <table className="data-table">
            <thead><tr><th>Engineer</th><th>Load</th><th>Utilization</th><th>Variance</th></tr></thead>
            <tbody>
              {analytics.engineerUtilization.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.load}</td>
                  <td>{row.utilizationPct}%</td>
                  <td>{row.variancePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
