"use client";

import type { ComponentProps, CSSProperties } from "react";
import clsx from "clsx";
import { useFieldControl } from "./Field";
import styles from "./Slider.module.scss";

type SliderProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange" | "min" | "max" | "step"> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

/** Range input with the amber filled track (e.g. narration speed). */
export function Slider({ value, onValueChange, min = 0, max = 1, step = 0.01, className, ...props }: SliderProps) {
  const field = useFieldControl();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className={clsx(styles.slider, className)}
      style={{ "--pct": `${pct}%` } as CSSProperties}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      {...field}
      {...props}
    />
  );
}
