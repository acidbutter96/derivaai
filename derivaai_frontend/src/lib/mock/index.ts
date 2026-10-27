// Mocked API. Each function mirrors one endpoint of API v2 (docs/design-v2.md) and is async,
// so replacing the body with a fetch keeps every call site as it is.

import { nodeCatalog } from "./catalog";
import { lessons, pipelines, renders } from "./data";
import type { Lesson, NodeTypeDef, Pipeline, Render } from "./types";

export * from "./types";
export { categoryLabels } from "./catalog";

/** GET /nodes */
export async function listNodeTypes(): Promise<NodeTypeDef[]> {
  return nodeCatalog;
}

/** Sync lookup for client components that already hold the catalog. */
export function findNodeType(key: string): NodeTypeDef | undefined {
  return nodeCatalog.find((def) => def.key === key);
}

/** GET /pipelines */
export async function listPipelines(): Promise<Pipeline[]> {
  return pipelines;
}

/** GET /pipelines/{id} */
export async function getPipeline(id: string): Promise<Pipeline | undefined> {
  return pipelines.find((pipeline) => pipeline.id === id);
}

/** GET /renders (newest first) */
export async function listRenders(filter?: { pipelineId?: string }): Promise<Render[]> {
  return filter?.pipelineId ? renders.filter((render) => render.pipelineId === filter.pipelineId) : renders;
}

/** GET /renders/{id} */
export async function getRender(id: string): Promise<Render | undefined> {
  return renders.find((render) => render.id === id);
}

/** GET /lessons */
export async function listLessons(): Promise<Lesson[]> {
  return lessons;
}

/** GET /lessons/{slug} */
export async function getLesson(slug: string): Promise<Lesson | undefined> {
  return lessons.find((lesson) => lesson.slug === slug);
}

// ---------- Derived values (computed by the API in the real app) ----------

export interface RenderCounts {
  done: number;
  total: number;
  cached: number;
  /** Node id of the first failed run, if any. */
  failedNode?: string;
}

export function renderCounts(render: Render): RenderCounts {
  const finished = new Set(["succeeded", "cached"]);
  return {
    done: render.nodeRuns.filter((run) => finished.has(run.status)).length,
    total: render.nodeRuns.length,
    cached: render.nodeRuns.filter((run) => run.status === "cached").length,
    failedNode: render.nodeRuns.find((run) => run.status === "failed")?.nodeId,
  };
}

/** `0:41`, `1:05` */
export function formatClock(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** `0.1 s`, `8.2 s`, `1:05` */
export function formatDuration(seconds: number) {
  return seconds < 60 ? `${seconds.toFixed(1)} s` : formatClock(seconds);
}

/** Navigation counts and "Recentes" for the sidebar. */
export async function getSidebarData() {
  const active = renders.filter((render) => render.status === "running").length;
  return {
    counts: {
      lessons: lessons.length,
      pipelines: pipelines.length,
      renders: active > 0 ? `${active} ativo` : renders.length,
    },
    recents: [
      { label: "Carga do circuito RC", href: "/pipelines/carga-rc", status: "running" as const },
      { label: "Descarga RL", href: "/lessons/descarga-circuito-rl", status: "pending" as const },
      { label: "Lei de Ohm (EN)", href: "/lessons/ohms-law", status: "succeeded" as const },
    ],
  };
}
