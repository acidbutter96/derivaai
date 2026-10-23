"use client";

import { useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
}

interface TabsProps<T extends string> {
  tabs: ReadonlyArray<TabItem<T>>;
  value: T;
  onChange: (id: T) => void;
  /** Prefix for ids, so <TabPanel> can be linked: `${idPrefix}-tab-${id}`. */
  idPrefix: string;
  "aria-label": string;
  className?: string;
}

/** 2 px accent underline on the selected tab; arrow keys / Home / End move between tabs. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  idPrefix,
  className,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className={clsx(styles.tabs, className)}>
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps extends ComponentProps<"div"> {
  idPrefix: string;
  id: string;
  active: boolean;
}

export function TabPanel({ idPrefix, id, active, ...props }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-tab-${id}`}
      hidden={!active}
      {...props}
    />
  );
}
