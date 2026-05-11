import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../../../shared/components/PageWrapper.jsx";
import EffortTable from "../components/EffortTable.jsx";
import EffortOverrideModal from "../components/EffortOverrideModal.jsx";
import EffortLogModal from "../components/EffortLogModal.jsx";
import TotalEffortSummary from "../components/TotalEffortSummary.jsx";
import { getEffortEstimates } from "../../../services/effort.service.js";
import { getBlocks } from "../../../services/blocks.service.js";
import useAuth from "../../../shared/hooks/useAuth.js";
import { canAccess } from "../../../shared/utils/roleGuard.js";
import { subscribeToDataChanges } from "../../../services/api.js";
import { ROLES } from "../../../shared/constants/roles.js";

export default function EffortPage() {
  const { role, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [overrideRow, setOverrideRow] = useState(null);
  const [logRow, setLogRow] = useState(null);

  async function refresh() {
    setRows(await getEffortEstimates());
    setBlocks(await getBlocks());
  }
  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToDataChanges(() => {
      refresh();
    });
    return unsubscribe;
  }, []);

  const rowsWithPrediction = useMemo(() => {
    const blockById = new Map(blocks.map((block) => [block.id, block]));
    const completedWithSignal = blocks.filter(
      (block) =>
        block.status === "Completed" &&
        Number(block.estimatedHours) > 0 &&
        Number(block.actualHours) > 0,
    );

    const ratioBySignature = new Map();
    completedWithSignal.forEach((block) => {
      const signature = `${block.type || "Unknown"}|${block.techNode || "Unknown"}|${block.complexity || "Unknown"}`;
      const ratio = Number(block.actualHours) / Number(block.estimatedHours);
      const existing = ratioBySignature.get(signature) || {
        total: 0,
        count: 0,
      };
      ratioBySignature.set(signature, {
        total: existing.total + ratio,
        count: existing.count + 1,
      });
    });

    return rows.map((row) => {
      const block = blockById.get(row.id) || {};
      const signature = `${block.type || "Unknown"}|${block.techNode || "Unknown"}|${row.complexity || block.complexity || "Unknown"}`;
      const stats = ratioBySignature.get(signature);
      if (!stats || stats.count === 0) {
        return {
          ...row,
          predictedHours: row.estimatedHours,
          predictionHint: "No similar historical data yet.",
        };
      }

      const avgRatio = stats.total / stats.count;
      const predictedHours = Math.max(
        1,
        Math.round(Number(row.estimatedHours || 0) * avgRatio),
      );
      const deltaPct = Math.round((avgRatio - 1) * 100);

      let predictionHint =
        "Based on past data, this is likely close to estimate.";
      if (deltaPct > 0) {
        predictionHint = `Based on past data, this will likely take ${deltaPct}% longer than estimated.`;
      } else if (deltaPct < 0) {
        predictionHint = `Based on past data, this may finish ${Math.abs(deltaPct)}% faster than estimated.`;
      }

      return {
        ...row,
        predictedHours,
        predictionHint,
      };
    });
  }, [blocks, rows]);

  function canLogHours(row) {
    if (!row?.assignedEngineerId) return false;
    if (role === ROLES.ADMIN || role === ROLES.MANAGER) return true;
    if (role === ROLES.ENGINEER) return row.assignedEngineerId === user?.id;
    return false;
  }

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Effort Estimation</h1>
      </div>
      <TotalEffortSummary rows={rowsWithPrediction} blocks={blocks} />
      <div className="card" style={{ padding: 0, marginTop: 16 }}>
        <EffortTable
          rows={rowsWithPrediction}
          canOverride={canAccess(role, "override:effort")}
          onOverride={(r) => setOverrideRow(r)}
          canLogHours={canLogHours}
          onLogHours={(r) => setLogRow(r)}
        />
      </div>
      <EffortLogModal
        row={logRow}
        onClose={() => setLogRow(null)}
        onSaved={() => {
          setLogRow(null);
          refresh();
        }}
      />
      <EffortOverrideModal
        row={overrideRow}
        onClose={() => setOverrideRow(null)}
        onSaved={() => {
          setOverrideRow(null);
          refresh();
        }}
      />
    </PageWrapper>
  );
}
