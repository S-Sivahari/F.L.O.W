import { Edit2, Clock } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable.jsx';
import { getFactor } from '../../../shared/utils/complexity.js';

export default function EffortTable({ rows, canOverride, onOverride, canLogHours, onLogHours }) {
  const columns = [
    { key: 'name', label: 'Block', render: (r) => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{r.name}</span> },
    { key: 'complexity', label: 'Complexity', render: (r) => <span className={`complexity-badge complexity-${r.complexity}`}>{r.complexity}</span> },
    { key: 'baseHours', label: 'Base', render: (r) => `${r.baseHours}h` },
    { key: 'factor', label: 'Factor', render: (r) => `×${getFactor(r.complexity)}` },
    { key: 'estimatedHours', label: 'Est.', render: (r) => `${r.estimatedHours}h` },
    { key: 'predictedHours', label: 'Smart Est.', render: (r) => `${r.predictedHours ?? r.estimatedHours}h` },
    { key: 'actualHours', label: 'Actual', render: (r) => `${r.actualHours}h` },
    { key: 'variance', label: 'Variance', render: (r) => {
        const v = r.actualHours - r.estimatedHours;
        if (r.actualHours === 0) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        return <span className={v > 0 ? 'variance-neg' : 'variance-pos'}>{v > 0 ? '+' : ''}{v}h</span>;
    }},
    ...(typeof canLogHours === 'function' && typeof onLogHours === 'function'
      ? [{
          key: 'log',
          label: 'Log',
          sortable: false,
          render: (r) => (
            canLogHours(r) ? (
              <button className="btn btn-ghost" type="button" title="Log actual hours" onClick={() => onLogHours(r)}>
                <Clock size={14} />
              </button>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
            )
          ),
        }]
      : []),
    ...(canOverride ? [{ key: 'override', label: 'Override', sortable: false, render: (r) => (
      <button className="btn btn-ghost" onClick={() => onOverride(r)}><Edit2 size={14} /></button>
    )}] : []),
    { key: 'predictionHint', label: 'Prediction Insight', sortable: false, render: (r) => (
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.predictionHint || '—'}</span>
    )},
  ];
  return <DataTable columns={columns} data={rows} />;
}
