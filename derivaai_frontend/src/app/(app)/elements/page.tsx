import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Copy, Download, History, Play, Plus, Save, Square, Trash2, Workflow } from "lucide-react";
import { Crumbs, Page, PageHead, Topbar, TopbarSpacer } from "@/components/shell/AppShell";
import {
  Badge,
  Brand,
  Button,
  Card,
  CardBody,
  CardMedia,
  CardMeta,
  Field,
  Icon,
  Input,
  Kbd,
  LangTag,
  LessonStatusBadge,
  Panel,
  PanelBody,
  PanelHead,
  PanelSection,
  PanelTitle,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  Textarea,
  Toast,
} from "@/components/ui";
import {
  bezierPath,
  Canvas,
  CanvasEdges,
  Edge,
  Formula,
  Hud,
  Log,
  LogLine,
  NodeCard,
  NodeError,
  NodePreview,
  NodeProgress,
  PaletteGroup,
  PaletteItem,
  Player,
  Port,
  Timeline,
  TimelineRow,
  Waveform,
  ZoomControls,
} from "@/components/pipeline";
import { PORT_TYPES, portDescriptions } from "@/lib/ports";
import { STATUSES } from "@/lib/status";
import { SegmentedDemo, SliderDemo, TabsDemo, ToastDemo } from "./demos";
import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Elements" };

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        {note ? <p className="muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

// Handle positions of a node at (x, y): inputs at x, outputs at x + 248; first port row ≈ y + 69, +24 per row.
const NODE_W = 248;
const portY = (nodeY: number, row = 0) => nodeY + 69 + row * 24;

export default function ComponentSheetPage() {
  return (
    <>
      <Topbar>
        <Crumbs items={[{ label: "Interno" }, { label: "Elements" }]} />
        <TopbarSpacer />
        <Button variant="ghost" icon={Download}>
          Tokens
        </Button>
      </Topbar>
      <Page>
        <PageHead eyebrow="Design system" title="Elements" />

        <div className={styles.stack}>
          <Section title="Brand" note="∂ on an accent square; Deriva + AI in the accent color.">
            <div className={styles.row}>
              <Brand />
              <Brand showWordmark={false} />
            </div>
          </Section>

          <Section title="Buttons" note="32 px (26 px small). One primary per view; shortcut hint via Kbd.">
            <div className={styles.row}>
              <Button variant="primary" icon={Play} kbd="⌘↵">
                Renderizar
              </Button>
              <Button icon={Save} kbd="⌘S">
                Salvar
              </Button>
              <Button>Default</Button>
              <Button variant="ghost" icon={History}>
                Histórico
              </Button>
              <Button variant="danger" icon={Trash2}>
                Excluir
              </Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className={styles.row}>
              <Button size="sm" variant="primary">
                Small primary
              </Button>
              <Button size="sm">Small</Button>
              <Button size="sm" variant="ghost">
                Small ghost
              </Button>
              <Button iconOnly aria-label="Add">
                <Icon icon={Plus} />
              </Button>
              <Button iconOnly variant="ghost" aria-label="Copy">
                <Icon icon={Copy} />
              </Button>
              <Button iconOnly size="sm" variant="danger" aria-label="Stop">
                <Icon icon={Square} size={14} />
              </Button>
              <Kbd>⌘K</Kbd>
            </div>
          </Section>

          <Section title="Segmented control and tabs">
            <div className={styles.row}>
              <SegmentedDemo />
            </div>
            <div className={styles.tabsBox}>
              <TabsDemo />
            </div>
          </Section>

          <Section title="Fields" note="Units are a fixed suffix, never typed. Errors sit under the field in --status-failed.">
            <div className={styles.grid3}>
              <Field label="Rótulo">
                <Input placeholder="Narração" />
              </Field>
              <Field label="Resistência R">
                <Input mono unit="kΩ" defaultValue="1.0" />
              </Field>
              <Field label="Capacitância C" error="Valor deve ser maior que zero">
                <Input mono unit="mF" defaultValue="-1" />
              </Field>
              <Field label="Idioma" aside="herdado do render">
                <Select defaultValue="render">
                  <option value="render">Do render (pt-BR)</option>
                  <option value="pt-BR">pt-BR</option>
                  <option value="en">en</option>
                </Select>
              </Field>
              <Field label="Buscar nós">
                <SearchInput placeholder="Buscar nós…" kbd="/" />
              </Field>
              <Field label="Roteiro">
                <Textarea defaultValue="Quando fechamos a chave, o capacitor começa a acumular carga." rows={3} />
              </Field>
              <SliderDemo />
            </div>
          </Section>

          <Section title="Badges and status" note="Every status is color + shape + text; never color alone.">
            <div className={styles.row}>
              {STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
              <StatusBadge status="running" label="62%" />
              <StatusBadge status="succeeded" label="8.2 s" />
            </div>
            <div className={styles.row}>
              <LessonStatusBadge status="draft" />
              <LessonStatusBadge status="rendering" />
              <LessonStatusBadge status="ready" />
              <LessonStatusBadge status="failed" />
              <LessonStatusBadge status="ready" locale="en" />
              <Badge>v4</Badge>
              <Badge variant="accent">novo</Badge>
              <LangTag>pt-BR</LangTag>
              <LangTag>en</LangTag>
            </div>
          </Section>

          <Section title="Ports" note="circle = JSON value, diamond = blob reference. Hollow handle = required input not connected.">
            <div className={styles.portGrid}>
              {PORT_TYPES.map((type) => (
                <div key={type} className={styles.portCell}>
                  <Port port={{ name: type, type }} side="in" />
                  <span className="faint mono">{portDescriptions[type]}</span>
                </div>
              ))}
              <div className={styles.portCell}>
                <Port port={{ name: "scene", type: "video", linked: false }} side="in" />
                <span className="faint mono">unlinked</span>
              </div>
            </div>
          </Section>

          <Section title="Pipeline canvas" note="Nodes in each state on the dot grid; edges take the color of their source port.">
            <div className={styles.canvasScroll}>
              <Canvas className={styles.canvas}>
                <CanvasEdges>
                  <Edge d={bezierPath(24 + NODE_W, portY(64), 330, portY(64))} type="params" />
                  <Edge d={bezierPath(330 + NODE_W, portY(64), 636, portY(64))} type="expr" />
                  <Edge d={bezierPath(24 + NODE_W, portY(320), 330, portY(320))} type="text" flow />
                  <Edge d={bezierPath(330 + NODE_W, portY(320), 636, portY(320, 1))} type="audio" />
                </CanvasEdges>

                <Hud position="top-left">
                  <StatusBadge status="running" label="renderizando 4/7" />
                  <span className={styles.hudText}>7 nós · 7 conexões · 3 do cache</span>
                </Hud>

                <NodeCard
                  position={{ x: 24, y: 64 }}
                  title="Parâmetros do circuito"
                  nodeKey="io.params"
                  version={1}
                  category="io"
                  status="cached"
                  outputs={[{ name: "values", type: "params" }]}
                >
                  <NodePreview className={styles.params}>
                    <span>R</span>
                    <span>1.0 kΩ</span>
                    <span>C</span>
                    <span>1.0 mF</span>
                    <span>V₀</span>
                    <span>5.0 V</span>
                  </NodePreview>
                </NodeCard>

                <NodeCard
                  position={{ x: 330, y: 64 }}
                  title="Resolver EDO"
                  nodeKey="math.solve_ode"
                  version={1}
                  category="math"
                  status="cached"
                  inputs={[{ name: "params", type: "params" }]}
                  outputs={[{ name: "solution", type: "expr" }]}
                >
                  <NodePreview formula>
                    <Formula tex="V(t)=V_0\left(1-e^{-t/RC}\right)" />
                  </NodePreview>
                </NodeCard>

                <NodeCard
                  position={{ x: 636, y: 64 }}
                  title="Curva de carga"
                  nodeKey="plot.function"
                  version={1}
                  category="plot"
                  status="succeeded"
                  statusLabel="0.1 s"
                  inputs={[{ name: "fn", type: "expr" }]}
                  outputs={[{ name: "image", type: "image" }]}
                >
                  <NodePreview>
                    <svg viewBox="0 0 220 70" width="100%" height="70" role="img" aria-label="Charging curve">
                      <path d="M8 62 C 40 14, 90 10, 212 8" fill="none" stroke="var(--port-series)" strokeWidth="2" />
                    </svg>
                  </NodePreview>
                </NodeCard>

                <NodeCard
                  position={{ x: 24, y: 320 }}
                  title="Roteiro da aula"
                  nodeKey="io.text"
                  version={1}
                  category="io"
                  status="succeeded"
                  statusLabel="ok"
                  outputs={[{ name: "text", type: "text" }]}
                />

                <NodeCard
                  position={{ x: 330, y: 320 }}
                  title="Narração"
                  nodeKey="tts.narrate"
                  version={1}
                  queue="cpu"
                  category="narration"
                  status="running"
                  statusLabel="62%"
                  inputs={[{ name: "text", type: "text" }]}
                  outputs={[{ name: "audio", type: "audio" }]}
                  selected
                >
                  <NodePreview className={styles.audio}>
                    <Waveform />
                  </NodePreview>
                  <NodeProgress value={0.62} />
                </NodeCard>

                <NodeCard
                  position={{ x: 636, y: 320 }}
                  title="Vídeo final"
                  nodeKey="video.compose"
                  version={1}
                  queue="media"
                  category="video"
                  status="failed"
                  inputs={[
                    { name: "scene", type: "video", linked: false },
                    { name: "narration", type: "audio" },
                  ]}
                  outputs={[{ name: "video", type: "video" }]}
                >
                  <NodeError action="Abrir no inspetor">LaTeX: comando indefinido `\tauu` na linha 3</NodeError>
                </NodeCard>

                <ZoomControls zoom={0.72} />
              </Canvas>
            </div>
          </Section>

          <Section title="Palette" note="Draggable; category stripe groups the palette, ports decide compatibility.">
            <Panel className={styles.palette}>
              <PanelBody>
                <PaletteGroup title="Entrada">
                  <PaletteItem label="Parâmetros" nodeKey="io.params" category="io" />
                  <PaletteItem label="Texto" nodeKey="io.text" category="io" />
                </PaletteGroup>
                <PaletteGroup title="Matemática">
                  <PaletteItem label="Resolver EDO" nodeKey="math.solve_ode" category="math" />
                </PaletteGroup>
                <PaletteGroup title="Gráfico">
                  <PaletteItem label="Plotar função" nodeKey="plot.function" category="plot" />
                </PaletteGroup>
                <PaletteGroup title="Narração">
                  <PaletteItem label="Narrar texto" nodeKey="tts.narrate" category="narration" />
                </PaletteGroup>
                <PaletteGroup title="Animação">
                  <PaletteItem label="Carga do capacitor" nodeKey="anim.rc_charging" category="animation" />
                </PaletteGroup>
                <PaletteGroup title="Vídeo">
                  <PaletteItem label="Compor vídeo" nodeKey="video.compose" category="video" />
                </PaletteGroup>
              </PanelBody>
            </Panel>
          </Section>

          <Section title="Execution dock" note="Cache is visible: hatched violet bar. Log is an ARIA live region.">
            <div className={styles.dock}>
              <Timeline>
                <TimelineRow label="Parâmetros do circuito" status="cached" start={0} width={4} duration="cache" />
                <TimelineRow label="Resolver EDO" status="cached" start={4} width={4} duration="cache" />
                <TimelineRow label="Roteiro da aula" status="succeeded" start={8} width={3} duration="0.1 s" />
                <TimelineRow label="Narração" status="succeeded" start={11} width={22} duration="8.2 s" />
                <TimelineRow label="Animação da carga" status="running" start={11} width={46} duration="24 s…" />
                <TimelineRow label="Vídeo final" status="pending" duration="–" />
              </Timeline>
              <Log>
                <LogLine time="00:00.02">render r-0192 criado (v4, pt-BR)</LogLine>
                <LogLine time="00:00.03">cache io.params, math.solve_ode, plot.function</LogLine>
                <LogLine time="00:08.31">ok tts.narrate · 0:48 de áudio</LogLine>
                <LogLine time="00:41.02">anim.rc_charging 62%</LogLine>
              </Log>
            </div>
          </Section>

          <Section title="Media">
            <div className={styles.grid2}>
              <Player progress={0.42} current="0:48" duration="1:52" lang="pt-BR">
                <div className={styles.poster}>
                  <Formula tex="V(t)=V_0\left(1-e^{-t/RC}\right)" display />
                </div>
              </Player>
              <div className={styles.audioBox}>
                <span className="eyebrow">Última saída</span>
                <Waveform />
                <span className="mono faint">audio/wav · 1.5 MB · sha256:9f3c…e01a</span>
              </div>
            </div>
          </Section>

          <Section title="Cards, panels and tables">
            <div className={styles.grid3}>
              <Card>
                <CardMedia>
                  <svg viewBox="0 0 200 112" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
                    <path d="M10 100 C 40 30, 90 22, 190 20" fill="none" stroke="var(--port-series)" strokeWidth="3" />
                  </svg>
                </CardMedia>
                <CardBody>
                  <h3>Carga do circuito RC</h3>
                  <CardMeta>
                    <LessonStatusBadge status="ready" />
                    <LangTag>pt-BR</LangTag>
                    <span>publicada há 2 dias</span>
                  </CardMeta>
                </CardBody>
              </Card>
              <Card>
                <CardMedia />
                <CardBody>
                  <h3>Oscilador massa-mola</h3>
                  <CardMeta>
                    <LessonStatusBadge status="failed" />
                    <LangTag>pt-BR</LangTag>
                  </CardMeta>
                  <span className="muted">anim.scene: erro de LaTeX</span>
                </CardBody>
              </Card>
              <Panel className={styles.bordered}>
                <PanelHead>
                  <PanelTitle>Inspetor</PanelTitle>
                </PanelHead>
                <PanelBody>
                  <PanelSection>
                    <span className="eyebrow">Última saída</span>
                    <span className="mono">sha256:9f3c…e01a</span>
                  </PanelSection>
                  <PanelSection>
                    <Button icon={Workflow}>Executar até aqui</Button>
                  </PanelSection>
                </PanelBody>
              </Panel>
            </div>
            <Table>
              <thead>
                <tr>
                  <th>Render</th>
                  <th>Pipeline</th>
                  <th>Versão</th>
                  <th>Idioma</th>
                  <th>Status</th>
                  <th>Duração</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">r-0192</td>
                  <td>Carga do circuito RC</td>
                  <td>v4</td>
                  <td>
                    <LangTag>pt-BR</LangTag>
                  </td>
                  <td>
                    <StatusBadge status="running" label="62%" />
                  </td>
                  <td className="mono">0:41</td>
                </tr>
                <tr>
                  <td className="mono">r-0191</td>
                  <td>Carga do circuito RC</td>
                  <td>v3</td>
                  <td>
                    <LangTag>pt-BR</LangTag>
                  </td>
                  <td>
                    <StatusBadge status="succeeded" />
                  </td>
                  <td className="mono">0:22</td>
                </tr>
                <tr>
                  <td className="mono">r-0188</td>
                  <td>Oscilador massa-mola</td>
                  <td>v2</td>
                  <td>
                    <LangTag>pt-BR</LangTag>
                  </td>
                  <td>
                    <StatusBadge status="failed" />
                  </td>
                  <td className="mono">1:05</td>
                </tr>
              </tbody>
            </Table>
          </Section>

          <Section title="Toasts" note="Bottom-right, 340 px; auto-dismiss in 5 s unless the toast carries an action.">
            <div className={styles.row}>
              <ToastDemo />
            </div>
            <Toast title="Versão v4 salva" description="3 nós alterados" status="succeeded" />
          </Section>
        </div>
      </Page>
    </>
  );
}
