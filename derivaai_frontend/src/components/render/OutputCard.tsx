import { Film, Play } from "lucide-react";
import { Badge, Card, CardBody, CardMedia, CardMeta, Icon, StatusBadge } from "@/components/ui";
import { Waveform } from "@/components/pipeline/Media";
import { Curve } from "@/components/lesson/Curve";
import type { NodeOutput, NodeRun } from "@/lib/mock";
import styles from "./Output.module.scss";

interface OutputCardProps {
  title: string;
  run: NodeRun;
  output: NodeOutput;
  /** The render's final video gets the accent frame and "resultado" tag. */
  final?: boolean;
}

/** One blob produced by a node run: plot, narration or video. */
export function OutputCard({ title, run, output, final }: OutputCardProps) {
  return (
    <Card className={styles.card} data-final={final || undefined}>
      <CardMedia className={styles.media}>
        {output.kind === "image" ? <Curve kind="charge" marker={0.2} /> : null}
        {output.kind === "audio" ? <Waveform className={styles.wave} /> : null}
        {output.kind === "video" ? <Icon icon={final ? Play : Film} size={24} className={styles.videoIcon} /> : null}
      </CardMedia>
      <CardBody>
        <h3 className={styles.title}>{title}</h3>
        <CardMeta>
          {final ? (
            <Badge variant="accent">resultado</Badge>
          ) : run.status === "cached" ? (
            <StatusBadge status="cached" />
          ) : (
            <StatusBadge status="succeeded" label="novo" />
          )}
          <span className="mono">
            {[output.mime, output.length ?? output.size].filter(Boolean).join(" · ")}
          </span>
        </CardMeta>
        {output.sha256 ? <span className={styles.sha}>sha256:{output.sha256}</span> : null}
      </CardBody>
    </Card>
  );
}
