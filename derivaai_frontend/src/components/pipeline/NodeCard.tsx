import type { ComponentProps, CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { StatusBadge } from "@/components/ui/Badge";
import type { NodeCategory, PortSpec } from "@/lib/ports";
import type { Locale, Status } from "@/lib/status";
import { statusLabels } from "@/lib/status";
import { Port } from "./Port";
import styles from "./NodeCard.module.scss";

interface NodeCardProps extends Omit<ComponentProps<"div">, "title"> {
  title: string;
  /** Code key of the node type, e.g. `math.solve_ode`. Stays in English (it is code). */
  nodeKey: string;
  version?: number;
  queue?: string;
  category: NodeCategory;
  status?: Status;
  /** Overrides the status text, e.g. "62%" while running or "8.2 s" when it finished. */
  statusLabel?: ReactNode;
  selected?: boolean;
  inputs?: PortSpec[];
  outputs?: PortSpec[];
  /** Position on the canvas; omit to lay the node out in normal flow. */
  position?: { x: number; y: number };
  locale?: Locale;
  /** Optional output preview, inline config summary or a <NodeError>. */
  children?: ReactNode;
}

/** Node anatomy from design-system.md §8: stripe, head, key, ports, preview, progress, error. */
export function NodeCard({
  title,
  nodeKey,
  version,
  queue,
  category,
  status = "pending",
  statusLabel,
  selected,
  inputs = [],
  outputs = [],
  position,
  locale = "pt-BR",
  className,
  style,
  children,
  ...props
}: NodeCardProps) {
  const connected = inputs.filter((port) => port.linked ?? true).length;
  const announce = `${title}, ${statusLabels[locale][status]}, ${connected} ${locale === "en" ? "of" : "de"} ${inputs.length} ${
    locale === "en" ? "inputs connected" : "entradas conectadas"
  }`;
  const meta = [nodeKey, version ? `v${version}` : null, queue ? `${locale === "en" ? "queue" : "fila"} ${queue}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={announce}
      className={clsx(styles.node, className)}
      data-category={category}
      data-status={status}
      data-selected={selected || undefined}
      style={{ ...(position ? { left: position.x, top: position.y, position: "absolute" } : null), ...style } as CSSProperties}
      {...props}
    >
      <div className={styles.head}>
        <span className={styles.title}>{title}</span>
        <StatusBadge status={status} label={statusLabel} locale={locale} />
      </div>
      <div className={styles.key}>{meta}</div>

      {inputs.length + outputs.length > 0 ? (
        <div className={styles.ports}>
          <div className={styles.in}>
            {inputs.map((port) => (
              <Port key={port.name} port={port} side="in" />
            ))}
          </div>
          <div className={styles.out}>
            {outputs.map((port) => (
              <Port key={port.name} port={port} side="out" />
            ))}
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

/** Inline output: plot, waveform, video poster or config summary. */
export function NodePreview({
  formula,
  className,
  ...props
}: ComponentProps<"div"> & { /** Centered math face for a formula. */ formula?: boolean }) {
  return <div className={clsx(styles.preview, formula && styles.formula, className)} {...props} />;
}

/** Thin progress bar while the node runs (0–1). */
export function NodeProgress({ value }: { value: number }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Inline error of a failed node (red border comes from `status="failed"`). */
export function NodeError({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.error} role="alert">
      {children}
      {action ? <div className={styles.errorAction}>{action}</div> : null}
    </div>
  );
}
