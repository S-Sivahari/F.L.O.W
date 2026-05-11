import { useEffect, useState } from 'react';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';
import EffortTable from '../components/EffortTable.jsx';
import EffortOverrideModal from '../components/EffortOverrideModal.jsx';
import TotalEffortSummary from '../components/TotalEffortSummary.jsx';
import { getEffortEstimates } from '../../../services/effort.service.js';
import { getBlocks } from '../../../services/blocks.service.js';
import useAuth from '../../../shared/hooks/useAuth.js';
import { canAccess } from '../../../shared/utils/roleGuard.js';

export default function EffortPage() {
  const { role } = useAuth();
  const [rows, setRows] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [overrideRow, setOverrideRow] = useState(null);

  async function refresh() {
    setRows(await getEffortEstimates());
    setBlocks(await getBlocks());
  }
  useEffect(() => { refresh(); }, []);

  return (
    <PageWrapper>
      <div className="page-header"><h1>Effort Estimation</h1></div>
      <TotalEffortSummary rows={rows} blocks={blocks} />
      <div className="card" style={{ padding: 0, marginTop: 16 }}>
        <EffortTable rows={rows} canOverride={canAccess(role, 'override:effort')} onOverride={(r) => setOverrideRow(r)} />
      </div>
      <EffortOverrideModal row={overrideRow} onClose={() => setOverrideRow(null)} onSaved={() => { setOverrideRow(null); refresh(); }} />
    </PageWrapper>
  );
}
