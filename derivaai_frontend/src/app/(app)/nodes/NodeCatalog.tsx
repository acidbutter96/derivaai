"use client";

import { useState } from "react";
import { Badge, SearchInput, Select, Table } from "@/components/ui";
import { Handle } from "@/components/pipeline/Port";
import { categoryLabels, type NodeTypeDef, type PortDef } from "@/lib/mock";
import { NODE_CATEGORIES, type NodeCategory } from "@/lib/ports";
import styles from "./nodes.module.scss";

function Ports({ ports, side }: { ports: PortDef[]; side: "in" | "out" }) {
  if (ports.length === 0) return <span className="faint">—</span>;
  return (
    <div className={styles.ports}>
      {ports.map((port) => (
        <span key={port.name} className={styles.port}>
          <Handle type={port.type} side={side} className={styles.handle} />
          {port.name}
          <span className="faint">
            {port.type}
            {port.optional ? " · opcional" : ""}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Searchable table of `GET /nodes`: by label, key or port type. */
export function NodeCatalog({ nodeTypes }: { nodeTypes: NodeTypeDef[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NodeCategory | "all">("all");

  const q = query.trim().toLowerCase();
  const visible = nodeTypes.filter((def) => {
    if (category !== "all" && def.category !== category) return false;
    if (!q) return true;
    const ports = [...def.inputs, ...def.outputs].map((port) => port.type);
    return [def.label, def.key, ...ports].some((text) => text.toLowerCase().includes(q));
  });

  return (
    <div className={styles.catalog}>
      <div className={styles.filters}>
        <SearchInput
          className={styles.search}
          placeholder="Buscar por nome, chave ou tipo de porta…"
          kbd="/"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar nós"
        />
        <Select
          aria-label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value as NodeCategory | "all")}
          className={styles.category}
        >
          <option value="all">Todas as categorias</option>
          {NODE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.scroll}>
        <Table>
          <thead>
            <tr>
              <th>Nó</th>
              <th>Categoria</th>
              <th>Fila</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Config</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((def) => (
              <tr key={def.key}>
                <td>
                  <div className={styles.name}>
                    {def.label} <Badge>v{def.version}</Badge>
                  </div>
                  <div className="mono faint">{def.key}</div>
                  <div className={styles.description}>{def.description}</div>
                </td>
                <td>
                  <span className={styles.cat} data-category={def.category}>
                    {categoryLabels[def.category]}
                  </span>
                </td>
                <td className="mono">{def.queue}</td>
                <td>
                  <Ports ports={def.inputs} side="in" />
                </td>
                <td>
                  <Ports ports={def.outputs} side="out" />
                </td>
                <td className="muted">{def.config.length > 0 ? def.config.map((field) => field.name).join(", ") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {visible.length === 0 ? <p className={styles.empty}>Nenhum nó encontrado para “{query}”.</p> : null}
      </div>
    </div>
  );
}
