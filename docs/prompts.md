# Série de prompts: implementar o roadmap do DerivaAI

Prompts prontos para colar no **Antigravity** (agente com acesso ao repositório). Cada slice do
[roadmap-mvp](../derivaai_backend/docs/roadmap-mvp.md) vira um prompt autocontido, com escopo, passos,
arquivos-alvo, testes e critérios de aceite. Os prompts apontam para os docs do repo em vez de repeti-los,
então o agente sempre trabalha com a versão atual.

Estado no momento da escrita: esqueleto do backend e slice 1 (fundação) prontos; frontend com telas
mockadas (`derivaai_frontend/src/lib/mock`); slices 2 a 7 pendentes.

## Como usar no Antigravity

1. Abra a raiz do repositório (`derivaai/`) como workspace, para o agente enxergar backend, frontend e docs.
2. Cole o **Prompt 0** como regra do workspace (ou no início de cada conversa nova). Ele vale para todos os outros.
3. Uma conversa por prompt, uma branch por slice (`feat/slice-N-<nome>`). Use o modo de planejamento: leia o plano de implementação do agente **antes** de liberar a execução e barre qualquer plano que invente arquitetura fora do que os docs descrevem.
4. Depois de cada slice: rode `poetry run pytest` (backend) ou `yarn lint && yarn build` (frontend) você mesmo, revise o diff e só então abra a PR.
5. Ordem e paralelismo:

| Prompt | Depende de | Pode rodar em paralelo com |
|---|---|---|
| H (higiene) | nada | qualquer um |
| 2 Matemática e gráfico | slice 1 (pronta) | 7a |
| 3 Assets reais | 2 | 7a |
| 4 Narração | 3 | 5 (cuidado com conflito no `executor.py`), 7b |
| 5 Animação e vídeo | 3 | 4, 7b |
| 6 Lição ponta a ponta | 4 e 5 | 7c |
| 7a/7b/7c Editor | 7a só precisa do contrato da API; 7c precisa do 3 | 2 a 6 |

## Duas inconsistências que você precisa decidir antes

**1. Contrato do grafo: protótipo x design-v2.** O backend implementado usa arestas `{source, target}`,
handler `handler(data, inputs)` e chaves como `sympy.solve` e `plot.matplotlib`. O frontend mockado já segue
o [design-v2](design-v2.md) (portas tipadas, `math.solve_ode`, `plot.function`), que ainda é **proposta
pendente de aprovação**. Os prompts 2 a 6 seguem o protótipo, como o roadmap manda. O prompt 7a trata a
diferença com um adaptador no frontend, sem tocar no backend. Se você aprovar o design-v2, ele deveria
entrar **antes** do slice 2, porque muda a assinatura dos handlers e o formato do grafo.

**2. Repositório remoto.** `derivaai_backend/AGENTS.md` diz que não há repositório no GitHub e proíbe
issues e PRs, mas o remoto `acidbutter96/derivaai` existe e já tem a PR #1 mergeada. O prompt H corrige
isso. Enquanto não rodar, o Prompt 0 deixa explícito que vale a regra da organização: bug encontrado vira
issue no GitHub.

---

## Prompt 0: Contexto base (regra do workspace)

```text
Você trabalha no DerivaAI: estúdio programável de aulas de engenharia/física. Pipelines (grafos de nós
estilo ComfyUI) viram vídeos de aula narrados em pt-BR e en. Aula de aceitação: carga do circuito RC.

LEIA ANTES DE QUALQUER MUDANÇA
- derivaai_backend/AGENTS.md (regras que não se negociam) e os docs que ele indica
- docs/README.md, docs/architecture.md, docs/data-model-and-api.md, docs/rc-lesson-flow.md
- derivaai_backend/docs/roadmap-mvp.md e derivaai_backend/docs/decisions.md
- Frontend: derivaai_frontend/AGENTS.md. Este Next.js (16) tem mudanças incompatíveis com o que você
  conhece; leia o guia relevante em derivaai_frontend/node_modules/next/dist/docs/ antes de escrever código.

REGRAS GERAIS
1. Padrão fastapibuilder-api: cada domínio em app/<domínio>/ com exatamente router.py, schemas.py,
   models.py, service.py, repository.py. Router fino; regra de negócio no service (@log_errors);
   SQLAlchemy só no repository; core/ nunca importa de domínio.
2. Python 3.13+, só Poetry (nunca requirements.txt), SQLAlchemy com extra asyncio.
3. Migrations sempre geradas (alembic revision --autogenerate), revisadas, com downgrade() válido.
4. Toda rota declara response_model, status_code e summary. Task Celery é enviada por nome via
   app/workers/dispatch.py; a API nunca importa app/workers/tasks.py.
5. Toda mudança mantém a suíte verde: poetry run pytest. Sem teste, não está pronto.
6. Não invente arquitetura. Se algo não estiver nos docs, proponha a opção mínima, registre em
   derivaai_backend/docs/decisions.md e siga. Não implemente nada do docs/design-v2.md: é proposta
   pendente de aprovação.
7. Não toque em ../devbutter_app/infra nem em outros repositórios. Postgres e Redis são os compartilhados.
8. Segredos (chaves de API) só por variável de ambiente via app/settings/config.py. Nunca no código,
   em teste, em log ou em commit.
9. Idioma: documentação e conversa em pt-BR; código, nomes de variável e mensagens de commit em inglês.
10. Trabalhe em uma branch feat/slice-N-<nome>. Faça commits pequenos. Abra a PR com gh, mas NÃO faça merge.

BUGS (regra da organização)
Sempre que você encontrar um bug, mesmo que fora do escopo da tarefa, abra uma issue no GitHub
(repo acidbutter96/derivaai) com gh issue create: título curto, sintoma, passos de reprodução, causa
provável e arquivo/linha. Se o bug for corrigido na mesma slice, referencie a issue no commit e feche-a
no final com gh issue close <n> --comment "<como foi resolvido>". Se não for corrigido, deixe a issue
aberta e cite-a no resumo final. Registre também em decisions.md, seção "Bugs encontrados".

ENTREGA DE TODA SLICE
- Código + testes + migration (se houver) + docs atualizados (domains.md, workers.md, architecture.md
  do backend, docs/ do projeto, roadmap-mvp.md marcando a slice como concluída).
- Resumo final: o que mudou, como rodar e testar, decisões tomadas, issues abertas/fechadas, pendências.
```

---

## Prompt H: Higiene dos docs (rápido, opcional, faça primeiro)

```text
Siga o Contexto base. Tarefa de documentação, sem mudar código de aplicação.

Problema: derivaai_backend/AGENTS.md e docs/decisions.md afirmam que não existe repositório remoto e
proíbem issues e PRs, mas `git remote -v` mostra origin = github.com/acidbutter96/derivaai e a PR #1
já foi mergeada.

Faça:
1. Confirme com git remote -v e git log que o remoto existe.
2. Em derivaai_backend/AGENTS.md, troque a seção "Projeto sem repositório remoto" por "Repositório e issues":
   o repo é acidbutter96/derivaai; bugs viram issues no GitHub (gh issue create); a issue é fechada ao
   fim da slice se foi corrigida nela; PRs por branch feat/slice-N-<nome>, sem merge pelo agente.
3. Em derivaai_backend/docs/decisions.md: mova "Repositório e CI" de "Em aberto" para "Tomadas" (só a parte
   do repositório; CI continua em aberto) e transforme a tabela "Bugs encontrados" em referência às issues:
   abra no GitHub uma issue para cada bug da tabela (o do prefork -P solo no macOS/3.13 fica aberto como
   workaround; o do import de lessons no worker já foi corrigido, então abra e feche com comentário).
4. Em derivaai_backend/docs/roadmap-mvp.md, remova "Não há repositório remoto ainda" e crie uma issue por
   slice (2 a 7) com o critério "Pronto quando" da tabela; coloque o link das issues na tabela.
5. Em docs/README.md, adicione prompts.md à tabela de documentos, se o arquivo existir.

Critérios de aceite: nenhum doc afirma mais que não há repositório; as issues existem e estão
linkadas; nenhum arquivo fora de docs/ e derivaai_backend/docs|AGENTS.md foi alterado.
```

---

## Prompt 2: Nós de matemática e gráfico (slice 2)

```text
Siga o Contexto base. Slice 2 do roadmap: nós de matemática e gráfico.

OBJETIVO
Um pipeline de dois nós gera o gráfico da carga do RC. Leia docs/rc-lesson-flow.md (seção "Stored graph
shape") e derivaai_backend/docs/workers.md. O executor e o handler `passthrough` já existem em
app/workers/executor.py; o contrato é handler(data: dict, inputs: dict) -> dict. Mantenha esse contrato.

ESCOPO
Criar o pacote app/workers/handlers/ (um módulo por categoria) e registrá-lo para que o worker e os
testes carreguem os handlers sem import circular (veja como tasks.py e tests/test_worker_import.py
tratam imports e preserve esse teste verde). Handlers:

1. io.params: devolve data (R, C, V0) como saída. Valide tipos e faixas (R, C > 0) e levante um erro que
   herde de PipelineError com mensagem clara. As chaves finais de nós de entrada são decididas aqui:
   registre em decisions.md se mudar o nome ilustrativo.
2. sympy.solve: recebe a equação (string) e os parâmetros em inputs, resolve a EDO com condição inicial
   V(0)=0 e devolve: a expressão de V(t) como string, tau = R*C numérico e os parâmetros. Para o RC,
   o resultado tem de ser V0*(1 - exp(-t/(R*C))). SEGURANÇA: a equação vem do usuário. Proibido eval/exec;
   use o parser do SymPy com namespace restrito (símbolos e funções permitidas explícitos), limite o
   tamanho da entrada e traduza qualquer falha de parsing para PipelineError.
3. plot.matplotlib: usa o backend Agg (sem GUI), amostra V(t) de 0 a t_max_in_tau * tau, marca t = tau
   (63,2% de V0), rotula eixos com unidades e salva um PNG. O PNG vai para um diretório derivado de
   settings.storage_dir (já existe em app/settings/config.py); devolva o caminho no output
   ("image_path"). Esse caminho é provisório: a slice 3 transforma saídas em Assets.

Dependências: poetry add sympy matplotlib (confirme o resolver e que o lock fica consistente em 3.13).

CATÁLOGO
Os três tipos precisam existir no catálogo (nodes: key, category, inputs, outputs, config_schema) para o
editor listá-los. Proponha a menor opção idempotente (por exemplo um comando de seed em
app/nodes/ ou script em scripts/) e registre a escolha em decisions.md. Não use migration de dados
escrita à mão.

TESTES (tests/)
- Cada handler isolado (caso feliz + entrada inválida + equação maliciosa tipo "__import__('os')").
- Verificação numérica: V(tau) ≈ 0,632 * V0 com tolerância explícita.
- Pipeline io.params -> sympy.solve -> plot.matplotlib via execute_graph e também via POST /renders com
  CELERY_TASK_ALWAYS_EAGER, afirmando render succeeded e PNG existente e não vazio (assinatura PNG).
- Teste que garante que todo tipo registrado em HANDLERS tem entrada no catálogo.

CRITÉRIOS DE ACEITE
- poetry run pytest verde (os 29 testes anteriores continuam passando).
- Um render do grafo RC de dois nós termina succeeded e gera o PNG com a curva e a marca em tau.
- docs/workers.md (tabela de handlers) e docs/rc-lesson-flow.md atualizados; roadmap marca a slice 2.

FORA DO ESCOPO: registrar Assets no banco (slice 3), TTS, Manim, FFmpeg, qualquer mudança de frontend.
```

---

## Prompt 3: Assets reais (slice 3)

```text
Siga o Contexto base. Slice 3: assets reais. Pré-requisito: slice 2 mergeada.

OBJETIVO
O executor passa contexto (render, diretório de armazenamento) aos handlers e cada arquivo gerado vira
um Asset ligado ao render. GET /assets?render_id= lista o PNG da slice 2.

DECISÃO A REGISTRAR (decisions.md, fecha o ponto em aberto 2)
Storage: disco local em settings.storage_dir agora, atrás de uma interface (Protocol Storage com
save/open/uri) para trocar por S3 depois sem tocar nos handlers. Não implemente S3.

ESCOPO
1. Contexto: dataclass NodeContext (render_id, node_id, workdir com Path). Os handlers existentes
   (passthrough e os da slice 2) continuam funcionando. Escolha a forma que quebre menos: aceitar um
   terceiro parâmetro opcional ou inspecionar a assinatura. Registre a escolha. Atualize os handlers
   da slice 2 para escrever em ctx.workdir (storage_dir/renders/<render_id>/<node_id>/).
2. Saída de arquivo: tipo FileOutput(path, kind, mime_type) que o handler devolve no dict de saída.
   O executor continua PURO (sem I/O de banco): quem persiste é a task em app/workers/tasks.py, que ao fim
   de cada nó, ou ao fim do render, cria um Asset por FileOutput (uri, kind, mime_type, size_bytes,
   render_id). Reexecutar um render não pode duplicar assets (uri é única; trate o ConflictError).
3. Download: GET /assets/{asset_id}/file serve o arquivo (FileResponse) com o mime_type correto.
   Proteja contra path traversal: o caminho vem do banco, mas valide que está sob storage_dir.
4. Limpeza: um render falho não deixa assets órfãos apontando para arquivo inexistente.

Respeite o padrão de cinco arquivos: a lógica de download fica em assets/service.py, o router só delega.

TESTES
- Executor com contexto (fake handler que escreve arquivo).
- Render do pipeline RC (2 nós) com Postgres de teste: 1 Asset image/png, size_bytes correto, render_id certo.
- GET /assets?render_id= e GET /assets/{id}/file (200 com bytes do PNG, 404 se arquivo sumiu, 4xx em path fora de storage_dir).
- Re-render não duplica.

CRITÉRIOS DE ACEITE
pytest verde; um render real (Postgres + Redis + worker -P solo) produz PNG listado em /assets?render_id=
e baixável; workers.md, domains.md e architecture.md atualizados; roadmap marca a slice 3.

FORA DO ESCOPO: S3, URLs assinadas, autenticação.
```

---

## Prompt 4: Narração (slice 4)

```text
Siga o Contexto base. Slice 4: narração. Pré-requisito: slice 3 mergeada.

OBJETIVO
tts.narrate em pt-BR e en, gerando um asset de áudio com a duração conhecida.

PASSO 1: DECISÃO (antes de codar, ponto em aberto 1 do decisions.md)
Compare, em uma tabela curta em decisions.md, 3 a 4 provedores de TTS quanto a: qualidade em pt-BR,
latência, custo por minuto, licença/uso comercial, necessidade de rede e de chave. Inclua pelo menos
um provedor local/offline (por exemplo Piper) como fallback sem custo e um provedor de nuvem (por exemplo
ElevenLabs, Google Cloud TTS ou OpenAI TTS). Faça a pesquisa na documentação oficial, não de memória.
Pare e me apresente a recomendação antes de implementar. Só continue depois da minha confirmação.

PASSO 2: IMPLEMENTAÇÃO (após aprovação)
1. Interface TTSProvider (Protocol): synthesize(text, language, voice, speed) -> bytes de áudio + formato.
   Um módulo por provedor em app/workers/tts/. Seleção por settings (tts_provider, chaves por env).
2. Handler tts.narrate: data = {language, voice, speed, pause_ms}; inputs traz o texto do roteiro (nó io.text,
   que você também cria: devolve o texto). language pode vir do render/lição ("render" no mock do
   frontend significa herdar). Saída: FileOutput de áudio (wav ou mp3 conforme o provedor) e duration_seconds
   (necessário para a slice 5 sincronizar o vídeo). Meça a duração do arquivo gerado, não a estime.
3. Divida textos longos em frases para respeitar limites do provedor e some pause_ms entre elas.
4. Falhas de rede/quota viram PipelineError com mensagem sem vazar chave; sem retry infinito.
5. Registre io.text e tts.narrate no catálogo (mesma técnica do seed da slice 2).

TESTES
- Provedor fake determinístico (gera tom/silêncio com duração proporcional ao texto) para todos os testes
  unitários e de pipeline. Nenhum teste chama a rede nem exige chave.
- Um teste de integração opcional, marcado (pytest -m integration) e pulado sem chave, com o provedor real. Registre o marker `integration` em [tool.pytest.ini_options] do pyproject.toml (ainda não existe) e use `-m "not integration"` como padrão.
- Pipeline io.text -> tts.narrate: Asset de áudio criado, duration_seconds > 0, pt-BR e en.

CRITÉRIOS DE ACEITE
pytest verde sem rede e sem chave; com a chave configurada, o teste de integração gera áudio audível
narrando o texto do RC em pt-BR; .env.example (ou setup.md) documenta as variáveis novas sem valores
reais; workers.md, decisions.md e roadmap atualizados.

FORA DO ESCOPO: clonagem de voz, SSML avançado, cache de áudio entre renders.
```

---

## Prompt 5: Animação e vídeo (slice 5)

```text
Siga o Contexto base. Slice 5: animação e vídeo. Pré-requisito: slice 3 mergeada (pode rodar em paralelo
com a slice 4; se as duas mexerem em executor.py ou no seed do catálogo, rebase sobre a que mergear primeiro).

OBJETIVO
manim.scene (carga do capacitor) e ffmpeg.compose (animação + gráfico + narração em MP4) como assets.

PASSO 1: DECISÃO (ponto em aberto 3 do decisions.md)
Manim (precisa de cairo, pango, ffmpeg e, para fórmulas, LaTeX) e FFmpeg no mesmo worker ou em worker
separado? Investigue as dependências nativas reais no macOS e em Linux, proponha a opção mínima e registre.
Recomendação inicial a validar: mesma base de código, mas fila própria "derivaai-media" para nós pesados
(o mock do frontend já fala em queues cpu|media) e um Dockerfile do worker de mídia em derivaai_backend/docker/.
NÃO crie docker-compose no repo (a infra é a do devbutter_app) e não edite ../devbutter_app/infra.

PASSO 2: IMPLEMENTAÇÃO
1. manim.scene: data = parâmetros da cena (V0, tau, resolução, fps, qualidade). Gere o arquivo da cena em
   diretório temporário e chame o CLI do manim via subprocess com lista de argumentos (sem shell=True),
   timeout configurável e captura de stderr. Saída: FileOutput de vídeo (MP4 sem áudio) e duration_seconds.
   A animação mostra o capacitor carregando e a curva V(t) com marca em tau.
2. ffmpeg.compose: inputs = vídeo da cena, áudio da narração e (opcional) imagem do gráfico. Mux em MP4
   H.264/AAC (yuv420p para tocar em qualquer lugar). Regra de duração: o vídeo final dura max(vídeo, áudio);
   se o áudio for maior, congele o último quadro; nunca corte a narração. Use subprocess com argumentos em
   lista e valide que os arquivos de entrada existem e estão sob storage_dir.
3. Erros: binário ausente, timeout e saída não zero viram PipelineError com trecho útil do stderr.
4. Registre os dois tipos no catálogo.

TESTES
- Unitários com subprocess mockado: montagem correta dos argumentos, timeout, erro de binário.
- Integração marcada (pytest -m integration), pulada se manim/ffmpeg não estiverem no PATH: renderiza uma
  cena curta (480p, 2 s) e compõe com áudio gerado pelo ffprobe/ffmpeg; valide com ffprobe que o MP4 tem
  uma faixa de vídeo e uma de áudio e duração esperada.
- Pipeline completo com handlers falsos para vídeo/áudio, para rodar em qualquer máquina.

CRITÉRIOS DE ACEITE
pytest verde em máquina sem Manim/FFmpeg (integração pulada); em máquina com eles, o teste de integração
passa e o MP4 abre num player; docs (workers.md, setup.md com as dependências nativas, decisions.md,
roadmap) atualizados.

FORA DO ESCOPO: legendas, múltiplas cenas, transições elaboradas, GPU.
```

---

## Prompt 6: Lição ponta a ponta (slice 6)

```text
Siga o Contexto base. Slice 6: lição de ponta a ponta. Pré-requisito: slices 4 e 5 mergeadas.

OBJETIVO
Um único POST cria a lição, instancia o pipeline-modelo "lição RC" e entrega o vídeo em pt-BR. A lição vai
a ready quando o render termina.

ESCOPO (padrão fastapibuilder-api: lógica no service, router fino)
1. Template como código: app/lessons/templates/rc_charging.py com uma função que recebe parâmetros
   (R, C, V0, language, texto opcional) e devolve o grafo completo de docs/rc-lesson-flow.md:
   io.params -> sympy.solve -> plot.matplotlib e manim.scene; io.text -> tts.narrate; tudo -> ffmpeg.compose.
   Roteiro padrão em pt-BR e en (use a física de docs/rc-lesson-flow.md: RC dV/dt + V = V0, V(t) =
   V0(1 - e^(-t/RC)), tau = RC, 63,2% em t = tau). Parâmetros validados com Pydantic.
2. Endpoint POST /lessons/from-template (202): body {template: "rc-charging", title, slug opcional,
   language, params}. Cria Pipeline + Lesson (status rendering) + Render e enfileira. Retorna ids e status.
   Slug e nome do pipeline únicos: gere sufixo estável e trate 409 do jeito do repo.
3. Máquina de estados da lição, alterada só pelo worker: draft -> rendering -> ready | failed, espelhando o
   render. Sem estado inconsistente: se o render falhar, a lição vai a failed com o erro acessível.
4. Reexecutar render de uma lição failed volta a rendering sem criar lição nova.

TESTES
- Template gera grafo acíclico com todos os tipos registrados no catálogo e nos HANDLERS.
- POST /lessons/from-template com handlers falsos de TTS/Manim/FFmpeg (eager): lição termina ready, render
  succeeded, assets de imagem, áudio e vídeo listados.
- Falha em um nó: lição failed, render failed com error, sem assets órfãos.
- Teste de integração marcado: o fluxo real produz o MP4 do RC em pt-BR (pula sem as dependências).

CRITÉRIOS DE ACEITE
pytest verde; com o ambiente completo, curl em POST /lessons/from-template entrega, via polling em
GET /renders/{id} e GET /assets?render_id=, o vídeo do RC em pt-BR; docs/rc-lesson-flow.md ganha o
"como rodar" real; roadmap marca a slice 6 e o MVP backend como concluído.

FORA DO ESCOPO: outros templates além do RC, autenticação, frontend.
```

---

## Prompt 7a: Frontend, contrato da API e telas reais (slice 7, parte 1)

```text
Siga o Contexto base. Slice 7, parte 1 de 3. Só frontend (derivaai_frontend) e uma mudança mínima de CORS
no backend. Leia derivaai_frontend/AGENTS.md e o guia do Next em node_modules/next/dist/docs/ antes de codar.

CONTEXTO
As telas hoje leem de src/lib/mock (data.ts, types.ts, catalog.ts, index.ts). O comentário em
src/lib/mock/types.ts diz que trocar o mock por fetch real não deve mexer nos componentes. O mock segue o
docs/design-v2.md (portas tipadas, chaves math.solve_ode/plot.function, arestas from/to com port), mas o
backend implementado segue o protótipo (arestas {source,target}, chaves sympy.solve/plot.matplotlib).
O design-v2 NÃO está aprovado: não o implemente no backend.

ESCOPO
1. Backend (mínimo): CORSMiddleware em app/main.py, origens vindas de settings (cors_origins, padrão
   http://localhost:3000). Teste cobrindo o preflight.
2. Tipos gerados: adicione openapi-typescript e o script "yarn gen:api" que gera src/lib/api/schema.d.ts a
   partir de http://localhost:8000/openapi.json. Faça commit do arquivo gerado.
3. Cliente: src/lib/api/client.ts (fetch tipado, base URL por NEXT_PUBLIC_API_URL, erros 404/409/422
   tratados com tipo próprio), e TanStack Query (@tanstack/react-query) com provider no layout.
4. Adaptadores: src/lib/api/adapters.ts converte entre o formato do backend e os tipos de
   src/lib/mock/types.ts (que a UI consome), nos dois sentidos, incluindo grafo {source,target} <-> portas.
   Onde o backend não tem o dado (portas tipadas, título do nó, posições), derive do catálogo local de
   src/lib/mock/catalog.ts e guarde posições dentro de node.data.ui. Documente cada lacuna em
   docs/design-ui.md ou num novo docs/frontend-contract.md como "diferença protótipo x v2".
5. Telas de lista e detalhe (lessons, pipelines, renders, nodes) passam a usar hooks reais
   (useLessons, usePipelines, useRenders, useNodeTypes...) em src/lib/api/hooks.ts. Mantenha o mock
   ativo por NEXT_PUBLIC_USE_MOCK=1 para desenvolvimento offline. Estados de carregando, vazio e erro
   usando os componentes de src/components/ui existentes.
6. Zod para validar respostas nas bordas (não confie cegamente no tipo gerado).

CRITÉRIOS DE ACEITE
yarn lint e yarn build verdes; com o backend no ar (uvicorn + Postgres), as telas listam dados reais criados
via /docs; com NEXT_PUBLIC_USE_MOCK=1 continuam funcionando como hoje; nenhuma mudança visual
inesperada (siga design/design-system.md e os tokens); lacunas protótipo x v2 documentadas.

FORA DO ESCOPO: canvas editável (7b), disparo e acompanhamento de render (7c), i18n.
```

---

## Prompt 7b: Editor com React Flow (slice 7, parte 2)

```text
Siga o Contexto base. Slice 7, parte 2 de 3. Pré-requisito: 7a mergeada. Só frontend.

CONTEXTO
O editor mockado fica em src/app/(editor)/pipelines/[id]/ (Editor.tsx, EditorCanvas.tsx, NodePalette.tsx,
Inspector.tsx, Dock.tsx, graph.ts, simulate.ts) com os componentes de src/components/pipeline. Hoje o
canvas é desenhado à mão e o estado é local. Referência visual: design/wireframes/02-editor.html e
design/layout.md.

ESCOPO
1. Adicione @xyflow/react e zustand. O canvas React Flow é só cliente: "use client" e carregamento dinâmico
   sem SSR (conforme o guia do Next desta versão). Reutilize NodeCard e Port como nós customizados,
   mantendo o visual do design system.
2. Store Zustand (src/app/(editor)/pipelines/[id]/store.ts): nós, arestas, seleção, dirty flag, undo/redo
   simples. Posições dos nós em node.data.ui (convenção da 7a).
3. Paleta: lista os tipos do catálogo real (useNodeTypes) agrupados por categoria; arrastar para o canvas
   cria o nó com config padrão.
4. Conexões: validação por tipo de porta usando src/lib/ports.ts; rejeitar aresta inválida com feedback
   visual; impedir ciclos no cliente (o backend também valida com CycleError).
5. Inspector: formulário gerado do config_schema / ConfigField do nó selecionado, validado com Zod.
6. Salvar: PATCH /pipelines/{id} com o grafo adaptado; indicador "não salvo" (status warning já existe em
   lib/status.ts); atalho Ctrl/Cmd+S; aviso ao sair com alterações.
7. Carregar: GET /pipelines/{id} e adaptar para o canvas.
8. Criar pipeline novo a partir da lista (POST /pipelines).

TESTES
Sem framework de teste no frontend hoje: adicione Vitest + Testing Library só para a lógica pura (store,
validação de portas, adaptadores, detecção de ciclo). Não escreva testes de snapshot visual.

CRITÉRIOS DE ACEITE
yarn lint, yarn build e yarn test verdes; é possível montar do zero o grafo RC pelo editor (io.params,
sympy.solve, plot.matplotlib), salvar, recarregar a página e ver o mesmo grafo; ligação de portas
incompatíveis é recusada.

FORA DO ESCOPO: executar render (7c), i18n, colaboração em tempo real.
```

---

## Prompt 7c: Executar, acompanhar e i18n (slice 7, parte 3)

```text
Siga o Contexto base. Slice 7, parte 3 de 3. Pré-requisitos: 7b mergeada e slice 3 no backend
(download de assets). Só frontend.

ESCOPO
1. Executar: botão "Renderizar" no editor (POST /renders {pipeline_id, lesson_id?}); desabilitado com
   alterações não salvas (peça para salvar antes) e com grafo inválido.
2. Acompanhar: polling com TanStack Query (refetchInterval enquanto status for queued|running; pare ao
   chegar em succeeded|failed) em GET /renders/{id}. O backend só tem progresso global (0-100), não
   por nó: mostre a barra global em RunTimeline e marque os nós como "executando" de forma honesta (sem
   inventar estado por nó). Deixe a UI pronta para o estado por nó do design-v2 e documente a lacuna.
3. Resultados: ao concluir, GET /assets?render_id=; mostre PNG no OutputCard e Media, áudio num player e
   o vídeo final em <video controls> usando GET /assets/{id}/file. Em failed, mostre render.error.
4. Tela de render (src/app/(app)/renders/[id]) usa os dados reais.
5. i18n pt-BR e en com next-intl, conforme o guia do Next desta versão: mova os textos hoje espalhados em
   lib/nav.ts e lib/status.ts (que já têm dicionários por Locale) para o mecanismo do next-intl, com
   troca de idioma persistida. Sem texto fixo novo fora dos dicionários.
6. Fluxo de aceitação: refazer a lição RC pelo editor, sem chamar a API à mão.

TESTES
Vitest para o hook de polling (para quando termina), a seleção de mídia por kind e as chaves de i18n
(pt-BR e en têm o mesmo conjunto de chaves).

CRITÉRIOS DE ACEITE
yarn lint, yarn build e yarn test verdes; com o backend completo no ar (slices 2 a 6), montar a lição RC
no editor, renderizar e assistir ao MP4 na própria tela de render; trocar entre pt-BR e en altera toda a UI;
docs/README.md, docs/design-ui.md e o roadmap marcam a slice 7 e o MVP como concluídos.

FORA DO ESCOPO: SSE/push de eventos (design-v2), autenticação, upload de assets pelo cliente.
```

---

## Depois do MVP

Pontos que os prompts acima deixam de propósito para depois: aprovar ou descartar o
[design-v2](design-v2.md) (portas tipadas, versões imutáveis de pipeline, cache por nó, SSE),
autenticação e dono de lições/pipelines, S3/CDN, CI e novos templates além do RC. Cada um merece um
prompt próprio, escrito depois que a decisão for tomada.
