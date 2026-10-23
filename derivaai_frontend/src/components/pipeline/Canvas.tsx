import type { ComponentProps } from "react";
import clsx from "clsx";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { PortType } from "@/lib/ports";
import styles from "./Canvas.module.scss";

/** Dot grid every 24 px + line grid every 120 px. Nodes are absolutely positioned inside. */
export function Canvas({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.canvas, className)} {...props} />;
}

/** SVG layer under the nodes that holds the typed edges. */
export function CanvasEdges({ className, children, ...props }: ComponentProps<"svg">) {
  return (
    <svg className={clsx(styles.edges, className)} aria-hidden {...props}>
      {children}
    </svg>
  );
}

/** Cubic bezier from an output handle to an input handle. */
export function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(48, Math.abs(x2 - x1) * 0.5);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

interface EdgeProps {
  d: string;
  /** Edges take the color of their source port. */
  type: PortType;
  /** Dashed stroke animation into a running node. */
  flow?: boolean;
  /** 35% opacity while an incompatible connection is being dragged. */
  dim?: boolean;
}

export function Edge({ d, type, flow, dim }: EdgeProps) {
  return (
    <path
      d={d}
      className={clsx(styles.edge, flow && styles.flow, dim && styles.dim)}
      style={{ stroke: `var(--port-${type})` }}
    />
  );
}

type HudPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Floating panel over the canvas (render status, zoom, minimap). */
export function Hud({
  position,
  card = true,
  className,
  ...props
}: ComponentProps<"div"> & { position: HudPosition; /** Wrap in the raised HUD card. */ card?: boolean }) {
  return <div className={clsx(styles.hud, card && styles.card, className)} data-position={position} {...props} />;
}

interface ZoomControlsProps {
  /** 0.25–2 (25–200%). */
  zoom: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onFit }: ZoomControlsProps) {
  return (
    <Hud position="bottom-left" role="group" aria-label="Zoom">
      <Button variant="ghost" size="sm" iconOnly aria-label="Zoom out" onClick={onZoomOut}>
        <Icon icon={ZoomOut} size={14} />
      </Button>
      <span className={styles.zoom} aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="sm" iconOnly aria-label="Zoom in" onClick={onZoomIn}>
        <Icon icon={ZoomIn} size={14} />
      </Button>
      <Button variant="ghost" size="sm" iconOnly aria-label="Fit" onClick={onFit}>
        <Icon icon={Maximize2} size={14} />
      </Button>
    </Hud>
  );
}
