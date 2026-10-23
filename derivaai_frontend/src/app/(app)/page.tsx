import { Plus, Workflow } from "lucide-react";
import { Crumbs, Page, PageHead, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Button, ButtonLink } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Início" }]} />
        <TopbarSpacer />
        <Button icon={Workflow}>Novo pipeline</Button>
        <Button variant="primary" icon={Plus}>
          Nova lição
        </Button>
      </Topbar>
      <Page>
        <PageHead eyebrow="Estúdio" title="Continue de onde parou" />
        <p className="muted">
          The screens (home, editor, render, lesson) are built on the elements demoed on the Elements page.
        </p>
        <p style={{ marginTop: "var(--space-4)" }}>
          <ButtonLink href="/elements" variant="primary">
            Open elements demo
          </ButtonLink>
        </p>
      </Page>
    </>
  );
}
