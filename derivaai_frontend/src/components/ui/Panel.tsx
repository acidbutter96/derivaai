import type { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Panel.module.scss";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return <section className={clsx(styles.panel, className)} {...props} />;
}

/** 40 px header; put a title or <Tabs> inside. */
export function PanelHead({ className, ...props }: ComponentProps<"header">) {
  return <header className={clsx(styles.head, className)} {...props} />;
}

export function PanelTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={clsx(styles.title, className)} {...props} />;
}

export function PanelBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

export function PanelSection({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.section, className)} {...props} />;
}
