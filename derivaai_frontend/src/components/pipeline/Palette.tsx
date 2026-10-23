import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import type { NodeCategory } from "@/lib/ports";
import styles from "./Palette.module.scss";

export function PaletteGroup({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

interface PaletteItemProps extends Omit<ComponentProps<"div">, "title"> {
  label: string;
  /** Code key, e.g. `plot.function`, shown in mono. */
  nodeKey: string;
  category: NodeCategory;
}

/** Draggable catalog entry. Category only groups the palette; port types decide compatibility. */
export function PaletteItem({ label, nodeKey, category, className, ...props }: PaletteItemProps) {
  return (
    <div className={clsx(styles.item, className)} data-category={category} draggable {...props}>
      <span className={styles.swatch} aria-hidden />
      <span className={styles.label}>{label}</span>
      <span className={styles.key}>{nodeKey}</span>
    </div>
  );
}
