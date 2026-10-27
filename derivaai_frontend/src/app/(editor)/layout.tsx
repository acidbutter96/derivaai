import { AppShell } from "@/components/shell/AppShell";
import { Sidebar } from "@/components/shell/Sidebar";

// Pipeline editor: the sidebar collapses to a 56 px rail to give the canvas room.
export default function EditorLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell variant="editor" sidebar={<Sidebar collapsed user={{ name: "Marcos Pereira" }} />}>
      {children}
    </AppShell>
  );
}
