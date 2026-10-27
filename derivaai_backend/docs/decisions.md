# Decisões

## Tomadas

| Decisão | Motivo |
|---|---|
| Padrão fastapibuilder-api, cinco arquivos por domínio | Estrutura previsível; adicionar um domínio é uma adição mecânica |
| Python 3.13+ (`>=3.13`, sem teto) | 3.10 e 3.11 estão obsoletos para novos projetos |
| PostgreSQL + SQLAlchemy 2.0 async + Alembic | Stack proposta para o DerivaAI |
| Pipelines em JSON no formato React Flow, livres | O "template de lição" é opcional; o editor é de pipelines arbitrários |
| Celery + Redis para renders; task enviada por nome | Renders são longos; a API não importa o corpo das tasks |
| Enfileiramento injetado no `RenderService` | Testes sem broker |
| `node_types` sem chave estrangeira com o grafo | O catálogo descreve nós para a UI; o grafo só guarda o `type` |
| Primeira lição de aceitação: carga do circuito RC | Caso concreto para guiar as fatias |
| Sem issues de GitHub por enquanto | Ainda não existe repositório |
| Postgres compartilhado do devbutter_app (banco e role `derivaai`, `localhost:5436`), sem Postgres próprio; conexão por `DATABASE_*` | ADR-0008 do devbutter_app: um Postgres por ambiente; `DATABASE_URL` não é lida |
| Redis compartilhado da infra do devbutter_app, fila própria `derivaai-renders` (`REDIS_QUEUE_NAME`); sem `docker-compose.yml` no derivaai | Mesmo padrão do Postgres e de `blob-jobs`/`relay-shared`; a fila padrão `celery` colidiria |
| Worker com `-P solo` | Prefork usa `spawn` no macOS/3.13 e as tasks não executam; ver bugs abaixo |

## Em aberto

1. **Provedor de TTS** (fatia 4): precisa soar bem em pt-BR.
2. **Storage dos assets** (fatia 3): disco local ou S3 desde já.
3. **Execução dos nós pesados**: Manim e FFmpeg no mesmo worker ou em workers separados (imagem com dependências nativas).
4. **Autenticação**: fora do MVP, mas define se `lessons` e `pipelines` passam a ter dono.
5. **Repositório e CI**: onde hospedar e quando abrir as fatias como issues.

## Bugs encontrados (sem repositório para issues; registrar no GitHub quando existir)

| Bug | Estado |
|---|---|
| Worker prefork no macOS/Python 3.13 rejeita toda task (`ValueError: not enough values to unpack`), render fica em `queued` | Contornado com `-P solo`, documentado em `setup.md` |
| Worker não importava `lessons`: `NoReferencedTableError` em `renders.lesson_id` ao rodar a task (testes não pegavam porque o `conftest` importa todos os models) | Corrigido em `app/workers/tasks.py` + `tests/test_worker_import.py`; fechado na mesma fatia |
