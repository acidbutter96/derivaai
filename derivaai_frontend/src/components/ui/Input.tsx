"use client";

import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown, Search } from "lucide-react";
import { useFieldControl } from "./Field";
import { Icon } from "./Icon";
import { Kbd } from "./Kbd";
import styles from "./Input.module.scss";

interface InputProps extends ComponentProps<"input"> {
  /** Mono face for numeric values, ids and hashes. */
  mono?: boolean;
  invalid?: boolean;
  /** Fixed suffix such as "kΩ" or "ms". Units are never typed by the user. */
  unit?: ReactNode;
}

export function Input({ mono, invalid, unit, className, ...props }: InputProps) {
  const field = useFieldControl();
  const input = (
    <input
      className={clsx(styles.input, mono && styles.mono, (invalid || field["aria-invalid"]) && styles.invalid, className)}
      {...field}
      {...props}
    />
  );
  if (!unit) return input;
  return (
    <div className={styles.group}>
      {input}
      <span className={styles.unit}>{unit}</span>
    </div>
  );
}

export function Textarea({
  mono,
  invalid,
  className,
  ...props
}: ComponentProps<"textarea"> & { mono?: boolean; invalid?: boolean }) {
  const field = useFieldControl();
  return (
    <textarea
      className={clsx(
        styles.input,
        styles.textarea,
        mono && styles.mono,
        (invalid || field["aria-invalid"]) && styles.invalid,
        className,
      )}
      {...field}
      {...props}
    />
  );
}

export function Select({ invalid, className, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  const field = useFieldControl();
  return (
    <div className={styles.select}>
      <select
        className={clsx(styles.input, (invalid || field["aria-invalid"]) && styles.invalid, className)}
        {...field}
        {...props}
      >
        {children}
      </select>
      <Icon icon={ChevronDown} size={14} className={styles.chevron} />
    </div>
  );
}

interface SearchInputProps extends Omit<ComponentProps<"input">, "type"> {
  /** Shortcut hint shown at the right, e.g. "/" or "⌘K". */
  kbd?: string;
}

export function SearchInput({ kbd, className, ...props }: SearchInputProps) {
  return (
    <div className={clsx(styles.search, className)}>
      <Icon icon={Search} size={14} className={styles.searchIcon} />
      <input type="search" className={clsx(styles.input, kbd && styles.withKbd)} {...props} />
      {kbd ? <Kbd className={styles.searchKbd}>{kbd}</Kbd> : null}
    </div>
  );
}
