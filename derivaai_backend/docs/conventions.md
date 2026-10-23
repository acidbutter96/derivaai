# Convenções

O projeto segue o padrão **fastapibuilder-api**.

## Python

- **3.13 ou mais novo** (`python = ">=3.13"`, `.python-version` = `3.13`, ruff `py313`, mypy `3.13`).
- Sintaxe moderna: `X | None`, genéricos nativos (`list[str]`), sem `typing.Optional/List/Dict`.
- Pisos de dependência com wheels para 3.13: `asyncpg >= 0.30`, `pydantic >= 2.10`, `sqlalchemy >= 2.0.36`, `celery >= 5.5`.
- SQLAlchemy sempre com o extra `asyncio` (`sqlalchemy = { extras = ["asyncio"], ... }`); sem ele o `greenlet` não é instalado em algumas plataformas e o import de `sqlalchemy.ext.asyncio` falha.
- Gerenciamento de dependências só com Poetry; nada de `requirements.txt`.

## Rotas

Todo decorator de rota declara `response_model`, `status_code` explícito e `summary`. O router só valida, chama o service e retorna.

## Injeção de dependência

- Providers cross-domain (`DbSession`, `PaginationDep`) em `core/dependencies.py`.
- Providers de um domínio (`PipelineServiceDep`...) no topo do `router.py` do próprio domínio.
- `core/` nunca importa de um domínio.

## Logging

- `@log_errors` na classe de service: aplica `log_call` a todo método público (debug na entrada, erro com traceback na falha, relança).
- `log_call` direto em um único método quando só ele precisa.
- Evitar ambos em caminhos quentes (loops de alta frequência).
- Os decorators só decidem *o que* logar (`extra={"event", "target"}`); o formato é de `settings/logging_config.py`.

## Exceções

Services e repositories só levantam tipos de `core/exceptions.py`. Para criar um erro novo: definir a classe e decorar um handler logo abaixo com `@exception_handler(Tipo)`; o `main.py` não muda.

## Unicidade e 409

Colunas únicas hoje: `pipelines.name`, `lessons.slug`, `node_types.key`, `assets.uri`.

1. A constraint no banco (`unique=True`) é a fonte da verdade.
2. O repository captura `IntegrityError`, faz `rollback()` e levanta `ConflictError` (helper privado `_commit_or_raise_conflict`, usado em `create` e `update`).
3. O router não faz nada extra; o handler de `ConflictError` devolve 409.

Não usar "checar se existe e depois inserir" como substituto: é redundante e tem corrida.

## Migrations

- Sempre geradas: `alembic revision --autogenerate -m "..."`, e revisadas antes de aplicar.
- Nome de arquivo com timestamp (`file_template` no `alembic.ini`).
- Todo `models.py` novo precisa entrar em `app/db/all_models.py`, senão o autogenerate não enxerga a tabela.
- Rollback: `alembic downgrade -1` (ou `-N`, ou uma revisão). Todo `downgrade()` precisa reverter o `upgrade()` por completo.
- Duas cabeças de migration: `alembic merge heads`.

## Testes

- `pytest` + `httpx.AsyncClient` (`ASGITransport`) para endpoints; SQLite em memória com `StaticPool`.
- Por coluna única: criar duplicado (409) e, se atualizável, colidir no `PATCH` (409 e o original intacto).
- `renders` sobrescreve `get_render_enqueuer` e não precisa de broker.
- `tests/test_decorators.py` cobre `log_call`/`log_errors` (sync, async, erro, `event`/`target`).
- `tests/test_executor.py` cobre ordenação, ciclo, tipo desconhecido e progresso.
- Factories em `tests/factories.py`, fora dos pacotes de domínio.
