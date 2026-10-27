import type { CurveKind } from "@/lib/mock";

const curves: Record<CurveKind, { d: string; color: string; label: string }> = {
  charge: { d: "M10 100 C 40 30, 90 22, 190 20", color: "var(--port-series)", label: "Curva de carga" },
  decay: { d: "M10 14 C 40 72, 90 92, 190 96", color: "var(--status-running)", label: "Curva de descarga" },
  wave: {
    d: "M10 56 C 25 0, 55 0, 70 56 S 115 112, 130 56 S 175 0, 190 56",
    color: "var(--status-cached)",
    label: "Oscilação",
  },
  line: { d: "M10 100 L 190 16", color: "var(--status-succeeded)", label: "Reta" },
};

/** Lesson thumbnail: the lesson's main curve on the inset background (16:9). */
export function Curve({ kind, marker }: { kind: CurveKind; /** Dashed vertical line at x (0–1), e.g. t = τ. */ marker?: number }) {
  const curve = curves[kind];
  return (
    <svg viewBox="0 0 200 112" width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label={curve.label}>
      {marker !== undefined ? (
        <line
          x1={10 + marker * 180}
          x2={10 + marker * 180}
          y1={8}
          y2={108}
          stroke="var(--accent)"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <path d={curve.d} fill="none" stroke={curve.color} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
