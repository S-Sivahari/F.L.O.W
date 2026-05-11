import { Edit2 } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable.jsx';
import { getFactor } from '../../../shared/utils/complexity.js';

export default function EffortTable({ rows, canOverride, onOverride }) {
  const columns = [
    { key: 'name', label: 'Block', render: (r) => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{r.name}</span> },
    { key: 'complexity', label: 'Complexity', render: (r) => <span className={`complexity-badge complexity-${r.complexity}`}>{r.complexity}</span> },
    { key: 'baseHours', label: 'Base', render: (r) => `${r.baseHours}h` },
    { key: 'factor', label: 'Factor', render: (r) => `×${getFactor(r.complexity)}` },
    { key: 'estimatedHours', label: 'Est.', render: (r) => `${r.estimatedHours}h` },
    { key: 'actualHours', label: 'Actual', render: (r) => `${r.actualHours}h` },
    { key: 'variance', label: 'Variance', render: (r) => {
        const v = r.actualHours - r.estimatedHours;
        if (r.actualHours === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        return <span className={v > 0 ? 'variance-neg' : 'variance-pos'}>{v > 0 ? '+' : ''}{v}h</span>;
    }},
    ...(canOverride ? [{ key: 'override', label: 'Override', sortable: false, render: (r) => (
      <button className="btn btn-ghost" onClick={() => onOverride(r)}><Edit2 size={14} /></button>
    )}] : []),
  ];
  return <DataTable columns={columns} data={rows} />;
}
