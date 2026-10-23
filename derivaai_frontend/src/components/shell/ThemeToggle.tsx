"use client";

import { Moon, Sun } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/lib/use-theme";
import type { Locale } from "@/lib/status";
import styles from "./ThemeToggle.module.scss";

const labels: Record<Locale, Record<"dark" | "light", string>> = {
  "pt-BR": { dark: "Tema escuro", light: "Tema claro" },
  en: { dark: "Dark theme", light: "Light theme" },
};

export function ThemeToggle({ locale = "pt-BR" }: { locale?: Locale }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setTheme(next)}
      title={labels[locale][next]}
      aria-label={labels[locale][next]}
    >
      <Icon icon={theme === "dark" ? Moon : Sun} />
      <span className={styles.label}>{labels[locale][theme]}</span>
    </button>
  );
}
