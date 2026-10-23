import { AppShell } from "@/components/shell/AppShell";
import { Sidebar } from "@/components/shell/Sidebar";

// Default shell (232 px sidebar). The pipeline editor will get its own group with variant="editor".
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell sidebar={<Sidebar user={{ name: "Marcos" }} />}>{children}</AppShell>
  );
}
