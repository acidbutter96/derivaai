# Domínios

Todas as listagens aceitam paginação `?offset=0&limit=20` (`offset >= 0`, `1 <= limit <= 100`).
Erros: `404` quando o recurso não existe, `409` em violação de unicidade, `422` em payload inválido.

## pipelines - `/pipelines`

Grafo livre do editor de nós (formato React Flow). Não há obrigação de seguir o "template de lição".

- Modelo: `id`, `name` (**único**), `description`, `graph` (JSON `{nodes: [], edges: []}`), `created_at`, `updated_at`.
- Endpoints: `POST /` (201), `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` (204).
- Excluir um pipeline exclui seus renders (CASCADE) e solta as lições que o usavam (SET NULL).

## lessons - `/lessons`

Aula narrada. O pipeline é opcional.

- Modelo: `id`, `slug` (**único**, `^[a-z0-9]+(-[a-z0-9]+)*$`), `title`, `language` (`pt-BR` | `en`, padrão `pt-BR`), `status` (`draft` | `rendering` | `ready` | `failed`, padrão `draft`), `pipeline_id`, timestamps.
- Endpoints: `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`.

## nodes - `/nodes`

Catálogo de tipos de nó disponíveis para montar pipelines.

- Modelo: `id`, `key` (**único**, ex.: `sympy.solve`, `manim.scene`; `^[a-z0-9_]+(\.[a-z0-9_]+)*$`), `name`, `category` (`math` | `plot` | `animation` | `narration` | `audio` | `video` | `io`), `description`, `inputs` / `outputs` (listas de `{name, type}`), `config_schema` (JSON), `created_at`.
- Endpoints: `POST /`, `GET /?category=`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`.
- O catálogo descreve os nós para a UI; quem executa um nó é o handler registrado no worker ([workers.md](workers.md)).

## renders - `/renders`

Uma execução de pipeline, opcionalmente em nome de uma lição. Processada pela fila.

- Modelo: `id`, `pipeline_id` (obrigatório), `lesson_id`, `status` (`queued` | `running` | `succeeded` | `failed`), `progress` (0-100), `error`, `started_at`, `finished_at`, `created_at`.
- Endpoints:
  - `POST /` -> **202**. Valida que o pipeline existe (404 se não), grava o render como `queued` e enfileira o job.
  - `GET /?status_filter=&pipeline_id=` (mais recentes primeiro).
  - `GET /{id}`.
- Não há `PATCH`/`DELETE`: o estado só muda pelo worker.
- O enfileiramento é injetado (`get_render_enqueuer`), então os testes não precisam de broker.

## assets - `/assets`

Arquivos gerados ou enviados: gráficos, animações, áudio de narração, vídeo final.

- Modelo: `id`, `uri` (**único**), `kind` (`image` | `audio` | `video` | `data`), `mime_type`, `size_bytes`, `render_id`, `created_at`.
- Endpoints: `POST /`, `GET /?render_id=`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`.
- Hoje o asset só registra metadados; a gravação do arquivo em storage é a fatia 3 do [roadmap](roadmap-mvp.md).

## Meta

- `GET /health` -> `{"status": "ok"}`.
