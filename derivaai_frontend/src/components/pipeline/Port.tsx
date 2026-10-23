import type { ComponentProps } from "react";
import clsx from "clsx";
import { isBlobPort, type PortSpec, type PortType } from "@/lib/ports";
import styles from "./Port.module.scss";

interface HandleProps extends ComponentProps<"span"> {
  type: PortType;
  /** An unconnected required input shows a hollow handle. */
  linked?: boolean;
  side: "in" | "out";
}

/** The dot on the node edge: circle = JSON value, diamond = blob reference. The 20 px hit area is invisible. */
export function Handle({ type, linked = true, side, className, ...props }: HandleProps) {
  return (
    <span
      className={clsx(styles.handle, className)}
      data-type={type}
      data-side={side}
      data-blob={isBlobPort(type) || undefined}
      data-linked={linked}
      {...props}
    />
  );
}

interface PortProps {
  port: PortSpec;
  side: "in" | "out";
}

/** One row of a node: handle + name + type printed in the mono face (10 px). */
export function Port({ port, side }: PortProps) {
  const linked = port.linked ?? true;
  return (
    <div className={styles.port} data-type={port.type} data-side={side}>
      <Handle type={port.type} linked={linked} side={side} />
      <span className={styles.name}>{port.name}</span>
      <span className={styles.type}>
        {port.type}
        <span className="sr-only">{linked ? "" : " (not connected)"}</span>
      </span>
    </div>
  );
}
