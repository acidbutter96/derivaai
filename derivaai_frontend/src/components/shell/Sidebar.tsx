import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { StatusDot } from "@/components/ui/Badge";
import { Shapes } from "lucide-react";
import { navEntries, type NavEntry } from "@/lib/nav";
import type { Locale, Status } from "@/lib/status";
import { NavItem } from "./NavItem";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Sidebar.module.scss";

export interface RecentItem {
  label: string;
  href: string;
  status: Status;
}

interface SidebarProps {
  /** 56 px icons-only rail, used inside the pipeline editor. */
  collapsed?: boolean;
  locale?: Locale;
  /** Counts shown at the right of each entry, by nav key. */
  counts?: Partial<Record<NavEntry["key"], number | string>>;
  /** Last three opened items with their status dot. */
  recents?: RecentItem[];
  user?: { name: string };
}

const recentsTitle: Record<Locale, string> = { "pt-BR": "Recentes", en: "Recent" };
const elementsLabel: Record<Locale, string> = { "pt-BR": "Elementos", en: "Elements" };

export function Sidebar({ collapsed, locale = "pt-BR", counts, recents = [], user }: SidebarProps) {
  return (
    <aside className={styles.sidebar} data-collapsed={collapsed ? "true" : "false"}>
      <Link href="/" className={styles.brand} aria-label="DerivaAI">
        <Brand showWordmark={!collapsed} />
      </Link>

      <nav aria-label="Principal" className={styles.nav}>
        {navEntries(locale).map(({ key, href, label, icon }) => (
          <NavItem key={key} href={href} label={label} icon={<Icon icon={icon} />} count={counts?.[key]} />
        ))}
      </nav>

      {recents.length > 0 && !collapsed ? (
        <div className={styles.recents}>
          <div className={styles.eyebrow}>{recentsTitle[locale]}</div>
          {recents.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href} className={styles.recent}>
              <StatusDot status={item.status} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <NavItem href="/elements" label={elementsLabel[locale]} icon={<Icon icon={Shapes} />} />
        <ThemeToggle locale={locale} />
        {user ? (
          <div className={styles.user} title={user.name}>
            <span className={styles.avatar}>{initials(user.name)}</span>
            <span className={styles.userName}>{user.name}</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
