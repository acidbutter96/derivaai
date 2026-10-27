"use client";

import Link from "next/link";
import { Square } from "lucide-react";
import { Badge, Button, PanelHead, StatusBadge, TabPanel, Tabs } from "@/components/ui";
import { OutputCard } from "@/components/render/OutputCard";
import { RunLog, RunTimeline } from "@/components/render/RunTimeline";
import { formatClock, type Graph, type PipelineVersion, type Render } from "@/lib/mock";
import styles from "./editor.module.scss";

export type DockTab = "run" | "outputs" | "versions";

const TABS = [
  { id: "run", label: "Execução" },
  { id: "outputs", label: "Saídas" },
  { id: "versions", label: "Versões" },
] as const;

interface DockProps {
  tab: DockTab;
  onTab: (tab: DockTab) => void;
  render: Render | null;
  graph: Graph;
  versions: PipelineVersion[];
  currentVersion: number;
  /** Renders of this pipeline from the server, listed under each version. */
  renders: Render[];
  onCancel: () => void;
}

export function Dock({ tab, onTab, render, graph, versions, currentVersion, renders, onCancel }: DockProps) {
  const outputs = (render?.nodeRuns ?? []).flatMap((run) =>
    (run.outputs ?? [])
      .filter((o) => o.kind === "image" || o.kind === "audio" || o.kind === "video")
      .map((output) => ({ run, output, node: graph.nodes.find((n) => n.id === run.nodeId) })),
  );
  const allRenders = render && !renders.some((r) => r.id === render.id) ? [render, ...renders] : renders;
  // renders started in this session only exist in the mock's memory, so they have no detail page
  const hasPage = (id: string) => renders.some((r) => r.id === id);

  return (
    <section className={styles.dock} aria-label="Dock de execução">
      <PanelHead className={styles.dockHead}>
        <Tabs idPrefix="dock" aria-label="Dock" tabs={TABS} value={tab} onChange={onTab} className={styles.tabs} />
        <span className={styles.spacer} />
        {render ? (
          <span className={styles.dockMeta}>
            {hasPage(render.id) ? <Link href={`/renders/${render.id}`}>render {render.id}</Link> : `render ${render.id}`} · v{render.version} · {render.language} ·{" "}
            {formatClock(render.elapsed)}
          </span>
        ) : null}
        {render?.status === "running" ? (
          <Button size="sm" variant="danger" icon={Square} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </PanelHead>

      <TabPanel idPrefix="dock" id="run" active={tab === "run"} className={styles.dockBody}>
        {render ? (
          <div className={styles.dockRun}>
            <RunTimeline render={render} graph={graph} />
            <RunLog render={render} />
          </div>
        ) : (
          <p className={styles.description}>Nenhum render deste pipeline ainda. Use Renderizar (⌘↵).</p>
        )}
      </TabPanel>

      <TabPanel idPrefix="dock" id="outputs" active={tab === "outputs"} className={styles.dockBody}>
        {outputs.length > 0 ? (
          <div className={styles.dockOutputs}>
            {outputs.map(({ run, output, node }) => (
              <OutputCard
                key={`${run.nodeId}-${output.port}`}
                run={run}
                output={output}
                title={node?.title ?? run.nodeId}
                final={node?.type === "video.compose"}
              />
            ))}
          </div>
        ) : (
          <p className={styles.description}>Este render ainda não gerou arquivos.</p>
        )}
      </TabPanel>

      <TabPanel idPrefix="dock" id="versions" active={tab === "versions"} className={styles.dockBody}>
        <ul className={styles.versions}>
          {versions.map((version) => {
            const own = allRenders.filter((r) => r.version === version.number);
            return (
              <li key={version.number}>
                <Badge variant={version.number === currentVersion ? "accent" : "default"}>v{version.number}</Badge>
                <span className="mono faint">{version.graphHash}</span>
                <span className={styles.description}>
                  {version.changes} {version.changes === 1 ? "nó alterado" : "nós alterados"} · {version.author} · {version.createdAgo}
                </span>
                <span className={styles.spacer} />
                {own.map((r) =>
                  hasPage(r.id) ? (
                    <Link key={r.id} href={`/renders/${r.id}`} className={styles.versionRender}>
                      <span className="mono">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </Link>
                  ) : (
                    <span key={r.id} className={styles.versionRender}>
                      <span className="mono">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </span>
                  ),
                )}
              </li>
            );
          })}
        </ul>
      </TabPanel>
    </section>
  );
}
