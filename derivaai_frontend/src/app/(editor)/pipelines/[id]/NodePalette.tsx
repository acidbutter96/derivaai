"use client";

import { useState, type RefObject } from "react";
import { Panel, PanelBody, PanelHead, PanelTitle, SearchInput } from "@/components/ui";
import { PaletteGroup, PaletteItem } from "@/components/pipeline/Palette";
import { categoryLabels, type NodeTypeDef } from "@/lib/mock";
import { NODE_CATEGORIES } from "@/lib/ports";
import styles from "./editor.module.scss";

export const DRAG_MIME = "application/x-deriva-node";

/** Catalog grouped by category; items are dragged onto the canvas. */
export function NodePalette({ catalog, searchRef }: { catalog: NodeTypeDef[]; searchRef: RefObject<HTMLInputElement | null> }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = catalog.filter((def) => !q || def.label.toLowerCase().includes(q) || def.key.includes(q));

  return (
    <Panel className={styles.palette} aria-label="Paleta de nós">
      <PanelHead>
        <PanelTitle>Nós</PanelTitle>
      </PanelHead>
      <PanelBody>
        <SearchInput
          ref={searchRef}
          placeholder="Buscar nós…"
          kbd="/"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar nós"
          className={styles.paletteSearch}
        />
        <p className={styles.paletteHint}>Arraste para o canvas. Catálogo vem do código (GET /nodes).</p>
        {NODE_CATEGORIES.map((category) => {
          const items = visible.filter((def) => def.category === category);
          if (items.length === 0) return null;
          return (
            <PaletteGroup key={category} title={categoryLabels[category]}>
              {items.map((def) => (
                <PaletteItem
                  key={def.key}
                  label={def.label}
                  nodeKey={def.key}
                  category={def.category}
                  aria-description={def.description}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_MIME, def.key);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                />
              ))}
            </PaletteGroup>
          );
        })}
        {visible.length === 0 ? <p className={styles.paletteHint}>Nenhum nó para “{query}”.</p> : null}
      </PanelBody>
    </Panel>
  );
}
