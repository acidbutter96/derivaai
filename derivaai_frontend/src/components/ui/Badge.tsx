import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { lessonStatusLabels, lessonStatusToStatus, statusLabels } from "@/lib/status";
import type { LessonStatus, Locale, Status } from "@/lib/status";
import styles from "./Badge.module.scss";

interface BadgeProps extends ComponentProps<"span"> {
  variant?: "default" | "accent";
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return <span className={clsx(styles.badge, variant === "accent" && styles.accent, className)} {...props} />;
}

interface StatusMarkProps extends ComponentProps<"span"> {
  status: Status;
}

/** Color + shape only (dot / diamond / square / hollow). Always pair with a text label. */
export function StatusDot({ status, className, ...props }: StatusMarkProps) {
  return <span aria-hidden className={clsx(styles.dot, styles[status], className)} {...props} />;
}

interface StatusBadgeProps extends Omit<ComponentProps<"span">, "children"> {
  status: Status;
  /** Overrides the default label, e.g. "62%" while running or a duration when succeeded. */
  label?: ReactNode;
  locale?: Locale;
  /** Plain text instead of a pill (used inside lists and timelines). */
  bare?: boolean;
}

/** Status = color + shape + text (design-system.md §5). */
export function StatusBadge({ status, label, locale = "pt-BR", bare, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles.status, styles[status], bare && styles.bare, className)}
      data-status={status}
      {...props}
    >
      <StatusDot status={status} />
      {label ?? statusLabels[locale][status]}
    </span>
  );
}

interface LessonStatusBadgeProps extends Omit<ComponentProps<"span">, "children"> {
  status: LessonStatus;
  locale?: Locale;
}

export function LessonStatusBadge({ status, locale = "pt-BR", ...props }: LessonStatusBadgeProps) {
  return <StatusBadge status={lessonStatusToStatus[status]} label={lessonStatusLabels[locale][status]} {...props} />;
}

/** `pt-BR` / `en` tag in the mono face. */
export function LangTag({ className, ...props }: ComponentProps<"span">) {
  return <span className={clsx(styles.lang, className)} {...props} />;
}
