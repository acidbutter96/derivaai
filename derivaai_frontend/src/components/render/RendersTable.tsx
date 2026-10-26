import Link from "next/link";
import { LangTag, StatusBadge, Table } from "@/components/ui";
import { findNodeType, formatClock, renderCounts, type Pipeline, type Render } from "@/lib/mock";
import styles from "./Render.module.scss";

/** Status text for a render row: progress while running, the default label otherwise. */
export function renderStatusLabel(render: Render) {
  if (render.status !== "running") return undefined;
  const { done, total } = renderCounts(render);
  return `${Math.round((done / total) * 100)}%`;
}

function nodesSummary(render: Render, pipeline?: Pipeline) {
  const { done, total, cached, failedNode } = renderCounts(render);
  if (failedNode) {
    const node = pipeline?.graph.nodes.find((n) => n.id === failedNode);
    const key = node ? findNodeType(node.type)?.key : failedNode;
    return `${done}/${total} · ${key}`;
  }
  return cached > 0 ? `${done}/${total} · ${cached} cache` : `${done}/${total}`;
}

export function RendersTable({ renders, pipelines }: { renders: Render[]; pipelines: Pipeline[] }) {
  const byId = new Map(pipelines.map((pipeline) => [pipeline.id, pipeline]));
  return (
    <div className={styles.tableScroll}>
      <Table>
        <thead>
          <tr>
            <th>Render</th>
            <th>Pipeline</th>
            <th>Versão</th>
            <th>Idioma</th>
            <th>Status</th>
            <th>Nós</th>
            <th>Duração</th>
            <th>Quando</th>
          </tr>
        </thead>
        <tbody>
          {renders.map((render) => {
            const pipeline = byId.get(render.pipelineId);
            return (
              <tr key={render.id}>
                <td className="mono">
                  <Link href={`/renders/${render.id}`} className={styles.rowLink}>
                    {render.id}
                  </Link>
                </td>
                <td>{pipeline?.name ?? render.pipelineId}</td>
                <td>v{render.version}</td>
                <td>
                  <LangTag>{render.language}</LangTag>
                </td>
                <td>
                  <StatusBadge status={render.status} label={renderStatusLabel(render)} />
                </td>
                <td>{nodesSummary(render, pipeline)}</td>
                <td className="mono">{formatClock(render.elapsed)}</td>
                <td className="muted">{render.startedAgo}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
