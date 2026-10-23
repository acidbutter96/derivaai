import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { Play } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Icon } from "@/components/ui/Icon";
import { LangTag } from "@/components/ui/Badge";
import styles from "./Media.module.scss";

interface FormulaProps extends ComponentProps<"span"> {
  /** LaTeX source, e.g. `V(t)=V_0\left(1-e^{-t/RC}\right)`. */
  tex: string;
  display?: boolean;
}

/** Formulas are first-class: rendered with KaTeX on the server, never as plain text. */
export function Formula({ tex, display, className, ...props }: FormulaProps) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "htmlAndMathml" });
  return <span className={clsx(styles.formula, className)} dangerouslySetInnerHTML={{ __html: html }} {...props} />;
}

const DEFAULT_BARS = [
  30, 55, 80, 45, 90, 60, 35, 75, 100, 65, 40, 85, 55, 70, 30, 95, 50, 80, 45, 60, 85, 40, 70, 55, 90, 35, 65, 75,
];

interface WaveformProps extends ComponentProps<"div"> {
  /** Bar heights in percent (0–100). */
  bars?: number[];
}

export function Waveform({ bars = DEFAULT_BARS, className, ...props }: WaveformProps) {
  return (
    <div className={clsx(styles.wave, className)} role="img" aria-label="Audio waveform" {...props}>
      {bars.map((height, index) => (
        <i key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

interface PlayerProps {
  /** Poster or <video>; fills the 16:9 frame. */
  children?: ReactNode;
  /** 0–1 */
  progress?: number;
  current?: string;
  duration?: string;
  lang?: string;
}

/** 16:9 frame with the amber progress bar and language tag. Playback controls arrive with the real <video>. */
export function Player({ children, progress = 0, current = "0:00", duration = "0:00", lang }: PlayerProps) {
  return (
    <div className={styles.player}>
      {children}
      <div className={styles.bar}>
        <Icon icon={Play} size={14} />
        <div className={styles.track}>
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="mono">
          {current} / {duration}
        </span>
        {lang ? <LangTag className={styles.lang}>{lang}</LangTag> : null}
      </div>
    </div>
  );
}
