# **VYTAL**

## *Plataforma SaaS de Gestão e Treino com Inteligência Artificial*

### Para CrossFit, Treino Funcional, Hyrox, Running e Personal Trainers

# Proposta Comercial — MVP

|  |  |
| :---- | :---- |
| **Apresentado por** | **JCUNHAFONTE, LDA** · NIF PT515097365 |
| **Apresentado a** | **MUSAS & VIKINGS, LDA** *(marca: CrossFit Aveiro)* · NIF PT516786997 |
| **Data de emissão** | 1 de Junho de 2026 |
| **Validade da proposta** | 30 dias |
| **Classificação** | Confidencial · Uso restrito ao cliente |

## Identificação das partes

| Campo | Prestador | Cliente |
| :---- | :---- | :---- |
| **Razão social** | JCUNHAFONTE, LDA | MUSAS & VIKINGS, LDA |
| **Marca comercial** | · | CrossFit Aveiro |
| **NIF** | PT515097365 | PT516786997 |
| **Forma jurídica** | Sociedade por Quotas | Sociedade por Quotas |
| **Sede** | Portugal | TABPARK – Zona Industrial da Taboeira, Lote 27, Fração A2, 3800-055 Esgueira, Aveiro |
| **CAE principal** | · | 93130 · Atividades de ginásio |
| **Representante legal** | José Cunha Fonte (Sócio-Gerente) | Juvenal Fernandes (Sócio-Gerente) |
| **Contacto técnico** | José Fonte · Lucas Hartridge | *\[a preencher\]* |

| Campo | Valor |
| :---- | :---- |
| **Designação técnica** | Plataforma SaaS de gestão e treino com Inteligência Artificial |
| **Marca comercial do produto** | Vytal |
| **Período contratual** | 1 de Junho de 2026 a 30 de Novembro de 2026 *(6 meses; garantia até 29 de Novembro de 2026)* |
| **Conclusão e *go-live*** | 30 de Outubro de 2026 |
| **Valor total** | **€290.000,00** *(acresce IVA à taxa legal em vigor)* |
| **Enquadramento PRR** | Candidatura *"Soluções de IA para PME's"* · projeto **CrossFit Aveiro Digital** · investimento total €290.000 · apoio 75% (~€217.500) · contrapartida da empresa (~€72.500) |
| **Validade da proposta** | 30 dias a contar da data de emissão |

> **Nota de pressupostos.** Esta proposta consolida o âmbito do documento *MVP Vytal v2.0* e da candidatura PRR *CrossFit Aveiro Digital*, e as conversas com a Musas & Vikings, Lda. *(CrossFit Aveiro)*. Alguns parâmetros — datas exatas e linha de corte do âmbito — carecem de confirmação formal. A versão final é emitida após o alinhamento de âmbito (Secção 9 e 18).

---

## Índice

**PARTE I. Enquadramento Estratégico**

- 1. Sumário Executivo
- 2. Contexto e Problema a Resolver
- 3. Visão, Objetivos e Métricas de Sucesso
- 4. Diferenciação e Proposta de Valor

**PARTE II. Solução Técnica**

- 5. Arquitetura Geral do Sistema
- 6. *Stack* Tecnológico
- 7. Inteligência Artificial — Coach Assist
- 8. Funcionalidades por Persona
- 9. Âmbito do MVP — o que entra e o que transita
- 10. Conformidade, Segurança e RGPD

**PARTE III. Execução**

- 11. Equipa e Responsabilidades
- 12. Metodologia e Governo de Projeto
- 13. Cronograma e Fases
- 14. Detalhe Técnico por Fase
- 15. Critérios de Aceitação por Fase

**PARTE IV. Investimento e Condições Comerciais**

- 16. Plano de Investimento
- 17. Plano de Pagamentos
- 18. Pressupostos e Dependências do Cliente
- 19. Gestão de Alterações de Âmbito
- 20. SLA e Garantia Pós-*Go-Live*
- 21. Análise de Riscos e Plano de Mitigação

**PARTE V. Termos Legais**

- 22. Propriedade Intelectual
- 23. Confidencialidade e Proteção de Dados
- 24. Termos Contratuais Gerais
- 25. Aceitação da Proposta

**Anexos**

- Anexo A. Mapeamento ao Cronograma PRR
- Anexo B. Especificação Funcional dos Módulos do MVP
- Anexo C. Glossário Técnico
- Anexo D. Documentos de Referência

---

# PARTE I: Enquadramento Estratégico

## 1 · SUMÁRIO EXECUTIVO

A **JCUNHAFONTE, LDA** propõe à **MUSAS & VIKINGS, LDA** a conceção, construção, integração e colocação em produção do **MVP da plataforma Vytal**: um SaaS multi-tenant de gestão e treino para espaços de fitness e bem-estar — CrossFit, treino funcional, Hyrox, running e personal trainers — com **inteligência artificial integrada** no apoio à programação de treino. A plataforma é adaptada ao uso do CrossFit Aveiro, no âmbito da candidatura PRR *"Soluções de IA para PME's"* — projeto **CrossFit Aveiro Digital**.

A solução organiza-se em três superfícies complementares:

- **`vytal.fit`** — *landing* e apresentação do produto;
- **`my.vytal.fit`** — app do cliente/atleta *("my" de "a minha app de fitness")*, disponível em *browser* e, em fase posterior, como aplicação nativa iOS/Android;
- **`pro.vytal.fit`** — *backoffice* de gestão e administração *(o lado "pro"fissional)*.

**Resultado contratual.** A 30 de Outubro de 2026 o CrossFit Aveiro terá em produção um MVP funcional, multi-tenant, em conformidade com o RGPD, com um grupo-piloto a operá-lo em contexto real — alinhado com a janela de execução do PRR *(operação piloto Set–Out 2026; relatório final Nov 2026)* e base sólida para validação e iteração subsequente.

A presente proposta consolida o **âmbito técnico, o cronograma físico-financeiro e os termos comerciais** do contrato a celebrar entre as partes. A faturação total da JCUNHAFONTE, LDA à MUSAS & VIKINGS, LDA cifra-se em **€290.000** *(acresce IVA)*, distribuídos por uma **fatura de adjudicação** e **seis fases de execução**, com tranches sincronizadas com a aceitação dos entregáveis. A primeira fatura, de adjudicação (€5.000), formaliza o serviço e destina-se a permitir o pedido de **adiantamento no âmbito do PRR**. O valor corresponde ao investimento total elegível de **€290.000** da candidatura.

### ▸ 1.1 · Âmbito completo *vs* MVP

O documento *MVP Vytal v2.0* descreve o **conjunto completo do produto** (52 *user stories*). A presente proposta delimita um **MVP verdadeiro**, entregável dentro da janela do PRR, e identifica explicitamente os itens que, por gerarem atraso, transitam para a fase seguinte (Secção 9).

## 2 · CONTEXTO E PROBLEMA A RESOLVER

A gestão de boxes, estúdios e ginásios funcionais assenta hoje num mosaico de ferramentas fragmentadas — folhas de cálculo, apps genéricas de marcação, faturação manual — que não comunicam entre si nem capturam a especificidade do treino funcional: WODs, metodologias, PRs, %RM, *leaderboards*. No CrossFit Aveiro, em concreto *(situação "as-is" da candidatura)*: atendimento manual, planos de treino e nutrição elaborados à mão, ausência de integração de dados e acompanhamento reativo, com tarefas administrativas a absorver tempo da equipa de *coaching*.

A Vytal substitui esse mosaico por uma plataforma única que cobre **gestão, treino e experiência do atleta**, com IA a assistir o treinador na programação.

## 3 · VISÃO, OBJETIVOS E MÉTRICAS DE SUCESSO

**Visão.** Tornar-se o sistema operativo dos espaços de fitness e bem-estar, do CrossFit ao *personal training*.

**Objetivos do MVP:**

1. Experiência completa e demonstrável das três superfícies em produção.
2. CrossFit Aveiro a operar gestão + treino + app do atleta em contexto real *(operação piloto)*.
3. Coach Assist AI a gerar planos de treino com revisão humana.

**Métricas de sucesso (piloto):**

| Métrica | Alvo |
| :---- | :---- |
| Marcação de aula | ≤ 3 toques |
| Check-in | QR sem atrito |
| WODs publicados via *Builder* | ≥ 80% |
| Plano gerado por IA aceite/editado pelo treinador | < 5 min |
| *Uptime* (pós-go-live) | ≥ 99,5% mensal |

> Estes alvos articulam-se com os resultados esperados na candidatura PRR *(redução ~50% no tempo de gestão/atendimento; +40% eficiência técnica; +25% retenção/satisfação)*.

## 4 · DIFERENCIAÇÃO E PROPOSTA DE VALOR

### ▸ 4.1 · O que torna esta solução defensável

- **Vertical, não genérica:** modela WODs, metodologias, PRs, %RM e *leaderboards* de raiz.
- **Três superfícies coerentes:** gestão, atleta e site público partilham o mesmo núcleo de dados.
- **IA com guarda-corpos:** o Coach Assist acelera a programação, com **revisão humana obrigatória** antes de publicar.
- **Multi-tenant desde o primeiro dia:** isolamento de dados por organização garantido na arquitetura.

### ▸ 4.2 · Proposta de valor para o CrossFit Aveiro

1. **Time-to-market:** metodologia ágil e incremental para entregar um MVP demonstrável e em produção dentro da janela do PRR.
2. **Mercado português:** desenhado para MB Way, SEPA e conformidade fiscal PT *(SAF-T/ATCUD — Secção 9)*.
3. **Escalabilidade:** arquitetura multi-tenant pronta para múltiplos espaços sem reescrita.

---

# PARTE II: Solução Técnica

## 5 · ARQUITETURA GERAL DO SISTEMA

| Superfície | Domínio | Descrição |
| :---- | :---- | :---- |
| *Landing* | `vytal.fit` | Apresentação do produto e captação. |
| App do Atleta | `my.vytal.fit` | Web app *(e nativa, fase posterior)*: marcação, check-in, treino, resultados, bem-estar. |
| *Backoffice* | `pro.vytal.fit` | Gestão de membros, treino, *staff*, faturação, KPIs. |
| App nativa | iOS / Android | Submissão às lojas em fase posterior *(processo de revisão Apple/Google)*. |

**Princípios arquiteturais:** multi-tenant com isolamento por organização; *end-to-end type safety*; suporte PT/EN/ES; tema claro/escuro; *offline-first* na app do treinador.

## 6 · *STACK* TECNOLÓGICO

A Vytal assenta num *stack* **TypeScript unificado** *(mesma linguagem do *frontend* ao *backend*)*, organizado em monorepo. A escolha privilegia *type safety* ponta-a-ponta, velocidade de entrega e baixo custo de manutenção.

### ▸ 6.1 · Aplicações e API

| Tecnologia | Papel | Justificação |
| :---- | :---- | :---- |
| **Next.js 15** *(App Router)*, React 19 | *Backoffice* (`pro`), *landing* (`vytal.fit`), sites públicos | *Server Components*, *streaming* e SSR/ISR; *deploy* nativo na Vercel. |
| **Tailwind CSS + Radix UI + shadcn/ui** | *Design system* e componentes acessíveis | Consistência visual, tema claro/escuro, acessibilidade *(WAI-ARIA)*. |
| **Expo 54 / React Native** | App do atleta (`my`), nativa iOS/Android *(fase posterior)* | Base de código partilhada; *offline-first* na app do treinador. |
| **tRPC** | *Backend* partilhado, API tipada ponta-a-ponta | Elimina divergência *client/server*; sem geração de SDK. |
| **Zod** | Validação de *schemas* e *inputs* | Contratos partilhados entre camadas; *single source of truth*. |
| **i18n (PT/EN/ES)** | Internacionalização | Mercado PT primeiro, expansão ES/EN sem reescrita. |

### ▸ 6.2 · Dados e Analítica

| Tecnologia | Papel | Justificação |
| :---- | :---- | :---- |
| **PostgreSQL** *(Neon)* | Base de dados relacional principal, *org-scoped* | Isolamento multi-tenant; *serverless*, escala e *branching*. |
| **Drizzle ORM** | Acesso a dados tipado + migrações versionadas | *Schema-as-code*, migrações reprodutíveis em CI. |
| **Redis** *(cache / tempo-real)* | *Cache*, sessões, *leaderboards* em tempo real | Latência baixa para *leaderboards* e *check-ins*. |
| **Armazenamento de objetos** *(S3-compatível)* | Multimédia *(vídeos de exercícios, imagens)* | Custo baixo, CDN à frente. |
| **Camada analítica** *(tabelas agregadas; *data warehouse* em fase posterior)* | Métricas de operação, performance e bem-estar | Base para *dashboards* e, mais tarde, modelos preditivos. |

**Base de dados de treinos, modelos e exercícios.** Respondendo diretamente à questão colocada: **sim**, o modelo de dados contempla de raiz um **catálogo de exercícios** *(por metodologia: CrossFit, Hyrox, Força, Running, Personalizado)*, uma **biblioteca de WODs** *(≥200 pré-construídos + criados no Builder)*, **modelos/templates de planos** e o **histórico de resultados e PRs** por atleta. Esta estrutura é o que alimenta o WOD Builder, o motor de planeamento e o Coach Assist AI *(via RAG — Secção 7)*.

### ▸ 6.3 · Inteligência Artificial / LLM

| Tecnologia | Papel | Justificação |
| :---- | :---- | :---- |
| **Claude** *(recomendado)*, atrás de *gateway* trocável | Coach Assist — geração de planos com justificação | Estado-da-arte em raciocínio; *gateway* permite trocar provedor sem reescrita. |
| **RAG** sobre catálogo de exercícios/WODs | Fundamentar as sugestões em dados reais do espaço | Reduz alucinação; respostas ancoradas no equipamento e histórico. |
| **Embeddings + *vector store*** *(fase posterior)* | Recomendação e *matching* de treinos | Recomendações personalizadas por perfil/objetivo. |

> **Provedor LLM: Claude**, atrás de uma camada de abstração *(gateway)* que permite trocar de modelo sem reescrita. *(A candidatura refere genericamente modelos LLM equivalentes a Copilot/Gemini/Claude.)*

### ▸ 6.4 · Autenticação, Infraestrutura e DevOps

| Tecnologia | Papel | Justificação |
| :---- | :---- | :---- |
| **Better Auth** + *plugin* de organização *(5 papéis)* | Autenticação, sessões, RBAC, multi-org | Provisionamento por convite; MFA opcional para gestão. |
| **Turborepo** | Monorepo *(web + mobile + packages partilhados)* | *Builds* incrementais e *cache* partilhada. |
| **Vercel** | *Deploy*, *preview environments*, CDN | CI/CD integrado; ambientes por *branch*. |
| **CI/CD + gestão de ambientes** | *dev / staging / produção* | *Pipelines* automáticos com migrações e *seed*. |
| **Observabilidade** *(logs, erros, *uptime*)* | Monitorização pós-go-live | Suporta o SLA da Secção 20. |

### ▸ 6.5 · Qualidade e Testes

| Tecnologia | Papel | Justificação |
| :---- | :---- | :---- |
| **Vitest** | Testes unitários e de integração | Rápido; cobertura da lógica de negócio/API. |
| **Playwright** | Testes E2E *(fluxos de utilizador)* | Valida os fluxos críticos em *browser* real. |
| **TypeScript + ESLint** | *Type-check* e *linting* em CI | Barreira de qualidade antes do *merge*. |

## 7 · INTELIGÊNCIA ARTIFICIAL — COACH ASSIST

**Coach Assist AI *(base, incluído no MVP)*.** *Chat* na área do treinador que gera estruturas de plano completas com justificação *(equilíbrio, volume, foco)*. Exemplo: *"plano de 4 semanas, CrossFit iniciante"*. A IA considera a base de exercícios, o equipamento do espaço, o histórico recente e a metodologia escolhida.

**Salvaguardas obrigatórias.** Toda a saída é apresentada como **sugestão indicativa**, sujeita a **revisão e edição humana antes de publicar**, com *disclaimer* visível. Operações sensíveis exigem confirmação humana *(human-in-the-loop)*.

*Fora do MVP (Secção 9):* AI Insights semanais de programação, recomendação de nutrição avançada, integração de *wearables* e analítica de correlação treino↔bem-estar *(previstos em fases posteriores da candidatura)*.

## 8 · FUNCIONALIDADES POR PERSONA *(mapa de user stories v2.0)*

> Legenda: **M** = MVP-MUST · **S** = MVP-SHOULD · *(F2/F3/F4)* = fase posterior. Os itens MVP-MUST que recomendamos diferir para proteger o prazo constam na Secção 9.2.

### ▸ 8.1 · Gestor

| Epic | *Stories* MVP |
| :---- | :---- |
| **G1** Dashboard & KPIs | Dashboard de operação diária (M) · KPIs negócio/churn/ocupação (M) · alertas de risco de abandono (M) · assiduidade por aula/horário (S) |
| **G2** Membros & Planos | Perfil completo c/ *lifestyle* (M) · planos de subscrição (M) · *dunning* de pagamentos (M) · importação CSV (M) · contratos/*waivers* digitais (M) · *onboarding* 30 dias (S) |
| **G3** Billing & Fiscal PT | Pagamentos cartão/MB Way/SEPA/Multibanco (M) · **SAF-T + ATCUD + QR fiscal (M — ver 9.3)** · notas de crédito/reembolsos (M) · POS de balcão (M) |
| **G4** CRM & Leads | *Pipeline* de leads *kanban* (M) · *automations* de leads (M) · *automations* de retenção (S) |
| **G5** Staff & Permissões | 6 perfis + RBAC + *audit log* (M) · escalas/turnos (S) · chat interno (S) |
| **G6** Marketing *(novo v2)* | White-label · *site builder* · Google Review automático · avaliação de treinadores — **todos MVP-MUST no documento; recomendamos diferir, ver 9.2** |

### ▸ 8.2 · Treinador

| Epic | *Stories* MVP |
| :---- | :---- |
| **C1** WOD / Programação / IA | WOD Builder + tipos de estímulo + *timers* (M) · BD **≥300 exercícios** em 5 metodologias (M) · BD **≥200 WODs** pré-feitos (M) · planeamento semanal agendado (M) · motor de planeamento *(estilo TrueCoach/CoachRx)* (M) · **Coach Assist AI** (M) · cálculo %RM por atleta (S) · *insights* semanais de programação (S) |
| **C2** Coach App & Aula | App *offline-first* (M) · *timers* (M) · *whiteboard*/coachboard tempo real (M) · TV Display da box (M) · notas privadas de *coaching* (M) |
| **C3** PRs & Progressão | Registo de PRs (M) · *leaderboards* tempo real (M) · gestão de lesões/restrições (S) |

### ▸ 8.3 · Personal Trainer

| Epic | *Stories* MVP |
| :---- | :---- |
| **P1** Agenda & Sessões | Agenda 1:1 e *semi-private* (M) · página de *booking* pública (M) · *packs* de sessões (M) · dashboard do PT (S) |
| **P2** Clientes & Planos | Perfil completo do cliente (M) · *builder* de planos (M) · notas de sessão (S) |
| **P3** Faturação | Link de pagamento/cobrança (M) · fatura simplificada (M) |

### ▸ 8.4 · Atleta

| Epic | *Stories* MVP |
| :---- | :---- |
| **A1** Reservas & Check-in | Marcação ≤3 toques (M) · check-in QR (M) · gerir plano/pagamentos (M) · notificações configuráveis (M) |
| **A2** WOD / PRs / Gamificação | Ver WOD do dia c/ vídeos (M) · registar resultado + *leaderboard* (M) · histórico de PRs (M) · %RM no WOD (M) · *streaks*/medalhas (S) |
| **A3** Saúde & Bem-estar *(novo v2)* | Perfil *lifestyle* (M) · questionário diário 1–10 (M) — **questionário pós-treino c/ *body map* (A3-03) e dashboard cruzado performance/saúde (A3-04) são MVP-MUST no documento; recomendamos diferir, ver 9.2** |

## 9 · ÂMBITO DO MVP — O QUE ENTRA E O QUE TRANSITA

O documento *MVP Vytal v2.0* classifica quase todas as *user stories* como **MVP-MUST**, o que torna o "MVP" praticamente equivalente ao produto completo. Para entregar dentro da janela do PRR, a JCUNHAFONTE propõe a linha de corte seguinte. **Esta linha é uma recomendação para discussão** — todos os itens diferidos podem ser repostos no MVP via *Change Request* (Secção 19), com o impacto correspondente em prazo e valor.

### ▸ 9.1 · Núcleo do MVP — recomendado para *go-live*

Essencial à operação do piloto, a desenvolver e colocar em produção:

- **Gestão:** dashboard e KPIs (G1-01/02/03), perfil de membro c/ *lifestyle* (G2-01), planos e *dunning* (G2-02/03), importação CSV (G2-04), *waivers* digitais (G2-05), CRM *kanban* + *automations* (G4-01/02), 6 perfis + RBAC (G5-01).
- **Faturação:** pagamentos MB Way/SEPA/Multibanco/cartão (G3-01), notas de crédito (G3-03), POS de balcão (G3-04). *(SAF-T/ATCUD — ver 9.3.)*
- **Treino:** WOD Builder (C1-01), BD ≥300 exercícios (C1-02), BD ≥200 WODs (C1-03), planeamento semanal e motor de planeamento (C1-04/05), Coach Assist AI (C1-08), %RM (C1-07/A2-07), app *offline* + *timers* + *whiteboard* + TV (C2-01…04), notas (C2-06), PRs e *leaderboards* (C3-01/02).
- **App do Atleta:** marcação, check-in QR, plano, notificações (A1-01…04), ver WOD/registar/PRs (A2-01…03), gamificação (A2-04).
- **Bem-estar (base):** perfil *lifestyle* (A3-01), check-in diário 1–10 (A3-02).
- **PT:** agenda 1:1 (P1-01), *booking* público (P1-02), *packs* (P1-03), perfil de cliente (P2-01), *builder* de planos (P2-02), pagamento/fatura (P3-01/02).
- **Infraestrutura:** multi-tenant, com **servidores e estrutura incluídos** *(a pedido do cliente)*.

### ▸ 9.2 · Itens marcados **MVP-MUST no documento** que recomendamos **diferir** *(principais geradores de atraso)*

| *Story* | Item | Porquê diferir |
| :---- | :---- | :---- |
| **G6-01** | App white-label *(theming dinâmico, apps nas stores)* | Revisão Apple/Google + multi-instância; processo lento e fora do controlo. |
| **G6-02** | *Site builder* + domínio próprio + SSL automático | Infra dedicada; substituível por site pré-configurado no MVP. |
| **G2-08 / G6-03** | Drop-ins self-service + Google Reviews automático | Dependência de API externa *(Google Business Profile)*; ROI baixo no piloto. |
| **G6-04** | Avaliação interna de treinadores pelos atletas | Não essencial à operação do piloto. |
| **A3-03 / A3-04** | Questionário pós-treino c/ *body map* SVG + dashboard cruzado performance/saúde | *Body map* (build vs licenciar) + cifragem Art. 9 RGPD; trabalho e risco significativos. |

*SHOULD que sugerimos não priorizar no MVP:* *insights* semanais (C1-06), *onboarding* 30 dias (G2-06), escalas/turnos (G5-02), chat interno (G5-04), *automations* de retenção (G4-03), gestão de lesões (C3-04), dashboard do PT (P1-06), notas de sessão (P2-03).

*Fora do MVP já no próprio documento (fases F2–F4):* *wearables*, nutrição IA, *marketplace* de planos, *corporate wellness*, multi-localização/franquias, VOD, módulos de nutricionista/fisioterapia, desafios inter-box, *digital twin*, *mental coaching*.

### ▸ 9.3 · Frentes que mobilizam talento especializado

Estas frentes **não são incógnitas nem riscos em aberto**: são entregas que a JCUNHAFONTE executa, mobilizando para cada uma o talento especializado previsto na Secção 16.2. São, em essência, *trabalho a fazer com a competência certa*. Para cada frente, a abordagem recomendada:

1. **Conformidade fiscal PT — SAF-T, ATCUD, QR** (G3-02). **Decisão recomendada:** integrar um **fornecedor de faturação certificado pela AT** *(ex.: InvoiceXpress, Moloni ou Vendus)* para emitir faturas com ATCUD/QR e gerar/submeter o SAF-T — **em vez de desenvolver e certificar software de faturação próprio**, processo regulatório pesado *(Portaria 363/2010)* que comprometeria o prazo. A Vytal orquestra a cobrança *(subscrições, MB Way/SEPA/cartão)* e delega o documento fiscal ao fornecedor via API. Ativação faseada: cobrança operacional no MVP → emissão fiscal certificada na sequência imediata. *(Subscrição do fornecedor: custo do cliente — §16.3.)*
2. **Coach Assist AI** (C1-08). **Decisão recomendada: Claude**, atrás de *gateway* trocável, com *RAG* sobre a BD de exercícios/WODs e revisão humana obrigatória.
3. **App white-label** (G6-01). Entregue por talento *mobile* dedicado. **Abordagem recomendada:** app única com *theming* dinâmico — escala melhor do que apps separadas nas *stores*.
4. **Site próprio** (G6-02). Entregue por talento de *front-end*/infra. **Abordagem recomendada:** subdomínio no arranque, com caminho para domínio próprio e SSL automático *(Let's Encrypt)*.
5. **Body map interativo** (A3-03). Entregue por talento de UX/*front-end*. **Abordagem recomendada:** avaliar SVG próprio *vs* licenciado conforme custo/prazo.
6. **Conteúdo das BDs — ≥300 exercícios, ≥200 WODs, vídeos** (C1-02/03). Curado por talento de conteúdo, **semeado a partir do planeamento e *logs* de WODs do CrossFit Aveiro** *(ver Secção 18)*.

## 10 · CONFORMIDADE, SEGURANÇA E RGPD

| Domínio | Implementação |
| :---- | :---- |
| **Isolamento multi-tenant** | Dados *org-scoped*; isolamento por organização aplicado na camada de API. |
| **Controlo de acessos** | RBAC granular *(Owner / Diretor / Financeiro / Coordenação Comercial / Treinador / PT)*; MFA opcional para perfis de gestão. |
| **Autenticação** | Better Auth — sessões com *tokens*, provisionamento por convite. |
| **Consentimento** | Explícito e granular *(toggles por categoria no perfil do atleta)*, retirável. |
| **Encriptação em trânsito** | TLS 1.2+ obrigatório. |
| **Encriptação em repouso** | Dados sensíveis de saúde/bem-estar *(Art. 9 RGPD)* cifrados em repouso na camada de saúde avançada. |
| **Apagamento / portabilidade** | Mecanismos de exportação e apagamento a pedido do titular. |
| **Anonimização** | Dados pessoais em *dev*/*staging* sintéticos ou anonimizados. |
| **Subcontratantes** | NDAs individuais; lista disponível ao DPO do cliente. |
| **DPA** | Acordo de Tratamento de Dados celebrado antes do arranque. |
| **Pagamentos** | SCA/3DS na UE; documentos fiscais via fornecedor certificado *(§9.3.1)*. |
| **Posição RGPD** | JCUNHAFONTE = **subcontratante** *(processor)*; MUSAS & VIKINGS, LDA = **responsável pelo tratamento** *(controller)*. |

### ▸ 10.1 · Avaliação de Impacto sobre a Proteção de Dados (DPIA)

Nos termos do **Artigo 35.º do RGPD**, o tratamento de dados de saúde/bem-estar *(categorias especiais do Art. 9.º)* e o recurso a IA podem obrigar à realização de uma **DPIA** antes do tratamento em produção. A responsabilidade formal é do **responsável pelo tratamento** *(Musas & Vikings, Lda.)*. A JCUNHAFONTE compromete-se a fornecer a documentação técnica *(tratamentos, categorias de dados, fluxos, medidas de segurança, lógica dos modelos de IA)* e a colaborar com o DPO/jurista do cliente. A DPIA deve estar concluída antes da pilotagem com dados reais.

### ▸ 10.2 · Salvaguardas contra alucinações da IA *(Coach Assist)*

Os LLMs podem gerar conteúdo factualmente incorreto *(hallucination)*. Como o Coach Assist apoia decisões de treino, aplicam-se:

- **Processuais:** toda a saída é **sugestão indicativa**, com **revisão e edição humana obrigatória antes de publicar**; nenhum plano é publicado automaticamente; *disclaimer* visível *("Sugestão de apoio. Decisão final do treinador.")*.
- **Técnicas:** arquitetura **RAG** que ancora as respostas na BD de exercícios/WODs e no contexto do espaço; *audit trail* de cada sugestão *(prompt, contexto, resposta, ação)*; histórico de sugestões aceites/rejeitadas; *guardrails* que sinalizam respostas de baixa confiança para revisão.
- **Legais:** *disclaimer* de conteúdo assistido por IA; cláusula nos Termos de Utilização a delimitar a responsabilidade sobre decisões tomadas com base nas sugestões.

---

# PARTE III: Execução

## 11 · EQUIPA E RESPONSABILIDADES

### ▸ 11.1 · Equipa *core* · JCUNHAFONTE, LDA

| Pessoa | Papel | Responsabilidades |
| :---- | :---- | :---- |
| **José Fonte** | Tech Lead · Arquiteto · *Project Manager* | Arquitetura, decisões técnicas estruturantes, IA/Coach Assist, coordenação da equipa, relação com o cliente, qualidade de *delivery*, integrações críticas. |
| **Lucas Hartridge** | *Senior Full-Stack Engineer* · Produto | Implementação *backend*/*frontend*, módulos de treino e atleta, integrações, revisão de código, mentoria a contratantes. |

A gestão de projeto e o *overhead* são absorvidos pela equipa *core*, sem rubrica separada.

### ▸ 11.2 · Contratantes especializados *(Upwork e contratação direta)*

| Perfil | Janela | Responsabilidades |
| :---- | :---- | :---- |
| **UX/UI *Senior Designer*** | F1, F4 | *Design system*, fluxos de gestor/treinador/atleta, protótipos, *handoff* Figma → código. |
| **Engenheiro Mobile** *(Expo, React Native)* | F4, F6 | App do atleta iOS/Android, check-in QR, *push*, preparação para as *stores*. |
| **Especialista IA / LLM** | F5 | Coach Assist, *RAG* sobre a BD de exercícios/WODs, *gateway* de LLM, *guardrails*. |
| ***QA Engineer*** | F3–F6 | Plano de testes, automação E2E *(Playwright)*, testes unitários *(Vitest)*, UAT com o piloto. |
| **Especialista de Integrações** | F1, F5 | Pagamentos *(MB Way/SEPA/cartão)* e fornecedor de faturação certificado *(SAF-T/ATCUD)*. |

### ▸ 11.3 · Apoio externo pontual

- **Jurista RGPD:** revisão da política de privacidade, DPA e cláusulas de cumprimento.
- **Contabilista certificado:** validação de despesa para efeitos PRR *(a cargo do cliente, fora desta proposta)*.

## 12 · METODOLOGIA E GOVERNO DE PROJETO

### ▸ 12.1 · Processo de desenvolvimento

| Componente | Descrição |
| :---- | :---- |
| **Cadência** | Scrum adaptado, *sprints* de duas semanas. |
| **Cerimónias com cliente** | *Demo* quinzenal de progresso + ponto de situação escrito. |
| **Repositório de código** | Git privado, com acesso de leitura partilhado com o cliente. |
| **Ambientes** | *dev*, *staging* e *prod* com *deploy* contínuo automatizado. |
| **Documentação** | Atualizada continuamente; *ADRs* para decisões arquiteturais. |

### ▸ 12.2 · Definição de Pronto *(Definition of Done)*

Um item considera-se concluído quando, cumulativamente: (1) código revisto por par; (2) testes automáticos a passar *(unit, integração, E2E relevantes)*; (3) documentação atualizada; (4) *deploy* em *staging* sem regressões; (5) validação por QA quando aplicável; (6) aprovação funcional do *stakeholder* quando funcionalidade visível.

### ▸ 12.3 · Comunicação e *stakeholders*

| *Stakeholder* | Cadência | Canal |
| :---- | :---- | :---- |
| *Sponsor* executivo *(CrossFit Aveiro)* | Mensal | *Steering Committee* (1h) |
| *Stakeholder* operacional | Quinzenal | *Demo* + *checkpoint* |
| Atletas piloto *(a partir da F6)* | Semanal | Sessões de *feedback* (30 min) |
| Equipa técnica | Diária | *Stand-up* assíncrono escrito |

## 13 · CRONOGRAMA E FASES

| Fase | Duração | Período | Designação |
| :---- | :---: | :---: | :---- |
| Adjudicação | — | Jun 2026 | Formalização do serviço + arranque |
| **F1** | 1m | Jun 2026 | Fundação, Infraestrutura & Multi-Tenant |
| **F2** | 1m | Jul 2026 | *Backoffice* de Gestão (`pro.vytal.fit`) |
| **F3** | 1m | Ago 2026 | Treino — WOD Builder, Exercícios, Planeamento |
| **F4** | 1m | Set 2026 | App do Atleta (`my.vytal.fit`) + Bem-estar base |
| **F5** | 1m | Out 2026 | Coach Assist AI + Faturação base |
| **F6** | ½m | Out 2026 | Testes, Pilotagem & *Go-Live* *(30 Out 2026)* |

O cronograma físico mantém alinhamento com a janela de execução do PRR *(ver Anexo A)* — operação piloto Set–Out 2026, relatório final Nov 2026. O calendário está comprimido para caber nessa janela; caso o PRR exija ajuste, a reprogramação faz-se junto do organismo intermédio, sem alteração do valor contratual *(ver R7)*.

## 14 · DETALHE TÉCNICO POR FASE

### Fase 1 — Fundação, Infraestrutura & Multi-Tenant
**Período:** Jun 2026 · **Investimento:** €40.000 *(inclui adjudicação €5.000)*
**Objetivo.** Estabelecer as fundações técnicas e organizacionais do projeto.
**Entregáveis:** provisionamento de servidores e ambientes *(dev/staging/produção)*; arquitetura multi-tenant ao nível do modelo de dados; autenticação e RBAC; *pipeline* CI/CD; *design system* inicial; *backlog* detalhado das fases seguintes.

### Fase 2 — *Backoffice* de Gestão
**Período:** Jul 2026 · **Investimento:** €55.000
**Objetivo.** Entregar o núcleo de gestão (`pro.vytal.fit`).
**Entregáveis:** membros e perfis *(com lifestyle)*; planos e *dunning*; importação CSV; *waivers* digitais; CRM *kanban* + *automations*; *staff* e RBAC; dashboard/KPIs.

### Fase 3 — Treino
**Período:** Ago 2026 · **Investimento:** €55.000
**Objetivo.** Entregar o motor de treino.
**Entregáveis:** WOD Builder *(tipos de estímulo, timers)*; BD ≥300 exercícios *(5 metodologias)*; BD ≥200 WODs; planeamento semanal e motor de planeamento; %RM; PRs e *leaderboards*; *whiteboard*/TV.

### Fase 4 — App do Atleta + Bem-estar
**Período:** Set 2026 · **Investimento:** €60.000
**Objetivo.** Entregar a app do atleta (`my.vytal.fit`) e a camada de bem-estar base.
**Entregáveis:** marcação ≤3 toques, check-in QR, ver WOD, registo de resultados, *leaderboards*, PRs, %RM, gamificação; perfil de estilo de vida e check-in diário 1–10.

### Fase 5 — Coach Assist AI + Faturação
**Período:** Out 2026 · **Investimento:** €55.000
**Objetivo.** Entregar a IA de apoio e a faturação.
**Entregáveis:** Coach Assist AI *(geração de planos com RAG e revisão humana)*; integração de pagamentos *(MB Way/SEPA/cartão)*; integração de fornecedor de faturação certificado *(ATCUD/QR/SAF-T)*.

### Fase 6 — Testes, Pilotagem & *Go-Live*
**Período:** Out 2026 · **Investimento:** €25.000
**Objetivo.** Validar, endurecer e colocar em produção com o grupo piloto.
**Entregáveis:** *landing* `vytal.fit`; testes de integração e carga; UAT com 3–5 atletas piloto; correção de *bugs* críticos/altos; *runbook* e alarmes; manual de utilizador PT-PT; **go-live a 30 de Outubro de 2026**; acompanhamento nos 30 dias seguintes *(incluído)*.

## 15 · CRITÉRIOS DE ACEITAÇÃO POR FASE

Cada fase considera-se aceite quando, cumulativamente:

1. Todos os entregáveis listados estão concluídos e disponíveis em *staging* *(ou em produção, no caso da F6)*.
2. Realizou-se *demo* ao vivo com o cliente, conduzida pelo Tech Lead da JCUNHAFONTE, LDA.
3. Não existem *bugs* críticos ou bloqueantes em aberto.
4. O cliente confirma a aceitação por escrito *(email ou ferramenta partilhada)*. A aceitação desbloqueia a faturação da tranche respetiva.

**Aceitação tácita.** Em caso de não-aceitação, o cliente comunica em **5 dias úteis** após a *demo* os pontos concretos a corrigir; a JCUNHAFONTE dispõe de **10 dias úteis** para resolver. O ciclo repete-se até aceitação ou decisão conjunta de tratamento como adenda. A não-comunicação dentro dos 5 dias úteis equivale a **aceitação tácita**.

---

# PARTE IV: Investimento e Condições Comerciais

## 16 · PLANO DE INVESTIMENTO

### ▸ 16.1 · Distribuição por fase

| Fase | Designação | Investimento | % do total |
| :---- | :---- | ----: | ----: |
| **Adjudicação** | Fatura de adjudicação de serviço *(parte da F1)* | €5.000 | 1,7% |
| **F1** | Fundação, Infraestrutura & Multi-Tenant — remanescente | €35.000 | 12,1% |
| **F2** | *Backoffice* de Gestão | €55.000 | 19,0% |
| **F3** | Treino — WOD Builder, Exercícios, Planeamento | €55.000 | 19,0% |
| **F4** | App do Atleta + Bem-estar base | €60.000 | 20,7% |
| **F5** | Coach Assist AI + Faturação base | €55.000 | 19,0% |
| **F6** | Testes, Pilotagem & *Go-Live* | €25.000 | 8,6% |
| **Total** |  | **€290.000** | **100,0%** |

> O contrato de desenvolvimento corresponde ao **investimento total elegível de €290.000** da candidatura PRR *(apoio 75% ≈ €217.500 a fundo perdido; contrapartida da empresa ≈ €72.500)*.

### ▸ 16.2 · Distribuição indicativa por natureza de investimento

A entrega assenta numa equipa *core* enxuta da JCUNHAFONTE, LDA reforçada por contratantes especializados via Upwork e contratação direta, modelo escolhido para acomodar as competências verticais exigidas pelo projeto.

| Rubrica | Valor | % |
| :---- | ----: | ----: |
| Equipa *core* JCUNHAFONTE *(José Fonte + Lucas Hartridge)*, 6 meses parcialmente alocados | €180.000 | 62,1% |
| *Senior* UX/UI Designer *(Figma, Design System, prototipagem)*, Upwork | €30.000 | 10,3% |
| Engenheiro Mobile *(Expo, React Native, iOS e Android)*, Upwork | €25.000 | 8,6% |
| Especialista em IA / LLM *(Coach Assist, *gateway*, *guardrails*)*, Upwork | €20.000 | 6,9% |
| *QA Engineer* *(Playwright, Vitest, testes E2E)*, Upwork | €18.000 | 6,2% |
| Infraestrutura e servidores *(setup dev/staging/produção)* | €12.000 | 4,1% |
| Jurista RGPD e revisão DPA, contratação direta | €5.000 | 1,7% |
| **Total** | **€290.000** | **100,0%** |

**Síntese.** Equipa *core* JCUNHAFONTE: **62,1%** (€180.000). Contratantes especializados Upwork: **31,9%** (€93.000). Infraestrutura: **4,1%** (€12.000). Apoio jurídico externo: **1,7%** (€5.000).

**Nota.** A decomposição por rubrica destina-se a fins de transparência e governo do projeto. A faturação ao cliente é realizada **por marco de pagamento** *(Secção 17)*, não por rubrica. Pequenas alterações entre rubricas podem ocorrer ao longo do projeto, sem impacto no valor total acordado.

### ▸ 16.3 · Custos não incluídos

Os seguintes custos são da **responsabilidade direta do cliente** ou contratados a terceiros, fora do âmbito desta proposta:

- Subscrições recorrentes de *cloud* **a partir do go-live** *(estimativa indicativa de €1.500–€3.000/mês)*. Durante o projeto *(até go-live)*, a estrutura e servidores de dev/staging/produção e o *setup* inicial **estão incluídos** no valor acordado.
- Licenciamento de serviços de terceiros *(provedor LLM acima de limites, gateways de pagamento, fornecedor de faturação certificado SAF-T/ATCUD, APIs externas)*.
- *Hardware* e equipamentos dos utilizadores finais.
- Validação contabilística certificada para efeitos do programa PRR.

## 17 · PLANO DE PAGAMENTOS

A faturação é realizada em **sete tranches**: uma fatura de adjudicação inicial e seis tranches por fase, sincronizadas com a aceitação formal dos respetivos entregáveis. A primeira fatura assume natureza de **adjudicação de serviço**, emitida na assinatura do contrato, conta para o valor total e cobre o arranque da Fase 1; destina-se a permitir o pedido de **adiantamento no âmbito do PRR**.

| \# | Marco | Data prevista | Valor | Acumulado |
| :---: | :---- | :---- | ----: | ----: |
| 1 | **Adjudicação** *(desbloqueia adiantamento PRR)* | Jun 2026 | €5.000 | €5.000 |
| 2 | Conclusão F1. Fundação & Infraestrutura | Jun 2026 | €35.000 | €40.000 |
| 3 | Conclusão F2. *Backoffice* de Gestão | Jul 2026 | €55.000 | €95.000 |
| 4 | Conclusão F3. Treino | Ago 2026 | €55.000 | €150.000 |
| 5 | Conclusão F4. App do Atleta + Bem-estar | Set 2026 | €60.000 | €210.000 |
| 6 | Conclusão F5. Coach AI + Faturação | Out 2026 | €55.000 | €265.000 |
| 7 | Conclusão F6. *Go-Live* e aceitação final | Out 2026 | €25.000 | **€290.000** |

### ▸ 17.1 · Condições de pagamento

| Termo | Condição |
| :---- | :---- |
| **Convenção de valores** | Todos os valores são **líquidos de IVA**, em linha com a convenção da candidatura PRR *(investimento total de €290.000 apresentado sem IVA, coerente com a prática de despesa elegível para entidades com direito à dedução)*. |
| **IVA** | Não incluído nos valores indicados. Acresce à taxa legal em vigor *(atualmente 23%)*, liquidado em fatura à MUSAS & VIKINGS, LDA, que o recupera nos termos gerais do CIVA. |
| **Entidade emissora** | JCUNHAFONTE, LDA, NIF PT515097365 |
| **Entidade faturada** | MUSAS & VIKINGS, LDA *(opera sob a marca CrossFit Aveiro; promotora/beneficiária do PRR)*, NIF PT516786997 |
| **Prazo de pagamento** | 15 dias contados da data de emissão da fatura. |
| **Atraso** | Sujeito a juros de mora à taxa legal aplicável a transações comerciais *(Decreto-Lei n.º 62/2013)*. |
| **Moeda** | Euro (€). |
| **Método** | Transferência bancária para conta a indicar pela JCUNHAFONTE, LDA. |

> ✅ **Elegibilidade PRR.** A entidade faturada — **Musas & Vikings, Lda.** *(NIF PT516786997, que opera sob a marca CrossFit Aveiro)* — deve coincidir com a **entidade beneficiária** da candidatura para que a despesa de desenvolvimento seja elegível. **A confirmar** junto da consultora administrativa/contabilista: que a candidatura PRR está registada em nome de *Musas & Vikings, Lda.* *(e não apenas da marca "CrossFit Aveiro")*, o tratamento do IVA e o calendário de adiantamento.

## 18 · PRESSUPOSTOS E DEPENDÊNCIAS DO CLIENTE

Para cumprir o calendário e o orçamento, a JCUNHAFONTE, LDA assume os seguintes pressupostos. Alterações materiais podem implicar ajustes em prazo e/ou orçamento, formalizados por adenda assinada.

1. Designação de um *stakeholder* **operacional** *(sessões quinzenais ≤2h; respostas em ≤2 dias úteis)* e de um *sponsor* **executivo** com poder de decisão sobre âmbito e orçamento.
2. **Confirmação da linha de corte do MVP** *(Secção 9)* e das decisões em aberto *(9.3)*.
3. Acesso a documentação e dados representativos do CrossFit Aveiro para configuração e calibração.
4. Mobilização de **3–5 atletas/utilizadores** para UAT a partir de Setembro de 2026 *(operação piloto)*.
5. Domínio próprio e decisões finais de *branding* confirmadas até ao final da F1.
6. Fornecimento do detalhe das *user stories* do MVP que ainda não o têm *(conforme pedido)*, para estimativa fina; itens sem detalhe são inferidos pela JCUNHAFONTE e validados na entrega.
7. **Gestão da candidatura PRR** *(submissões, validação contabilística, comunicação com o organismo intermédio)* a cargo do cliente, com apoio técnico da JCUNHAFONTE quando aplicável.
8. **Conteúdo das bases de dados** — fornecimento e/ou validação do conteúdo inicial das BDs de exercícios *(≥300)* e WODs *(≥200)* nas 5 metodologias. O CrossFit Aveiro dispõe de planeamento e *logs* de WODs que podem semear a base; a produção de vídeos de exercícios *(≤60s)* é tratada na decisão 9.3.6 e pode constituir esforço fora deste contrato.

## 19 · GESTÃO DE ALTERAÇÕES DE ÂMBITO

Pedidos que extravasem o âmbito definido na **Parte II** e na **Secção 9** são tratados por **pedido formal de alteração** *(Change Request)*:

1. O cliente submete o pedido por escrito ao *Tech Lead* da JCUNHAFONTE, LDA.
2. A JCUNHAFONTE responde em **5 dias úteis** com análise de impacto em prazo, custo e dependências.
3. Se aprovado, a alteração formaliza-se em **adenda assinada** antes do início da execução.
4. Pequenas alterações, até 1 dia/pessoa de esforço, podem ser absorvidas pela margem de execução, ao critério da JCUNHAFONTE, sem necessidade de adenda.

Os itens da **Secção 9.2** seguem este processo se o cliente decidir antecipá-los.

## 20 · SLA E GARANTIA PÓS-*GO-LIVE*

A garantia incluída no valor total cobre os **30 dias após go-live**, ou seja, até **29 de Novembro de 2026**.

| Cobertura | Detalhe |
| :---- | :---- |
| **Correção de *bugs* funcionais** | Sem custo adicional. |
| **Resposta a incidentes críticos** | Até 4 horas em horário útil *(10:00–19:00 WET, dias úteis)*. |
| ***Uptime* alvo** | ≥ 99,5% mensal. |
| **Acompanhamento técnico** | Sessões semanais *(≤30 min)* durante os 30 dias. |

### ▸ 20.1 · Manutenção pós-garantia

Após o período de garantia, a manutenção evolutiva e corretiva pode ser contratada em adenda:

- **Pacote de horas mensais**, flexível, com horas não utilizadas reportáveis ao mês seguinte.
- **Contrato de manutenção mensal** com SLA reforçado e janelas de *release* programadas.

Os custos recorrentes de infraestrutura e licenciamento de terceiros **a partir do go-live são da responsabilidade do cliente** *(estimativa €1.500–€3.000/mês para *cloud*)*, com apoio da JCUNHAFONTE na sua estimativa ao longo do projeto.

## 21 · ANÁLISE DE RISCOS E PLANO DE MITIGAÇÃO

| \# | Risco | Probabilidade | Impacto | Mitigação |
| :---: | :---- | :---: | :---: | :---- |
| **R1** | **Âmbito apresentado é o produto completo, não um MVP** | Alta | Alto | Linha de corte da Secção 9 fixada e aceite antes do arranque; disciplina rigorosa de *change requests*. |
| R2 | Esforço/risco de certificação fiscal | Média | Alto | Integração com fornecedor de faturação certificado pela AT *(9.3.1)*, evitando a certificação de software próprio; ativação faseada. |
| R3 | *User stories* do MVP sem detalhe suficiente | Média | Médio | Inferência documentada + validação na entrega; pedido formal de detalhe ao cliente. |
| R4 | Custos de inferência em LLM acima do estimado | Média | Médio | *Gateway* unificado, *caching* de *prompts*, opção de modelo auto-alojado. |
| R5 | Indisponibilidade do *stakeholder* ou do piloto | Média | Médio | Cadência quinzenal escrita + *Steering* mensal; pré-compromisso do piloto até à F4. |
| R6 | Dados sensíveis de bem-estar *(Art. 9 RGPD)* | Baixa | Alto | Camada de saúde avançada *(body map/cifragem)* só na fase seguinte; no MVP, recolha de dados mínima. |
| **R7** | **Calendário comprimido face à janela de execução do PRR** *(operação piloto Set–Out 2026, relatório final Nov 2026)* | Média | Alto | Linha de corte do MVP que prioriza o essencial; itens não-críticos em fases posteriores; se necessário, **reprogramação do cronograma PRR** junto do organismo intermédio, sem alteração do valor contratual. |

---

# PARTE V: Termos Legais

## 22 · PROPRIEDADE INTELECTUAL

| Componente | Titular após pagamento integral |
| :---- | :---- |
| **Código-fonte específico do projeto** *(configurações, integrações e interfaces do CrossFit Aveiro)* | MUSAS & VIKINGS, LDA |
| **Documentação técnica e de utilizador** | MUSAS & VIKINGS, LDA |
| **Bibliotecas, *frameworks* internos reutilizáveis e ferramentas de produtividade preexistentes** na JCUNHAFONTE, LDA | JCUNHAFONTE, LDA, licenciados ao cliente em **regime perpétuo, irrevogável, mundial e isento de *royalties*** para utilização no contexto da plataforma Vytal. |
| ***Frameworks*** **e serviços de terceiros** *(provedor LLM, gateways de pagamento, APIs externas)* | Respetivos titulares; utilização sujeita a licenciamento direto entre o cliente e o fornecedor. |

> **Nota.** A marca e o produto-base **Vytal** *(propriedade da JCUNHAFONTE)* são **licenciados** ao CrossFit Aveiro para uso no âmbito deste projeto. O código e as configurações específicas do CrossFit Aveiro passam para a titularidade do cliente após pagamento integral. O enquadramento exato *(licença de uso vs cessão de componentes)* deve ser confirmado entre as partes, atendendo a que a candidatura PRR refere o uso da plataforma Vytal pelo CrossFit Aveiro.

A JCUNHAFONTE, LDA reserva o direito de mencionar o projeto em portfólio e materiais comerciais próprios, mediante aprovação prévia do cliente e sem divulgação de detalhes técnicos sensíveis ou dados confidenciais.

## 23 · CONFIDENCIALIDADE E PROTEÇÃO DE DADOS

| Aspeto | Compromisso |
| :---- | :---- |
| **Confidencialidade** | Toda a informação trocada ao abrigo deste contrato é confidencial, exceto a manifestamente pública. Vigora durante a vigência do contrato e por 5 anos após o seu termo. |
| **Posição RGPD** | A JCUNHAFONTE, LDA atua como **subcontratante** *(processor)*; a MUSAS & VIKINGS, LDA é o **responsável pelo tratamento** *(controller)*. |
| **DPA** | Será celebrado **Acordo de Tratamento de Dados** específico antes do início formal da execução. |
| **Subcontratantes** | Lista mantida e disponível ao DPO do cliente. NDAs individuais com todos. |
| **Dados em desenvolvimento** | Apenas dados sintéticos ou anonimizados são utilizados em ambientes de *dev* e *staging*. |
| **Inferência sobre dados sensíveis** | Preferencialmente em modelos auto-alojados, evitando trânsito desnecessário para fornecedores *cloud* de terceiros. |
| ***Right to audit*** | O cliente reserva o direito de auditar as práticas de segurança e privacidade da JCUNHAFONTE, LDA com 30 dias de pré-aviso. |

## 24 · TERMOS CONTRATUAIS GERAIS

| Termo | Condição |
| :---- | :---- |
| **Lei aplicável** | Lei portuguesa. |
| **Foro** | Tribunal da Comarca de Aveiro, com renúncia expressa a qualquer outro. |
| **Idioma do contrato** | Português de Portugal. |
| **Rescisão por incumprimento material** | Qualquer das partes pode rescindir mediante incumprimento material da outra, com **15 dias de pré-aviso para sanação**. Em caso de rescisão, o cliente paga o trabalho efetivamente realizado até à data, com base na proporção da fase em curso. |
| **Força maior** | Eventos de força maior *(catástrofes, guerra, paralisações de serviços terceiros essenciais)* suspendem prazos pelo período correspondente, mediante notificação escrita. |
| **Cessão da posição contratual** | Nenhuma das partes pode ceder a sua posição sem consentimento escrito da outra. |
| **Não-aliciamento** | Durante a vigência do contrato e por 12 meses após o seu termo, nenhuma das partes contratará diretamente colaboradores da outra envolvidos no projeto, sem acordo escrito. |
| **Comunicações formais** | Por email para os endereços indicados no cabeçalho desta proposta. |
| **Integralidade do contrato** | Esta proposta, uma vez aceite, e quaisquer adendas posteriores assinadas, constituem o acordo integral entre as partes sobre o seu objeto. |

## 25 · ACEITAÇÃO DA PROPOSTA

Esta proposta é válida por **30 dias** a contar da data de emissão. Para aceitação, o cliente deve devolver este documento assinado e rubricado, ou enviar email formal de aceitação ao representante da JCUNHAFONTE, LDA.

Após aceitação, a JCUNHAFONTE, LDA emite **fatura de adjudicação** correspondente a €5.000 e dá início formal aos trabalhos da Fase 1.

---

# Anexos

## Anexo A: Mapeamento ao Cronograma PRR

A presente proposta alinha-se com o cronograma físico-financeiro da candidatura PRR *"Soluções de IA para PME's"* — projeto **CrossFit Aveiro Digital** *(promotora: Musas & Vikings, Lda.)*. Por o desenvolvimento arrancar em Junho de 2026, a execução concentra-se na janela final do programa, com **go-live a 30 de Outubro de 2026** e relatório final em Novembro de 2026.

| Fase desta Proposta | Janela | Investimento | Fase PRR correspondente |
| :---- | :---- | ----: | :---- |
| F1. Fundação & Infraestrutura | Jun 2026 | €40.000 | Desenvolvimento e integração |
| F2. *Backoffice* de Gestão | Jul 2026 | €55.000 | Desenvolvimento e integração |
| F3. Treino | Ago 2026 | €55.000 | Desenvolvimento / testes internos |
| F4. App do Atleta + Bem-estar | Set 2026 | €60.000 | Implementação e operação piloto |
| F5. Coach AI + Faturação | Out 2026 | €55.000 | Implementação e operação piloto |
| F6. Testes, Pilotagem & Go-Live | Out 2026 | €25.000 | Operação piloto / avaliação |
| **Total** | **Jun–Out 2026** | **€290.000** | Investimento total elegível |

**Investimento total elegível da candidatura:** €290.000. **Slice JCUNHAFONTE, LDA:** €290.000 *(desenvolvimento)*. Custos recorrentes de *cloud* pós-go-live, licenciamento do fornecedor de faturação certificado e validação contabilística são contratados e faturados separadamente, fora deste contrato.

## Anexo B: Especificação Funcional dos Módulos do MVP

### B.1 · Coach Assist AI
| Atributo | Detalhe |
| :---- | :---- |
| **Inputs** | Pedido do treinador *(linguagem natural)*, metodologia, equipamento do espaço, histórico recente, BD de exercícios/WODs. |
| **Outputs** | Estrutura de plano/WOD completa + justificação *(equilíbrio, volume, foco)*, sempre editável. |
| **Modelos** | Claude via *gateway*; arquitetura *RAG* sobre a BD de exercícios/WODs. |
| **Salvaguardas** | Revisão humana obrigatória; *disclaimer*; *audit trail*; sem publicação automática. |
| **Métrica** | Plano aceite/editado pelo treinador em < 5 min. |

### B.2 · WOD Builder & Motor de Planeamento
| Atributo | Detalhe |
| :---- | :---- |
| **Inputs** | Tipos de estímulo *(AMRAP, EMOM, For Time, Tabata, Strength)*, exercícios, estrutura *(Warm Up/Skill/WOD/Cool Down)*. |
| **Outputs** | WOD publicado para app + TV; planeamento por atleta/grupo/turma; %RM por atleta. |
| **Métrica** | ≥ 80% dos WODs publicados via Builder. |

### B.3 · App do Atleta
| Atributo | Detalhe |
| :---- | :---- |
| **Inputs** | Marcação, check-in QR, resultados, PRs. |
| **Outputs** | WOD do dia com vídeos, *leaderboards* tempo real, histórico de PRs, %RM, gamificação. |
| **Métrica** | Marcação ≤ 3 toques; check-in QR sem atrito. |

### B.4 · Bem-estar
| Atributo | Detalhe |
| :---- | :---- |
| **Inputs** | Perfil de estilo de vida; check-in diário *(sono, fadiga, stress — 1–10)*. |
| **Outputs** | Diário pessoal e tendências; *flag* de bem-estar para o treinador *(se autorizado)*. |
| **RGPD** | Categoria especial *(Art. 9.º)*; cifragem reforçada na camada avançada. |

### B.5 · Faturação & Fiscal PT
| Atributo | Detalhe |
| :---- | :---- |
| **Inputs** | Subscrições, *packs*, drop-ins; métodos MB Way/SEPA/cartão. |
| **Outputs** | Cobrança orquestrada pela Vytal; documento fiscal *(fatura, ATCUD, QR, SAF-T)* emitido por fornecedor certificado pela AT. |
| **Nota** | Evita certificação de software próprio *(§9.3.1)*. |

## Anexo C: Glossário Técnico

| Termo | Definição |
| :---- | :---- |
| **AMRAP / EMOM / For Time / Tabata** | Formatos de treino *(estímulos)* de fitness funcional. |
| **ATCUD** | Código único de documento fiscal exigido pela AT. |
| **DPA** | *Data Processing Agreement*, acordo de tratamento de dados RGPD. |
| **DPO** | *Data Protection Officer*, encarregado de proteção de dados. |
| **LLM** | *Large Language Model*. |
| **MoSCoW** | Priorização *Must / Should / Could / Won't*. |
| **MVP** | *Minimum Viable Product*. |
| **PR** | *Personal Record*, recorde pessoal do atleta. |
| **RAG** | *Retrieval-Augmented Generation*, ancoragem das respostas da IA em dados reais. |
| **RBAC** | *Role-Based Access Control*. |
| **RGPD** | Regulamento Geral sobre a Proteção de Dados *(UE 2016/679)*. |
| **RPE** | *Rate of Perceived Exertion*, esforço percebido. |
| **%RM** | Percentagem da repetição máxima *(1RM)*. |
| **Rx / Scaled** | Treino conforme prescrito *(Rx)* ou adaptado *(Scaled)*. |
| **SAF-T (PT)** | Ficheiro normalizado de auditoria fiscal *(AT)*. |
| **SCA / 3DS** | Autenticação forte de pagamentos na UE. |
| **SEPA / MB Way** | Débito direto europeu / pagamento móvel português. |
| **UAT** | *User Acceptance Testing*. |
| **WOD** | *Workout of the Day*, treino do dia. |

## Anexo D: Documentos de Referência

### D.1 · Documentos de base
1. **MVP Vytal v2.0** — especificação de produto *(user stories, personas, matriz de permissões)*.
2. **Memória Descritiva da Candidatura PRR** *"Soluções de IA para PME's"* — projeto CrossFit Aveiro Digital; promotora Musas & Vikings, Lda.; define enquadramento de financiamento, cronograma e despesa elegível.
3. **PRD Vytal** — requisitos funcionais e não-funcionais da plataforma.

### D.2 · Legislação e normativos aplicáveis
4. Regulamento (UE) 2016/679 *(RGPD)*.
5. Portaria n.º 363/2010 *(certificação de software de faturação)* e regime de faturação/ATCUD da AT.
6. Decreto-Lei n.º 62/2013 *(atrasos de pagamento em transações comerciais)*.

---

### Assinaturas

**Pelo prestador de serviços, JCUNHAFONTE, LDA**

| Campo | Valor |
| :---- | :---- |
| Nome | José Cunha Fonte |
| Cargo | Sócio-Gerente |
| NIF da entidade | PT515097365 |

Data: \_\_\_\_ / \_\_\_\_ / 2026

Assinatura: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**Pelo cliente, MUSAS & VIKINGS, LDA** *(CrossFit Aveiro)*

| Campo | Valor |
| :---- | :---- |
| Nome | Juvenal Fernandes |
| Cargo | Sócio-Gerente |
| NIF da entidade | PT516786997 |

Data: \_\_\_\_ / \_\_\_\_ / 2026

Assinatura: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
