import { Log, LogLine, Timeline, TimelineRow } from "@/components/pipeline/Timeline";
import { findNodeType, formatDuration, type Graph, type Render } from "@/lib/mock";

function durationText(status: string, duration?: number, progress?: number) {
  if (status === "cached") return "cache";
  if (status === "running") return progress !== undefined ? `${Math.round(progress * 100)}%` : "…";
  if (duration === undefined) return "–";
  return formatDuration(duration);
}

/** Per-node Gantt of a render. Bars are placed on the render's own time scale. */
export function RunTimeline({ render, graph, lanes }: { render: Render; graph: Graph; /** Show the cpu/media queue per row. */ lanes?: boolean }) {
  const total = Math.max(
    render.elapsed,
    ...render.nodeRuns.map((run) => (run.start ?? 0) + (run.duration ?? 0)),
  );
  const pct = (seconds: number) => (seconds / total) * 100;

  return (
    <Timeline aria-label="Execução por nó">
      {render.nodeRuns.map((run) => {
        const node = graph.nodes.find((n) => n.id === run.nodeId);
        // running bars grow to "now"; cached runs get a minimum visible width
        const end = run.status === "running" ? render.elapsed : (run.start ?? 0) + (run.duration ?? 0);
        const width = run.start === undefined ? 0 : Math.max(pct(end - run.start), 1.2);
        return (
          <TimelineRow
            key={run.nodeId}
            label={node?.title ?? run.nodeId}
            lane={lanes ? findNodeType(node?.type ?? "")?.queue : undefined}
            status={run.status}
            start={run.start === undefined ? 0 : pct(run.start)}
            width={width}
            duration={durationText(run.status, run.duration, run.progress)}
          />
        );
      })}
    </Timeline>
  );
}

/** SSE event stream of a render. */
export function RunLog({ render }: { render: Render }) {
  return (
    <Log>
      {render.events.map((event) => (
        <LogLine key={event.time + event.text} time={event.time}>
          {event.text}
        </LogLine>
      ))}
    </Log>
  );
}
