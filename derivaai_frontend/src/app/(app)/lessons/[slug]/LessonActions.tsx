"use client";

import { useState } from "react";
import { Download, Play, Workflow } from "lucide-react";
import { Button, ButtonLink, SegmentedControl, useToast } from "@/components/ui";
import type { Locale } from "@/lib/status";

const LOCALES: Locale[] = ["pt-BR", "en"];

interface LessonActionsProps {
  pipelineId: string;
  language: Locale;
  renderedLocales: Locale[];
  canDownload: boolean;
}

/** Language switch + actions. A locale without a render turns the primary action into "Renderizar em EN". */
export function LessonActions({ pipelineId, language, renderedLocales, canDownload }: LessonActionsProps) {
  const [lang, setLang] = useState<Locale>(language);
  const { push } = useToast();
  const hasRender = renderedLocales.includes(lang);
  const short = lang === "pt-BR" ? "PT-BR" : "EN";

  const options = LOCALES.map((locale) => {
    const label = locale === "pt-BR" ? "PT-BR" : "EN";
    return { value: locale, label: renderedLocales.includes(locale) ? label : `${label} · sem render` };
  });

  return (
    <>
      <SegmentedControl aria-label="Idioma da lição" options={options} value={lang} onChange={setLang} />
      <ButtonLink href={`/pipelines/${pipelineId}`} icon={Workflow}>
        Abrir pipeline
      </ButtonLink>
      <Button icon={Download} disabled={!canDownload || !hasRender}>
        Baixar MP4
      </Button>
      <Button
        variant="primary"
        icon={Play}
        onClick={() =>
          push({
            title: hasRender ? "Novo render na fila" : `Render em ${short} na fila`,
            description: "Nós sem mudança virão do cache",
            status: "pending",
          })
        }
      >
        {hasRender ? "Renderizar de novo" : `Renderizar em ${short}`}
      </Button>
    </>
  );
}
