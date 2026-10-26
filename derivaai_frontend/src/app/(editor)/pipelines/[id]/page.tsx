import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPipeline, listNodeTypes, listPipelines, listRenders } from "@/lib/mock";
import { Editor } from "./Editor";

export async function generateStaticParams() {
  const pipelines = await listPipelines();
  return pipelines.map((pipeline) => ({ id: pipeline.id }));
}

export async function generateMetadata({ params }: PageProps<"/pipelines/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pipeline = await getPipeline(id);
  return { title: pipeline?.name ?? "Pipeline" };
}

export default async function PipelineEditorPage({ params }: PageProps<"/pipelines/[id]">) {
  const { id } = await params;
  const pipeline = await getPipeline(id);
  if (!pipeline) notFound();
  const [renders, catalog, template] = await Promise.all([
    listRenders({ pipelineId: id }),
    listNodeTypes(),
    getPipeline("licao-narrada"),
  ]);

  return (
    // the editor reads ?v= on the client
    <Suspense>
      <Editor pipeline={pipeline} renders={renders} catalog={catalog} template={template?.graph} />
    </Suspense>
  );
}
