import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Crumbs, Page, PageHead, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui";
import { LessonGrid } from "@/components/lesson/LessonGrid";
import { listLessons } from "@/lib/mock";

export const metadata: Metadata = { title: "Lições" };

export default async function LessonsPage() {
  const lessons = await listLessons();
  const ready = lessons.filter((lesson) => lesson.status === "ready").length;

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Lições" }]} />
        <TopbarSpacer />
        <Button variant="primary" icon={Plus}>
          Nova lição
        </Button>
      </Topbar>
      <Page>
        <PageHead eyebrow={`${lessons.length} lições · ${ready} prontas`} title="Lições" />
        <LessonGrid lessons={lessons} title="Todas as lições" />
      </Page>
    </>
  );
}
