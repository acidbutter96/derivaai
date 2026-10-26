import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Crumbs, Page, PageHead, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Badge, ButtonLink, StatusBadge, Table } from "@/components/ui";
import { GraphThumb } from "@/components/pipeline";
import { renderStatusLabel } from "@/components/render/RendersTable";
import { listLessons, listPipelines, listRenders } from "@/lib/mock";
import styles from "./pipelines.module.scss";

export const metadata: Metadata = { title: "Pipelines" };

export default async function PipelinesPage() {
  const [pipelines, renders, lessons] = await Promise.all([listPipelines(), listRenders(), listLessons()]);

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Pipelines" }]} />
        <TopbarSpacer />
        <ButtonLink href="/pipelines/queda-livre" variant="primary" icon={Plus}>
          Novo pipeline
        </ButtonLink>
      </Topbar>
      <Page>
        <PageHead eyebrow={`${pipelines.length} pipelines`} title="Pipelines" />
        <div className={styles.scroll}>
          <Table>
            <thead>
              <tr>
                <th aria-label="Grafo" />
                <th>Pipeline</th>
                <th>Versão</th>
                <th>Nós</th>
                <th>Último render</th>
                <th>Lições</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipeline) => {
                const last = renders.find((render) => render.pipelineId === pipeline.id);
                const usedBy = lessons.filter((lesson) => lesson.pipelineId === pipeline.id);
                return (
                  <tr key={pipeline.id}>
                    <td className={styles.thumbCell}>
                      <div className={styles.thumb}>
                        <GraphThumb graph={pipeline.graph} />
                      </div>
                    </td>
                    <td>
                      <Link href={`/pipelines/${pipeline.id}`} className={styles.name}>
                        {pipeline.name}
                      </Link>
                      <div className={styles.description}>{pipeline.description}</div>
                    </td>
                    <td>
                      <Badge>v{pipeline.headVersion}</Badge>
                    </td>
                    <td className="mono">
                      {pipeline.graph.nodes.length} · {pipeline.graph.edges.length}
                    </td>
                    <td>
                      {last ? (
                        <Link href={`/renders/${last.id}`} className={styles.render}>
                          <span className="mono">{last.id}</span>
                          <StatusBadge status={last.status} label={renderStatusLabel(last)} />
                        </Link>
                      ) : (
                        <span className="faint">nenhum</span>
                      )}
                    </td>
                    <td>{usedBy.length > 0 ? usedBy.map((lesson) => lesson.title).join(", ") : <span className="faint">—</span>}</td>
                    <td className="muted">{pipeline.updatedAgo}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Page>
    </>
  );
}
