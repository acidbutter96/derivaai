# DerivaAI Documentation

DerivaAI is a programmable engineering/physics lesson studio. Notes are turned into narrated lesson
videos through free-form pipelines built in a ComfyUI-style visual node editor (English and
Brazilian Portuguese).

| Document | Contents |
|---|---|
| [architecture.md](architecture.md) | System context, backend layers, request flow, render lifecycle, repository layout |
| [data-model-and-api.md](data-model-and-api.md) | ER diagram, entities, enums and every HTTP endpoint |
| [rc-lesson-flow.md](rc-lesson-flow.md) | The acceptance lesson (RC circuit charging) as a node pipeline, end to end |
| [design-ui.md](design-ui.md) | Early UI notes, **superseded** by [`../design/`](../design/README.md) (design system, layout, wireframes) |
| [design-v2.md](design-v2.md) | **Proposal**: typed ports, nodes as code, pipeline versions, per-node runs with cache, blobs, SSE |
| [prompts.md](prompts.md) | Series of ready-to-run prompts that implement roadmap slices 2 to 7 |

> The prototype docs above describe what is implemented today. [design-v2.md](design-v2.md) proposes replacing
> parts of it and is pending approval.

## Status legend

- **Implemented**: exists in `derivaai_backend/` today (5 domains, Celery queue, graph executor, tests).
- **Planned**: designed but not coded yet (real node handlers, storage, TTS, Manim, FFmpeg, frontend).

Each section marks which one it describes. The frontend folder (`derivaai_frontend/`) is empty and
no logo file exists yet, so everything in [design-ui.md](design-ui.md) is design intent.

## Related

- Backend docs in Portuguese: [`derivaai_backend/docs/`](../derivaai_backend/docs/README.md)
  (conventions, setup, roadmap, decisions). This folder is the English, project-wide view.
- Python target: 3.13+ (`.python-version` = `3.13`, `pyproject.toml` `python = ">=3.13"`, ruff `py313`, mypy `3.13`).
- Pattern: **fastapibuilder-api**, five files per domain.
