import { Play } from "lucide-react";
import { Icon } from "@/components/ui";
import { Formula, Waveform } from "@/components/pipeline/Media";
import { NodeError, NodePreview, NodeProgress } from "@/components/pipeline/NodeCard";
import { findNodeType, type GraphNode, type NodeRun } from "@/lib/mock";
import styles from "./editor.module.scss";

const DEFAULT_SOLUTION = "V(t)=V_0\\left(1-e^{-t/RC}\\right)";

/** Inline content of a node on the canvas: config summary, last output, progress or error. */
export function NodeBody({ node, run }: { node: GraphNode; run?: NodeRun }) {
  if (run?.status === "failed") {
    return <NodeError action="Abrir no inspetor">{run.error ?? "Falhou"}</NodeError>;
  }

  const progress = run?.status === "running" ? <NodeProgress value={run.progress ?? 0} /> : null;
  const done = run?.status === "succeeded" || run?.status === "cached";

  switch (node.type) {
    case "io.params": {
      const fields = findNodeType(node.type)?.config ?? [];
      return (
        <NodePreview className={styles.params}>
          {Object.entries(node.config).map(([name, value]) => {
            const field = fields.find((f) => f.name === name);
            const unit = field?.kind === "number" ? field.unit : undefined;
            return (
              <span key={name} className={styles.paramRow}>
                <span>{name}</span>
                <span>{unit ? `${value} ${unit}` : value}</span>
              </span>
            );
          })}
        </NodePreview>
      );
    }
    case "io.text":
      return <NodePreview className={styles.text}>{String(node.config.text || "Roteiro vazio")}</NodePreview>;
    case "math.solve_ode":
    case "math.simplify": {
      const tex = run?.outputs?.find((o) => o.kind === "expr")?.value ?? DEFAULT_SOLUTION;
      return (
        <NodePreview formula>
          <Formula tex={tex} />
        </NodePreview>
      );
    }
    case "plot.function":
    case "plot.series":
      return (
        <NodePreview>
          <svg viewBox="0 0 220 70" width="100%" height="70" role="img" aria-label="Gráfico">
            <path d="M8 62 C 40 14, 90 10, 212 8" fill="none" stroke="var(--port-series)" strokeWidth="2" opacity={done ? 1 : 0.35} />
          </svg>
        </NodePreview>
      );
    case "tts.narrate":
      return (
        <>
          <NodePreview className={styles.audio}>
            <Icon icon={Play} size={12} />
            <Waveform />
            <span className="mono faint">{run?.outputs?.find((o) => o.kind === "audio")?.length ?? "–:––"}</span>
          </NodePreview>
          {progress}
        </>
      );
    case "anim.rc_charging":
    case "anim.scene":
    case "video.compose":
      return (
        <>
          <NodePreview className={styles.video}>
            {done ? (
              <span>
                {run?.outputs?.[0]?.length ?? "1:52"} · {run?.outputs?.[0]?.size ?? "mp4"}
              </span>
            ) : run?.status === "running" ? (
              <span>renderizando quadros…</span>
            ) : run?.status === "skipped" ? (
              <span>pulado: entrada falhou</span>
            ) : (
              <span>aguardando entradas</span>
            )}
          </NodePreview>
          {progress}
        </>
      );
    default:
      return progress;
  }
}
