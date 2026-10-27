# Architecture

## System context (Implemented backend, Planned frontend)

```mermaid
flowchart LR
    U[Author] --> FE["Node editor<br/>Next.js 16 + React 19 + TypeScript + React Flow<br/>(scaffolded, editor planned)"]
    FE -->|REST JSON| API[FastAPI API]
    API --> DB[(PostgreSQL)]
    API -->|send_task by name| RQ[(Redis)]
    RQ --> W[Celery worker]
    W --> DB
    W --> EX[Graph executor]
    EX --> H["Node handlers<br/>sympy, matplotlib, tts, manim, ffmpeg<br/>(planned; only passthrough exists)"]
    H --> ST[("Asset storage<br/>STORAGE_DIR, S3 later<br/>(planned)")]
```

## Backend layers (Implemented)

Each resource lives in `app/<domain>/` with exactly five files.

| File | Responsibility |
|---|---|
| `router.py` | Thin `APIRouter`; also hosts the domain's own DI provider (e.g. `PipelineServiceDep`) |
| `schemas.py` | Pydantic v2 models: `Create`, `Update` (optional fields), `Read` (`from_attributes`) |
| `models.py` | SQLAlchemy 2.0 ORM (`Mapped[...]`) |
| `service.py` | Business rules, decorated with `@log_errors`; raises domain exceptions |
| `repository.py` | Only place that knows SQLAlchemy; turns `IntegrityError` into `ConflictError` |

Cross-cutting folders:

- `settings/`: `config.py` (pydantic-settings), `logging_config.py`, `middleware.py` (request id, timing, request log).
- `core/`: `dependencies.py` (session, pagination), `decorators.py` (`log_call`, `log_errors`), `exceptions.py` (`NotFoundError`, `ConflictError` with self-registering handlers).
- `db/`: `base.py`, `session.py` (async engine, `get_db_session`), `all_models.py` (imports every model for Alembic).
- `workers/`: queue infrastructure, outside the domain pattern.

Import rule: `core/` never imports from a domain; domain-specific providers stay in that domain's `router.py` to avoid cycles.

## Request flow

```mermaid
flowchart LR
    C[Client] --> M[Middleware: request id + log]
    M --> R[router.py]
    R --> S["service.py (@log_errors)"]
    S --> P[repository.py]
    P --> DB[(PostgreSQL)]
    P -. IntegrityError .-> X[ConflictError]
    S -. not found .-> N[NotFoundError]
    X --> H409[handler: 409]
    N --> H404[handler: 404]
```

`main.py` assembly order: `setup_logging` -> `FastAPI()` -> `register_middleware` ->
`register_exception_handlers` -> one `include_router` per domain. `GET /health` returns `{"status": "ok"}`.

## Render lifecycle (Implemented)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant R as Redis
    participant W as Celery worker
    participant DB as PostgreSQL
    C->>API: POST /renders {pipeline_id}
    API->>DB: insert render (queued)
    API->>R: send_task run_render(render_id)
    API-->>C: 202 + render
    W->>R: consume job
    W->>DB: status=running, started_at
    W->>W: execute_graph(pipeline.graph)
    alt success
        W->>DB: status=succeeded, progress=100
    else error
        W->>DB: status=failed, error=message
    end
    C->>API: GET /renders/{id} (polling)
```

Design notes:

- The API enqueues **by task name** (`dispatch.enqueue_render`), so it never imports task bodies.
- The enqueuer is injected into `RenderService` (`get_render_enqueuer`), so tests run without a broker.
- Each task builds its own engine with `NullPool` because `asyncio.run` creates a new event loop per task.

## Graph executor (Implemented)

```mermaid
flowchart TD
    G["graph {nodes, edges}"] --> T["topological_order (Kahn)"]
    T -->|cycle| CE[CycleError]
    T --> L{for each node in order}
    L --> HD{handler registered?}
    HD -->|no| UE[UnknownNodeTypeError]
    HD -->|yes| RUN["handler(data, inputs)"]
    RUN --> OUT[outputs of node]
    OUT --> PR["on_progress(done * 100 / total)"]
    PR --> L
```

- A node's `inputs` is the merge of the outputs of every source node with an edge into it.
- Handlers register with `@node_handler("type")`; signature `handler(data: dict, inputs: dict) -> dict`.
- Only `passthrough` exists today (returns `inputs` merged with `data`). All errors inherit `PipelineError`.

## Repository layout

```
derivaai/
├── docs/                    this folder (English, project-wide)
├── derivaai_frontend/       Next.js 16 app (scaffold only; node editor planned)
└── derivaai_backend/
    ├── app/
    │   ├── main.py
    │   ├── settings/ core/ db/
    │   ├── pipelines/ lessons/ nodes/ renders/ assets/
    │   └── workers/         celery_app, dispatch, executor, tasks
    ├── alembic/             migrations (none generated yet)
    ├── docs/                Portuguese backend docs
    ├── tests/               per-domain tests, executor, decorators
    ├── (no compose: Postgres and Redis come from devbutter_app/infra)
    └── pyproject.toml       Poetry, Python >=3.13
```

## Stack

FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, PostgreSQL, Celery + Redis, Poetry.
Planned for nodes: SymPy, SciPy, Matplotlib, Manim, FFmpeg, TTS. Frontend (Next.js 16, React 19, TypeScript, Yarn): installed KaTeX, lucide-react, clsx, Sass.

Planned frontend libs:

- `@xyflow/react` (React Flow): node editor, client-only (`"use client"` + `dynamic(..., { ssr: false })`).
- Zustand: editor state.
- TanStack Query: server state and polling of Celery job status.
- `next-intl`: i18n (EN and pt-BR).
- Zod: payload and form validation.
- `openapi-typescript`: TypeScript types generated from the FastAPI OpenAPI schema.
