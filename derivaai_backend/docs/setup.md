# Setup local

Requisitos: Python 3.13+, Poetry, Docker (Redis aqui; Postgres no `shared-postgres` do devbutter_app).

```bash
# Postgres: um por ambiente (ADR-0008 do devbutter_app). Sobe a infra compartilhada, que cria o banco `derivaai`:
#   (cd ../../devbutter_app/infra && docker network create devbutter_shared 2>/dev/null; docker compose --env-file .env up -d shared-postgres)
docker compose up -d                 # Redis 7 (6379)
poetry env use 3.13
poetry install
cp .env.example .env
poetry run alembic revision --autogenerate -m "initial"   # revisar o arquivo gerado
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload                  # http://localhost:8000/docs
poetry run celery -A app.workers.celery_app worker -l info -P solo
poetry run pytest
```

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `ENVIRONMENT` | `development` | Fora de `development` o processo recusa subir se `DATABASE_URL` existir |
| `DATABASE_HOST` / `PORT` / `USER` / `PASSWORD` / `NAME` | `localhost` / `5436` / `derivaai` / `derivaai` / `derivaai` | Montam `postgresql+asyncpg://` no Settings (padrão das APIs do devbutter_app); `DATABASE_URL` não é lida |
| `DEBUG` | `false` | Eco do SQL da engine |
| `LOG_LEVEL` | `INFO` | Nível do logging |
| `REDIS_URL` | `redis://localhost:6379/0` | Broker e backend do Celery |
| `CELERY_TASK_ALWAYS_EAGER` | `false` | Executa tasks no próprio processo |
| `STORAGE_DIR` | `./storage` | Diretório de arquivos gerados (uso previsto na fatia 3) |

## Worker no macOS

Rode o worker com `-P solo`. O pool padrão (prefork) usa `spawn` no macOS com Python 3.13 e as tasks falham com
`ValueError: not enough values to unpack (expected 3, got 0)`, deixando o render em `queued`. Em Linux (container) o
prefork funciona; o `solo` também serve enquanto os renders forem um por vez.

## Estado de verificação

Os testes (28) passam com SQLite em memória. A fatia 1 foi validada com o `shared-postgres` (pgvector/pg16, banco `derivaai`) e Redis 7 reais: migration inicial
(`upgrade head`, `downgrade base`, `upgrade head`), `/health`, render `passthrough` -> `succeeded` e tipo de nó
desconhecido -> `failed` com a mensagem.
