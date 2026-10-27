# DerivaAI Backend

FastAPI backend (fastapibuilder-api pattern) for DerivaAI: node-editor pipelines that render narrated
engineering/physics lessons. Requires Python 3.13+.

```bash
# Postgres and Redis come from devbutter_app/infra (one per environment; own db `derivaai`, queue `derivaai-renders`)
(cd ../../devbutter_app/infra && docker network create devbutter_shared 2>/dev/null; docker compose --env-file .env up -d shared-postgres redis)
poetry env use 3.13
poetry install
cp .env.example .env
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
poetry run celery -A app.workers.celery_app worker -l info -P solo   # render worker
poetry run pytest
```

## Domains (five files each: router, schemas, models, service, repository)

- `pipelines` - free-form node graphs (React Flow nodes + edges as JSON)
- `lessons` - narrated lessons (pt-BR / en), pipeline optional
- `nodes` - catalog of node types (sympy, manim, tts, ffmpeg...)
- `renders` - pipeline executions queued to Celery (`POST /renders` returns 202)
- `assets` - generated/uploaded files (plots, animations, audio, video)

`app/workers/` is queue infrastructure: `executor.py` runs a graph topologically with handlers
registered via `@node_handler("type")`; `tasks.py` is the Celery task that updates render status.
