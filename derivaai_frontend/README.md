# DerivaAI frontend

Next.js (App Router) + TypeScript + SCSS Modules. Built from the design in [`../design`](../design/README.md).

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build
yarn lint
```

Open `/elements` for the demo screen: every element in every state, in dark and light.

## Structure

```
src/
  styles/
    tokens.scss        design tokens, 1:1 with design/tokens.css (CSS custom properties, dark default)
    _mixins.scss       focus ring, eyebrow, canvas grid, breakpoints. Use: @use "styles/mixins" as *;
    globals.scss       reset, typography, utilities
  lib/                 status, port types, nav, theme (no UI)
    mock/              mocked API v2: types, node catalog, data, one async function per endpoint
  components/
    ui/                Button, Field/Input/Select/Slider, Badge/StatusBadge, Tabs, Panel, Card, Table, Toast, Stat, ...
    shell/             AppShell, Sidebar, Topbar, Crumbs, Page, ThemeToggle
    pipeline/          NodeCard, Port/Handle, Canvas/Edge/Hud, Palette, Timeline/Log, Formula/Waveform/Player, GraphThumb
    lesson/            Curve thumbnail, LessonCard, LessonGrid (language filter)
    render/            RendersTable, RunTimeline/RunLog, OutputCard
  app/
    layout.tsx         fonts (IBM Plex), theme init script, ToastProvider
    (app)/             default shell: home, lessons, pipelines, renders, node catalog, /elements demo
    (editor)/          56 px rail shell: pipeline editor
```

## Screens (mocked)

All data comes from `src/lib/mock` (no backend yet). Each function there mirrors one endpoint of API v2
(`docs/design-v2.md`) and is async, so wiring the real API means replacing the function bodies.

| Route | Screen |
|---|---|
| `/` | Home: continue hero, KPIs, lesson grid with language filter, recent renders |
| `/lessons`, `/lessons/:slug` | Lesson list; lesson reading page (video, script with KaTeX, parameters, render history, language switch) |
| `/pipelines`, `/pipelines/:id` | Pipeline list; editor (palette, canvas, inspector, dock). `?v=` shows a version |
| `/renders`, `/renders/:id` | Render list; render detail (player, summary, per-node Gantt, SSE log, outputs) |
| `/nodes` | Node catalog (`GET /nodes`), searchable by name, key or port type |

The editor runs a client-side stand-in for the worker (`simulate.ts`, one `advance` step per tick): edit a
node, press Renderizar (`⌘↵`) and only that node and its downstream re-run, the rest comes from cache. Nodes
drag on the 24 px grid, palette items drop onto the canvas, inputs connect from the inspector's Portas tab, and
`[` `]` `` ` `` `/` `Delete` `⌘S` work as in `design/layout.md`. Changes live in memory only.

## Conventions

- Colors, sizes and durations come only from the semantic tokens (`--bg-*`, `--fg-*`, `--status-*`, `--port-*`, ...). Never use the raw palette in components.
- One `*.module.scss` per component; variants are `data-*` attributes (`data-status`, `data-category`, `data-type`).
- Status and port types always combine color + shape + text (never color alone).
- Components are server components unless they need state or events (`"use client"`: Tabs, Field/Input, Slider, SegmentedControl, Toast, NavItem, ThemeToggle).
- Lucide icons go through `<Icon icon={...} />` (16 px, 1.75 stroke). Components can't cross the server→client boundary: pass `<Icon />` nodes, not icon components.
- Theme: `data-theme` on `<html>`, set before hydration by `lib/theme-script.ts`; read/write with `useTheme()`.

## Next

Replace `lib/mock` with the API, React Flow for the canvas (edge dragging between ports), SSE for live renders, settings page.
