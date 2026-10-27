import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Stat.module.scss";

interface StatProps extends Omit<ComponentProps<"div">, "title"> {
  label: ReactNode;
  value: ReactNode;
  /** Small line under the value, e.g. "de 4 · 1 em inglês". */
  sub?: ReactNode;
}

/** KPI tile: eyebrow label, mono value, faint caption. */
export function Stat({ label, value, sub, className, ...props }: StatProps) {
  return (
    <div className={clsx(styles.stat, className)} {...props}>
      <span className="eyebrow">{label}</span>
      <span className={styles.value}>{value}</span>
      {sub ? <span className={styles.sub}>{sub}</span> : null}
    </div>
  );
}

/** Highlighted note box (e.g. "Só o que mudou rodou de novo"). */
export function Callout({
  icon,
  title,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & { icon?: ReactNode; title: ReactNode }) {
  return (
    <div className={clsx(styles.callout, className)} {...props}>
      {icon ? <span className={styles.calloutIcon}>{icon}</span> : null}
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
