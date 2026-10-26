"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { History, Play, Save } from "lucide-react";
import { Crumbs, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import { Badge, Button, SegmentedControl, StatusBadge, useToast } from "@/components/ui";
import type { ConfigValue, Graph, NodeTypeDef, Pipeline, PipelineVersion, Render } from "@/lib/mock";
import type { Locale } from "@/lib/status";
import { defaultConfig, downstream, validate } from "./graph";
import { advance, cancel } from "./simulate";
import { EditorCanvas } from "./EditorCanvas";
import { Inspector } from "./Inspector";
import { Dock, type DockTab } from "./Dock";
import { NodePalette } from "./NodePalette";
import styles from "./editor.module.scss";

export type Selection = { kind: "node"; id: string } | { kind: "edge"; index: number } | null;

const TICK_MS = 700;

const LANGS = [
  { value: "pt-BR", label: "PT-BR" },
  { value: "en", label: "EN" },
] as const;

interface EditorProps {
  pipeline: Pipeline;
  renders: Render[];
  catalog: NodeTypeDef[];
  template?: Graph;
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function Editor({ pipeline, renders, catalog, template }: EditorProps) {
  const { push } = useToast();
  const requested = Number(useSearchParams().get("v")) || pipeline.headVersion;

  const [graph, setGraph] = useState<Graph>(pipeline.graph);
  const [version, setVersion] = useState(requested);
  const [versions, setVersions] = useState<PipelineVersion[]>(pipeline.versions);
  const [dirty, setDirty] = useState(false);
  /** Nodes whose config changed since the last render: they and their downstream re-run. */
  const [changed, setChanged] = useState<Set<string>>(() => new Set());
  const [selection, setSelection] = useState<Selection>(() => {
    const first = pipeline.graph.nodes.find((n) => n.type === "tts.narrate") ?? pipeline.graph.nodes[0];
    return first ? { kind: "node", id: first.id } : null;
  });
  const [render, setRender] = useState<Render | null>(
    () => renders.find((r) => r.version === requested) ?? renders[0] ?? null,
  );
  const [lang, setLang] = useState<Locale>(render?.language ?? "pt-BR");
  const [panels, setPanels] = useState({ palette: true, inspector: true, dock: true });
  const [dockTab, setDockTab] = useState<DockTab>("run");
  const [cacheable, setCacheable] = useState<ReadonlySet<string>>(() => new Set());
  const renderSeq = useRef(193);
  const searchRef = useRef<HTMLInputElement>(null);

  const issues = useMemo(() => validate(graph), [graph]);
  const running = render?.status === "running";
  // versions saved in this session are newer than the server's head
  const head = Math.max(...versions.map((v) => v.number));

  // ---------- live render (mock SSE) ----------
  const graphRef = useRef(graph);
  const cacheableRef = useRef(cacheable);
  useEffect(() => {
    graphRef.current = graph;
    cacheableRef.current = cacheable;
  }, [graph, cacheable]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setRender((current) => (current ? advance(current, graphRef.current, cacheableRef.current) : current));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  const lastStatus = useRef(render?.status);
  useEffect(() => {
    if (lastStatus.current === "running" && render?.status === "succeeded") {
      const cached = render.nodeRuns.filter((run) => run.status === "cached").length;
      push({
        title: `Render ${render.id} concluído`,
        description: `${render.nodeRuns.length} nós · ${cached} do cache`,
        status: "succeeded",
      });
    }
    lastStatus.current = render?.status;
  }, [render, push]);

  // ---------- graph edits ----------
  const markChanged = useCallback((ids: string[]) => {
    setDirty(true);
    setChanged((prev) => new Set([...prev, ...ids]));
  }, []);

  const updateConfig = useCallback(
    (nodeId: string, name: string, value: ConfigValue) => {
      setGraph((g) => ({
        ...g,
        nodes: g.nodes.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, [name]: value } } : n)),
      }));
      markChanged([nodeId]);
    },
    [markChanged],
  );

  const renameNode = useCallback((nodeId: string, title: string) => {
    setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === nodeId ? { ...n, title } : n)) }));
    setDirty(true);
  }, []);

  // positions live in `ui`: they change the version but never the cache
  const moveNode = useCallback((nodeId: string, x: number, y: number) => {
    setGraph((g) => ({ ...g, ui: { ...g.ui, [nodeId]: { x, y } } }));
    setDirty(true);
  }, []);

  const addNode = useCallback(
    (key: string, x: number, y: number) => {
      const def = catalog.find((d) => d.key === key);
      if (!def) return;
      const base = key.split(".")[1];
      let n = 1;
      while (graph.nodes.some((node) => node.id === `${base}_${n}`)) n += 1;
      const id = `${base}_${n}`;
      setGraph((g) => ({
        ...g,
        nodes: [...g.nodes, { id, type: key, version: def.version, title: def.label, config: defaultConfig(def) }],
        ui: { ...g.ui, [id]: { x, y } },
      }));
      markChanged([id]);
      setSelection({ kind: "node", id });
    },
    [catalog, graph.nodes, markChanged],
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      const targets = graph.edges.filter((e) => e.from.node === nodeId).map((e) => e.to.node);
      setGraph((g) => ({
        nodes: g.nodes.filter((n) => n.id !== nodeId),
        edges: g.edges.filter((e) => e.from.node !== nodeId && e.to.node !== nodeId),
        ui: Object.fromEntries(Object.entries(g.ui).filter(([id]) => id !== nodeId)),
      }));
      markChanged(targets);
      setSelection(null);
    },
    [graph.edges, markChanged],
  );

  const connect = useCallback(
    (from: { node: string; port: string }, to: { node: string; port: string }) => {
      // an input port accepts one edge: connecting replaces the previous one
      setGraph((g) => ({
        ...g,
        edges: [...g.edges.filter((e) => !(e.to.node === to.node && e.to.port === to.port)), { from, to }],
      }));
      markChanged([to.node]);
    },
    [markChanged],
  );

  const removeEdge = useCallback(
    (index: number) => {
      const edge = graph.edges[index];
      setGraph((g) => ({ ...g, edges: g.edges.filter((_, i) => i !== index) }));
      if (edge) markChanged([edge.to.node]);
      setSelection(null);
    },
    [graph.edges, markChanged],
  );

  const loadTemplate = useCallback(() => {
    if (!template) return;
    setGraph(template);
    markChanged(template.nodes.map((n) => n.id));
    setSelection(template.nodes[0] ? { kind: "node", id: template.nodes[0].id } : null);
  }, [template, markChanged]);

  // ---------- save / render ----------
  const save = useCallback(() => {
    if (!dirty) {
      push({ title: "Nada para salvar", description: `O grafo é igual à v${version}`, status: "succeeded" });
      return version;
    }
    const next = head + 1;
    const hash = Math.random().toString(16).slice(2, 6);
    setVersions((list) => [
      { number: next, graphHash: `${hash}…${hash.split("").reverse().join("")}`, createdAgo: "agora", author: "Marcos", changes: changed.size },
      ...list,
    ]);
    setVersion(next);
    setDirty(false);
    push({
      title: `Versão v${next} salva`,
      description: changed.size === 1 ? "1 nó alterado" : `${changed.size} nós alterados`,
      status: "succeeded",
    });
    return next;
  }, [dirty, version, head, changed, push]);

  const startRender = useCallback(() => {
    if (running) return;
    if (issues.length > 0) {
      const first = issues[0];
      push({
        title: "Grafo inválido",
        description: `${graph.nodes.find((n) => n.id === first.nodeId)?.title}: ${first.message}`,
        status: "failed",
        action: { label: "Ver nó", onClick: () => setSelection({ kind: "node", id: first.nodeId }) },
      });
      return;
    }
    const v = save();
    const rerun = downstream(graph, changed);
    const hadRun = new Set(
      (render?.nodeRuns ?? []).filter((r) => r.status === "succeeded" || r.status === "cached").map((r) => r.nodeId),
    );
    setCacheable(new Set(graph.nodes.map((n) => n.id).filter((id) => hadRun.has(id) && !rerun.has(id))));
    setChanged(new Set());
    const id = `r-0${renderSeq.current++}`;
    setRender({
      id,
      pipelineId: pipeline.id,
      version: v,
      language: lang,
      status: "running",
      startedAgo: "agora",
      by: "Marcos",
      elapsed: 0,
      savedByCache: 0,
      nodeRuns: graph.nodes.map((n) => ({ nodeId: n.id, status: "pending" })),
      events: [{ time: "00:00.00", text: `render ${id} criado (v${v}, ${lang})` }],
    });
    setPanels((p) => ({ ...p, dock: true }));
    setDockTab("run");
  }, [running, issues, graph, changed, render, save, pipeline.id, lang, push]);

  const cancelRender = useCallback(() => {
    setRender((current) => (current ? cancel(current) : current));
    push({ title: "Render cancelado", description: "Nós pendentes marcados como cancelados", status: "canceled" });
  }, [push]);

  // ---------- keyboard map (layout.md) ----------
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key === "s") {
        event.preventDefault();
        save();
        return;
      }
      if (mod && event.key === "Enter") {
        event.preventDefault();
        startRender();
        return;
      }
      if (isTyping(event.target) || mod) return;
      if (event.key === "[") setPanels((p) => ({ ...p, palette: !p.palette }));
      else if (event.key === "]") setPanels((p) => ({ ...p, inspector: !p.inspector }));
      else if (event.key === "`") setPanels((p) => ({ ...p, dock: !p.dock }));
      else if (event.key === "/") {
        event.preventDefault();
        setPanels((p) => ({ ...p, palette: true }));
        requestAnimationFrame(() => searchRef.current?.focus());
      } else if ((event.key === "Delete" || event.key === "Backspace") && selection) {
        if (selection.kind === "node") removeNode(selection.id);
        else removeEdge(selection.index);
      } else if (event.key === "Escape") setSelection(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, startRender, selection, removeNode, removeEdge]);

  const selectedNode = selection?.kind === "node" ? graph.nodes.find((n) => n.id === selection.id) : undefined;

  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Pipelines", href: "/pipelines" }, { label: pipeline.name }]} />
        <Badge>v{version}</Badge>
        {version !== head && !dirty ? <Badge variant="accent">versão antiga</Badge> : null}
        {dirty ? <StatusBadge status="warning" /> : null}
        {issues.length === 0 ? (
          <StatusBadge status="succeeded" label="grafo válido" />
        ) : (
          <StatusBadge status="failed" label={`${issues.length} ${issues.length === 1 ? "problema" : "problemas"}`} />
        )}
        <TopbarSpacer />
        <SegmentedControl aria-label="Idioma do render" options={LANGS} value={lang} onChange={setLang} />
        <Button
          variant="ghost"
          icon={History}
          onClick={() => {
            setPanels((p) => ({ ...p, dock: true }));
            setDockTab("versions");
          }}
        >
          Histórico
        </Button>
        <Button icon={Save} kbd="⌘S" onClick={save}>
          Salvar
        </Button>
        <Button variant="primary" icon={Play} kbd="⌘↵" onClick={startRender} disabled={running}>
          Renderizar
        </Button>
      </Topbar>

      <p className={styles.readOnly}>Em telas menores que 1024 px o editor é somente leitura: veja o grafo e acompanhe o render.</p>

      <div
        className={styles.editor}
        data-palette={panels.palette || undefined}
        data-inspector={panels.inspector || undefined}
        data-dock={panels.dock || undefined}
      >
        {panels.palette ? <NodePalette catalog={catalog} searchRef={searchRef} /> : null}

        <div className={styles.center}>
          <EditorCanvas
            graph={graph}
            render={render}
            selection={selection}
            issues={issues}
            onSelect={setSelection}
            onMove={moveNode}
            onDrop={addNode}
            onLoadTemplate={template ? loadTemplate : undefined}
          />
          {panels.dock ? (
            <Dock
              tab={dockTab}
              onTab={setDockTab}
              render={render}
              graph={graph}
              versions={versions}
              currentVersion={version}
              renders={renders}
              onCancel={cancelRender}
            />
          ) : null}
        </div>

        {panels.inspector ? (
          <Inspector
            graph={graph}
            catalog={catalog}
            selection={selection}
            node={selectedNode}
            run={selectedNode ? render?.nodeRuns.find((r) => r.nodeId === selectedNode.id) : undefined}
            issues={issues}
            pipeline={pipeline}
            onConfig={updateConfig}
            onRename={renameNode}
            onConnect={connect}
            onRemoveEdge={removeEdge}
            onRemoveNode={removeNode}
            onRunUntil={(title) =>
              push({ title: `Executando até “${title}”`, description: "Só este nó e os anteriores; o resto fica igual", status: "running" })
            }
          />
        ) : null}
      </div>
    </>
  );
}
