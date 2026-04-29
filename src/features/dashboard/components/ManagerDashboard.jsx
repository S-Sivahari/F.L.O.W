import { useEffect, useState } from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard.jsx';
import BlocksByStageChart from './BlocksByStageChart.jsx';
import EffortSummaryChart from './EffortSummaryChart.jsx';
import PendingApprovalsList from './PendingApprovalsList.jsx';
import { getBlocks } from '../../../services/blocks.service.js';
import { getApprovals } from '../../../services/approvals.service.js';

export default function ManagerDashboard() {
  const [blocks, setBlocks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    (async () => {
      setBlocks(await getBlocks());
      const ap = await getApprovals();
      setPendingCount(ap.filter((a) => a.status === 'Pending').length);
    })();
  }, []);

  const completed = blocks.filter((b) => b.status === 'Completed').length;
  const totalEst = blocks.reduce((s, b) => s + (b.estimatedHours || 0), 0);

  return (
    <div>
      <div className="page-header"><h1>Overview</h1></div>

      <div className="stat-grid">
        <StatCard label="Total Blocks" value={blocks.length} icon={<Layers size={12} />} />
        <StatCard label="Completed Blocks" value={completed} icon={<CheckCircle2 size={12} />} delta={`${blocks.length ? Math.round((completed / blocks.length) * 100) : 0}% complete`} />
        <StatCard label="Pending Approvals" value={pendingCount} icon={<AlertTriangle size={12} />} pulse={pendingCount > 0} />
        <StatCard label="Total Estimated Hours" value={`${totalEst}h`} icon={<Clock size={12} />} />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <BlocksByStageChart blocks={blocks} />
        <EffortSummaryChart blocks={blocks} />
      </div>

      <PendingApprovalsList />
    </div>
  );
}
