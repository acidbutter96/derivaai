import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, Page, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { LangTag, LessonStatusBadge, StatusBadge } from "@/components/ui";
import { Formula, Player } from "@/components/pipeline";
import { Curve } from "@/components/lesson/Curve";
import { renderStatusLabel } from "@/components/render/RendersTable";
import { getLesson, getPipeline, listLessons, listRenders, type ScriptBlock } from "@/lib/mock";
import { LessonActions } from "./LessonActions";
import styles from "./lesson.module.scss";

export async function generateStaticParams() {
  const lessons = await listLessons();
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  return { title: lesson?.title ?? "Lição" };
}

function Script({ blocks }: { blocks: ScriptBlock[] }) {
  return blocks.map((block, index) =>
    block.kind === "math" ? (
      <div key={index} className={styles.equation}>
        <Formula tex={block.tex} display />
      </div>
    ) : (
      <p key={index}>
        {block.parts.map((part, i) => (typeof part === "string" ? part : <Formula key={i} tex={part.tex} className={styles.inline} />))}
      </p>
    ),
  );
}

export default async function LessonPage({ params }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  const [pipeline, renders] = await Promise.all([getPipeline(lesson.pipelineId), listRenders({ pipelineId: lesson.pipelineId })]);
  const published = renders.find((render) => render.id === lesson.publishedRenderId);
  const en = lesson.language === "en";

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: en ? "Lessons" : "Lições", href: "/lessons" }, { label: lesson.title }]} />
        <LessonStatusBadge status={lesson.status} locale={lesson.language} />
        <TopbarSpacer />
        <LessonActions
          pipelineId={lesson.pipelineId}
          language={lesson.language}
          renderedLocales={lesson.renderedLocales}
          canDownload={Boolean(published)}
        />
      </Topbar>
      <Page>
        <div className={styles.layout}>
          <article className={styles.content}>
            <div className="eyebrow">
              {lesson.subject}
              {lesson.length ? ` · ${lesson.length}` : ""}
            </div>
            <h1 className={styles.title}>{lesson.title}</h1>

            <Player duration={lesson.length ?? "–:––"} lang={published ? lesson.language : undefined}>
              <div className={styles.poster} data-empty={!published || undefined}>
                {published ? (
                  <>
                    <Curve kind={lesson.curve} marker={lesson.curve === "charge" ? 0.2 : undefined} />
                    {lesson.curve === "charge" ? (
                      <span className={styles.posterNote}>
                        <Formula tex="t=\tau \to 63{,}2\%\ \text{de}\ V_0" />
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>
                    {lesson.status === "failed"
                      ? "O último render falhou. Abra o pipeline para ver o erro."
                      : "Esta lição ainda não tem um render publicado."}
                  </span>
                )}
              </div>
            </Player>

            <section className={styles.script}>
              <h2>{en ? "Script" : "Roteiro"}</h2>
              <Script blocks={lesson.script} />
            </section>
          </article>

          <aside className={styles.side}>
            <section className={styles.box}>
              <div className="eyebrow">{en ? "Published" : "Publicado"}</div>
              {published ? (
                <>
                  <div className={styles.row}>
                    <Link href={`/renders/${published.id}`} className="mono">
                      {published.id}
                    </Link>
                    <StatusBadge status={published.status} />
                    <LangTag>{published.language}</LangTag>
                  </div>
                  <span className={styles.small}>
                    Pipeline v{published.version} · {lesson.publishedAgo}
                  </span>
                </>
              ) : (
                <span className={styles.small}>Nenhum render publicado.</span>
              )}
            </section>

            <section className={styles.box}>
              <div className="eyebrow">{en ? "Parameters" : "Parâmetros"}</div>
              <dl className={styles.params}>
                {lesson.params.map((param) => (
                  <div key={param.symbol}>
                    <dt>{param.symbol}</dt>
                    <dd>{param.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.box}>
              <div className="eyebrow">{en ? "Render history" : "Histórico de renders"}</div>
              {renders.length > 0 ? (
                <ul className={styles.history}>
                  {renders.map((render) => {
                    const current = render.id === lesson.publishedRenderId;
                    const failedNode = render.nodeRuns.find((run) => run.status === "failed");
                    const failedKey = failedNode
                      ? pipeline?.graph.nodes.find((n) => n.id === failedNode.nodeId)?.type
                      : undefined;
                    return (
                      <li key={render.id}>
                        <Link href={`/renders/${render.id}`} className="mono">
                          {render.id}
                        </Link>
                        <StatusBadge status={render.status} label={renderStatusLabel(render)} />
                        <span className={styles.small}>
                          v{render.version}
                          {current ? " · publicado" : ""}
                          {failedKey ? ` · ${failedKey}` : ""}
                        </span>
                        <span className={styles.spacer} />
                        {current ? (
                          <span className={styles.current}>atual</span>
                        ) : render.status === "succeeded" ? (
                          <button type="button" className={styles.linkButton}>
                            publicar
                          </button>
                        ) : (
                          <Link href={`/renders/${render.id}`} className={styles.small}>
                            ver
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className={styles.small}>Nenhum render ainda.</span>
              )}
            </section>
          </aside>
        </div>
      </Page>
    </>
  );
}
