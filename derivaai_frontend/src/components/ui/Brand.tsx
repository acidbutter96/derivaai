import type { ComponentProps } from "react";
import clsx from "clsx";
import styles from "./Brand.module.scss";

/** `∂` on an accent square. 28 px in the sidebar, 20 px as favicon. */
export function Mark({ size = 28, className, ...props }: ComponentProps<"span"> & { size?: number }) {
  return (
    <span
      aria-hidden
      className={clsx(styles.mark, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.68) }}
      {...props}
    >
      ∂
    </span>
  );
}

export function Wordmark({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={clsx(styles.wordmark, className)} {...props}>
      Deriva<b>AI</b>
    </span>
  );
}

export function Brand({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className={styles.brand}>
      <Mark />
      {showWordmark ? <Wordmark /> : <span className="sr-only">DerivaAI</span>}
    </span>
  );
}
