import type { Metadata } from "next";
import { Crumbs, Page, PageHead, Topbar } from "@/components/shell/AppShell";
import { listNodeTypes } from "@/lib/mock";
import { NodeCatalog } from "./NodeCatalog";

export const metadata: Metadata = { title: "Catálogo de nós" };

export default async function NodesPage() {
  const nodeTypes = await listNodeTypes();
  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Catálogo de nós" }]} />
      </Topbar>
      <Page>
        <PageHead eyebrow={`${nodeTypes.length} tipos · GET /nodes · somente leitura`} title="Catálogo de nós" />
        <p className="muted" style={{ margin: "0 0 var(--space-6)", maxWidth: "68ch" }}>
          Cada tipo de nó é uma classe Python. Adicionar um nó é uma mudança de código com teste; este catálogo é gerado a
          partir dela.
        </p>
        <NodeCatalog nodeTypes={nodeTypes} />
      </Page>
    </>
  );
}
