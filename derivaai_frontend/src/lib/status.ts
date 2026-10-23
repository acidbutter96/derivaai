// One vocabulary for node runs, renders and lessons (design-system.md §5).

export type Locale = "pt-BR" | "en";

export const STATUSES = [
  "pending",
  "running",
  "cached",
  "succeeded",
  "failed",
  "skipped",
  "canceled",
  "warning",
] as const;

export type Status = (typeof STATUSES)[number];

export const statusLabels: Record<Locale, Record<Status, string>> = {
  "pt-BR": {
    pending: "aguardando",
    running: "executando",
    cached: "cache",
    succeeded: "ok",
    failed: "falhou",
    skipped: "pulado",
    canceled: "cancelado",
    warning: "não salvo",
  },
  en: {
    pending: "pending",
    running: "running",
    cached: "cached",
    succeeded: "ok",
    failed: "failed",
    skipped: "skipped",
    canceled: "canceled",
    warning: "unsaved",
  },
};

// Lesson status is derived from its renders (design v2) and reuses the status shapes.
export type LessonStatus = "draft" | "rendering" | "ready" | "failed";

export const lessonStatusToStatus: Record<LessonStatus, Status> = {
  draft: "pending",
  rendering: "running",
  ready: "succeeded",
  failed: "failed",
};

export const lessonStatusLabels: Record<Locale, Record<LessonStatus, string>> = {
  "pt-BR": { draft: "rascunho", rendering: "renderizando", ready: "pronta", failed: "falhou" },
  en: { draft: "draft", rendering: "rendering", ready: "ready", failed: "failed" },
};
