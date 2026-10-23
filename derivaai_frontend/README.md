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
  components/
    ui/                Button, Field/Input/Select/Slider, Badge/StatusBadge, Tabs, Panel, Card, Table, Toast, ...
    shell/             AppShell, Sidebar, Topbar, Crumbs, Page, ThemeToggle
    pipeline/          NodeCard, Port/Handle, Canvas/Edge/Hud, Palette, Timeline/Log, Formula/Waveform/Player
  app/
    layout.tsx         fonts (IBM Plex), theme init script, ToastProvider
    (app)/             default shell; /elements is the elements demo
```

## Conventions

- Colors, sizes and durations come only from the semantic tokens (`--bg-*`, `--fg-*`, `--status-*`, `--port-*`, ...). Never use the raw palette in components.
- One `*.module.scss` per component; variants are `data-*` attributes (`data-status`, `data-category`, `data-type`).
- Status and port types always combine color + shape + text (never color alone).
- Components are server components unless they need state or events (`"use client"`: Tabs, Field/Input, Slider, SegmentedControl, Toast, NavItem, ThemeToggle).
- Lucide icons go through `<Icon icon={...} />` (16 px, 1.75 stroke). Components can't cross the server→client boundary: pass `<Icon />` nodes, not icon components.
- Theme: `data-theme` on `<html>`, set before hydration by `lib/theme-script.ts`; read/write with `useTheme()`.

## Next

Screens from `design/layout.md` (home, pipeline editor with React Flow, render detail, lesson) and the remaining list pages.
