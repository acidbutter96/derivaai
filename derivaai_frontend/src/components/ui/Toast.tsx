"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { StatusDot } from "./Badge";
import { Button } from "./Button";
import { Icon } from "./Icon";
import type { Status } from "@/lib/status";
import styles from "./Toast.module.scss";

const AUTO_DISMISS_MS = 5000;

export interface ToastInput {
  title: ReactNode;
  description?: ReactNode;
  status?: Status;
  /** A toast with an action stays until dismissed. */
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Bottom-right, 340 px, auto-dismiss 5 s unless it carries an action. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback((toast: ToastInput) => {
    setToasts((all) => [...all, { ...toast, id: Date.now() + Math.random() }]);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, dismiss }: { toast: ToastItem; dismiss: (id: number) => void }) {
  const { id, action } = toast;

  useEffect(() => {
    if (action) return;
    const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, action, dismiss]);

  return <Toast {...toast} onDismiss={() => dismiss(id)} />;
}

interface ToastProps extends ToastInput {
  onDismiss?: () => void;
}

/** Presentational toast (also used directly in the Elements demo page). */
export function Toast({ title, description, status, action, onDismiss }: ToastProps) {
  return (
    <div className={styles.toast} role="status">
      {status ? <StatusDot status={status} className={styles.dot} /> : null}
      <div className={styles.text}>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
        {action ? (
          <Button size="sm" variant="primary" onClick={action.onClick} className={styles.action}>
            {action.label}
          </Button>
        ) : null}
      </div>
      {onDismiss ? (
        <Button size="sm" variant="ghost" iconOnly aria-label="Dismiss" onClick={onDismiss}>
          <Icon icon={X} size={14} />
        </Button>
      ) : null}
    </div>
  );
}
