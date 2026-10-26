import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, Zap } from "lucide-react";
import { Crumbs, Page, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Callout, Icon, Panel, PanelBody, PanelHead, PanelTitle, Stat, StatusBadge } from "@/components/ui";
import { Formula, Player } from "@/components/pipeline";
import { Curve } from "@/components/lesson/Curve";
import { OutputCard } from "@/components/render/OutputCard";
import { renderStatusLabel } from "@/components/render/RendersTable";
import { RunLog, RunTimeline } from "@/components/render/RunTimeline";
import { findNodeType, formatClock, getPipeline, getRender, listLessons, listRenders, renderCounts } from "@/lib/mock";
import { RenderActions } from "./RenderActions";
import styles from "./render.module.scss";

export async function generateStaticParams() {
  const renders = await listRenders();
  return renders.map((render) => ({ id: render.id }));
}

export async function generateMetadata({ params }: PageProps<"/renders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Render ${id}` };
}

export default async function RenderPage({ params }: PageProps<"/renders/[id]">) {
  const { id } = await params;
  const render = await getRender(id);
  if (!render) notFound();
  const [pipeline, lessons] = await Promise.all([getPipeline(render.pipelineId), listLessons()]);
  if (!pipeline) notFound();

  const counts = renderCounts(render);
  const lesson = lessons.find((l) => l.pipelineId === pipeline.id && l.language === render.language);
  const running = render.status === "running";
  const failedRun = render.nodeRuns.find((run) => run.status === "failed");
  const failedNode = failedRun ? pipeline.graph.nodes.find((n) => n.id === failedRun.nodeId) : undefined;
  const queues = [...new Set(pipeline.graph.nodes.map((n) => findNodeType(n.type)?.queue))].join(" + ");
  const outputs = render.nodeRuns.flatMap((run) =>
    (run.outputs ?? [])
      .filter((output) => output.kind === "image" || output.kind === "audio" || output.kind === "video")
      .map((output) => ({ run, output, title: pipeline.graph.nodes.find((n) => n.id === run.nodeId)?.title ?? run.nodeId })),
  );

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Renders", href: "/renders" }, { label: <span className="mono">{render.id}</span> }]} />
        <StatusBadge status={render.status} label={running ? renderStatusLabel(render) : render.status === "succeeded" ? "concluído" : undefined} />
        <TopbarSpacer />
        <RenderActions
          renderId={render.id}
          pipelineId={pipeline.id}
          version={render.version}
          running={running}
          publishTo={render.status === "succeeded" ? lesson?.title : undefined}
          published={lesson?.publishedRenderId === render.id}
        />
      </Topbar>
      <Page>
        <div className={styles.top}>
          <Player
            progress={running ? 0 : 0.37}
            current={running ? "0:00" : "0:41"}
            duration={render.finalVideo?.length ?? "–:––"}
            lang={render.language}
          >
            <div className={styles.poster} data-pending={!render.finalVideo || undefined}>
              {render.finalVideo ? (
                <>
                  <Curve kind="charge" />
                  <Formula tex="V(t)=V_0\left(1-e^{-t/RC}\right)" className={styles.posterFormula} />
                </>
              ) : (
                <span>{running ? "O vídeo final aparece quando o render terminar" : "Sem vídeo final"}</span>
              )}
            </div>
          </Player>

          <div className={styles.summary}>
            <div>
              <div className="eyebrow">
                {pipeline.name} · v{render.version}
              </div>
              <h1>Render {render.id}</h1>
              <p className="muted">
                Iniciado {render.startedAgo} por {render.by} · idioma {render.language} · fila {queues}
              </p>
            </div>
            <div className={styles.stats}>
              <Stat label={running ? "Decorrido" : "Duração total"} value={formatClock(render.elapsed)} />
              <Stat label="Do cache" value={`${counts.cached} de ${counts.total} nós`} />
              <Stat label="Tempo poupado" value={`≈ ${formatClock(render.savedByCache)}`} />
              <Stat
                label="Vídeo final"
                value={render.finalVideo ? `${render.finalVideo.length} · ${render.finalVideo.size}` : "–"}
              />
            </div>
            {failedRun && failedNode ? (
              <Callout icon={<Icon icon={AlertTriangle} className={styles.failIcon} />} title={`${failedNode.title} falhou`}>
                <span className="mono">{failedRun.error}</span>. Os nós seguintes foram pulados; abra o pipeline para corrigir
                e renderizar de novo.
              </Callout>
            ) : render.explanation ? (
              <Callout icon={<Icon icon={Zap} />} title="Só o que mudou rodou de novo.">
                {render.explanation}
              </Callout>
            ) : null}
          </div>
        </div>

        <Panel className={styles.panel}>
          <PanelHead>
            <PanelTitle>Execução por nó</PanelTitle>
            <span className={styles.spacer} />
            <StatusBadge status="cached" />
            <StatusBadge status="succeeded" label="executado" />
            <StatusBadge status="failed" />
          </PanelHead>
          <PanelBody className={styles.execution}>
            <RunTimeline render={render} graph={pipeline.graph} lanes />
            <div className={styles.log}>
              <div className="eyebrow">Eventos (SSE)</div>
              <RunLog render={render} />
            </div>
          </PanelBody>
        </Panel>

        <section className={styles.outputs}>
          <h2>Saídas</h2>
          {outputs.length > 0 ? (
            <div className={styles.outputGrid}>
              {outputs.map(({ run, output, title }) => (
                <OutputCard
                  key={`${run.nodeId}-${output.port}`}
                  run={run}
                  output={output}
                  title={title}
                  final={pipeline.graph.nodes.find((n) => n.id === run.nodeId)?.type === "video.compose"}
                />
              ))}
            </div>
          ) : (
            <p className="muted">Nenhum arquivo gerado ainda.</p>
          )}
        </section>
      </Page>
    </>
  );
}
