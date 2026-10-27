import type { Metadata } from "next";
import { Crumbs, Page, PageHead, Topbar } from "@/components/shell/AppShell";
import { RendersTable } from "@/components/render/RendersTable";
import { listPipelines, listRenders } from "@/lib/mock";

export const metadata: Metadata = { title: "Renders" };

export default async function RendersPage() {
  const [renders, pipelines] = await Promise.all([listRenders(), listPipelines()]);
  const running = renders.filter((render) => render.status === "running").length;

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Renders" }]} />
      </Topbar>
      <Page>
        <PageHead eyebrow={`${renders.length} renders · ${running} em execução`} title="Renders" />
        <RendersTable renders={renders} pipelines={pipelines} />
      </Page>
    </>
  );
}
