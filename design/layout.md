# Layout

Screens, regions and responsive rules. Sizes come from the layout tokens in [`tokens.css`](tokens.css).
Wireframes: [`wireframes/index.html`](wireframes/index.html) (desktop, 1440 × 900).

## App shell

```
┌──────────┬──────────────────────────────────────────────┐
│          │ Top bar (52)  crumbs · status       actions  │
│ Sidebar  ├──────────────────────────────────────────────┤
│ (232)    │                                              │
│          │ Page content (padding 32)                    │
│ ∂ Deriva │                                              │
│ Início   │                                              │
│ Lições   │                                              │
│ Pipelines│                                              │
│ Renders  │                                              │
│ Nós      │                                              │
│ Recentes │                                              │
│ ─────    │                                              │
│ Tema     │                                              │
│ Usuário  │                                              │
└──────────┴──────────────────────────────────────────────┘
```

Navigation: Início (home), Lições (lessons), Pipelines, Renders, Catálogo de nós (read-only catalog from code).
"Recentes" lists the last three opened items with their status dot. Global search `⌘K` searches lessons,
pipelines and node types.

## Screens

| # | Screen | Route | Wireframe |
|---|---|---|---|
| 01 | Home | `/` | [01-library.html](wireframes/01-library.html) |
| 02 | Pipeline editor | `/pipelines/:id` (`?v=` for a version) | [02-editor.html](wireframes/02-editor.html) |
| 03 | Render detail | `/renders/:id` | [03-render.html](wireframes/03-render.html) |
| 04 | Lesson | `/lessons/:slug` (`?lang=`) | [04-lesson.html](wireframes/04-lesson.html) |
| 05 | Component sheet | internal | [05-components.html](wireframes/05-components.html) |

Not drawn yet (follow the same shell and components): lessons list, pipelines list, renders list
(table from 01), node catalog (palette items as a searchable table with port types), settings.

### 01 Home

1. **Continue** hero: the most recent pipeline as a graph thumbnail + status + "Abrir no editor" / "Ver render".
2. KPI tiles: lessons ready, time saved by cache, renders ok/failed; template tile "lição narrada".
3. Lesson grid (4 columns ≥ 1280 px, 3 ≥ 1024, 2 ≥ 640, 1 below), filter by language.
4. Recent renders table.

### 02 Pipeline editor (the core screen)

```
┌──┬──────────────────────────────────────────────────────────────────────────────┐
│  │ Pipelines / Name  v4 [não salvo] [grafo válido]   PT-BR|EN  Histórico Salvar ▶│
│56├──────────┬────────────────────────────────────────────────┬──────────────────┤
│  │ Palette  │ Canvas                                         │ Inspector        │
│  │ (264)    │  HUD: render status · counts      [minimap]    │ (344)            │
│  │ search / │                                                │ Config|Portas|   │
│  │ groups   │   nodes + typed edges                          │ Saída            │
│  │ by cat.  │                                                │ form from        │
│  │          │  zoom − 72% + fit                              │ config_schema    │
│  │          ├────────────────────────────────────────────────┤ last output      │
│  │          │ Dock (232, resizable 120–50%)                  │ Executar até aqui│
│  │          │ Execução | Saídas | Versões        Cancelar    │                  │
│  │          │ per-node timeline         │ SSE event log      │                  │
└──┴──────────┴────────────────────────────────────────────────┴──────────────────┘
```

- Sidebar collapses to 56 px icons to give the canvas room.
- Palette and inspector collapse with `[` and `]`; dock toggles with `` ` `` and remembers its height.
- Top bar: version badge, unsaved state, validation state, render language, history, Save (`⌘S`, creates a version if the graph changed), Render (`⌘↵`, saves first).
- Canvas: dot grid, zoom 25–200%, minimap bottom-right, zoom controls bottom-left, render HUD top-left.
- Selecting a node opens it in the inspector; selecting an edge shows source/target ports and type.
- Dock tabs: **Execução** (timeline + log of the current render), **Saídas** (gallery of blobs from this render), **Versões** (version list with diff counts and their renders).
- Empty pipeline: canvas shows "Arraste um nó da paleta ou comece pelo modelo Lição narrada" with the template button.

### 03 Render detail

Header with status and actions (open the exact version in the editor, render again, publish to lesson).
Top row: final video player (16:9) + summary (duration, cached nodes, time saved, final video size) and an
explanation of what re-ran. Then the per-node Gantt (lane `cpu` / `media` shown per row) and the outputs grid.
Running render: same page, live from SSE, with Cancelar in the header.

### 04 Lesson

Reading layout: content column (max 68ch for prose) + 340 px side column.
Content: title, published video, script with the equations rendered. Side: published render, parameters,
render history with "publicar" on succeeded renders. The language switch shows "sem render" for locales without
a render and turns the primary action into "Renderizar em EN".

## Responsive rules

| Width | Behavior |
|---|---|
| ≥ 1440 | Reference layout |
| 1280–1439 | Editor: inspector 312 px, palette 240 px |
| 1024–1279 | Editor: palette becomes a popover (`/` or "+" button); inspector overlays the canvas as a drawer |
| < 1024 | Editor is read-only (view graph, follow a render, see outputs) with a notice; home, lesson and render pages are fully responsive, sidebar becomes a top bar with a menu |
| < 640 | Lesson page is a single column: video, script, then side boxes |

Page gutters: 32 px desktop, 24 px tablet, 16 px phone. No horizontal page scroll at any width (the canvas pans instead).

## Layers

`--z-canvas` 0 < `--z-panel` 10 (HUDs, panels) < `--z-dock` 20 < `--z-popover` 40 < `--z-modal` 60 < `--z-toast` 80.

## Keyboard map (editor)

| Key | Action |
|---|---|
| `⌘S` / `⌘↵` | Save version / Render |
| `/` | Focus node search |
| `[` / `]` / `` ` `` | Toggle palette / inspector / dock |
| `Space` + drag | Pan |
| `⌘0` / `⌘1` | Fit / 100% |
| `Tab` / arrows | Cycle / move between nodes |
| `C` | Connect from focused port |
| `⌘D` / `Delete` | Duplicate / delete selection |
| `R` on a node | Execute up to this node |
