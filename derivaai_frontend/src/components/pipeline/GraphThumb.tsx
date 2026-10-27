import { findNodeType, type Graph, type NodeRun } from "@/lib/mock";
import { bezierPath } from "./Canvas";

// Canvas coordinates drawn at half scale: a 248 px node becomes 124 units wide.
const SCALE = 0.5;
const NODE_W = 248 * SCALE;
const NODE_H = 56;
const PAD = 16;

/** Miniature of a graph: one rect per node (category-colored top edge) and its edges. */
export function GraphThumb({ graph, runs = [] }: { graph: Graph; runs?: NodeRun[] }) {
  if (graph.nodes.length === 0) return null;

  const points = Object.values(graph.ui);
  const minX = Math.min(...points.map((p) => p.x)) * SCALE - PAD;
  const minY = Math.min(...points.map((p) => p.y)) * SCALE - PAD;
  const maxX = Math.max(...points.map((p) => p.x)) * SCALE + NODE_W + PAD;
  const maxY = Math.max(...points.map((p) => p.y)) * SCALE + NODE_H + PAD;
  const pos = (id: string) => ({ x: graph.ui[id].x * SCALE, y: graph.ui[id].y * SCALE });
  const status = new Map(runs.map((run) => [run.nodeId, run.status]));

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={`Grafo com ${graph.nodes.length} nós`}
    >
      {graph.edges.map((edge, index) => {
        const a = pos(edge.from.node);
        const b = pos(edge.to.node);
        const running = status.get(edge.to.node) === "running";
        return (
          <path
            key={index}
            d={bezierPath(a.x + NODE_W, a.y + NODE_H / 2, b.x, b.y + NODE_H / 2)}
            fill="none"
            stroke={running ? "var(--accent)" : "var(--border-strong)"}
            strokeDasharray={running ? "4 4" : undefined}
            strokeWidth={1.5}
          />
        );
      })}
      {graph.nodes.map((node) => {
        const p = pos(node.id);
        const category = findNodeType(node.type)?.category ?? "io";
        return (
          <g key={node.id}>
            <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={4} fill="var(--bg-panel)" stroke="var(--border-default)" />
            <rect x={p.x} y={p.y} width={NODE_W} height={3} rx={1.5} fill={`var(--cat-${category})`} />
          </g>
        );
      })}
    </svg>
  );
}
