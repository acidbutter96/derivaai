import type { LucideIcon } from "lucide-react";
import { Book, Clapperboard, Grid2x2, House, Workflow } from "lucide-react";
import type { Locale } from "./status";

export interface NavEntry {
  key: "home" | "lessons" | "pipelines" | "renders" | "nodes";
  href: string;
  label: string;
  icon: LucideIcon;
  /** Count shown at the right in --fg-faint. */
  count?: number | string;
}

const labels: Record<Locale, Record<NavEntry["key"], string>> = {
  "pt-BR": {
    home: "Início",
    lessons: "Lições",
    pipelines: "Pipelines",
    renders: "Renders",
    nodes: "Catálogo de nós",
  },
  en: {
    home: "Home",
    lessons: "Lessons",
    pipelines: "Pipelines",
    renders: "Renders",
    nodes: "Node catalog",
  },
};

/** Navigation from layout.md: Início, Lições, Pipelines, Renders, Catálogo de nós. */
export function navEntries(locale: Locale = "pt-BR"): NavEntry[] {
  const t = labels[locale];
  return [
    { key: "home", href: "/", label: t.home, icon: House },
    { key: "lessons", href: "/lessons", label: t.lessons, icon: Book },
    { key: "pipelines", href: "/pipelines", label: t.pipelines, icon: Workflow },
    { key: "renders", href: "/renders", label: t.renders, icon: Clapperboard },
    { key: "nodes", href: "/nodes", label: t.nodes, icon: Grid2x2 },
  ];
}
