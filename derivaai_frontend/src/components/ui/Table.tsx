import type { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Table.module.scss";

/** Plain <table> styled for the renders list. Use `className="mono"` on cells with ids and durations. */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={clsx(styles.table, className)} {...props} />;
}
