# Vytal — NEXT STEPS / Backlog

> Backlog vivo, atualizado a cada sprint. Ligado a [`docs/PLANO_SPRINTS.md`](docs/PLANO_SPRINTS.md) e ao contrato (JCUNHAFONTE ↔ Musas & Vikings · €290.000 · go-live 30 Out 2026).
> Legenda: `[ ]` por fazer · `[~]` em curso · `[x]` feito · `(D#)` decisão · `(A#)` ponto em aberto.
> Última atualização: 2026-06-30.

> **★ Estrela-guia: ZERO mock data.** O objetivo transversal é não haver dados
> falsos/`localStorage` de domínio em lado nenhum — toda a UI (pro, my) consome
> a API tRPC real, org-scoped. `localStorage` só para preferências (tema, idioma)
> via `STORAGE_KEYS`. Progresso vivo na secção "Erradicação de mock data".

## Decisões em vigor *(ref. Adenda 01)*
- **D1** Questionário pós-treino no MVP (F4), **sem** mapa de lesões.
- **D2** SAF-T/ATCUD **faseado** (F5, via fornecedor certificado).
- **D3** Candidatura PRR em nome de **Musas & Vikings, Lda**.
- **D4** Conteúdo das BD de exercícios/WODs **validado pelo Juvenal** (âmbito → A-1).
- **D5** LLM = **Claude** (gateway trocável).
- **D6** Diferidos: white-label, site builder, Google Reviews, avaliação de treinadores, mapa de lesões, wearables, nutrição IA.
- **D7** Loja online + catálogo de merch com integração a fornecedores chineses/dealers: o gestor escolhe modelo/cor/tamanho e a plataforma trata da ligação, encomenda e sincronização.

## Mapa de superfícies
- **landing** = presença pública (`vytal.fit`)
- **pro** = backoffice operacional (`pro.vytal.fit`)
- **my** = portal do atleta / membro (`my.vytal.fit`)
- No repo atual, os apps de produção estão separados por superfície: `apps/landing`, `apps/pro`, `apps/my` e `apps/api`; `apps/docs` existe só como leitor/apoio local, não como projeto Vercel necessário.
- API em produção passa a ser um origin separado (`api.vytal.fit`); `pro.vytal.fit` fica só para o web app e os clients usam `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`.
- Documentação pública para developers fica no ReadMe a partir de `apps/api/readme`; `api.vytal.fit` expõe `/openapi.json` como contrato machine-readable e a raiz redireciona para esse contrato.
- Estado real hoje: `pro` já tem alguns fluxos reais via tRPC/API, mas ainda mistura páginas ligadas a dados persistidos com muitas páginas de protótipo/mock. `my` tem app própria, login próprio e consome recursos reais do API onde já foi ligado, mas ainda precisa de completar as restantes superfícies.

---

## Pacotes (guia kloser) — o que adotar e quando
O DB já existe (Neon Postgres + Drizzle + migrações + seed + Better Auth + tRPC) — **não recriar**. Adotar pacotes do kloser à medida das fases:
- [ ] **`authz`** — *adiado (reality-check)*: o vytal já tem hierarquia de roles testada em `shared` (`ROLE_HIERARCHY` + `minRole` → `staffProcedure`/`adminProcedure`). Extrair pacote com matriz de capacidades como o kloser só vale a pena quando o modelo de **6 perfis × capacidades × scope** for mesmo necessário (fase posterior). Hoje seria over-engineering.
- [~] **`email`** — infra transacional **pronta**: pacote `@vytal-fit/email` (Brevo + provider mock), templates verificação/reset/password-changed/convite/convite-aceite/welcome em PT/EN/ES, sync idempotente via `npm run brevo:sync`, hooks Better Auth ligados (verificação no signup, reset, tripwire de mudança de password, convite, welcome ao fundador). Cobertura: builders + `sendEmail`. Falta: dunning + campanhas de go-live. → F2.
- [ ] **`agents` + `vectors`/pgvector** — vector store para o RAG do Coach Assist AI. → F5.
- [ ] *(opcional)* **`comms`** — gate RGPD de marketing/campanhas. → pós-MVP.
- [ ] **`whatsapp`** — comunicação com membros/leads (lembretes de aula, follow-up, dunning); forte no mercado PT. → pós-MVP / Fase 2.
- [ ] **`ads`** — Google/Meta Ads → leads no CRM (aquisição de membros). → pós-MVP / Fase 2.
- [ ] **`calendar-sync`** — sincronizar aulas/sessões PT com Google/Apple Calendar. → pós-MVP / Fase 2.
- [ ] *(talvez)* **`ocr`** — digitalização de waivers/contratos/ID dos membros. Baixa prioridade.
- ❌ Só `portals` (portais imobiliários) não tem uso no vytal; `connectors` fica genérico/baixa prioridade.

## F1 · Fundação, Infraestrutura & Multi-Tenant — S1 (€40.000)
- [x] Auditoria da fundação vs critérios de aceitação F1
- [x] Arquitetura multi-tenant (modelo de dados org-scoped) — todas as tabelas com `organizationId` + índices `org`/compostos
- [x] Autenticação + RBAC (`orgProcedure`, Better Auth)
- [x] Pipeline CI/CD (`ci.yml`, `e2e.yml`) + Vercel monorepo com projetos separados por root directory (`apps/landing`, `apps/pro`, `apps/my`, `apps/api`)
- [x] Provisionamento de ambientes dev / staging / produção (Vercel + Neon)
- [x] Design system base (shadcn/ui + tokens, light/dark)
- [x] Backlog detalhado F2–F6 (este ficheiro + `docs/PLANO_SPRINTS.md`)
- [x] **Clareza do data layer:** fonte única de chaves localStorage (`STORAGE_KEYS` em `@vytal-fit/shared`); stores centrais migradas; literal duplicado `"vytal-auth"` removido
- [~] Migrar chaves localStorage restantes (páginas `console/*`) — saem no wiring tRPC da F2/F4
- [x] Seed de produção coberto por teste de regressão (PGlite): 3 orgs, org-1 populada, idempotência
- [x] Seed de domínio das **org-2 / org-3** (core: coaches, locations, class types, membros, planos, leads) — ids alinhados ao mock; classes/WODs/check-ins seguem no wiring F2
- [x] Register real (Better Auth `signUp`) — era stub; hard-nav para `/onboarding` (padrão kloser)
- [x] Página `/welcome` (seleção de ginásio pós-login, padrão kloser); login → `/welcome` → escolher ginásio → `/dashboard` *(QA em browser pendente)*
- [ ] (A-3) Confirmar domínio próprio + identidade visual

## F2 · Backoffice de Gestão (`pro.vytal.fit`) — S2–S3 (€55.000)
- [ ] Membros e perfis (com lifestyle)
- [ ] Planos + dunning
- [ ] Importação CSV
- [ ] Waivers digitais
- [ ] CRM kanban + automations de leads
- [ ] Staff + RBAC
- [ ] Dashboard / KPIs
- [x] Suporte / tickets operacionais — lista, criação e mudança de estado via API org-scoped
- [~] Loja online / merch conectado a fornecedores externos (catálogo, variantes, encomenda, tracking) — **API real pronta**: `shop` router + tabelas + seed org-1 + 9 testes (fornecedores china/pt/eu, encomendas com total+tracking, role-gated). Falta ligar a UI do `pro/store` (browser-QA) + reconciliar campo `style`; fulfillment real e integrações externas continuam para fase posterior
- [ ] Aceitação F2

## F3 · Treino — S4–S5 (€55.000)
- [ ] WOD Builder (tipos de estímulo, timers)
- [ ] BD ≥300 exercícios (5 metodologias) — (D4/A-1) conteúdo validado pelo Juvenal; o catálogo já vem de um JSON/TS gerado com 1.3k+ movimentos, thumbnails/GIFs e notas PT/EN/ES, o WOD builder valida `exerciseId`s contra esse catálogo, mas o pipeline editorial/media ainda está parcial
- [ ] BD ≥200 WODs pré-construídos
- [ ] Motor de planeamento (semanal/ciclos)
- [ ] Cálculo de %RM
- [ ] PRs + leaderboards
- [ ] Whiteboard / TV
- [ ] Aceitação F3

## F4 · App do Atleta (`my.vytal.fit`) + Bem-estar — S6–S7 (€60.000)
- [x] **`gym_members.user_id`** (atleta ↔ membro) — migração `0002`, FK + unique por org; desbloqueia self-service
- [~] Self-service de bookings/resultados (atleta age sobre o SEU membro) — API + REST wrappers prontos; mobile booking/PR/WOD wiring em curso; `my` já consome bookings/PRs/resultados reais; exercícios/WODs usam catálogo partilhado file-backed com validação de movimentos
- [ ] Marcação ≤3 toques · check-in QR
- [ ] Ver WOD · registar resultado · leaderboards · PRs · %RM · gamificação
- [ ] Perfil de estilo de vida
- [x] Check-in diário (sono/fadiga/stress/disposição 1–10) — tabela `wellness_checkins` (upsert 1/dia, migração 0009) + router (list/byId/forDay/upsert) + `members.me` + ecrã `/wellness` no `my` (tRPC real) + i18n PT/EN/ES; leituras de saúde com guarda RGPD (atleta só os seus, org-wide só staff)
- [x] **(D1) Questionário pós-treino: RPE + gosto + limitação por lesão (1–9), sem mapa interativo** — `workoutFeedback` API + cartão "Último treino" no `/wellness` do `my`
- [~] Perfil de performance e saúde (base) — read-back: cartão de Tendências (média 7d + sparklines) no `/wellness`; falta perfil agregado cruzado
- [ ] Aceitação F4

## F5 · Coach Assist AI + Faturação — S8 (€55.000)
- [ ] (A-2) Escolher fornecedor de faturação certificado (InvoiceXpress / Moloni / Vendus)
- [ ] Coach Assist AI (D5: Claude + RAG + revisão humana)
- [ ] Faturação base: MB Way / SEPA / cartão
- [ ] (D2) Emissão fiscal ATCUD/QR + SAF-T via fornecedor certificado
- [ ] Aceitação F5

## F6 · Testes, Pilotagem & Go-Live (30 Out) — S9 (€25.000)
- [ ] Landing `vytal.fit`
- [ ] Testes de integração e carga
- [ ] UAT com 3–5 atletas piloto
- [ ] Correção de bugs críticos/altos
- [ ] Runbook + alarmes + manual PT-PT
- [ ] **Go-live 30 Out 2026**
- [ ] Acompanhamento 30 dias (garantia até 29 Nov 2026)

---

## Erradicação de mock data (★ estrela-guia)
Auditoria 2026-06-30 (`useDataStore` = store mock/localStorage de domínio):
- **`my`**: **0 páginas com `useDataStore`** ✅ — home, schedule, wod, records, profile, wellness todas em tRPC real. (Resta `progress` com `GOALS_KEY` local = metas pessoais; sem API de goals ainda.)
- **`pro`**: **16 páginas ainda com `useDataStore`** (audit 2026-06-30, fim de sessão): `communications/sms`, `community`, `dropins`, `financials`, `integrations`, `members/[id]/{assessments,body,nutrition,referrals}` (D6, diferidas), `members/import`, `screen`, `settings/{page,payments,website}`, `wods/programming`, e `layout.tsx` (só `switchOrgData`, intencional). **Reais via tRPC**: shell (notificações+features+mensagens), dashboard, members (list/[id]/edit/cancel/billing/360), staff (list/[id]), classes (list/[id]/attendance/feedback/waitlist), WODs, CRM (kanban + [id]), plans (list/create), locations, class-types, exercises, check-ins, settings/features, store, mensagens.
  - **`settings/page` + `settings/payments`**: zero-mock. `organization_settings` ganhou blobs `profile` (contacto/morada/social/locale, migração 0015) e `payment_methods` (MB Way/Multibanco/SEPA/cartão/dinheiro/transferência, migração 0016); `orgSettings.get` devolve `name`+`profile`+`paymentMethods`, `orgSettings.update` aceita patch de cada um (e o `name` atualiza a `organization` canónica). 5 testes novos (608 total). Aplicado à Neon de prod.
  - **O que falta a cada página restante**: `settings/website` (2029 linhas) → blob `publicSite` muito maior que o schema atual; `wods/programming` → hidratação client-side de exercícios no modal; `dropins`/`community`/`communications/sms`/`integrations`/`members/import`/`screen` → APIs/tabelas novas; `financials` → F5 (fiscal PT); `members/[id]/{body,nutrition,assessments,referrals}` → D6 (não fazer).
- **Shell/sidebar do `pro`** (`(app)/layout.tsx`): ligado à API real — notificações (`notifications.list`/`markRead`/`markAllRead`) no dropdown + badge de não-lidas; feature flags da org via `orgSettings.get` (filtragem do nav + route-protection); nome da org via memberships. Resta no shell: painel de mensagens (`conversations` mock) → espera API de comms (passo 3); `switchOrgData` mantido para páginas ainda em mock.
- **`crm/[id]`** (detalhe da lead): zero-mock — `leads.get` (lead + coach + timeline), `leads.update` (edição de perfil, defaults stripped), `leads.logActivity` (notas/chamadas/emails/bookings), `updateStage` regista `stage_change` automático. Nova tabela `lead_activities` (migração 0013) + seed de timeline para org-1. Aplicado à Neon de prod. 12 testes novos (585 total).
- **Comms / mensagens** (passo 3): API real `messages` router (`conversations` com thread + unreadCount derivado, `send` staff-only, `markRead`). Novas tabelas `conversations`/`messages` (migração 0014) + enum `conversation_contact_status` + seed org-1 (5 threads, 9 mensagens). Ligados: `messages/page.tsx` e o `FloatingChat` da shell (adaptam API → tipo `Conversation`, JSX intacto; tempos formatados no cliente). 10 testes novos (595 total). Aplicado à Neon de prod. **Resta na shell só `switchOrgData`** (mock data switch para páginas ainda em mock). Falta ainda: `communications/sms` + `communications/templates` (campanhas, não 1:1) e `inbox`.
- **Loja / merch (D7)**: **API + seed prontos** — tabelas `suppliers`/`store_products`/`store_orders` (migração 0010), router `shop` (catálogo, fornecedores china/pt/eu, encomendas com total+tracking, role-gated), 9 testes, seed org-1 (4 fornecedores + 6 produtos + 3 encomendas). **Falta ligar a UI do `pro/store`** (946 linhas em mock) + reconciliar o campo `style` (existe no protótipo, não no schema). → próximo passo F2 (browser-QA).
- **Biblioteca de exercícios**: router `exercises` existe (catálogo file-backed 1.3k+ movimentos, validação no WOD builder); falta pipeline editorial/media e consumo real em todas as superfícies.
- **`notifications/page.tsx`**: zero-mock (lista/markRead/markAllRead via API). **`settings/features`**: já estava em `orgSettings.get/update`; removida a sync redundante ao store mock (a shell lê features da mesma query partilhada).
- **`members/[id]`**: dados de domínio agora reais — `members.byId`/`update`/`archive`, `checkIns.list/create`, `subscriptions.byMember` (+ `plans.list` para resolver o plano), `personalRecords.list`. Já não importa `useDataStore`. **Resta mock local** (precisa de API/tabelas novas, não bloqueante): notas de staff, log de comunicações por membro, pagamentos (F5), timeline de atividade.
- **`plans/create`**: zero-mock (`subscriptions.plans.create` + `classTypes.list`).
- **`classes/[id]` + `classes/[id]/attendance`**: presença real — `classes.byId` (+ `classTypes`/`locations`/`coaches` para enriquecer), roster via `bookings.listByClass` (agora com `memberEmail`), check-in/no-show/check-in-todos via nova mutação `bookings.setAttendance` (staff+, carimba `checkedInAt`), walk-in via `bookings.book`. 5 testes novos (600 total). `classes/[id]/feedback`: nome da aula via API (as estatísticas de rating continuam mock, falta API de avaliações de aula).
- **`members/[id]/360`**: identidade/estado/plano reais (members.byId + subscriptions.byMember + plans); visuais de engagement continuam ilustrativos.
- **`classes/waitlist`**: zero-mock via nova query `bookings.waitlist` (waitlisted org-wide com classe+membro+posição); promover = `setAttendance(confirmed)`, remover = `cancel`. 3 testes novos (603 total).
- **Regra**: cada página migrada deixa de importar `useDataStore` para dados de domínio e passa a `trpc.*`; `localStorage` só preferências via `STORAGE_KEYS`.

## Pontos em aberto
- **A-1** Âmbito exato da produção de conteúdo das BD (exercícios/WODs) — *Bruno + Juvenal*.
- **A-2** Selecionar fornecedor de faturação certificado — *antes da F5*.
- **A-3** Domínio próprio + identidade visual final — *até fim da F1*.

## Diferido (fase seguinte)
Mapa de lesões SVG · dashboard cruzado saúde/performance (A3-04) · white-label · site builder + domínio/SSL · Google Reviews · avaliação de treinadores · wearables · nutrição IA · marketplace · corporate wellness · multi-localização · VOD · loja/merch com ligação a fornecedores externos (protótipo web já em linha; fulfillment real pendente) · resto do `pro` ainda com páginas mock/local que precisam de wiring tRPC/API.
