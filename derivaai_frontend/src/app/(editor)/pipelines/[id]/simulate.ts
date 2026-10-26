// Client-side stand-in for the worker + SSE stream: one call = one `advance(render_id)` step
// (docs/design-v2.md, Execution model). Replaced by GET /renders/{id}/events later.

import { findNodeType, type Graph, type NodeRun, type Render } from "@/lib/mock";
import { topoOrder } from "./graph";

/** Fake seconds that pass per tick. */
const TICK_S = 2;

function stamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

function fakeOutputs(graph: Graph, nodeId: string): NodeRun["outputs"] {
  const node = graph.nodes.find((n) => n.id === nodeId);
  const def = findNodeType(node?.type ?? "");
  return def?.outputs.map((port) => {
    switch (port.type) {
      case "audio":
        return { port: port.name, kind: "audio", mime: "audio/wav", size: "1.5 MB", length: "0:48", sha256: "a3e1…77c0" };
      case "video":
        return { port: port.name, kind: "video", mime: "video/mp4", size: "24 MB", length: "1:52", sha256: "e9b2…1d04" };
      case "image":
        return { port: port.name, kind: "image", mime: "image/png", size: "84 KB", sha256: "5b1e…c2d0" };
      case "expr":
        return { port: port.name, kind: "expr", value: "V(t)=V_0\\left(1-e^{-t/RC}\\right)" };
      default:
        return { port: port.name, kind: "text", value: "ok" };
    }
  });
}

/**
 * Advances a running render by one tick: finishes or progresses running nodes, then schedules
 * every pending node whose upstream runs are done (from cache when `cacheable` has it).
 */
export function advance(render: Render, graph: Graph, cacheable: ReadonlySet<string>): Render {
  if (render.status !== "running") return render;

  const elapsed = render.elapsed + TICK_S;
  const events = [...render.events];
  const runs = new Map(render.nodeRuns.map((run) => [run.nodeId, { ...run }]));
  const keyOf = (id: string) => graph.nodes.find((n) => n.id === id)?.type ?? id;

  for (const run of runs.values()) {
    if (run.status !== "running") continue;
    const queue = findNodeType(keyOf(run.nodeId))?.queue;
    run.progress = Math.min(1, (run.progress ?? 0) + (queue === "media" ? 0.14 : 0.4));
    if (run.progress >= 1) {
      run.status = "succeeded";
      run.duration = elapsed - (run.start ?? 0);
      run.progress = undefined;
      run.outputs = run.outputs ?? fakeOutputs(graph, run.nodeId);
      events.push({ time: stamp(elapsed), text: `ok ${keyOf(run.nodeId)}` });
    }
  }

  const done = (id: string) => ["succeeded", "cached"].includes(runs.get(id)?.status ?? "succeeded");
  for (const id of topoOrder(graph)) {
    const run = runs.get(id);
    if (!run || run.status !== "pending") continue;
    const upstream = graph.edges.filter((e) => e.to.node === id).map((e) => e.from.node);
    if (!upstream.every(done)) continue;
    if (cacheable.has(id)) {
      Object.assign(run, { status: "cached", start: elapsed, duration: 0.2, outputs: run.outputs ?? fakeOutputs(graph, id) });
      events.push({ time: stamp(elapsed), text: `cache ${keyOf(id)}` });
    } else {
      const queue = findNodeType(keyOf(id))?.queue ?? "cpu";
      Object.assign(run, { status: "running", start: elapsed, progress: 0 });
      events.push({ time: stamp(elapsed), text: `${keyOf(id)} iniciado (fila ${queue})` });
    }
  }

  const nodeRuns = render.nodeRuns.map((run) => runs.get(run.nodeId)!);
  const finished = nodeRuns.every((run) => run.status === "succeeded" || run.status === "cached");
  if (finished) events.push({ time: stamp(elapsed), text: "render concluído" });

  return {
    ...render,
    elapsed,
    nodeRuns,
    events,
    status: finished ? "succeeded" : "running",
    finalVideo: finished ? { length: "1:52", size: "24 MB" } : render.finalVideo,
  };
}

/** Marks pending and running nodes as canceled (`POST /renders/{id}/cancel`). */
export function cancel(render: Render): Render {
  return {
    ...render,
    status: "canceled",
    nodeRuns: render.nodeRuns.map((run) =>
      run.status === "pending" || run.status === "running" ? { ...run, status: "canceled", progress: undefined } : run,
    ),
    events: [...render.events, { time: stamp(render.elapsed), text: "render cancelado" }],
  };
}
