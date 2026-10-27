// Graph helpers for the editor: handle geometry, ordering and the client-side validation
// (`POST /pipelines/validate` does the real one).

import { findNodeType, type ConfigValue, type Graph, type GraphEdge, type NodeTypeDef } from "@/lib/mock";

export const NODE_W = 248;
// First port row sits ≈ 69 px below the node top (stripe + head + key line); each row is 24 px.
const PORT_Y0 = 69;
const PORT_ROW = 24;

export function inputHandle(graph: Graph, nodeId: string, port: string) {
  const node = graph.nodes.find((n) => n.id === nodeId);
  const def = node ? findNodeType(node.type) : undefined;
  const row = Math.max(0, def?.inputs.findIndex((p) => p.name === port) ?? 0);
  const pos = graph.ui[nodeId] ?? { x: 0, y: 0 };
  return { x: pos.x, y: pos.y + PORT_Y0 + row * PORT_ROW };
}

export function outputHandle(graph: Graph, nodeId: string, port: string) {
  const node = graph.nodes.find((n) => n.id === nodeId);
  const def = node ? findNodeType(node.type) : undefined;
  const row = Math.max(0, def?.outputs.findIndex((p) => p.name === port) ?? 0);
  const pos = graph.ui[nodeId] ?? { x: 0, y: 0 };
  return { x: pos.x + NODE_W, y: pos.y + PORT_Y0 + row * PORT_ROW };
}

export function edgeType(graph: Graph, edge: GraphEdge) {
  const node = graph.nodes.find((n) => n.id === edge.from.node);
  return findNodeType(node?.type ?? "")?.outputs.find((p) => p.name === edge.from.port)?.type ?? "text";
}

/** Kahn's algorithm; nodes in a cycle are appended at the end. */
export function topoOrder(graph: Graph): string[] {
  const indegree = new Map(graph.nodes.map((n) => [n.id, 0]));
  for (const edge of graph.edges) indegree.set(edge.to.node, (indegree.get(edge.to.node) ?? 0) + 1);
  const queue = graph.nodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const edge of graph.edges.filter((e) => e.from.node === id)) {
      const left = (indegree.get(edge.to.node) ?? 1) - 1;
      indegree.set(edge.to.node, left);
      if (left === 0) queue.push(edge.to.node);
    }
  }
  return [...order, ...graph.nodes.map((n) => n.id).filter((id) => !order.includes(id))];
}

/** The given nodes plus everything downstream of them (what a render has to recompute). */
export function downstream(graph: Graph, ids: Iterable<string>): Set<string> {
  const out = new Set(ids);
  const stack = [...out];
  while (stack.length > 0) {
    const id = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge.from.node === id && !out.has(edge.to.node)) {
        out.add(edge.to.node);
        stack.push(edge.to.node);
      }
    }
  }
  return out;
}

export interface ValidationIssue {
  nodeId: string;
  message: string;
}

/** Every input port needs exactly one edge (no implicit merge in graph spec v2). */
export function validate(graph: Graph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const node of graph.nodes) {
    const def = findNodeType(node.type);
    if (!def) {
      issues.push({ nodeId: node.id, message: `tipo desconhecido ${node.type}` });
      continue;
    }
    for (const port of def.inputs) {
      if (port.optional) continue;
      if (!graph.edges.some((e) => e.to.node === node.id && e.to.port === port.name)) {
        issues.push({ nodeId: node.id, message: `entrada ${port.name} (${port.type}) sem conexão` });
      }
    }
  }
  return issues;
}

export function defaultConfig(def: NodeTypeDef): Record<string, ConfigValue> {
  return Object.fromEntries(
    def.config.map((field) => {
      switch (field.kind) {
        case "number":
          return [field.name, 1];
        case "slider":
          return [field.name, 1];
        case "select":
          return [field.name, field.options[0]?.value ?? ""];
        default:
          return [field.name, ""];
      }
    }),
  );
}
