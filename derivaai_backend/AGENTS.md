# AGENTS.md - DerivaAI Backend

Guia para coding agents. Leia este arquivo primeiro; os detalhes estão em [`docs/`](docs/README.md).

## O que é

Backend FastAPI do DerivaAI: estúdio programável de aulas de engenharia/física. Pipelines (grafos de nós
estilo ComfyUI) viram vídeos de aula narrados em pt-BR e en. Primeira lição de aceitação: carga do circuito RC.

## Stack

Python 3.13+, FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, PostgreSQL, Celery + Redis, Poetry.

## Mapa da documentação

| Quando precisar de... | Leia |
|---|---|
| Camadas, tree de arquivos, modelo de dados | [docs/architecture.md](docs/architecture.md) |
| Modelos, regras e endpoints de cada domínio | [docs/domains.md](docs/domains.md) |
| Fila, executor de grafos, handlers de nós | [docs/workers.md](docs/workers.md) |
| Padrões de código, 409, migrations, testes | [docs/conventions.md](docs/conventions.md) |
| Subir o ambiente | [docs/setup.md](docs/setup.md) |
| O que construir em seguida | [docs/roadmap-mvp.md](docs/roadmap-mvp.md) |
| Decisões e pontos em aberto | [docs/decisions.md](docs/decisions.md) |

## Comandos

```bash
(cd ../../devbutter_app/infra && docker compose --env-file .env up -d shared-postgres redis)  # Postgres + Redis (docs/setup.md)
poetry env use 3.13 && poetry install
poetry run uvicorn app.main:app --reload                  # API em :8000/docs
poetry run celery -A app.workers.celery_app worker -l info -P solo
poetry run pytest                                         # toda mudança deve manter a suíte verde
poetry run alembic revision --autogenerate -m "msg"       # revisar antes de aplicar
poetry run alembic upgrade head
```

## Regras que não se negociam

1. **Padrão fastapibuilder-api**: cada domínio em `app/<domínio>/` com exatamente `router.py`, `schemas.py`, `models.py`, `service.py`, `repository.py`.
2. Router fino: valida, chama o service, retorna. Regra de negócio só no `service.py` (com `@log_errors`).
3. SQLAlchemy só no `repository.py`. Ele traduz `IntegrityError` em `ConflictError` (com `rollback()` antes de levantar). Service e router só veem exceções de `app/core/exceptions.py`.
4. `core/` nunca importa de um domínio. Provider de DI de domínio fica no `router.py` dele.
5. Toda rota declara `response_model`, `status_code` e `summary`.
6. Coluna única nova = `unique=True` no model + tradução para 409 no repository + dois testes (duplicado e colisão no PATCH).
7. Domínio ou model novo: registrar o router em `app/main.py` e o `models` em `app/db/all_models.py`.
8. Python 3.13+ (`python = ">=3.13"`); SQLAlchemy sempre com o extra `asyncio`. Só Poetry, nunca `requirements.txt`.
9. Migrations sempre geradas (não escritas à mão) e revisadas; o `downgrade()` precisa reverter o `upgrade()`.
10. Task Celery enviada por nome via `app/workers/dispatch.py`; a API não importa `app/workers/tasks.py`.

## Checklist: adicionar um domínio

1. Criar `app/<domínio>/` com os cinco arquivos (mais `__init__.py`).
2. `include_router` em `app/main.py`; import do `models` em `app/db/all_models.py`.
3. Gerar e revisar a migration.
4. Testes em `tests/test_<domínio>.py` (endpoints + unicidade); factory em `tests/factories.py`.
5. Atualizar [docs/domains.md](docs/domains.md) e a tree em [docs/architecture.md](docs/architecture.md).

## Checklist: adicionar um nó executável

1. Handler com `@node_handler("tipo.nome")` em `app/workers/` (assinatura `handler(data, inputs) -> dict`).
2. Registrar o tipo no catálogo (`POST /nodes`) com `key`, `category`, `inputs`, `outputs`.
3. Teste do handler e do pipeline que o usa (ver `tests/test_executor.py`).
4. Atualizar a tabela de handlers em [docs/workers.md](docs/workers.md).

## Estado atual

Esqueleto pronto: 5 domínios (`pipelines`, `lessons`, `nodes`, `renders`, `assets`), fila Celery, executor
topológico (único handler real: `passthrough`), 29 testes passando. Fatia 1 (fundação) concluída, usando o Postgres compartilhado do devbutter_app (banco `derivaai`, porta 5436): migration
inicial gerada e validada (upgrade/downgrade) e render `passthrough` ponta a ponta com Postgres e Redis reais.
Próximas fatias: [docs/roadmap-mvp.md](docs/roadmap-mvp.md).

## Projeto sem repositório remoto

Não há repositório no GitHub ainda: não abra issues nem PRs. Registre pendências em
[docs/decisions.md](docs/decisions.md) (seção "Em aberto") ou no roadmap.

## Idioma

Documentação e comunicação em português (pt-BR); código, nomes e mensagens de commit em inglês.
