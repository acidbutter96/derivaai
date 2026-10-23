"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import styles from "./Field.module.scss";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Props every control inside a <Field> needs: id, aria-describedby, aria-invalid. */
export function useFieldControl() {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};
  return {
    id: ctx.id,
    "aria-describedby": ctx.describedBy,
    "aria-invalid": ctx.invalid || undefined,
  };
}

interface FieldProps {
  label: ReactNode;
  /** Right side of the label row, e.g. "herdado do render" or a live value ("1.00×"). */
  aside?: ReactNode;
  hint?: ReactNode;
  /** Shown under the field in --status-failed; also marks the control invalid. */
  error?: ReactNode;
  children: ReactNode;
}

export function Field({ label, aside, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          <span>{label}</span>
          {aside ? <span className={styles.aside}>{aside}</span> : null}
        </label>
        {children}
        {error ? (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        ) : null}
        {hint ? (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
