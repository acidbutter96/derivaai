"use client";

import { useState, type ReactNode } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Lesson } from "@/lib/mock";
import { LessonCard } from "./LessonCard";
import styles from "./Lesson.module.scss";

type LangFilter = "all" | "pt-BR" | "en";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pt-BR", label: "PT-BR" },
  { value: "en", label: "EN" },
] as const;

/** Lesson grid with the language filter: 4 columns ≥ 1280 px, 3 ≥ 1024, 2 ≥ 640, 1 below. */
export function LessonGrid({ lessons, title, aside }: { lessons: Lesson[]; title: ReactNode; aside?: ReactNode }) {
  const [lang, setLang] = useState<LangFilter>("all");
  const visible = lang === "all" ? lessons : lessons.filter((lesson) => lesson.language === lang);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <SegmentedControl aria-label="Filtrar lições por idioma" options={FILTERS} value={lang} onChange={setLang} />
        <span className={styles.spacer} />
        {aside}
      </div>
      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Nenhuma lição neste idioma.</p>
      )}
    </section>
  );
}
