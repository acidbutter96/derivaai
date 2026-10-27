"use client";

import { useState } from "react";
import { Film, Play, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  Icon,
  Input,
  Kbd,
  Panel,
  PanelBody,
  PanelHead,
  PanelSection,
  Select,
  Slider,
  StatusBadge,
  TabPanel,
  Tabs,
  Textarea,
} from "@/components/ui";
import { Formula, Waveform } from "@/components/pipeline/Media";
import { Handle, Port } from "@/components/pipeline/Port";
import { Curve } from "@/components/lesson/Curve";
import type { ConfigField, ConfigValue, Graph, GraphNode, NodeOutput, NodeRun, NodeTypeDef, Pipeline } from "@/lib/mock";
import { edgeType, type ValidationIssue } from "./graph";
import type { Selection } from "./Editor";
import styles from "./editor.module.scss";

type InspectorTab = "config" | "ports" | "output";

const TABS = [
  { id: "config", label: "Config" },
  { id: "ports", label: "Portas" },
  { id: "output", label: "Saída" },
] as const;

const SHORTCUTS: Array<[string, string]> = [
  ["⌘S / ⌘↵", "Salvar / Renderizar"],
  ["/", "Buscar nós"],
  ["[ ] `", "Paleta, inspetor, dock"],
  ["Delete", "Remover seleção"],
  ["⌘ + roda", "Zoom"],
];

interface InspectorProps {
  graph: Graph;
  catalog: NodeTypeDef[];
  selection: Selection;
  node?: GraphNode;
  run?: NodeRun;
  issues: ValidationIssue[];
  pipeline: Pipeline;
  onConfig: (nodeId: string, name: string, value: ConfigValue) => void;
  onRename: (nodeId: string, title: string) => void;
  onConnect: (from: { node: string; port: string }, to: { node: string; port: string }) => void;
  onRemoveEdge: (index: number) => void;
  onRemoveNode: (nodeId: string) => void;
  onRunUntil: (title: string) => void;
}

export function Inspector(props: InspectorProps) {
  const { graph, selection, node, pipeline, issues } = props;
  return (
    <Panel className={styles.inspector} aria-label="Inspetor">
      {node ? (
        <NodeInspector key={node.id} {...props} node={node} />
      ) : selection?.kind === "edge" && graph.edges[selection.index] ? (
        <EdgeInspector graph={graph} index={selection.index} onRemove={props.onRemoveEdge} />
      ) : (
        <>
          <PanelHead>
            <span className={styles.inspectorTitle}>Pipeline</span>
          </PanelHead>
          <PanelBody>
            <PanelSection>
              <h2 className={styles.nodeTitle}>{pipeline.name}</h2>
              <p className={styles.description}>{pipeline.description}</p>
            </PanelSection>
            <PanelSection>
              <span className="eyebrow">Validação</span>
              {issues.length === 0 ? (
                <StatusBadge status="succeeded" label="grafo válido" />
              ) : (
                <ul className={styles.issues}>
                  {issues.map((issue) => (
                    <li key={issue.nodeId + issue.message}>
                      <strong>{graph.nodes.find((n) => n.id === issue.nodeId)?.title}</strong>: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </PanelSection>
            <PanelSection>
              <span className="eyebrow">Atalhos</span>
              <dl className={styles.shortcuts}>
                {SHORTCUTS.map(([keys, action]) => (
                  <div key={keys}>
                    <dt>
                      <Kbd>{keys}</Kbd>
                    </dt>
                    <dd>{action}</dd>
                  </div>
                ))}
              </dl>
            </PanelSection>
          </PanelBody>
        </>
      )}
    </Panel>
  );
}

function NodeInspector({
  graph,
  catalog,
  node,
  run,
  issues,
  onConfig,
  onRename,
  onConnect,
  onRemoveNode,
  onRunUntil,
}: InspectorProps & { node: GraphNode }) {
  const [tab, setTab] = useState<InspectorTab>("config");
  const def = catalog.find((d) => d.key === node.type);
  const nodeIssues = issues.filter((issue) => issue.nodeId === node.id);

  return (
    <>
      <PanelHead>
        <Tabs idPrefix="inspector" aria-label="Inspetor" tabs={TABS} value={tab} onChange={setTab} className={styles.tabs} />
      </PanelHead>
      <PanelBody>
        <PanelSection>
          <div className={styles.nodeHead} data-category={def?.category}>
            <div>
              <h2 className={styles.nodeTitle}>{node.title}</h2>
              <span className="mono faint">
                {node.type} · v{node.version} · fila {def?.queue}
              </span>
            </div>
            <StatusBadge status={run?.status ?? "pending"} />
          </div>
          {def ? <p className={styles.description}>{def.description}</p> : null}
          {nodeIssues.map((issue) => (
            <p key={issue.message} className={styles.issue}>
              {issue.message}
            </p>
          ))}
          {run?.error ? <p className={styles.issue}>{run.error}</p> : null}
        </PanelSection>

        <TabPanel idPrefix="inspector" id="config" active={tab === "config"} className={styles.tabPanel}>
          <Field label="Rótulo">
            <Input value={node.title} onChange={(e) => onRename(node.id, e.target.value)} />
          </Field>
          {def?.config.map((field) => (
            <ConfigInput key={field.name} field={field} value={node.config[field.name]} onChange={(v) => onConfig(node.id, field.name, v)} />
          ))}
          {def && def.config.length === 0 ? <p className={styles.description}>Este nó não tem configuração.</p> : null}
        </TabPanel>

        <TabPanel idPrefix="inspector" id="ports" active={tab === "ports"} className={styles.tabPanel}>
          <span className="eyebrow">Entradas</span>
          {def?.inputs.length ? (
            def.inputs.map((port) => {
              const edge = graph.edges.find((e) => e.to.node === node.id && e.to.port === port.name);
              const source = edge ? graph.nodes.find((n) => n.id === edge.from.node) : undefined;
              const candidates = graph.nodes.flatMap((other) =>
                other.id === node.id
                  ? []
                  : (catalog.find((d) => d.key === other.type)?.outputs ?? [])
                      .filter((out) => out.type === port.type)
                      .map((out) => ({ value: `${other.id}.${out.name}`, label: `${other.title} · ${out.name}` })),
              );
              return (
                <div key={port.name} className={styles.portRow}>
                  <div className={styles.portBox}>
                    <Port port={{ ...port, linked: Boolean(edge) || port.optional }} side="in" />
                  </div>
                  <Select
                    aria-label={`Conectar ${port.name}`}
                    value={edge ? `${edge.from.node}.${edge.from.port}` : ""}
                    onChange={(e) => {
                      const [fromNode, fromPort] = e.target.value.split(".");
                      if (fromNode) onConnect({ node: fromNode, port: fromPort }, { node: node.id, port: port.name });
                    }}
                  >
                    <option value="" disabled>
                      {candidates.length > 0 ? "Sem conexão: escolha uma saída" : `Nenhuma saída ${port.type}`}
                    </option>
                    {candidates.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                  {source ? null : port.optional ? (
                    <span className={styles.description}>opcional</span>
                  ) : (
                    <span className={styles.issue}>obrigatória</span>
                  )}
                </div>
              );
            })
          ) : (
            <p className={styles.description}>Sem entradas.</p>
          )}
          <span className="eyebrow">Saídas</span>
          {def?.outputs.map((port) => {
            const targets = graph.edges
              .filter((e) => e.from.node === node.id && e.from.port === port.name)
              .map((e) => `${graph.nodes.find((n) => n.id === e.to.node)?.title} · ${e.to.port}`);
            return (
              <div key={port.name} className={styles.portRow}>
                <div className={styles.portBox}>
                  <Port port={port} side="out" />
                </div>
                <span className={styles.description}>{targets.length > 0 ? `→ ${targets.join(", ")}` : "não usada"}</span>
              </div>
            );
          })}
        </TabPanel>

        <TabPanel idPrefix="inspector" id="output" active={tab === "output"} className={styles.tabPanel}>
          {run?.outputs?.length ? (
            run.outputs.map((output) => <OutputView key={output.port} output={output} cacheKey={run.cacheKey} />)
          ) : (
            <p className={styles.description}>Sem saída ainda. Renderize o pipeline para ver o resultado deste nó.</p>
          )}
        </TabPanel>
      </PanelBody>
      <div className={styles.inspectorFooter}>
        <Button icon={Play} onClick={() => onRunUntil(node.title)} className={styles.grow}>
          Executar até aqui
        </Button>
        <Button iconOnly variant="danger" aria-label="Remover nó" title="Remover nó (Delete)" onClick={() => onRemoveNode(node.id)}>
          <Icon icon={Trash2} />
        </Button>
      </div>
    </>
  );
}

function ConfigInput({ field, value, onChange }: { field: ConfigField; value: ConfigValue | undefined; onChange: (v: ConfigValue) => void }) {
  switch (field.kind) {
    case "textarea":
      return (
        <Field label={field.label} hint={field.hint}>
          <Textarea rows={5} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "number":
      return (
        <Field label={field.label} hint={field.hint}>
          <Input
            mono
            unit={field.unit}
            inputMode="decimal"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "select":
      return (
        <Field label={field.label} hint={field.hint} aside={value === "render" ? "herdado do render" : undefined}>
          <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "slider": {
      const n = Number(value ?? field.min);
      return (
        <Field label={field.label} hint={field.hint} aside={`${n.toFixed(2)}${field.suffix ?? ""}`}>
          <Slider value={n} onValueChange={onChange} min={field.min} max={field.max} step={field.step} />
        </Field>
      );
    }
    default:
      return (
        <Field label={field.label} hint={field.hint}>
          <Input mono value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
  }
}

function OutputView({ output, cacheKey }: { output: NodeOutput; cacheKey?: string }) {
  return (
    <div className={styles.output}>
      <span className="eyebrow">Última saída · {output.port}</span>
      <div className={styles.outputPreview}>
        {output.kind === "audio" ? <Waveform /> : null}
        {output.kind === "image" ? (
          <div className={styles.outputImage}>
            <Curve kind="charge" marker={0.2} />
          </div>
        ) : null}
        {output.kind === "video" ? <Icon icon={Film} size={20} /> : null}
        {output.kind === "expr" && output.value ? <Formula tex={output.value} /> : null}
        {(output.kind === "text" || output.kind === "params") && output.value ? <span className="mono">{output.value}</span> : null}
      </div>
      <dl className={styles.meta}>
        {output.sha256 ? (
          <div>
            <dt>blob</dt>
            <dd>sha256:{output.sha256}</dd>
          </div>
        ) : null}
        {output.mime ? (
          <div>
            <dt>formato</dt>
            <dd>
              {output.mime}
              {output.size ? ` · ${output.size}` : ""}
              {output.length ? ` · ${output.length}` : ""}
            </dd>
          </div>
        ) : null}
        {cacheKey ? (
          <div>
            <dt>cache key</dt>
            <dd>{cacheKey}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function EdgeInspector({ graph, index, onRemove }: { graph: Graph; index: number; onRemove: (index: number) => void }) {
  const edge = graph.edges[index];
  const type = edgeType(graph, edge);
  const title = (id: string) => graph.nodes.find((n) => n.id === id)?.title ?? id;
  return (
    <>
      <PanelHead>
        <span className={styles.inspectorTitle}>Conexão</span>
      </PanelHead>
      <PanelBody>
        <PanelSection>
          <div className={styles.edgeType}>
            <Handle type={type} side="out" className={styles.inlineHandle} />
            <span className="mono">{type}</span>
          </div>
          <dl className={styles.meta}>
            <div>
              <dt>de</dt>
              <dd>
                {title(edge.from.node)} · {edge.from.port}
              </dd>
            </div>
            <div>
              <dt>para</dt>
              <dd>
                {title(edge.to.node)} · {edge.to.port}
              </dd>
            </div>
          </dl>
          <p className={styles.description}>Uma entrada aceita uma única conexão; não existe mesclagem implícita.</p>
        </PanelSection>
        <PanelSection>
          <Button variant="danger" icon={Trash2} onClick={() => onRemove(index)}>
            Remover conexão
          </Button>
        </PanelSection>
      </PanelBody>
    </>
  );
}
