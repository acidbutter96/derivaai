import { AppShell } from "@/components/shell/AppShell";
import { Sidebar } from "@/components/shell/Sidebar";
import { getSidebarData } from "@/lib/mock";

// Default shell (232 px sidebar). The pipeline editor lives in the (editor) group with variant="editor".
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { counts, recents } = await getSidebarData();
  return (
    <AppShell sidebar={<Sidebar user={{ name: "Marcos Pereira" }} counts={counts} recents={recents} />}>
      {children}
    </AppShell>
  );
}
