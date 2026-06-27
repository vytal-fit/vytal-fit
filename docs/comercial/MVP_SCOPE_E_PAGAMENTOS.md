# Vytal — MVP · Âmbito e Plano de Pagamentos

**Documento de alinhamento (1 página) · para discussão com a Musas & Vikings, Lda. (CrossFit Aveiro) antes da proposta formal**
Apresentado por **JCUNHAFONTE, LDA** · 1 de Junho de 2026 · Confidencial

---

## 1 · Objetivo deste documento

Fixar **a linha que separa o MVP** (a entregar dentro da janela do PRR) **do que passa para a fase seguinte**, antes de redigir a proposta comercial completa. Responde diretamente ao pedido: *"as funcionalidades que vão trazer atraso e devem passar para o próximo passo"*.

Princípio orientador: **entregar cedo uma experiência completa e demonstrável** e adiar o que multiplica complexidade sem ser essencial à validação com o piloto.

---

## 2 · MVP — o que entra (núcleo a desenvolver)

| Área | Conteúdo |
| :--- | :--- |
| **Gestão** (`pro.vytal.fit`) | Membros e perfis · CRM/pipeline · staff e RBAC · dashboard de operação/KPIs |
| **Treino** | WOD Builder · base de exercícios (5 metodologias) · ≥200 WODs pré-construídos · motor de planeamento |
| **App do Atleta** (`my.vytal.fit`) | Marcação (≤3 toques) · check-in QR · ver WOD · registo de resultados · leaderboards · PRs · %RM · streaks/medalhas |
| **Perfil & Bem-estar (base)** | Perfil de estilo de vida · check-in diário simples (humor/fadiga/stress 1–10) |
| **Coach Assist AI (base)** | Geração de planos com revisão humana obrigatória *(ex.: "plano 4 semanas, CrossFit iniciante")* |
| **Faturação (base)** | Emissão de faturas · MB Way / SEPA |
| **Presença pública** | `vytal.fit` landing + site público pré-configurado |
| **Infraestrutura** | Multi-tenant · servidores e estrutura de dev/staging/produção *(incluído a pedido)* |

## 3 · Passa para a fase seguinte (⏭️ principais geradores de atraso)

| Item | Porquê adiar |
| :--- | :--- |
| **Site builder + domínios + SSL automático** *(Let's Encrypt)* | Infra pesada; substituível por site configurado manualmente no MVP |
| **White-label / theming dinâmico** | Marca única no MVP; theming por tenant depois |
| **Body map SVG interativo + cifragem RGPD Art.9** | Manter check-in simples; *build vs licenciar* o body map ainda em aberto |
| **Wearables (Garmin/Apple/Whoop) + nutrição IA** | Constam da visão "to-be" da candidatura; naturais para fases pós-MVP |
| **Sync de Google Reviews · avaliação peer de treinadores** | Dependências/itens não essenciais ao piloto |
| **AI Insights semanais de programação** | Manter só geração de planos; analítica depois |

## 4 · Frentes que mobilizam talento especializado *(executáveis — recomendação por frente)*

Não são incógnitas: são entregas que mobilizam o talento da equipa alargada. Recomendação por frente:

1. **Conformidade fiscal PT (SAF-T/ATCUD/QR).** Recomendado: **integrar fornecedor de faturação certificado pela AT** *(InvoiceXpress/Moloni/Vendus)* em vez de certificar software próprio; ativação faseada — cobrança no MVP, emissão fiscal logo a seguir.
2. **Coach Assist AI.** Especialista IA/LLM. Recomendado: **Claude** atrás de *gateway* trocável, com revisão humana.
3. **App white-label & site próprio.** Talento *mobile*/*front*. Recomendado: app única com *theming* + subdomínio com caminho para domínio próprio/SSL.
4. **Body map & conteúdo das BDs.** Talento de UX/conteúdo. Semeado pelos dados de planeamento e *logs* de WODs do CFA.
5. **Calendário PRR.** Go-live alvo **30 Out 2026** (janela: piloto Set–Out, relatório final Nov). Se apertar, reprograma-se o cronograma PRR sem alterar o valor.

---

## 5 · Investimento e plano de pagamentos

**Valor total: €290.000** *(acresce IVA)* · faturado à **Musas & Vikings, Lda.** *(marca CrossFit Aveiro)* · NIF PT516786997 · investimento total elegível PRR €290.000 *(apoio 75% ≈ €217.500; contrapartida ≈ €72.500)*

| Fase | Designação | Data | Valor |
| :--- | :--- | :--- | ---: |
| **Adjudicação** | Fatura de adjudicação *(desbloqueia adiantamento PRR)* | Jun 2026 | **€5.000** |
| **F1** | Fundação, Infraestrutura & Multi-Tenant *(servidores incluídos)* — remanescente | Jun 2026 | €35.000 |
| **F2** | Backoffice de Gestão (`pro.vytal.fit`) | Jul 2026 | €55.000 |
| **F3** | Treino — WOD Builder, Exercícios, Planeamento | Ago 2026 | €55.000 |
| **F4** | App do Atleta (`my.vytal.fit`) + Bem-estar base | Set 2026 | €60.000 |
| **F5** | Coach Assist AI + Faturação base | Out 2026 | €55.000 |
| **F6** | Testes, Pilotagem & Go-Live *(30 Out 2026)* | Out 2026 | €25.000 |
| **Total** | | | **€290.000** |

**Mecânica:** a 1.ª fatura (**€5.000**, adjudicação) é emitida na assinatura, conta para o total e cobre o arranque da F1; serve para pedir o **adiantamento PRR**. As tranches seguintes são emitidas após aceitação formal dos entregáveis de cada fase.

**Cronograma:** arranque **Jun 2026** → go-live **30 Out 2026** → garantia até **29 Nov 2026**, dentro da janela de execução do PRR.

---

### Notas / pressupostos a validar
- ✅ **Elegibilidade PRR:** a entidade faturada é a **Musas & Vikings, Lda.** *(marca CrossFit Aveiro, NIF PT516786997)*. **Confirmar** que a candidatura PRR está em nome desta razão social (não só da marca), além do IVA e do calendário do adiantamento.
- Valores **líquidos de IVA**, alinhados com a convenção da candidatura.
- **Servidores/estrutura** incluídos durante o projeto e setup inicial de produção; **cloud recorrente pós-go-live** fica como custo do cliente *(estimativa €1.500–3.000/mês)*.
- Falta confirmar: que a candidatura PRR está registada em nome de **Musas & Vikings, Lda.** *(e não só da marca CrossFit Aveiro)*.
