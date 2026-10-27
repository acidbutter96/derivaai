import Link from "next/link";
import { Layers, Plus, Workflow } from "lucide-react";
import { Crumbs, Page, PageHead, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Badge, Button, ButtonLink, Icon, LangTag, SearchInput, Stat, StatusBadge } from "@/components/ui";
import { GraphThumb } from "@/components/pipeline";
import { LessonGrid } from "@/components/lesson/LessonGrid";
import { RendersTable } from "@/components/render/RendersTable";
import { getPipeline, listLessons, listPipelines, listRenders, renderCounts } from "@/lib/mock";
import styles from "./home.module.scss";

export default async function HomePage() {
  const [lessons, renders, pipelines] = await Promise.all([listLessons(), listRenders(), listPipelines()]);
  const current = renders[0];
  const currentPipeline = await getPipeline(current.pipelineId);
  const counts = renderCounts(current);
  const runningRun = current.nodeRuns.find((run) => run.status === "running");
  const running = runningRun
    ? { ...runningRun, title: currentPipeline?.graph.nodes.find((n) => n.id === runningRun.nodeId)?.title ?? runningRun.nodeId }
    : undefined;
  const ready = lessons.filter((lesson) => lesson.status === "ready");
  const failed = renders.filter((render) => render.status === "failed").length;
  const savedMinutes = Math.round(renders.reduce((sum, render) => sum + render.savedByCache, 0) / 60);

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Início" }]} />
        <SearchInput className={styles.search} placeholder="Buscar lições, pipelines e nós…" kbd="⌘K" aria-label="Busca global" />
        <TopbarSpacer />
        <ButtonLink href="/pipelines/queda-livre" icon={Workflow}>
          Novo pipeline
        </ButtonLink>
        <Button variant="primary" icon={Plus}>
          Nova lição
        </Button>
      </Topbar>
      <Page>
        <PageHead eyebrow="Estúdio" title="Continue de onde parou" />

        <div className={styles.top}>
          <section className={styles.hero} aria-label="Pipeline mais recente">
            <div className={styles.heroGraph}>{currentPipeline ? <GraphThumb graph={currentPipeline.graph} runs={current.nodeRuns} /> : null}</div>
            <div className={styles.heroText}>
              <div className={styles.heroMeta}>
                <StatusBadge status={current.status} label={`renderizando ${counts.done}/${counts.total}`} />
                <LangTag>{current.language}</LangTag>
                <Badge>v{current.version}</Badge>
              </div>
              <h2>{currentPipeline?.name}</h2>
              <p className="muted">
                Pipeline da lição. {counts.cached} nós vieram do cache
                {running ? `; ${running.title.toLowerCase()} está em ${Math.round((running.progress ?? 0) * 100)}%` : ""}.
              </p>
              <div className={styles.heroActions}>
                <ButtonLink href={`/pipelines/${current.pipelineId}`} variant="primary">
                  Abrir no editor
                </ButtonLink>
                <ButtonLink href={`/renders/${current.id}`}>Ver render</ButtonLink>
              </div>
            </div>
          </section>

          <div className={styles.kpis}>
            <Stat
              label="Lições prontas"
              value={ready.length}
              sub={`de ${lessons.length} · ${ready.filter((lesson) => lesson.language === "en").length} em inglês`}
            />
            <Stat label="Tempo poupado pelo cache" value={`${savedMinutes} min`} sub="nos últimos 7 dias" />
            <Stat label="Renders" value={renders.length} sub={`${renders.length - failed} ok · ${failed} com falha`} />
            <Link href="/pipelines/licao-narrada" className={styles.template}>
              <Icon icon={Layers} />
              <span>
                <strong>Modelo: lição narrada</strong>
                <span className="muted">roteiro → narração → animação → vídeo</span>
              </span>
            </Link>
          </div>
        </div>

        <LessonGrid lessons={lessons} title="Lições" aside={<span className="muted">Ordenar: recentes</span>} />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Renders recentes</h2>
            <Link href="/renders" className={styles.more}>
              Ver todos
            </Link>
          </div>
          <RendersTable renders={renders.slice(0, 3)} pipelines={pipelines} />
        </section>
      </Page>
    </>
  );
}
