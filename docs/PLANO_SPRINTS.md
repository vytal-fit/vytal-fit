# Vytal — Plano de Sprints (alinhado ao contrato)

> Documento de execução. Liga o **contrato comercial** (6 fases, €290.000, go-live 30 Out 2026) a **sprints de 2 semanas**, com entregáveis, critérios de aceitação e tranches por fase.
> Prestador: **JCUNHAFONTE, LDA** · Cliente: **Musas & Vikings, Lda** *(marca CrossFit Aveiro)* · Enquadramento: candidatura PRR *"Soluções de IA para PME's"* — projeto **CrossFit Aveiro Digital**.
> Última atualização: 2026-06-28.

---

## 1 · Decisões fechadas (a refletir no âmbito)

| # | Decisão | Origem | Impacto no plano |
| :--- | :--- | :--- | :--- |
| D1 | **Questionário pós-treino MANTIDO no MVP** *(RPE + gosto + limitação por lesão em escala 1–9)* — **sem** mapa interativo de lesões | Bruno (27/06) | Entra na **F4** (Bem-estar). O *body map* SVG fica para a fase seguinte. Começa a construir o perfil de performance/saúde do atleta. |
| D2 | **SAF-T / ATCUD faseado** | Bruno | **F5**: faturação operacional + emissão fiscal via fornecedor certificado; certificação completa segue após go-live. |
| D3 | **Candidatura PRR em nome da Musas & Vikings, Lda** | Bruno | Elegibilidade resolvida; faturação à Musas (entidade beneficiária). |
| D4 | **Conteúdo das BD de exercícios/WODs — validação pelo Juvenal** | Bruno | Pressuposto P-3; âmbito exato da produção de conteúdo **a esclarecer com o Bruno** (ponto em aberto). |
| D5 | **LLM = Claude** *(atrás de gateway trocável)* | JCUNHAFONTE | **F5**: Coach Assist AI. |
| D6 | Diferidos para fase seguinte: white-label, site builder/domínios+SSL, Google Reviews, avaliação de treinadores, mapa de lesões SVG, wearables, nutrição IA | §9.2 da proposta (Bruno: "concordamos") | Fora do MVP; via *Change Request* se anteciparem. |
| D7 | **Loja online / merch com fornecedores externos** *(modelo, cor, tamanho, encomenda e tracking)* | JCUNHAFONTE + fornecedor | Fase posterior / marketplace; prever já a integração para dealers chineses e outros parceiros de produção. Protótipo de catálogo/supplier routing já existe no web app com persistência por org; fulfillment real continua para fase posterior. |

---

## 2 · Metodologia

- **Sprints de 2 semanas.** *Planning* no início, *demo* + *checkpoint* no fim de cada sprint.
- **Governo:** *Steering* mensal com o *sponsor*; ponto de situação escrito quinzenal.
- **Definição de Pronto (DoD):** código revisto · testes a passar *(Vitest + Playwright relevantes)* · documentação atualizada · *deploy* em *staging* sem regressões · aprovação funcional do *stakeholder* quando visível.
- **Aceitação por fase:** entregáveis em *staging* + *demo* ao vivo + sem *bugs* bloqueantes + confirmação escrita → desbloqueia a tranche. **Aceitação tácita** se não houver resposta em 5 dias úteis após a *demo*.

---

## 3 · Calendário de sprints

| Sprint | Datas | Fase | Foco |
| :--- | :--- | :--- | :--- |
| **S1** | 30 Jun – 11 Jul | F1 | Fundação, infraestrutura & multi-tenant |
| **S2** | 14 – 25 Jul | F2 | Backoffice de gestão (parte 1) |
| **S3** | 28 Jul – 8 Ago | F2 | Backoffice de gestão (parte 2) → aceitação F2 |
| **S4** | 11 – 22 Ago | F3 | Treino — WOD Builder + exercícios |
| **S5** | 25 Ago – 5 Set | F3 | Treino — planeamento + PRs → aceitação F3 |
| **S6** | 8 – 19 Set | F4 | App do atleta (parte 1) |
| **S7** | 22 Set – 3 Out | F4 | Bem-estar + questionário pós-treino → aceitação F4 |
| **S8** | 6 – 17 Out | F5 | Coach Assist AI + faturação base |
| **S9** | 20 – 30 Out | F6 | Testes, pilotagem & **go-live (30 Out)** |

*As sprints podem atravessar fronteiras de mês; as fases do contrato mantêm-se como marcos de faturação.*

---

## 4 · Fases × sprints × entregáveis

### F1 · Fundação, Infraestrutura & Multi-Tenant — S1
**Tranche:** €40.000 *(inclui adjudicação €5.000)* · **Período:** Jun 2026
- Provisionamento de servidores e ambientes *(dev / staging / produção)*.
- Arquitetura multi-tenant ao nível do modelo de dados.
- Autenticação + RBAC; *pipeline* CI/CD.
- *Design system* inicial.
- *Backlog* detalhado das fases seguintes.
- **Aceitação:** ambientes de pé, login + isolamento por organização demonstráveis.

### F2 · Backoffice de Gestão (`pro.vytal.fit`) — S2–S3
**Tranche:** €55.000 · **Período:** Jul 2026
- Membros e perfis *(com lifestyle)*; planos e *dunning*; importação CSV; *waivers* digitais.
- CRM *kanban* + *automations* de leads.
- *Staff* e RBAC; dashboard / KPIs.
- **Aceitação:** gestor cria membro/plano/lead e vê KPIs reais.

### F3 · Treino — S4–S5
**Tranche:** €55.000 · **Período:** Ago 2026
- WOD Builder *(tipos de estímulo, timers)*.
- **BD ≥300 exercícios** (5 metodologias) e **BD ≥200 WODs** — *conteúdo validado pelo Juvenal (D4)*.
- Motor de planeamento (semanal/ciclos); cálculo de **%RM**.
- PRs e *leaderboards*; *whiteboard*/TV.
- **Aceitação:** treinador cria e publica WOD; plano atribuído a atleta/turma.

### F4 · App do Atleta (`my.vytal.fit`) + Bem-estar — S6–S7
**Tranche:** €60.000 · **Período:** Set 2026
- App do atleta: marcação ≤3 toques · check-in QR · ver WOD · registar resultado · *leaderboards* · PRs · %RM · gamificação.
- Bem-estar: **perfil de estilo de vida** + **check-in diário (sono/fadiga/stress 1–10)**.
- **Questionário pós-treino (D1):** RPE (1–9) + gosto (1–9) + limitação por lesão (escala 1–9) — **sem mapa interativo**; dados com *timestamp* para começar o **perfil de performance e saúde**.
- **Aceitação:** atleta marca, faz check-in, regista resultado e responde aos questionários; dados visíveis no perfil.

### F5 · Coach Assist AI + Faturação — S8
**Tranche:** €55.000 · **Período:** Out 2026
- **Coach Assist AI** *(Claude via gateway, RAG sobre a BD de exercícios/WODs, revisão humana obrigatória)*.
- **Faturação base:** MB Way / SEPA / cartão.
- **Fiscal PT (faseado — D2):** emissão de fatura com ATCUD/QR via **fornecedor de faturação certificado**; SAF-T gerado/submetido pelo fornecedor.
- **Aceitação:** plano gerado por IA com revisão humana; cobrança + fatura certificada emitidas.

### F6 · Testes, Pilotagem & Go-Live — S9
**Tranche:** €25.000 · **Período:** Out 2026 · **Go-live: 30 Out 2026**
- Landing `vytal.fit`; testes de integração e carga.
- **UAT com 3–5 atletas piloto**; correção de *bugs* críticos/altos.
- *Runbook*, alarmes, manual de utilizador PT-PT.
- **Go-live** + acompanhamento nos 30 dias seguintes *(garantia incluída, até 29 Nov 2026)*.
- **Aceitação:** plataforma em produção com piloto a operar em contexto real.

---

## 5 · Backlog diferido (fase seguinte)

Mapa de lesões SVG interativo + dashboard cruzado saúde/performance avançado · white-label *(theming/stores)* · site builder + domínio próprio + SSL · Google Reviews automático · avaliação de treinadores · *wearables* (Garmin/Apple/Whoop) · nutrição IA · *marketplace* · loja/merch com fornecedores externos (incl. dealers chineses) — protótipo web já existente, fulfillment real posterior · *corporate wellness*, multi-localização, VOD · restante do `pro` ainda com mistura de real API e mock/local.

---

## 6 · Pressupostos e dependências do cliente

- **P-1** *Stakeholder* operacional disponível (quinzenal ≤2h; respostas ≤2 dias úteis) e *sponsor* executivo.
- **P-2** Acesso a documentação/dados representativos do CrossFit Aveiro.
- **P-3** **Conteúdo das BD de exercícios/WODs validado pelo Juvenal** *(D4)* — âmbito da produção a esclarecer com o Bruno *(ponto em aberto)*.
- **P-4** Mobilização de 3–5 atletas piloto a partir de Setembro (UAT).
- **P-5** Domínio próprio e *branding* confirmados até ao fim da F1.
- **P-6** Gestão da candidatura PRR *(submissões, validação contabilística)* a cargo do cliente, com apoio técnico da JCUNHAFONTE.

---

## 7 · Pontos em aberto

| # | Tema | Responsável | Estado |
| :--- | :--- | :--- | :--- |
| A-1 | Âmbito exato da produção de conteúdo das BD (exercícios/WODs) | Bruno + Juvenal | A esclarecer *(D4)* |
| A-2 | Fornecedor de faturação certificado a integrar *(InvoiceXpress / Moloni / Vendus)* | JCUNHAFONTE | A decidir antes da F5 |
| A-3 | Domínio próprio e identidade visual final | Cliente | Até fim da F1 |
