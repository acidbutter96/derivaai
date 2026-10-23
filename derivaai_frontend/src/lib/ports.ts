// Typed ports (design-system.md §6) and node categories (§7).
// circle = JSON value, diamond = blob reference.

export const PORT_TYPES = [
  "number",
  "text",
  "bool",
  "params",
  "expr",
  "series",
  "image",
  "audio",
  "video",
] as const;

export type PortType = (typeof PORT_TYPES)[number];

const BLOB_TYPES: ReadonlySet<PortType> = new Set(["series", "image", "audio", "video"]);

export const isBlobPort = (type: PortType) => BLOB_TYPES.has(type);

export const portDescriptions: Record<PortType, string> = {
  number: "scalar",
  text: "script, labels",
  bool: "flags",
  params: "{R, C, V0}",
  expr: "SymPy expression",
  series: "sampled data",
  image: "PNG/SVG",
  audio: "WAV/MP3",
  video: "MP4",
};

export const NODE_CATEGORIES = [
  "io",
  "math",
  "plot",
  "narration",
  "animation",
  "audio",
  "video",
] as const;

export type NodeCategory = (typeof NODE_CATEGORIES)[number];

export interface PortSpec {
  name: string;
  type: PortType;
  /** An unconnected required input shows a hollow handle. */
  linked?: boolean;
}
