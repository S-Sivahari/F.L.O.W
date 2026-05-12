import { useMemo, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MarkerType, Handle, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const STAGE_META = {
  'Not Started': { color: '#64748b', soft: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.3)', text: '#475569', short: 'IDLE' },
  'In Progress': { color: '#3b82f6', soft: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  text: '#2563eb', short: 'WIP' },
  'DRC':         { color: '#8b5cf6', soft: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.3)',  text: '#7c3aed', short: 'DRC' },
  'LVS':         { color: '#06b6d4', soft: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.3)',   text: '#0891b2', short: 'LVS' },
  'Review':      { color: '#f59e0b', soft: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  text: '#d97706', short: 'REVIEW' },
  'Completed':   { color: '#10b981', soft: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)',  text: '#059669', short: 'DONE' },
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
  const COL_W = 350; // Horizontal spacing between columns
  const ROW_H = 120; // Vertical spacing between rows
  
  cols.forEach((items, col) => {
    items.forEach((b, i) => {
      positions.set(b.id, {
        x: col * COL_W, // Left to right based on dependency layer
        y: i * ROW_H,   // Vertical spread within same layer
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
      background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
      border: critical ? `2px solid #f59e0b` : `1.5px solid ${meta.border}`,
      borderRadius: 12,
      minWidth: 240,
      maxWidth: 260,
      padding: '12px 16px',
      cursor: 'pointer',
      boxShadow: critical
        ? '0 0 0 3px rgba(245,158,11,0.15), 0 4px 12px rgba(0,0,0,0.1)'
        : `0 2px 8px rgba(0,0,0,0.08)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 10,
          padding: '2px 6px', borderRadius: 4,
          background: '#f1f5f9', color: '#64748b',
          border: '1px solid #e2e8f0',
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

      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
        {block.name}
      </div>

      <div style={{ marginTop: 8, height: 3, width: '100%', borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${STAGE_PROGRESS[block.status] ?? 0}%`,
          background: meta.color, borderRadius: 4,
          boxShadow: `0 0 4px ${meta.color}`,
        }} />
      </div>

      {critical && (
        <div style={{
          marginTop: 6, fontSize: 9, textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 600, color: '#d97706',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          ◇ Critical path
        </div>
      )}

      <Handle type="target" position={Position.Left}
        style={{ background: '#ffffff', borderColor: '#94a3b8', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: '#ffffff', borderColor: '#94a3b8', width: 8, height: 8 }} />
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
            stroke: isCritical ? '#f59e0b' : 'rgba(100,116,139,0.4)',
            strokeWidth: isCritical ? 2.5 : 2,
            filter: isCritical ? 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' : 'none',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCritical ? '#f59e0b' : 'rgba(100,116,139,0.6)',
            width: 18, height: 18,
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
    <div style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ 
          padding: 0.2,
          minZoom: 0.6,
          maxZoom: 1.0,
        }}
        defaultViewport={{ x: 100, y: 100, zoom: 0.8 }}
        minZoom={0.4}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(100,116,139,0.08)" gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}