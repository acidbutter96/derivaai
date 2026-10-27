# Roadmap do MVP

Meta: a lição de teste "carga do circuito RC", em pt-BR, saindo em vídeo. Cada fatia é entregável e testável.

Já feito: esqueleto do backend (5 domínios, fila, executor, 29 testes) e a fatia 1 (fundação, validada com Postgres e Redis reais). Não há repositório remoto ainda, então as fatias não estão como issues.

| # | Fatia | Pronto quando |
|---|---|---|
| 1 | ✅ **Fundação**: `poetry install`, migration inicial revisada, Postgres e Redis da infra do devbutter_app, API e worker no ar | `/health` responde e um render `passthrough` termina `succeeded` com Postgres e Redis reais |
| 2 | **Nós de matemática e gráfico**: `sympy.solve` (EDO do RC, V(t) = V0(1 - e^(-t/RC))) e `plot.matplotlib` | Um pipeline de dois nós gera o gráfico da carga do RC |
| 3 | **Assets reais**: o executor passa contexto (render, `STORAGE_DIR`) aos handlers e cada saída vira um `Asset` ligado ao render | `GET /assets?render_id=` lista o PNG da fatia 2 |
| 4 | **Narração**: `tts.narrate` em pt-BR e en, gerando áudio como asset | Áudio narrando o texto da lição |
| 5 | **Animação e vídeo**: `manim.scene` (carga do capacitor) e `ffmpeg.compose` (animação + narração em MP4) | Vídeo final como asset do render |
| 6 | **Lição de ponta a ponta**: pipeline-modelo "lição RC" instanciado pela API; a lição vai a `ready` quando o render termina | Um `POST` cria a lição e entrega o vídeo do RC em pt-BR |
| 7 | **Editor mínimo (frontend)**: React Flow para montar, salvar, disparar e acompanhar o render | Refazer a lição RC pelo editor, sem chamar a API à mão |

Fora do MVP: autenticação e usuários, S3/CDN, outros temas além do RC, templates além do da lição.
