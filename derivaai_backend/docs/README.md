# DerivaAI Backend - Documentação

> Coding agents: comecem pelo [`AGENTS.md`](../AGENTS.md) na raiz (regras, comandos e checklists). Esta pasta tem os detalhes.

Backend do DerivaAI: estúdio programável de aulas de engenharia/física. Pipelines montados em um
editor de nós (estilo ComfyUI) viram vídeos de aula narrados, em português (pt-BR) e inglês.

| Documento | Conteúdo |
|---|---|
| [architecture.md](architecture.md) | Visão geral, camadas, tree de arquivos, fluxo de uma requisição |
| [domains.md](domains.md) | Os cinco domínios: modelos, regras e endpoints |
| [workers.md](workers.md) | Fila (Celery/Redis), executor de grafos e handlers de nós |
| [conventions.md](conventions.md) | Padrão fastapibuilder, Python 3.13+, conflitos 409, testes |
| [setup.md](setup.md) | Como subir o ambiente local, migrations e testes |
| [roadmap-mvp.md](roadmap-mvp.md) | Fatias do MVP até a lição de circuito RC |
| [decisions.md](decisions.md) | Decisões tomadas e questões em aberto |

Stack: FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, PostgreSQL, Celery + Redis, Poetry, Python 3.13+.
Previstos para os nós: SymPy/SciPy/Matplotlib, Manim, FFmpeg, TTS.

## Ordem de leitura sugerida

1. [architecture.md](architecture.md) - onde cada coisa vive.
2. [conventions.md](conventions.md) - como escrever código aqui.
3. [domains.md](domains.md) e [workers.md](workers.md) - o que já existe.
4. [roadmap-mvp.md](roadmap-mvp.md) e [decisions.md](decisions.md) - o que falta e o que está em aberto.
