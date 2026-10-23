# DerivaAI design

Visual design for the DerivaAI frontend: design system, layout and wireframes. Status: **design proposal**,
no frontend code yet (`derivaai_frontend/` is empty). It replaces the thin UI notes in
[`../docs/design-ui.md`](../docs/design-ui.md) and assumes the backend model in
[`../docs/design-v2.md`](../docs/design-v2.md) (typed ports, per-node runs, cache, SSE).

| File | Contents |
|---|---|
| [design-system.md](design-system.md) | Principles, brand, color, type, status and port systems, components, motion, accessibility, frontend notes |
| [layout.md](layout.md) | App shell, every screen's regions, responsive rules, keyboard map |
| [tokens.css](tokens.css) | Design tokens (dark default, light via `data-theme="light"`) |
| [components.css](components.css) | Reference CSS for every component, used by the wireframes |
| [icons.js](icons.js) | Small Lucide-style sprite for the wireframes |
| [wireframes/index.html](wireframes/index.html) | Screen index with thumbnails |
| `wireframes/0X-*.html` | Home, pipeline editor, render detail, lesson, component sheet |
| `wireframes/png/` | 1440 px exports of each screen (editor also in light theme) |

## For coding agents

1. Read `design-system.md`, then `layout.md`.
2. Treat `tokens.css` as the only place colors, sizes and durations are defined; components use semantic tokens.
3. The HTML wireframes are the visual reference; open them in a browser (fonts load from Google Fonts).
4. UI copy in the wireframes is pt-BR; the product ships pt-BR and en.

## Direction in one paragraph

A quiet, dark engineering workspace with a single amber accent (from the ∂ mark), so the computation is
what carries color: typed ports (color + shape), per-node status live over SSE, and inline previews of each
node's output (formula, plot, waveform, video). Cache is a visible status, because the main promise of the
v2 design is that small edits re-render in seconds.
