"use client";

import { Play, Square, Upload, Workflow } from "lucide-react";
import { Button, ButtonLink, useToast } from "@/components/ui";

interface RenderActionsProps {
  renderId: string;
  pipelineId: string;
  version: number;
  running: boolean;
  /** Lesson title when this render can be published to it. */
  publishTo?: string;
  published?: boolean;
}

/** Header actions. Mocked: they only confirm with a toast. */
export function RenderActions({ renderId, pipelineId, version, running, publishTo, published }: RenderActionsProps) {
  const { push } = useToast();

  return (
    <>
      <ButtonLink href={`/pipelines/${pipelineId}?v=${version}`} icon={Workflow}>
        Abrir v{version} no editor
      </ButtonLink>
      {running ? (
        <Button
          variant="danger"
          icon={Square}
          onClick={() => push({ title: `Render ${renderId} cancelado`, description: "Nós pendentes marcados como cancelados", status: "canceled" })}
        >
          Cancelar
        </Button>
      ) : (
        <Button
          icon={Play}
          variant={publishTo && !published ? "default" : "primary"}
          onClick={() => push({ title: "Novo render na fila", description: `v${version} · nós sem mudança virão do cache`, status: "pending" })}
        >
          Renderizar de novo
        </Button>
      )}
      {publishTo && !published ? (
        <Button
          variant="primary"
          icon={Upload}
          onClick={() => push({ title: "Publicado na lição", description: `${publishTo} agora usa ${renderId}`, status: "succeeded" })}
        >
          Publicar na lição
        </Button>
      ) : null}
    </>
  );
}
