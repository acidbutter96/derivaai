import type { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Kbd.module.scss";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return <kbd className={clsx(styles.kbd, className)} {...props} />;
}
