import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import styles from "./AppShell.module.scss";

interface AppShellProps {
  sidebar: ReactNode;
  /** `editor` shrinks the sidebar to a 56 px rail and makes the main area a fixed-height workspace. */
  variant?: "default" | "editor";
  children: ReactNode;
}

export function AppShell({ sidebar, variant = "default", children }: AppShellProps) {
  return (
    <div className={styles.shell} data-variant={variant}>
      {sidebar}
      <main className={styles.main} id="main">
        {children}
      </main>
    </div>
  );
}

/** 52 px: breadcrumbs left, actions right; the primary action always last. */
export function Topbar({ className, ...props }: ComponentProps<"header">) {
  return <header className={clsx(styles.topbar, className)} {...props} />;
}

export function TopbarSpacer() {
  return <div className={styles.spacer} />;
}

export interface Crumb {
  label: ReactNode;
  href?: string;
}

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={index} className={styles.crumb}>
            {index > 0 ? <span className={styles.sep}>/</span> : null}
            {last ? (
              <strong aria-current="page">{item.label}</strong>
            ) : item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Page content, padding 32 px (24 tablet, 16 phone). */
export function Page({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.page, className)} {...props} />;
}

export function PageHead({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.pageHead}>
      <div className={styles.pageHeadText}>
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </div>
  );
}
