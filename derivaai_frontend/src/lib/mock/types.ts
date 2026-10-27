// Shapes of the mocked API (docs/design-v2.md, API v2). Screens only read these types,
// so swapping lib/mock for real fetches keeps the components untouched.

import type { NodeCategory, PortType } from "@/lib/ports";
import type { LessonStatus, Locale, Status } from "@/lib/status";

export type Queue = "cpu" | "media";

export interface PortDef {
  name: string;
  type: PortType;
  /** Optional inputs may stay unconnected; required ones fail validation. */
  optional?: boolean;
}

/** One field of a node's `config_schema`; the inspector form is generated from these. */
export type ConfigField =
  | { name: string; label: string; kind: "text"; hint?: string }
  | { name: string; label: string; kind: "textarea"; hint?: string }
  | { name: string; label: string; kind: "number"; unit?: string; hint?: string }
  | { name: string; label: string; kind: "select"; options: Array<{ value: string; label: string }>; hint?: string }
  | { name: string; label: string; kind: "slider"; min: number; max: number; step: number; suffix?: string; hint?: string };

/** `GET /nodes`: catalog generated from the node classes in code. */
export interface NodeTypeDef {
  key: string;
  version: number;
  category: NodeCategory;
  queue: Queue;
  label: string;
  description: string;
  inputs: PortDef[];
  outputs: PortDef[];
  config: ConfigField[];
}

export type ConfigValue = string | number;

export interface GraphNode {
  id: string;
  type: string;
  version: number;
  /** User label shown on the node ("Rótulo" in the inspector). */
  title: string;
  config: Record<string, ConfigValue>;
}

export interface GraphEdge {
  from: { node: string; port: string };
  to: { node: string; port: string };
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Canvas positions; never part of execution or caching. */
  ui: Record<string, { x: number; y: number }>;
}

export interface PipelineVersion {
  number: number;
  graphHash: string;
  createdAgo: string;
  author: string;
  /** Nodes added, changed or removed compared to the previous version. */
  changes: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  headVersion: number;
  updatedAgo: string;
  versions: PipelineVersion[];
  /** Graph of the head version (the mock keeps only the head). */
  graph: Graph;
}

export type OutputKind = "image" | "audio" | "video" | "expr" | "params" | "text";

export interface NodeOutput {
  port: string;
  kind: OutputKind;
  mime?: string;
  size?: string;
  /** Media length, e.g. "0:48". */
  length?: string;
  sha256?: string;
  /** Short inline value for JSON outputs (formula, params). */
  value?: string;
}

export interface NodeRun {
  nodeId: string;
  status: Status;
  /** Seconds since render start; omitted while pending. */
  start?: number;
  duration?: number;
  /** 0–1 while running. */
  progress?: number;
  cacheKey?: string;
  error?: string;
  outputs?: NodeOutput[];
}

export interface RenderEvent {
  time: string;
  text: string;
}

export interface Render {
  id: string;
  pipelineId: string;
  version: number;
  language: Locale;
  status: Status;
  startedAgo: string;
  by: string;
  /** Seconds; elapsed so far while running. */
  elapsed: number;
  /** Rough time the cache saved, in seconds. */
  savedByCache: number;
  nodeRuns: NodeRun[];
  events: RenderEvent[];
  /** Why only part of the graph re-ran. */
  explanation?: string;
  finalVideo?: { length: string; size: string };
}

export type ScriptPart = string | { tex: string };

export type ScriptBlock = { kind: "p"; parts: ScriptPart[] } | { kind: "math"; tex: string };

export interface LessonParam {
  symbol: string;
  value: string;
}

export type CurveKind = "charge" | "decay" | "wave" | "line";

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  subject: string;
  language: Locale;
  pipelineId: string;
  status: LessonStatus;
  publishedRenderId?: string;
  /** Video length of the published render. */
  length?: string;
  publishedAgo?: string;
  /** Short reason shown on the card when the last render failed. */
  failure?: string;
  curve: CurveKind;
  params: LessonParam[];
  script: ScriptBlock[];
  /** Locales that have at least one succeeded render. */
  renderedLocales: Locale[];
}
