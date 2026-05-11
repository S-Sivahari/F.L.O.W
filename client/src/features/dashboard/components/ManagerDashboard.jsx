import { useEffect, useState } from "react";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import StatCard from "./StatCard.jsx";
import BlocksByStageChart from "./BlocksByStageChart.jsx";
import EffortSummaryChart from "./EffortSummaryChart.jsx";
import PendingApprovalsList from "./PendingApprovalsList.jsx";
import DependencyGraph from "../../workflow/components/DependencyGraph.jsx";
import NodeDetailsDrawer from "../../workflow/components/NodeDetailsDrawer.jsx";
import DependencyModal from "../../workflow/components/DependencyModal.jsx";
import { getBlocks } from "../../../services/blocks.service.js";
import { getApprovals } from "../../../services/approvals.service.js";
import { enableEngineerAccess } from "../../../services/users.service.js";
import useAuth from "../../../shared/hooks/useAuth.js";
import useToast from "../../../shared/hooks/useToast.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { subscribeToDataChanges } from "../../../services/api.js";

export default function ManagerDashboard() {
  const { role } = useAuth();
  const toast = useToast();
  const [blocks, setBlocks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [managingBlockId, setManagingBlockId] = useState(null);
  const [engineerEmail, setEngineerEmail] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [savingEngineer, setSavingEngineer] = useState(false);

  const loadBlocks = async () => {
    const data = await getBlocks();
    setBlocks(data);
    const ap = await getApprovals();
    setPendingCount(ap.filter((a) => a.status === "Pending").length);
  };

  useEffect(() => {
    loadBlocks();
    const unsubscribe = subscribeToDataChanges(() => {
      loadBlocks();
    });
    return unsubscribe;
  }, []);

  const handleNodeClick = (nodeData) => {
    setSelectedNodeId(nodeData.id);
    setShowDetailsDrawer(true);
  };

  const handleManageDependencies = (blockId) => {
    setManagingBlockId(blockId);
    setShowDependencyModal(true);
  };

  const handleDependencyModalClose = () => {
    setShowDependencyModal(false);
    setManagingBlockId(null);
  };

  const handleDependencySuccess = async () => {
    await loadBlocks();
    setShowDependencyModal(false);
  };

  const completed = blocks.filter((b) => b.status === "Completed").length;
  const totalEst = blocks.reduce((s, b) => s + (b.estimatedHours || 0), 0);
  const isAdmin = role === ROLES.ADMIN;

  async function handleEnableEngineer(event) {
    event.preventDefault();
    const email = engineerEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Engineer email is required");
      return;
    }
    try {
      setSavingEngineer(true);
      const response = await enableEngineerAccess({
        email,
        name: engineerName.trim(),
      });
      toast.success(
        response.action === "created"
          ? "Engineer added and Google auth enabled"
          : "Engineer access enabled for Google auth",
      );
      setEngineerEmail("");
      setEngineerName("");
    } catch (error) {
      toast.error(error.message || "Unable to enable engineer access");
    } finally {
      setSavingEngineer(false);
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
          paddingBottom: "0",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "12px 16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color:
              activeTab === "overview"
                ? "var(--accent-primary)"
                : "var(--text-secondary)",
            borderBottom:
              activeTab === "overview"
                ? "2px solid var(--accent-primary)"
                : "none",
            transition: "var(--transition)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Layers size={14} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("dependencies")}
          style={{
            padding: "12px 16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            color:
              activeTab === "dependencies"
                ? "var(--accent-primary)"
                : "var(--text-secondary)",
            borderBottom:
              activeTab === "dependencies"
                ? "2px solid var(--accent-primary)"
                : "none",
            transition: "var(--transition)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <GitBranch size={14} />
          Dependency Graph
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div>
          <div className="page-header" style={{ marginBottom: "24px" }}>
            <h1>Overview</h1>
          </div>

          <div className="stat-grid">
            <StatCard
              label="Total Blocks"
              value={blocks.length}
              icon={<Layers size={12} />}
            />
            <StatCard
              label="Completed Blocks"
              value={completed}
              icon={<CheckCircle2 size={12} />}
              delta={`${blocks.length ? Math.round((completed / blocks.length) * 100) : 0}% complete`}
            />
            <StatCard
              label="Pending Approvals"
              value={pendingCount}
              icon={<AlertTriangle size={12} />}
              pulse={pendingCount > 0}
            />
            <StatCard
              label="Total Estimated Hours"
              value={`${totalEst}h`}
              icon={<Clock size={12} />}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <BlocksByStageChart blocks={blocks} />
            <EffortSummaryChart blocks={blocks} />
          </div>

          <PendingApprovalsList />

          {isAdmin && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12 }}>
                Engineer Google Access
              </h3>
              <p
                style={{
                  margin: 0,
                  marginBottom: 12,
                  color: "var(--text-secondary)",
                  fontSize: 12,
                }}
              >
                Add an engineer email to allow Google sign-in for Engineer
                dashboard access.
              </p>
              <form
                onSubmit={handleEnableEngineer}
                style={{ display: "grid", gap: 10 }}
              >
                <div className="form-row">
                  <label>Engineer Email</label>
                  <input
                    type="email"
                    value={engineerEmail}
                    onChange={(event) => setEngineerEmail(event.target.value)}
                    placeholder="engineer@company.com"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Engineer Name (optional)</label>
                  <input
                    value={engineerName}
                    onChange={(event) => setEngineerName(event.target.value)}
                    placeholder="Engineer name"
                  />
                </div>
                <div>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={savingEngineer}
                  >
                    {savingEngineer
                      ? "Saving..."
                      : "Enable Engineer Google Access"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === "dependencies" && (
        <div>
          <div className="page-header" style={{ marginBottom: "24px" }}>
            <h1>Dependency Graph</h1>
          </div>

          <div style={{ height: "calc(100vh - 280px)" }}>
            {blocks.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--text-secondary)",
                }}
              >
                No blocks available
              </div>
            ) : (
              <DependencyGraph blocks={blocks} onNodeClick={handleNodeClick} />
            )}
          </div>
        </div>
      )}

      {/* Node Details Drawer */}
      <NodeDetailsDrawer
        isOpen={showDetailsDrawer}
        nodeId={selectedNodeId}
        blocks={blocks}
        onClose={() => setShowDetailsDrawer(false)}
        onManageDependencies={handleManageDependencies}
      />

      {/* Dependency Modal */}
      <DependencyModal
        isOpen={showDependencyModal}
        blockId={managingBlockId}
        blocks={blocks}
        onClose={handleDependencyModalClose}
        onSuccess={handleDependencySuccess}
      />
    </div>
  );
}
