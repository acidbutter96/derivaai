"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { Layers } from "lucide-react";
import { Button, StatusBadge } from "@/components/ui";
import { bezierPath, Canvas, CanvasEdges, Edge, Hud, ZoomControls } from "@/components/pipeline/Canvas";
import { NodeCard } from "@/components/pipeline/NodeCard";
import { GraphThumb } from "@/components/pipeline/GraphThumb";
import { findNodeType, renderCounts, type Graph, type Render } from "@/lib/mock";
import { edgeType, inputHandle, NODE_W, outputHandle, type ValidationIssue } from "./graph";
import { NodeBody } from "./NodeBody";
import { DRAG_MIME } from "./NodePalette";
import type { Selection } from "./Editor";
import styles from "./editor.module.scss";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

interface EditorCanvasProps {
  graph: Graph;
  render: Render | null;
  selection: Selection;
  issues: ValidationIssue[];
  onSelect: (selection: Selection) => void;
  onMove: (nodeId: string, x: number, y: number) => void;
  onDrop: (key: string, x: number, y: number) => void;
  onLoadTemplate?: () => void;
}

type Drag =
  | { kind: "node"; id: string; px: number; py: number; nx: number; ny: number; moved: boolean }
  | { kind: "pan"; px: number; py: number; ox: number; oy: number };

export function EditorCanvas({ graph, render, selection, issues, onSelect, onMove, onDrop, onLoadTemplate }: EditorCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const fit = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    const points = Object.values(graph.ui);
    if (!box || points.length === 0) return;
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxX = Math.max(...points.map((p) => p.x)) + NODE_W;
    const maxY = Math.max(...points.map((p) => p.y)) + 220;
    const z = clampZoom(Math.min((box.width - 96) / (maxX - minX), (box.height - 120) / (maxY - minY), 1));
    setZoom(z);
    setPan({ x: (box.width - (maxX - minX) * z) / 2 - minX * z, y: 64 + (box.height - 64 - (maxY - minY) * z) / 2 - minY * z });
  }, [graph.ui]);

  // fit once the canvas has its size; later layout changes keep the user's view
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || graph.nodes.length === 0) return;
    fitted.current = true;
    fit();
  }, [fit, graph.nodes.length]);

  const runs = new Map(render?.nodeRuns.map((run) => [run.nodeId, run]));
  const counts = render ? renderCounts(render) : undefined;
  const invalid = new Set(issues.map((issue) => issue.nodeId));

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const nodeEl = (event.target as HTMLElement).closest<HTMLElement>("[data-node-id]");
    if (nodeEl) {
      const id = nodeEl.dataset.nodeId!;
      const pos = graph.ui[id];
      drag.current = { kind: "node", id, px: event.clientX, py: event.clientY, nx: pos.x, ny: pos.y, moved: false };
      onSelect({ kind: "node", id });
    } else if ((event.target as HTMLElement).closest("[data-edge-index]")) {
      return;
    } else if (!(event.target as HTMLElement).closest("[data-hud]")) {
      drag.current = { kind: "pan", px: event.clientX, py: event.clientY, ox: pan.x, oy: pan.y };
      onSelect(null);
    } else {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.px;
    const dy = event.clientY - d.py;
    if (d.kind === "pan") {
      setPan({ x: d.ox + dx, y: d.oy + dy });
    } else if (d.moved || Math.abs(dx) + Math.abs(dy) > 3) {
      d.moved = true;
      // snap to the 24 px grid
      onMove(d.id, Math.round((d.nx + dx / zoom) / 24) * 24, Math.round((d.ny + dy / zoom) / 24) * 24);
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey) {
      setZoom((z) => clampZoom(z * (event.deltaY > 0 ? 0.9 : 1.1)));
    } else {
      setPan((p) => ({ x: p.x - event.deltaX, y: p.y - event.deltaY }));
    }
  }

  return (
    <div
      ref={ref}
      className={styles.canvasWrap}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_MIME)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={(e) => {
        const key = e.dataTransfer.getData(DRAG_MIME);
        const box = ref.current?.getBoundingClientRect();
        if (!key || !box) return;
        e.preventDefault();
        const x = (e.clientX - box.left - pan.x) / zoom - NODE_W / 2;
        const y = (e.clientY - box.top - pan.y) / zoom - 24;
        onDrop(key, Math.round(x / 24) * 24, Math.round(y / 24) * 24);
      }}
    >
      <Canvas className={styles.canvas} style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}>
        <div className={styles.world} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <CanvasEdges>
            {graph.edges.map((edge, index) => {
              const a = outputHandle(graph, edge.from.node, edge.from.port);
              const b = inputHandle(graph, edge.to.node, edge.to.port);
              return (
                <Edge
                  key={index}
                  d={bezierPath(a.x, a.y, b.x, b.y)}
                  type={edgeType(graph, edge)}
                  flow={runs.get(edge.to.node)?.status === "running"}
                />
              );
            })}
          </CanvasEdges>
          {/* wide invisible strokes so edges can be clicked */}
          <svg className={styles.edgeHits} aria-hidden>
            {graph.edges.map((edge, index) => {
              const a = outputHandle(graph, edge.from.node, edge.from.port);
              const b = inputHandle(graph, edge.to.node, edge.to.port);
              const selected = selection?.kind === "edge" && selection.index === index;
              return (
                <path
                  key={index}
                  data-edge-index={index}
                  d={bezierPath(a.x, a.y, b.x, b.y)}
                  className={styles.edgeHit}
                  data-selected={selected || undefined}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelect({ kind: "edge", index });
                  }}
                />
              );
            })}
          </svg>

          {graph.nodes.map((node) => {
            const def = findNodeType(node.type);
            const run = runs.get(node.id);
            const status = run?.status ?? "pending";
            const linked = (port: string) => graph.edges.some((e) => e.to.node === node.id && e.to.port === port);
            const statusLabel =
              status === "running" && run?.progress !== undefined
                ? `${Math.round(run.progress * 100)}%`
                : status === "succeeded" && run?.duration !== undefined
                  ? `${run.duration.toFixed(1)} s`
                  : undefined;
            return (
              <NodeCard
                key={node.id}
                data-node-id={node.id}
                className={styles.node}
                data-invalid={invalid.has(node.id) || undefined}
                position={graph.ui[node.id]}
                title={node.title}
                nodeKey={node.type}
                version={node.version}
                queue={def?.queue}
                category={def?.category ?? "io"}
                status={status}
                statusLabel={statusLabel}
                selected={selection?.kind === "node" && selection.id === node.id}
                inputs={def?.inputs.map((port) => ({ ...port, linked: port.optional || linked(port.name) }))}
                outputs={def?.outputs}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelect({ kind: "node", id: node.id });
                }}
              >
                <NodeBody node={node} run={run} />
              </NodeCard>
            );
          })}
        </div>

        {graph.nodes.length === 0 ? (
          <div className={styles.empty} data-hud>
            <p>Arraste um nó da paleta ou comece pelo modelo Lição narrada.</p>
            {onLoadTemplate ? (
              <Button icon={Layers} onClick={onLoadTemplate}>
                Usar modelo Lição narrada
              </Button>
            ) : null}
          </div>
        ) : null}

        <Hud position="top-left" data-hud>
          {render && counts ? (
            <StatusBadge
              status={render.status}
              label={render.status === "running" ? `renderizando ${counts.done}/${counts.total}` : undefined}
            />
          ) : (
            <StatusBadge status="pending" label="sem render" />
          )}
          <span className={styles.hudText}>
            {graph.nodes.length} nós · {graph.edges.length} conexões
            {counts && counts.cached > 0 ? ` · ${counts.cached} do cache` : ""}
          </span>
        </Hud>

        {graph.nodes.length > 0 ? (
          <Hud position="bottom-right" className={styles.minimap} data-hud aria-label="Minimapa">
            <GraphThumb graph={graph} runs={render?.nodeRuns} />
          </Hud>
        ) : null}

        <div data-hud>
          <ZoomControls
            zoom={zoom}
            onZoomIn={() => setZoom((z) => clampZoom(z + 0.1))}
            onZoomOut={() => setZoom((z) => clampZoom(z - 0.1))}
            onFit={fit}
          />
        </div>
      </Canvas>
    </div>
  );
}
