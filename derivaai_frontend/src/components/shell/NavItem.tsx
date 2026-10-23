"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./NavItem.module.scss";

interface NavItemProps {
  href: string;
  label: string;
  /** Rendered by the server (`<Icon icon={...} />`); components can't cross the client boundary. */
  icon: ReactNode;
  count?: number | string;
}

export function NavItem({ href, label, icon, count }: NavItemProps) {
  const pathname = usePathname();
  const current = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={styles.item} aria-current={current ? "page" : undefined} title={label}>
      {icon}
      <span className={styles.label}>{label}</span>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
    </Link>
  );
}
