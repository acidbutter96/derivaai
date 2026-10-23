# DerivaAI design system

Source of truth for the frontend. Tokens live in [`tokens.css`](tokens.css); the reference CSS for every
component below is [`components.css`](components.css). The wireframes in [`wireframes/`](wireframes/index.html)
are built only from these two files, so what you see there is what this document specifies.

It assumes the [design v2](../docs/design-v2.md) backend model: typed ports, nodes defined in code,
pipeline versions, per-node runs with cache, blobs and SSE events.

## 1. Principles

1. **The canvas is the product.** Chrome stays quiet (neutral ink surfaces, one accent) so typed ports, node status and previews carry the color.
2. **Show the computation, not a spinner.** Every node shows its own state and its output inline: the formula, the plot, the waveform, the video. Status comes from SSE, never from polling the whole render.
3. **Cache is visible.** Cached work has its own status (violet, diamond, hatched bar), so authors learn that small edits are cheap.
4. **Math is first-class.** Formulas render with a math face; units are always shown next to numbers (`1.0 kΩ`, `300 ms`).
5. **Never color alone.** Status and port types combine color with shape and text label (see §5 and §6).
6. **Bilingual by default.** Every screen works in pt-BR and en; pt-BR strings run about 20% longer, so no fixed-width labels.

## 2. Brand

| Element | Spec |
|---|---|
| Mark | `∂` (partial derivative) in the math face, italic, 600, on an accent square with `--radius-sm`. Sizes 28 px (sidebar), 20 px (favicon) |
| Wordmark | `Deriva` + `AI` in the accent color, IBM Plex Sans 600, tracking -0.01em |
| Accent | Amber `--amber-500` `#ff8a3d` (dark), `--amber-700` `#b94a0d` (light, for 4.5:1 with white text). Used for the primary action, selection, focus ring and the time-constant marker in plots. Never for status |

## 3. Color

Components use **semantic tokens only**; raw palette tokens (`--ink-*`, `--paper-*`, `--amber-*`) exist only inside `tokens.css`.

| Role | Tokens |
|---|---|
| Surfaces | `--bg-app` < `--bg-canvas` < `--bg-panel` < `--bg-raised`; `--bg-inset` for fields and previews; `--bg-hover`, `--bg-active` for states |
| Text | `--fg-primary`, `--fg-secondary`, `--fg-muted`, `--fg-faint`, `--fg-on-accent` |
| Borders | `--border-subtle` (separators), `--border-default` (controls, nodes), `--border-strong` (hover) |
| Accent | `--accent`, `--accent-hover`, `--accent-soft` (selection halo, highlights), `--focus-ring` |
| Canvas grid | `--grid-dot` every 24 px, `--grid-line` every 120 px |

Themes: dark is default (`data-theme="dark"`), light is opt-in (`data-theme="light"`). The attribute can sit on
`<html>` or on any container, so previews and the component sheet can mix themes. Follow
`prefers-color-scheme` on first visit and remember the user's choice.

## 4. Typography

| Token | Size / line | Use |
|---|---|---|
| `--text-3xl` | 32 / 40 | Lesson title |
| `--text-2xl` | 24 / 32 | Page title |
| `--text-xl` | 20 / 28 | Section title, KPI value |
| `--text-lg` | 16 / 24 | Card title, lesson script body |
| `--text-md` | 14 / 20 | Default UI text |
| `--text-sm` | 13 / 20 | Lists, buttons, inputs |
| `--text-xs` | 12 / 16 | Node body, meta |
| `--text-2xs` | 11 / 16 | Eyebrows (uppercase, +0.08em), badges |

Faces: **IBM Plex Sans** (UI), **IBM Plex Mono** (node keys, ids, hashes, durations, numeric inputs, logs),
math face via **KaTeX** for formulas (`--font-math` is the fallback stack). Weights 400, 500, 600 only.
Numbers in tables and timelines use the mono face so columns align.

## 5. Status system

One vocabulary for node runs, renders and lessons. Each status = color + dot shape + text.

| Status | Token | Shape | pt-BR label | en label |
|---|---|---|---|---|
| pending | `--status-pending` | filled circle | aguardando | pending |
| running | `--status-running` | pulsing circle (+ progress bar on the node) | executando / `62%` | running / `62%` |
| cached | `--status-cached` | diamond (+ hatched bar in timelines) | cache | cached |
| succeeded | `--status-succeeded` | filled circle | ok / duration | ok / duration |
| failed | `--status-failed` | square (+ red node border and inline error) | falhou | failed |
| skipped | `--status-skipped` | hollow circle (+ node at 55% opacity) | pulado | skipped |
| canceled | `--status-canceled` | filled circle | cancelado | canceled |
| warning | `--status-warning` | filled circle | não salvo | unsaved |

Lesson status is derived (design v2): **rascunho / draft** (no published render), **renderizando / rendering**,
**pronta / ready** (published render succeeded), **falhou / failed**.

## 6. Port types

Ports are the core of the editor. Each type has a color and a handle shape:
**circle = JSON value**, **diamond = blob reference**. An unconnected required input shows a hollow handle.

| Type | Token | Handle | Carries |
|---|---|---|---|
| `number` | `--port-number` | ● | scalar |
| `text` | `--port-text` | ● | script, labels |
| `bool` | `--port-bool` | ● | flags |
| `params` | `--port-params` | ● | `{R, C, V0}` |
| `expr` | `--port-expr` | ● | SymPy expression |
| `series` | `--port-series` | ◆ | sampled data |
| `image` | `--port-image` | ◆ | PNG/SVG |
| `audio` | `--port-audio` | ◆ | WAV/MP3 |
| `video` | `--port-video` | ◆ | MP4 |

Edges take the color of their source port. While a connection is being dragged, incompatible ports dim to 30%
and compatible ones grow 2 px. The type name is printed next to each port in the mono face (10 px).

## 7. Node categories

A 3 px stripe on top of every node and on palette items: `io` gray, `math` amber, `plot` teal,
`narration` pink, `animation` violet, `video` red (`--cat-*`). Category drives grouping in the palette only;
type compatibility is always decided by ports.

## 8. Components

Class names refer to [`components.css`](components.css).

| Component | Class | Notes |
|---|---|---|
| App shell | `.shell`, `.shell--editor` | Sidebar 232 px; collapses to 56 px icons inside the editor |
| Sidebar nav | `.sidebar`, `.nav-item[aria-current]` | Counts on the right in `--fg-faint` |
| Top bar | `.topbar` | 52 px; breadcrumbs left, actions right; primary action always last |
| Button | `.btn` + `--primary`, `--ghost`, `--danger`, `--sm`, `--icon` | 32 px (26 px small). One primary per view. Shortcut hint via `.kbd` |
| Segmented control | `.seg` | Language switch (`PT-BR` / `EN`), filters |
| Field | `.field`, `.input`, `.input-group` + `.unit` | Units are a fixed suffix, never typed by the user. Errors under the field in `--status-failed` |
| Badge / status | `.badge`, `.status--*`, `.lang` | `.lang` shows `pt-BR` / `en` in mono |
| Panel | `.panel`, `.panel__head`, `.panel__section` | 40 px headers with tabs |
| Tabs | `.tab[aria-selected]` | 2 px accent underline |
| Card | `.card`, `.card__media` (16:9), `.card__body` | Lessons, outputs |
| Table | `.table` | Renders list; mono for ids and durations |
| Canvas | `.canvas`, `.canvas__edges`, `.hud-card` | Dot grid 24 px + line grid 120 px; HUDs float with `--shadow-md` |
| Node | `.node`, `.node__head`, `.node__key`, `.node__ports`, `.node__preview`, `.node__error`, `.node__progress` | Width 248 px; selected = accent border + soft halo; failed = red border + inline error |
| Port | `.port--{type}`, `.port--blob`, `.port--unlinked`, `.handle` | See §6 |
| Palette item | `.palette-item` | Draggable; label + mono key |
| Timeline | `.timeline`, `.bar`, `.bar--cached` | Per-node execution; hatched violet for cache |
| Log | `.log` | SSE event stream, mono 11 px, timestamps `mm:ss.cc` |
| Player | `.player`, `.player__bar` | 16:9, accent progress, language tag, captions toggle |
| Toast | `.toast` | Bottom-right, 340 px, auto-dismiss 5 s unless it carries an action |

### Node anatomy

```
┌─ category stripe (3 px) ─────────────────┐
│ Title                          [status]  │  .node__head
│ key · version · queue                    │  .node__key (mono, faint)
├──────────────────────────────────────────┤
│ ● input  type            type  output ◆  │  .node__ports (inputs left, outputs right)
├──────────────────────────────────────────┤
│ preview: formula / plot / waveform /     │  .node__preview (optional)
│ video poster / inline config summary     │
│ ▬▬▬▬▬▬▬▬▬▬░░░░░ progress (running)       │  .node__progress
│ error text + "Abrir no inspetor"         │  .node__error (failed)
└──────────────────────────────────────────┘
```

## 9. Iconography

Lucide (`lucide-react`), 16 px in navigation and buttons, 1.75 stroke. Names used: home, book (lessons),
workflow (pipelines), clapperboard/monitor-play (renders), grid (nodes), play, save, history, search,
stop, upload, download, layers (templates), zap (cache), copy, more. The wireframe sprite in `icons.js`
mirrors those names.

## 10. Motion

The product should feel alive while it computes, without noise.

| Motion | Spec |
|---|---|
| Hover/press | `--dur-fast` (120 ms), `--ease-out` |
| Panels, popovers | `--dur-base` (200 ms) fade + 4 px slide |
| Data flow | Edges into a running node animate a dashed stroke (`.edge--flow`, `--dur-flow` 1.4 s linear) |
| Running dot | 1.2 s pulse |
| Node finishes | Status badge cross-fades; preview fades in over 200 ms |
| Cache hit | Brief violet glow on the node border (360 ms), once |

All motion collapses to zero under `prefers-reduced-motion`; status still changes through color, shape and text.

## 11. Accessibility

- Text contrast ≥ 4.5:1 on panel surfaces in both themes (checked for `--fg-*`, `--status-*` and the accent with its on-accent text); port and category colors are graphic (≥ 3:1) and never carry text alone. Status colors are always paired with a label.
- Visible focus ring (`--focus-ring`) on every interactive element; never remove outlines without it.
- The canvas is keyboard-operable: Tab cycles nodes in topological order, arrows move the selection, Enter opens the inspector, `C` starts a connection from the focused port, Delete removes.
- Every node announces "title, status, n inputs connected of m" to screen readers; the dock log is an ARIA live region (polite).
- Touch targets ≥ 32 px in panels; port handles have an invisible 20 px hit area.

## 12. Content and voice

- UI copy in the active locale; node keys, port names and types stay in English (they are code).
- Short, concrete labels: "Renderizar", "Salvar", "Executar até aqui". Errors say what failed and where: "LaTeX: comando indefinido `\tauu` na linha 3".
- Numbers use the locale's decimal separator in prose and inspector values (`1,0 kΩ` in pt-BR, `1.0 kΩ` in en); ids, hashes and code stay as-is.

## 13. Implementation notes for the frontend

- Stack: React + TypeScript + React Flow. Map `tokens.css` 1:1 to CSS variables (or Tailwind theme) and port each class in `components.css` to a component.
- React Flow: custom node component = `.node`; `Handle` ids = port names; `sourceHandle`/`targetHandle` = graph v2 `from.port`/`to.port`; edge color from source port type; `isValidConnection` checks port types using the `GET /nodes` catalog.
- Inspector forms are generated from each node's `config_schema` (JSON Schema). Map `number` with `x-unit` to `.input-group` + `.unit`.
- Live status: one `EventSource` per open render (`GET /renders/{id}/events`); update node badges, dock timeline and log from the same stream.
- Validation: debounce 300 ms on graph changes, call `POST /pipelines/validate`, mark nodes/edges with returned errors.
