import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { StatusDot } from "@/components/ui/Badge";
import type { Status } from "@/lib/status";
import styles from "./Timeline.module.scss";

/** Per-node execution. Rows are `display: contents` so label, track and duration share one grid. */
export function Timeline({ className, ...props }: ComponentProps<"div">) {
  return <div role="table" className={clsx(styles.timeline, className)} {...props} />;
}

interface TimelineRowProps {
  label: string;
  status: Status;
  /** Bar start and width as a percentage of the render duration (0–100). */
  start?: number;
  width?: number;
  /** Duration text, mono and right-aligned: "8.2 s", "cache" or "–". */
  duration: ReactNode;
}

export function TimelineRow({ label, status, start = 0, width = 0, duration }: TimelineRowProps) {
  return (
    <div role="row" className={styles.row}>
      <div role="cell" className={styles.label}>
        <StatusDot status={status} />
        <span>{label}</span>
      </div>
      <div role="cell" className={styles.track}>
        {width > 0 ? (
          <span
            className={styles.bar}
            style={{ left: `${start}%`, width: `${width}%` }}
            data-status={status}
          />
        ) : null}
      </div>
      <div role="cell" className={styles.duration}>
        {duration}
      </div>
    </div>
  );
}

/** SSE event stream: mono 11 px, timestamps `mm:ss.cc`. */
export function Log({ className, ...props }: ComponentProps<"div">) {
  return <div role="log" aria-live="polite" className={clsx(styles.log, className)} {...props} />;
}

export function LogLine({ time, children }: { time: string; children: ReactNode }) {
  return (
    <div>
      <span className={styles.time}>{time}</span>
      {children}
    </div>
  );
}
