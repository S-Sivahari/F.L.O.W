import { useMemo, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MarkerType, Handle, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const STAGE_META = {
  'Not Started': { color: '#64748b', soft: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8', short: 'IDLE' },
  'In Progress': { color: '#3b82f6', soft: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.4)',  text: '#93c5fd', short: 'WIP' },
  'DRC':         { color: '#8b5cf6', soft: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.4)',  text: '#c4b5fd', short: 'DRC' },
  'LVS':         { color: '#06b6d4', soft: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.4)',   text: '#67e8f9', short: 'LVS' },
  'Review':      { color: '#f59e0b', soft: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.4)',  text: '#fcd34d', short: 'REVIEW' },
  'Completed':   { color: '#10b981', soft: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.4)',  text: '#6ee7b7', short: 'DONE' },
};

const STAGE_PROGRESS = {
  'Not Started': 0,
  'In Progress': 40,
  'DRC': 60,
  'LVS': 75,
  'Review': 90,
  'Completed': 100,
};

function computeLayout(blocks) {
  const idSet = new Set(blocks.map((b) => b.id));
  const indeg = new Map(blocks.map((b) => [
    b.id,
    (b.dependsOn || []).filter((d) => idSet.has(d)).length,
  ]));

  const layer = new Map();
  const queue = blocks.filter((b) => indeg.get(b.id) === 0).map((b) => b.id);
  queue.forEach((id) => layer.set(id, 0));

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const curLayer = layer.get(cur);
    blocks.forEach((b) => {
      if ((b.dependsOn || []).includes(cur)) {
        const next = Math.max(layer.get(b.id) ?? 0, curLayer + 1);
        layer.set(b.id, next);
        const nd = (indeg.get(b.id) || 1) - 1;
        indeg.set(b.id, nd);
        if (nd === 0) queue.push(b.id);
      }
    });
  }
  blocks.forEach((b) => { if (!layer.has(b.id)) layer.set(b.id, 0); });

  const cols = new Map();
  blocks.forEach((b) => {
    const l = layer.get(b.id);
    if (!cols.has(l)) cols.set(l, []);
    cols.get(l).push(b);
  });

  const positions = new Map();
  const COL_W = 280, ROW_H = 130;
  cols.forEach((items, col) => {
    const totalH = items.length * ROW_H;
    items.forEach((b, i) => {
      positions.set(b.id, {
        x: col * COL_W + 40,
        y: i * ROW_H - totalH / 2 + 350,
      });
    });
  });

  return positions;
}

function computeCriticalPath(blocks) {
  const idMap = new Map(blocks.map((b) => [b.id, b]));
  const memo = new Map();

  function weight(b) {
    return Math.max(1, 100 - (STAGE_PROGRESS[b.status] ?? 0));
  }

  function dfs(id) {
    if (memo.has(id)) return memo.get(id);
    const b = idMap.get(id);
    const downstreams = blocks.filter((x) => (x.dependsOn || []).includes(id));
    if (downstreams.length === 0) {
      const r = { len: weight(b), next: null };
      memo.set(id, r);
      return r;
    }
    let best = { len: 0, next: null };
    downstreams.forEach((d) => {
      const sub = dfs(d.id);
      if (sub.len > best.len) best = { len: sub.len, next: d.id };
    });
    const r = { len: weight(b) + best.len, next: best.next };
    memo.set(id, r);
    return r;
  }

  let bestStart = null, bestLen = -1;
  blocks.forEach((b) => {
    if ((b.dependsOn || []).length === 0) {
      const r = dfs(b.id);
      if (r.len > bestLen) { bestLen = r.len; bestStart = b.id; }
    }
  });
  if (!bestStart) return new Set();

  const path = new Set();
  let cur = bestStart;
  while (cur) { path.add(cur); cur = memo.get(cur)?.next; }
  return path;
}

function BlockNode({ data }) {
  const { block, critical } = data;
  const meta = STAGE_META[block.status] || STAGE_META['Not Started'];

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.88))',
      border: critical ? `1.5px solid rgba(245,158,11,0.8)` : `1px solid ${meta.border}`,
      borderRadius: 12,
      minWidth: 220,
      maxWidth: 240,
      padding: '10px 14px',
      cursor: 'pointer',
      boxShadow: critical
        ? '0 0 0 3px rgba(245,158,11,0.15), 0 18px 40px -16px rgba(0,0,0,0.7)'
        : `0 0 22px ${meta.color}22, 0 18px 40px -16px rgba(0,0,0,0.6)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 10,
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {block.id.toUpperCase()}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 9, textTransform: 'uppercase',
          letterSpacing: '0.05em', fontWeight: 600,
          padding: '2px 7px', borderRadius: 20,
          color: meta.text, background: meta.soft,
          border: `1px solid ${meta.border}`,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
          {meta.short}
        </span>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>
        {block.name}
      </div>

      <div style={{ marginTop: 8, height: 3, width: '100%', borderRadius: 4, background: 'rgba(30,41,59,0.8)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${STAGE_PROGRESS[block.status] ?? 0}%`,
          background: meta.color, borderRadius: 4,
          boxShadow: `0 0 6px ${meta.color}`,
        }} />
      </div>

      {critical && (
        <div style={{
          marginTop: 6, fontSize: 9, textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 600, color: '#fbbf24',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          ◇ Critical path
        </div>
      )}

      <Handle type="target" position={Position.Left}
        style={{ background: '#0f172a', borderColor: 'rgba(148,163,184,0.4)', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: '#0f172a', borderColor: 'rgba(148,163,184,0.4)', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { block: BlockNode };

export default function DependencyGraph({ blocks = [], onNodeClick = () => {} }) {
  const { nodes, edges } = useMemo(() => {
    if (blocks.length === 0) return { nodes: [], edges: [] };

    const positions = computeLayout(blocks);
    const criticalSet = computeCriticalPath(blocks);

    const nodes = blocks.map((b) => ({
      id: b.id,
      type: 'block',
      position: positions.get(b.id) || { x: 0, y: 0 },
      data: { block: b, critical: criticalSet.has(b.id) },
      sourcePosition: 'right',
      targetPosition: 'left',
    }));

    const edges = [];
    blocks.forEach((b) => {
      (b.dependsOn || []).forEach((depId) => {
        const isCritical = criticalSet.has(depId) && criticalSet.has(b.id);
        edges.push({
          id: `${depId}->${b.id}`,
          source: depId,
          target: b.id,
          type: 'smoothstep',
          animated: isCritical,
          style: {
            stroke: isCritical ? '#f59e0b' : 'rgba(148,163,184,0.35)',
            strokeWidth: isCritical ? 2 : 1.5,
            filter: isCritical ? 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' : 'none',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCritical ? '#f59e0b' : 'rgba(148,163,184,0.55)',
            width: 16, height: 16,
          },
        });
      });
    });

    return { nodes, edges };
  }, [blocks]);

  const handleNodeClick = useCallback((_, node) => {
    onNodeClick(node.data.block);
  }, [onNodeClick]);

  if (blocks.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        No blocks available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0f172a', borderRadius: 16, overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(148,163,184,0.12)" gap={28} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}