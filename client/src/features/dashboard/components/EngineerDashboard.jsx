import { useEffect, useState } from "react";
import { Layers, Activity, Clock } from "lucide-react";
import StatCard from "./StatCard.jsx";
import useAuth from "../../../shared/hooks/useAuth.js";
import useToast from "../../../shared/hooks/useToast.js";
import { getBlocks } from "../../../services/blocks.service.js";
import { getApprovals } from "../../../services/approvals.service.js";
import { advanceStage } from "../../../services/workflow.service.js";
import { submitForReview } from "../../../services/approvals.service.js";
import StatusBadge from "../../../shared/components/StatusBadge.jsx";
import ConfirmDialog from "../../../shared/components/ConfirmDialog.jsx";
import { relativeTime } from "../../../shared/utils/formatters.js";
import { subscribeToDataChanges } from "../../../services/api.js";

export default function EngineerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [blocks, setBlocks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [confirm, setConfirm] = useState(null);

  async function refresh() {
    setBlocks(await getBlocks());
    setApprovals(await getApprovals());
  }
  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToDataChanges(() => {
      refresh();
    });
    return unsubscribe;
  }, []);

  const mine = blocks.filter((b) => b.assignedEngineerId === user?.id);
  const inProgress = mine.filter((b) => b.status === "In Progress").length;
  const hoursLogged = mine.reduce((s, b) => s + (b.actualHours || 0), 0);
  const myRejections = approvals.filter(
    (a) => a.engineerId === user?.id && a.status === "Rejected",
  );

  async function doAdvance(b) {
    if (b.status === "Review") {
      await submitForReview(b.id, user.id);
      toast.success("Submitted for review");
    } else {
      await advanceStage(b.id, user.id);
      toast.success(`Advanced ${b.name}`);
    }
    setConfirm(null);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Workspace</h1>
      </div>

      <div className="stat-grid">
        <StatCard
          label="My Assigned Blocks"
          value={mine.length}
          icon={<Layers size={12} />}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={<Activity size={12} />}
        />
        <StatCard
          label="Hours Logged"
          value={`${hoursLogged}h`}
          icon={<Clock size={12} />}
        />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, marginBottom: 14 }}>My Blocks</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Block Name</th>
              <th>Type</th>
              <th>Stage</th>
              <th>Est. Hours</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((b) => {
              const disabled = b.status === "Completed";
              const isReview = b.status === "Review";
              return (
                <tr key={b.id}>
                  <td
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                    }}
                  >
                    {b.name}
                  </td>
                  <td>{b.type}</td>
                  <td>
                    <StatusBadge stage={b.status} />
                  </td>
                  <td>{b.estimatedHours}h</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      disabled={disabled}
                      onClick={() => setConfirm(b)}
                    >
                      {isReview ? "Submit for Review" : "Advance Stage"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {mine.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    padding: 20,
                  }}
                >
                  No blocks assigned to you yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {myRejections.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Rejection Feedback</h3>
          {myRejections.map((a) => {
            const block = blocks.find((b) => b.id === a.blockId);
            return (
              <div key={a.id} className="rejection-feedback">
                <div
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {block?.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Rejected by {a.reviewerName || "Manager"} ·{" "}
                  {relativeTime(a.reviewedAt)}
                </div>
                <div style={{ fontSize: 13 }}>{a.comment}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 6,
                  }}
                >
                  Block returned to In Progress.
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        title="Advance stage?"
        message={
          confirm
            ? `${confirm.status === "Review" ? "Submit" : "Advance"} ${confirm.name} from ${confirm.status}?`
            : ""
        }
        onConfirm={() => doAdvance(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
