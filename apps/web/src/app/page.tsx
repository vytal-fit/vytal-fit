"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Dumbbell,
  TrendingUp,
  CreditCard,
  Globe,
  Check,
  X,
  Star,
  ChevronDown,
  Menu,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Play,
  Sun,
  Moon,
} from "lucide-react";

// ── Noise texture SVG ────────────────────────────────────────────────────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`;

// ── CSS Keyframes (injected via style tag) ──────────────────────────────────
const LANDING_KEYFRAMES = `
@keyframes landing-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes landing-float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes landing-fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes landing-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes landing-pulse-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 12px rgba(34,197,94,0.8); }
}
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 32s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.scroll-reveal[data-revealed="true"] {
  opacity: 1;
  transform: translateY(0);
}
.animated-gradient-border {
  background: linear-gradient(90deg, #22c55e, #00d4ff, #c084fc, #22c55e);
  background-size: 300% 100%;
  animation: landing-gradient-shift 4s ease infinite;
}
`;

// ── Scroll Reveal Hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "true");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// ── SVG Decorative Components ────────────────────────────────────────────────
function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <defs>
        <pattern id="hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(34,197,94,0.15)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" />
    </svg>
  );
}

function WaveDivider({ flip = false, color = "rgba(34,197,94,0.06)" }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[40px]">
        <path
          d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

// ── Multi-language ──────────────────────────────────────────────────────────
type Lang = "pt" | "en" | "es";

const LANDING_COPY: Record<Lang, Record<string, string>> = {
  pt: {
    badge: "A plataforma #1 para espaços fitness em Portugal",
    headline: "Gerir o seu espaço fitness nunca foi tão simples",
    subtitle: "Membros, aulas, pagamentos, CRM, website — tudo numa única plataforma. De CrossFit a Yoga, de PT a Artes Marciais.",
    ctaStart: "Começar Grátis",
    ctaDemo: "Ver Demo",
    signIn: "Entrar",
    features: "Funcionalidades",
    pricing: "Preços",
    testimonials: "Testemunhos",
    faq: "FAQ",
    statVerticals: "Verticais",
    statFeatures: "Funcionalidades",
    statLangs: "Idiomas",
    statLocal: "100% Português",
    floatRevenue: "Receita",
    trustedBy: "Confiado por espaços em todo o país",
    everythingTitle: "Tudo o que precisa. Numa plataforma.",
    everythingSubtitle: "Construído de raiz para o mercado português, com todas as ferramentas que o seu espaço fitness precisa para crescer.",
    feat1: "Gestão de Membros", feat1d: "Perfis completos, histórico de presenças, planos de pagamento, documentos RGPD e comunicação integrada.",
    feat2: "Aulas & Horários", feat2d: "Calendário inteligente com reservas online, listas de espera, capacidade máxima e notificações automáticas.",
    feat3: "WODs & Treinos", feat3d: "Construtor de WODs com biblioteca de exercícios, tracking de resultados e progressão dos atletas.",
    feat4: "CRM & Leads", feat4d: "Pipeline drag-and-drop, follow-ups automáticos, conversão de leads e análise do funil de vendas.",
    feat5: "Finanças & Pagamentos", feat5d: "MBWay, SEPA, referências Multibanco, SAF-T, ATCUD, faturas automáticas e relatórios fiscais.",
    feat6: "Website & Loja", feat6d: "Site público personalizável com domínio próprio, loja online, landing pages e SEO integrado.",
    featLearnMore: "Saber mais",
    showcaseTitle: "Uma plataforma,",
    showcaseTitleHighlight: "múltiplas experiências",
    showcaseSubtitle: "Para gestores, atletas e visitantes — cada um tem a interface perfeita.",
    showcaseBadge: "Produto",
    showcaseExplore: "Explorar",
    compTitle: "Porquê o Vytal?",
    compSubtitle: "Construído especificamente para o mercado português, com funcionalidades que os concorrentes simplesmente não têm.",
    compBadge: "Comparação",
    compColFeature: "Funcionalidade",
    compGeneric: "Genérico",
    compRow1: "Multi-vertical (20+ tipos de espaço)",
    compRow2: "Totalmente em Português (PT)",
    compRow3: "Website público personalizável",
    compRow4: "App Mobile nativa",
    compRow5: "MBWay & Multibanco",
    compRow6: "SAF-T & ATCUD (Portugal)",
    compRow7: "AI Insights & Recomendações",
    compRow8: "API Aberta & Integrações",
    testimonialsTitle: "O que dizem os nossos",
    testimonialsTitleHighlight: "clientes",
    testimonialsBadge: "Testemunhos",
    t1quote: "Desde que mudámos para o Vytal, poupamos 3 horas por dia em tarefas administrativas. Os pagamentos automáticos via MBWay mudaram completamente o nosso fluxo de caixa.",
    t1name: "Ana Ferreira", t1role: "Proprietária", t1gym: "CrossFit Aveiro",
    t2quote: "O CRM de leads é incrível. Antes perdíamos potenciais membros porque não tínhamos follow-up. Agora convertemos 40% mais leads em membros pagantes.",
    t2name: "Ricardo Santos", t2role: "Head Coach & Manager", t2gym: "Iron Temple Lisboa",
    t3quote: "Gerimos 3 estúdios de yoga com o Vytal. A funcionalidade multi-localização é fantástica e o website personalizado para cada estúdio aumentou as nossas inscrições em 60%.",
    t3name: "Sofia Maia", t3role: "Directora", t3gym: "Studio Zen — 3 locais",
    pricingTitle: "Simples e",
    pricingTitleHighlight: "transparente",
    pricingSubtitle: "Sem surpresas, sem custos escondidos. Mude de plano quando quiser.",
    pricingBadge: "Preços",
    monthly: "Mensal",
    annual: "Anual",
    mostPopular: "Mais Popular",
    onRequest: "Sob consulta",
    billedAnnually: "Facturado anualmente · Poupa",
    perYear: "€/ano",
    pricingNote: "Sem cartão de crédito necessário para começar · Cancele quando quiser · Suporte em Português",
    planFreeDesc: "Para começar sem compromisso.",
    planProDesc: "Para espaços em crescimento.",
    planEnterpriseDesc: "Para redes e franquias fitness.",
    planFreePeriod: "para sempre",
    planProPeriod: "por mês",
    planEnterprisePeriod: "personalizado",
    planFreeF1: "Até 20 membros", planFreeF2: "1 localização", planFreeF3: "Calendário de aulas",
    planFreeF4: "Perfis básicos", planFreeF5: "App mobile (leitura)", planFreeF6: "Suporte por email",
    planFreeN1: "Pagamentos automáticos", planFreeN2: "CRM avançado", planFreeN3: "Website público", planFreeN4: "API",
    planProF1: "Membros ilimitados", planProF2: "1 localização", planProF3: "Todas as funcionalidades",
    planProF4: "Website público personalizado", planProF5: "Pagamentos MBWay & SEPA", planProF6: "SAF-T & ATCUD",
    planProF7: "CRM & Leads", planProF8: "App mobile completa", planProF9: "Suporte prioritário",
    planProN1: "Multi-localização", planProN2: "API Aberta",
    planEntF1: "Multi-localização", planEntF2: "Membros ilimitados", planEntF3: "API Aberta & Webhooks",
    planEntF4: "Integrações personalizadas", planEntF5: "Suporte dedicado 24/7", planEntF6: "Onboarding assistido",
    planEntF7: "SLA garantido", planEntF8: "Facturação centralizada",
    planFreeCta: "Começar Grátis", planProCta: "Começar Grátis 14 dias", planEntCta: "Falar com Vendas",
    faqTitle: "Perguntas",
    faqTitleHighlight: "frequentes",
    faqBadge: "FAQ",
    faq1q: "O Vytal funciona para yoga, pilates, artes marciais e outros tipos de espaço?",
    faq1a: "Sim! O Vytal suporta 20+ tipos de espaços fitness e wellness, incluindo CrossFit, yoga, pilates, artes marciais, natação, ginásios tradicionais, personal trainers, estúdios de dança e muito mais. Cada vertical tem as suas configurações e terminologia própria.",
    faq2q: "Posso migrar o meu espaço do Regibox ou outro software?",
    faq2a: "Absolutamente. Temos uma equipa de onboarding dedicada que ajuda na migração de dados (membros, pagamentos, histórico) de qualquer plataforma anterior. A migração é gratuita nos planos Pro e Enterprise e normalmente demora menos de 48 horas.",
    faq3q: "O site público do meu espaço é totalmente personalizável?",
    faq3a: "Sim. Cada espaço tem o seu próprio subdomínio (vytal.fit/o-meu-ginasio) ou pode usar o seu domínio próprio. Pode personalizar cores, logo, fotos, textos, horários, preços e muito mais — sem precisar de conhecimentos técnicos.",
    faq4q: "Quais métodos de pagamento são suportados?",
    faq4a: "Suportamos MBWay, referências Multibanco, transferência SEPA, cartão de crédito/débito e débito direto. Para o mercado português, geramos SAF-T e ATCUD conformes com a AT. Em breve também PayPal e Apple Pay.",
    faq5q: "Existe uma app mobile para os atletas?",
    faq5a: "Sim, a app Vytal está disponível para iOS (App Store) e Android (Google Play). Os atletas podem fazer check-in, consultar WODs, ver o seu progresso, fazer reservas e comunicar com os seus coaches diretamente pela app.",
    faq6q: "O Vytal cumpre com o RGPD (Regulamento Geral de Proteção de Dados)?",
    faq6a: "Totalmente. Todos os dados são alojados na União Europeia (Portugal/Irlanda), com encriptação end-to-end, controlo de acessos por perfil, registo de consentimentos, direito ao esquecimento e exportação de dados. Disponibilizamos DPA (Data Processing Agreement) para todos os clientes.",
    ctaBannerBadge: "Sem cartão de crédito",
    ctaBannerTitle: "Pronto para transformar",
    ctaBannerTitleLine2: "o seu espaço?",
    ctaBannerSubtitle: "Comece grátis hoje. Configure o seu espaço em menos de 5 minutos. Sem compromisso, sem cartão de crédito.",
    ctaBannerStart: "Começar Grátis Agora",
    ctaBannerDemo: "Ver Demo ao Vivo",
    footerTagline: "A plataforma de gestão para espaços fitness e wellness — feita em Portugal, para o mundo.",
    footerRights: "Todos os direitos reservados. Feito com",
    footerInPortugal: "em Portugal.",
    footerAllSystems: "Todos os sistemas operacionais",
    footerProduct: "Produto", footerResources: "Recursos", footerCompany: "Empresa", footerLegal: "Legal",
    fpFeat: "Funcionalidades", fpPricing: "Preços", fpNews: "Novidades", fpRoadmap: "Roadmap", fpApi: "API Docs",
    frHelp: "Centro de Ajuda", frBlog: "Blog", frVideos: "Tutoriais em Vídeo", frCommunity: "Comunidade", frStatus: "Estado do Sistema",
    fcAbout: "Sobre Nós", fcCareers: "Carreiras", fcPartners: "Parceiros", fcPress: "Imprensa", fcContact: "Contacto",
    flTerms: "Termos de Serviço", flPrivacy: "Política de Privacidade", flRgpd: "RGPD", flCookies: "Cookies", flDpa: "DPA",
    tabAdmin: "Admin", tabWebsite: "Website", tabMembro: "Membro", tabMobile: "Mobile",
    tabAdminTitle: "Painel de controlo completo",
    tabAdminDesc: "Uma visão 360° do seu espaço. Dashboards em tempo real, gestão de membros, finanças e muito mais — tudo num só lugar.",
    tabAdminI1: "Dashboard", tabAdminI2: "Membros", tabAdminI3: "Aulas", tabAdminI4: "CRM", tabAdminI5: "Finanças", tabAdminI6: "Relatórios",
    tabWebsiteTitle: "Site público personalizável",
    tabWebsiteDesc: "Cada espaço tem o seu site com domínio próprio, cores da marca, horários ao vivo, loja e formulário de contacto.",
    tabWebsiteI1: "Página Inicial", tabWebsiteI2: "Horários", tabWebsiteI3: "Planos", tabWebsiteI4: "Instrutores", tabWebsiteI5: "Loja", tabWebsiteI6: "Contacto",
    tabMembroTitle: "Portal do atleta",
    tabMembroDesc: "Os seus membros acedem online para ver horários, fazer reservas, consultar resultados e gerir a sua subscrição.",
    tabMembroI1: "As Minhas Aulas", tabMembroI2: "Resultados", tabMembroI3: "Plano", tabMembroI4: "Pagamentos", tabMembroI5: "Perfil", tabMembroI6: "Progresso",
    tabMobileTitle: "App para iOS e Android",
    tabMobileDesc: "Os atletas levam o ginásio no bolso. Check-in, treinos, resultados e comunicações — tudo na app Vytal.",
    tabMobileI1: "Today's WOD", tabMobileI2: "Check-in", tabMobileI3: "Leaderboard", tabMobileI4: "Treinos", tabMobileI5: "Mensagens", tabMobileI6: "Progresso",
    // Verticals
    verticalsTitle: "Um produto.",
    verticalsTitleHighlight: "20 verticais.",
    verticalsSubtitle: "Da box de CrossFit ao estúdio de dança — o Vytal adapta-se ao seu negócio.",
    v_crossfit_box: "CrossFit Box",
    v_functional_training: "Treino Funcional",
    v_gym: "Ginásio",
    v_yoga_studio: "Estúdio de Yoga",
    v_pilates_studio: "Estúdio de Pilates",
    v_martial_arts: "Artes Marciais",
    v_personal_training: "Personal Training",
    v_swimming: "Natação",
    v_dance_studio: "Estúdio de Dança",
    v_health_club: "Health Club",
    v_sports_club: "Clube Desportivo",
    v_climbing_gym: "Ginásio de Escalada",
    v_cycling_studio: "Estúdio de Cycling",
    v_running_club: "Clube de Corrida",
    v_gymnastics_academy: "Academia de Ginástica",
    v_rehabilitation: "Reabilitação",
    v_weightlifting_club: "Clube de Halterofilia",
    v_bootcamp: "Bootcamp",
    v_surf_water_sports: "Surf & Desportos Aquáticos",
    v_other: "Outro",
    // Feature Deep Dive
    deepDiveBadge: "Funcionalidades em detalhe",
    deepDiveCheckinTitle: "Check-in inteligente",
    deepDiveCheckinDesc: "Elimine as filas e o papel. O check-in é instantâneo, preciso e integrado com presenças e pagamentos.",
    deepDiveCheckinB1: "QR Code único por atleta",
    deepDiveCheckinB2: "Check-in em massa para coaches",
    deepDiveCheckinB3: "Walk-in sem reserva prévia",
    deepDiveCheckinB4: "Tracking de no-shows automático",
    deepDiveCrmTitle: "CRM & Pipeline de vendas",
    deepDiveCrmDesc: "Converta mais leads em membros pagantes com um pipeline visual e follow-ups automáticos.",
    deepDiveCrmB1: "Kanban drag-and-drop intuitivo",
    deepDiveCrmB2: "Lead scoring automático",
    deepDiveCrmB3: "Rastreio de fonte (Facebook, Google...)",
    deepDiveCrmB4: "Follow-up automático por email/SMS",
    deepDiveWebsiteTitle: "Website builder completo",
    deepDiveWebsiteDesc: "O seu espaço merece uma presença digital profissional. Configure em minutos, sem código.",
    deepDiveWebsiteB1: "Domínio próprio incluído",
    deepDiveWebsiteB2: "6 páginas: Home, Horários, Planos, Equipa, Loja, Contacto",
    deepDiveWebsiteB3: "Loja online com carrinho de compras",
    deepDiveWebsiteB4: "SEO, analytics e testemunhos integrados",
    deepDiveAnalyticsTitle: "Relatórios & Analytics",
    deepDiveAnalyticsDesc: "Tome decisões baseadas em dados reais. Veja o que funciona e corrija o que não funciona.",
    deepDiveAnalyticsB1: "Heatmap de presenças por hora/dia",
    deepDiveAnalyticsB2: "Gráficos de receita e crescimento",
    deepDiveAnalyticsB3: "Previsão de churn com IA",
    deepDiveAnalyticsB4: "Análise de retenção de membros",
    // Payments
    paymentsTitle: "Pagamentos",
    paymentsTitleHighlight: "Portugal",
    paymentsBadge: "Pagamentos",
    paymentsSubtitle: "Todos os métodos de pagamento que os seus clientes utilizam — integrados de raiz.",
    paymentsMbway: "MB Way",
    paymentsMultibanco: "Multibanco",
    paymentsSepa: "SEPA",
    paymentsVisa: "Visa / MC",
    paymentsCash: "Numerário",
    paymentsTransfer: "Transferência",
    // Automations & AI
    autoTitle: "Automações &",
    autoTitleHighlight: "Inteligência Artificial",
    autoBadge: "Automações & AI",
    autoSubtitle: "Poupe horas por semana com automações inteligentes e insights gerados por IA.",
    autoColLeft: "Automações",
    autoColRight: "AI Insights",
    autoA1Title: "Emails de milestone", autoA1Desc: "Parabéns automáticos ao 1º mês, 6 meses, 1 ano de membro.",
    autoA2Title: "Campanhas anti-churn", autoA2Desc: "Detecta membros em risco e envia ofertas personalizadas.",
    autoA3Title: "Onboarding sequenciado", autoA3Desc: "Sequência automática de boas-vindas para novos membros.",
    autoA4Title: "Mensagens de aniversário", autoA4Desc: "Felicita automaticamente no dia de aniversário do membro.",
    autoB1Title: "Previsão de churn", autoB1Desc: "IA identifica membros que podem cancelar nas próximas semanas.",
    autoB2Title: "Agendamento inteligente", autoB2Desc: "Sugere os melhores horários com base na procura histórica.",
    autoB3Title: "Sugestão de WODs", autoB3Desc: "Recomenda treinos adaptados ao nível e histórico de cada atleta.",
    autoB4Title: "Readiness scoring", autoB4Desc: "Avalia a prontidão do atleta com base em treinos e recuperação.",
    // Compliance
    complianceTitle: "Compliance &",
    complianceTitleHighlight: "Segurança",
    complianceBadge: "Segurança",
    complianceSubtitle: "Construído para cumprir as exigências legais portuguesas e europeias.",
    complianceRgpd: "RGPD Compliant",
    complianceSaft: "SAF-T / ATCUD Ready",
    complianceSsl: "SSL Encriptado",
    complianceUptime: "99.9% Uptime",
    complianceIso: "ISO 27001 (planeado)",
    complianceBackup: "Backups Diários",
  },
  en: {
    badge: "The #1 platform for fitness spaces in Portugal",
    headline: "Managing your fitness space has never been easier",
    subtitle: "Members, classes, payments, CRM, website — everything in one platform. From CrossFit to Yoga, PT to Martial Arts.",
    ctaStart: "Start Free",
    ctaDemo: "View Demo",
    signIn: "Sign In",
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    faq: "FAQ",
    statVerticals: "Verticals",
    statFeatures: "Features",
    statLangs: "Languages",
    statLocal: "100% Portuguese",
    floatRevenue: "Revenue",
    trustedBy: "Trusted by spaces across the country",
    everythingTitle: "Everything you need. One platform.",
    everythingSubtitle: "Built from the ground up for the Portuguese market, with all the tools your fitness space needs to grow.",
    feat1: "Member Management", feat1d: "Full profiles, attendance history, payment plans, GDPR documents and integrated communication.",
    feat2: "Classes & Schedules", feat2d: "Smart calendar with online bookings, waitlists, max capacity and automatic notifications.",
    feat3: "WODs & Workouts", feat3d: "WOD builder with exercise library, result tracking and athlete progression.",
    feat4: "CRM & Leads", feat4d: "Drag-and-drop pipeline, automatic follow-ups, lead conversion and sales funnel analysis.",
    feat5: "Finance & Payments", feat5d: "MBWay, SEPA, Multibanco references, SAF-T, ATCUD, automatic invoices and tax reports.",
    feat6: "Website & Store", feat6d: "Customizable public site with own domain, online store, landing pages and integrated SEO.",
    featLearnMore: "Learn more",
    showcaseTitle: "One platform,",
    showcaseTitleHighlight: "multiple experiences",
    showcaseSubtitle: "For managers, athletes and visitors — each gets the perfect interface.",
    showcaseBadge: "Product",
    showcaseExplore: "Explore",
    compTitle: "Why Vytal?",
    compSubtitle: "Built specifically for the Portuguese market, with features competitors simply don't have.",
    compBadge: "Comparison",
    compColFeature: "Feature",
    compGeneric: "Generic",
    compRow1: "Multi-vertical (20+ space types)",
    compRow2: "Fully in Portuguese (PT)",
    compRow3: "Customizable public website",
    compRow4: "Native mobile app",
    compRow5: "MBWay & Multibanco",
    compRow6: "SAF-T & ATCUD (Portugal)",
    compRow7: "AI Insights & Recommendations",
    compRow8: "Open API & Integrations",
    testimonialsTitle: "What our",
    testimonialsTitleHighlight: "clients say",
    testimonialsBadge: "Testimonials",
    t1quote: "Since we switched to Vytal, we save 3 hours a day on admin tasks. Automatic payments via MBWay completely changed our cash flow.",
    t1name: "Ana Ferreira", t1role: "Owner", t1gym: "CrossFit Aveiro",
    t2quote: "The leads CRM is amazing. Before, we were losing potential members because we had no follow-up. Now we convert 40% more leads into paying members.",
    t2name: "Ricardo Santos", t2role: "Head Coach & Manager", t2gym: "Iron Temple Lisboa",
    t3quote: "We manage 3 yoga studios with Vytal. The multi-location feature is fantastic and the custom website for each studio increased our sign-ups by 60%.",
    t3name: "Sofia Maia", t3role: "Director", t3gym: "Studio Zen — 3 locations",
    pricingTitle: "Simple and",
    pricingTitleHighlight: "transparent",
    pricingSubtitle: "No surprises, no hidden costs. Change your plan whenever you want.",
    pricingBadge: "Pricing",
    monthly: "Monthly",
    annual: "Annual",
    mostPopular: "Most Popular",
    onRequest: "On request",
    billedAnnually: "Billed annually · Save",
    perYear: "€/yr",
    pricingNote: "No credit card required to start · Cancel anytime · Support in Portuguese",
    planFreeDesc: "To get started with no commitment.",
    planProDesc: "For growing spaces.",
    planEnterpriseDesc: "For fitness networks and franchises.",
    planFreePeriod: "forever",
    planProPeriod: "per month",
    planEnterprisePeriod: "custom",
    planFreeF1: "Up to 20 members", planFreeF2: "1 location", planFreeF3: "Class calendar",
    planFreeF4: "Basic profiles", planFreeF5: "Mobile app (read-only)", planFreeF6: "Email support",
    planFreeN1: "Automatic payments", planFreeN2: "Advanced CRM", planFreeN3: "Public website", planFreeN4: "API",
    planProF1: "Unlimited members", planProF2: "1 location", planProF3: "All features",
    planProF4: "Custom public website", planProF5: "MBWay & SEPA payments", planProF6: "SAF-T & ATCUD",
    planProF7: "CRM & Leads", planProF8: "Full mobile app", planProF9: "Priority support",
    planProN1: "Multi-location", planProN2: "Open API",
    planEntF1: "Multi-location", planEntF2: "Unlimited members", planEntF3: "Open API & Webhooks",
    planEntF4: "Custom integrations", planEntF5: "Dedicated 24/7 support", planEntF6: "Assisted onboarding",
    planEntF7: "Guaranteed SLA", planEntF8: "Centralized billing",
    planFreeCta: "Start Free", planProCta: "Start 14-day Free Trial", planEntCta: "Talk to Sales",
    faqTitle: "Frequently asked",
    faqTitleHighlight: "questions",
    faqBadge: "FAQ",
    faq1q: "Does Vytal work for yoga, pilates, martial arts and other space types?",
    faq1a: "Yes! Vytal supports 20+ types of fitness and wellness spaces, including CrossFit, yoga, pilates, martial arts, swimming, traditional gyms, personal trainers, dance studios and much more. Each vertical has its own settings and terminology.",
    faq2q: "Can I migrate my space from Regibox or other software?",
    faq2a: "Absolutely. We have a dedicated onboarding team that helps with data migration (members, payments, history) from any previous platform. Migration is free on Pro and Enterprise plans and usually takes less than 48 hours.",
    faq3q: "Is my space's public site fully customizable?",
    faq3a: "Yes. Each space gets its own subdomain (vytal.fit/my-gym) or you can use your own domain. You can customize colors, logo, photos, texts, schedules, pricing and much more — no technical knowledge needed.",
    faq4q: "Which payment methods are supported?",
    faq4a: "We support MBWay, Multibanco references, SEPA transfer, credit/debit card and direct debit. For the Portuguese market, we generate SAF-T and ATCUD compliant with AT. PayPal and Apple Pay coming soon.",
    faq5q: "Is there a mobile app for athletes?",
    faq5a: "Yes, the Vytal app is available for iOS (App Store) and Android (Google Play). Athletes can check in, view WODs, track their progress, make bookings and communicate with their coaches directly through the app.",
    faq6q: "Does Vytal comply with GDPR (General Data Protection Regulation)?",
    faq6a: "Fully. All data is hosted in the European Union (Portugal/Ireland), with end-to-end encryption, role-based access control, consent logging, right to erasure and data export. We provide a DPA (Data Processing Agreement) for all clients.",
    ctaBannerBadge: "No credit card",
    ctaBannerTitle: "Ready to transform",
    ctaBannerTitleLine2: "your space?",
    ctaBannerSubtitle: "Start free today. Set up your space in under 5 minutes. No commitment, no credit card.",
    ctaBannerStart: "Start Free Now",
    ctaBannerDemo: "View Live Demo",
    footerTagline: "The management platform for fitness and wellness spaces — made in Portugal, for the world.",
    footerRights: "All rights reserved. Made with",
    footerInPortugal: "in Portugal.",
    footerAllSystems: "All systems operational",
    footerProduct: "Product", footerResources: "Resources", footerCompany: "Company", footerLegal: "Legal",
    fpFeat: "Features", fpPricing: "Pricing", fpNews: "What's New", fpRoadmap: "Roadmap", fpApi: "API Docs",
    frHelp: "Help Center", frBlog: "Blog", frVideos: "Video Tutorials", frCommunity: "Community", frStatus: "System Status",
    fcAbout: "About Us", fcCareers: "Careers", fcPartners: "Partners", fcPress: "Press", fcContact: "Contact",
    flTerms: "Terms of Service", flPrivacy: "Privacy Policy", flRgpd: "GDPR", flCookies: "Cookies", flDpa: "DPA",
    tabAdmin: "Admin", tabWebsite: "Website", tabMembro: "Member", tabMobile: "Mobile",
    tabAdminTitle: "Complete control panel",
    tabAdminDesc: "A 360° view of your space. Real-time dashboards, member management, finances and much more — all in one place.",
    tabAdminI1: "Dashboard", tabAdminI2: "Members", tabAdminI3: "Classes", tabAdminI4: "CRM", tabAdminI5: "Finances", tabAdminI6: "Reports",
    tabWebsiteTitle: "Customizable public site",
    tabWebsiteDesc: "Each space has its own site with custom domain, brand colors, live schedules, store and contact form.",
    tabWebsiteI1: "Home", tabWebsiteI2: "Schedules", tabWebsiteI3: "Plans", tabWebsiteI4: "Coaches", tabWebsiteI5: "Store", tabWebsiteI6: "Contact",
    tabMembroTitle: "Athlete portal",
    tabMembroDesc: "Your members access online to view schedules, make bookings, check results and manage their subscription.",
    tabMembroI1: "My Classes", tabMembroI2: "Results", tabMembroI3: "Plan", tabMembroI4: "Payments", tabMembroI5: "Profile", tabMembroI6: "Progress",
    tabMobileTitle: "App for iOS and Android",
    tabMobileDesc: "Athletes take the gym in their pocket. Check-in, workouts, results and communications — all in the Vytal app.",
    tabMobileI1: "Today's WOD", tabMobileI2: "Check-in", tabMobileI3: "Leaderboard", tabMobileI4: "Workouts", tabMobileI5: "Messages", tabMobileI6: "Progress",
    // Verticals
    verticalsTitle: "One product.",
    verticalsTitleHighlight: "20 verticals.",
    verticalsSubtitle: "From CrossFit box to dance studio — Vytal adapts to your business.",
    v_crossfit_box: "CrossFit Box",
    v_functional_training: "Functional Training",
    v_gym: "Gym",
    v_yoga_studio: "Yoga Studio",
    v_pilates_studio: "Pilates Studio",
    v_martial_arts: "Martial Arts",
    v_personal_training: "Personal Training",
    v_swimming: "Swimming",
    v_dance_studio: "Dance Studio",
    v_health_club: "Health Club",
    v_sports_club: "Sports Club",
    v_climbing_gym: "Climbing Gym",
    v_cycling_studio: "Cycling Studio",
    v_running_club: "Running Club",
    v_gymnastics_academy: "Gymnastics Academy",
    v_rehabilitation: "Rehabilitation",
    v_weightlifting_club: "Weightlifting Club",
    v_bootcamp: "Bootcamp",
    v_surf_water_sports: "Surf & Water Sports",
    v_other: "Other",
    // Feature Deep Dive
    deepDiveBadge: "Features in detail",
    deepDiveCheckinTitle: "Smart check-in",
    deepDiveCheckinDesc: "Eliminate queues and paperwork. Check-in is instant, accurate and integrated with attendance and payments.",
    deepDiveCheckinB1: "Unique QR Code per athlete",
    deepDiveCheckinB2: "Bulk check-in for coaches",
    deepDiveCheckinB3: "Walk-in without prior booking",
    deepDiveCheckinB4: "Automatic no-show tracking",
    deepDiveCrmTitle: "CRM & Sales pipeline",
    deepDiveCrmDesc: "Convert more leads into paying members with a visual pipeline and automatic follow-ups.",
    deepDiveCrmB1: "Intuitive drag-and-drop kanban",
    deepDiveCrmB2: "Automatic lead scoring",
    deepDiveCrmB3: "Source tracking (Facebook, Google...)",
    deepDiveCrmB4: "Automatic email/SMS follow-up",
    deepDiveWebsiteTitle: "Complete website builder",
    deepDiveWebsiteDesc: "Your space deserves a professional digital presence. Set up in minutes, no code needed.",
    deepDiveWebsiteB1: "Own domain included",
    deepDiveWebsiteB2: "6 pages: Home, Schedule, Plans, Team, Shop, Contact",
    deepDiveWebsiteB3: "Online store with shopping cart",
    deepDiveWebsiteB4: "SEO, analytics and testimonials built in",
    deepDiveAnalyticsTitle: "Reports & Analytics",
    deepDiveAnalyticsDesc: "Make decisions based on real data. See what works and fix what doesn't.",
    deepDiveAnalyticsB1: "Attendance heatmap by hour/day",
    deepDiveAnalyticsB2: "Revenue and growth charts",
    deepDiveAnalyticsB3: "AI-powered churn prediction",
    deepDiveAnalyticsB4: "Member retention analysis",
    // Payments
    paymentsTitle: "Payments for",
    paymentsTitleHighlight: "Portugal",
    paymentsBadge: "Payments",
    paymentsSubtitle: "All payment methods your clients use — integrated from the ground up.",
    paymentsMbway: "MB Way",
    paymentsMultibanco: "Multibanco",
    paymentsSepa: "SEPA",
    paymentsVisa: "Visa / MC",
    paymentsCash: "Cash",
    paymentsTransfer: "Transfer",
    // Automations & AI
    autoTitle: "Automations &",
    autoTitleHighlight: "Artificial Intelligence",
    autoBadge: "Automations & AI",
    autoSubtitle: "Save hours per week with smart automations and AI-generated insights.",
    autoColLeft: "Automations",
    autoColRight: "AI Insights",
    autoA1Title: "Milestone emails", autoA1Desc: "Automatic congratulations at 1st month, 6 months, 1 year as a member.",
    autoA2Title: "Anti-churn campaigns", autoA2Desc: "Detects at-risk members and sends personalized offers.",
    autoA3Title: "Sequenced onboarding", autoA3Desc: "Automatic welcome sequence for new members.",
    autoA4Title: "Birthday messages", autoA4Desc: "Automatically greets members on their birthday.",
    autoB1Title: "Churn prediction", autoB1Desc: "AI identifies members likely to cancel in the coming weeks.",
    autoB2Title: "Smart scheduling", autoB2Desc: "Suggests the best time slots based on historical demand.",
    autoB3Title: "WOD suggestions", autoB3Desc: "Recommends workouts tailored to each athlete's level and history.",
    autoB4Title: "Readiness scoring", autoB4Desc: "Evaluates athlete readiness based on training and recovery data.",
    // Compliance
    complianceTitle: "Compliance &",
    complianceTitleHighlight: "Security",
    complianceBadge: "Security",
    complianceSubtitle: "Built to meet Portuguese and European legal requirements.",
    complianceRgpd: "GDPR Compliant",
    complianceSaft: "SAF-T / ATCUD Ready",
    complianceSsl: "SSL Encrypted",
    complianceUptime: "99.9% Uptime",
    complianceIso: "ISO 27001 (planned)",
    complianceBackup: "Daily Backups",
  },
  es: {
    badge: "La plataforma #1 para espacios fitness en Portugal",
    headline: "Gestionar tu espacio fitness nunca fue tan fácil",
    subtitle: "Miembros, clases, pagos, CRM, sitio web — todo en una plataforma. De CrossFit a Yoga, de PT a Artes Marciales.",
    ctaStart: "Empezar Gratis",
    ctaDemo: "Ver Demo",
    signIn: "Entrar",
    features: "Funcionalidades",
    pricing: "Precios",
    testimonials: "Testimonios",
    faq: "FAQ",
    statVerticals: "Verticales",
    statFeatures: "Funcionalidades",
    statLangs: "Idiomas",
    statLocal: "100% Portugués",
    floatRevenue: "Ingresos",
    trustedBy: "La confianza de espacios en todo el país",
    everythingTitle: "Todo lo que necesitas. Una plataforma.",
    everythingSubtitle: "Construido desde cero para el mercado portugués, con todas las herramientas que tu espacio fitness necesita para crecer.",
    feat1: "Gestión de Miembros", feat1d: "Perfiles completos, historial de asistencia, planes de pago, documentos RGPD y comunicación integrada.",
    feat2: "Clases & Horarios", feat2d: "Calendario inteligente con reservas online, listas de espera, capacidad máxima y notificaciones automáticas.",
    feat3: "WODs & Entrenamientos", feat3d: "Constructor de WODs con biblioteca de ejercicios, seguimiento de resultados y progresión de atletas.",
    feat4: "CRM & Leads", feat4d: "Pipeline drag-and-drop, seguimientos automáticos, conversión de leads y análisis del embudo de ventas.",
    feat5: "Finanzas & Pagos", feat5d: "MBWay, SEPA, referencias Multibanco, SAF-T, ATCUD, facturas automáticas e informes fiscales.",
    feat6: "Sitio Web & Tienda", feat6d: "Sitio público personalizable con dominio propio, tienda online, landing pages y SEO integrado.",
    featLearnMore: "Saber más",
    showcaseTitle: "Una plataforma,",
    showcaseTitleHighlight: "múltiples experiencias",
    showcaseSubtitle: "Para gestores, atletas y visitantes — cada uno tiene la interfaz perfecta.",
    showcaseBadge: "Producto",
    showcaseExplore: "Explorar",
    compTitle: "¿Por qué Vytal?",
    compSubtitle: "Construido específicamente para el mercado portugués, con funcionalidades que los competidores simplemente no tienen.",
    compBadge: "Comparación",
    compColFeature: "Funcionalidad",
    compGeneric: "Genérico",
    compRow1: "Multi-vertical (20+ tipos de espacio)",
    compRow2: "Totalmente en Portugués (PT)",
    compRow3: "Sitio web público personalizable",
    compRow4: "App móvil nativa",
    compRow5: "MBWay & Multibanco",
    compRow6: "SAF-T & ATCUD (Portugal)",
    compRow7: "AI Insights & Recomendaciones",
    compRow8: "API Abierta & Integraciones",
    testimonialsTitle: "Lo que dicen",
    testimonialsTitleHighlight: "nuestros clientes",
    testimonialsBadge: "Testimonios",
    t1quote: "Desde que cambiamos a Vytal, ahorramos 3 horas al día en tareas administrativas. Los pagos automáticos via MBWay cambiaron completamente nuestro flujo de caja.",
    t1name: "Ana Ferreira", t1role: "Propietaria", t1gym: "CrossFit Aveiro",
    t2quote: "El CRM de leads es increíble. Antes perdíamos potenciales miembros porque no teníamos seguimiento. Ahora convertimos un 40% más de leads en miembros de pago.",
    t2name: "Ricardo Santos", t2role: "Head Coach & Manager", t2gym: "Iron Temple Lisboa",
    t3quote: "Gestionamos 3 estudios de yoga con Vytal. La funcionalidad multi-ubicación es fantástica y el sitio web personalizado para cada estudio aumentó nuestras inscripciones en un 60%.",
    t3name: "Sofia Maia", t3role: "Directora", t3gym: "Studio Zen — 3 locales",
    pricingTitle: "Simple y",
    pricingTitleHighlight: "transparente",
    pricingSubtitle: "Sin sorpresas, sin costes ocultos. Cambia de plan cuando quieras.",
    pricingBadge: "Precios",
    monthly: "Mensual",
    annual: "Anual",
    mostPopular: "Más Popular",
    onRequest: "Bajo consulta",
    billedAnnually: "Facturado anualmente · Ahorra",
    perYear: "€/año",
    pricingNote: "Sin tarjeta de crédito para empezar · Cancela cuando quieras · Soporte en Portugués",
    planFreeDesc: "Para empezar sin compromiso.",
    planProDesc: "Para espacios en crecimiento.",
    planEnterpriseDesc: "Para redes y franquicias fitness.",
    planFreePeriod: "para siempre",
    planProPeriod: "por mes",
    planEnterprisePeriod: "personalizado",
    planFreeF1: "Hasta 20 miembros", planFreeF2: "1 ubicación", planFreeF3: "Calendario de clases",
    planFreeF4: "Perfiles básicos", planFreeF5: "App móvil (solo lectura)", planFreeF6: "Soporte por email",
    planFreeN1: "Pagos automáticos", planFreeN2: "CRM avanzado", planFreeN3: "Sitio web público", planFreeN4: "API",
    planProF1: "Miembros ilimitados", planProF2: "1 ubicación", planProF3: "Todas las funcionalidades",
    planProF4: "Sitio web público personalizado", planProF5: "Pagos MBWay & SEPA", planProF6: "SAF-T & ATCUD",
    planProF7: "CRM & Leads", planProF8: "App móvil completa", planProF9: "Soporte prioritario",
    planProN1: "Multi-ubicación", planProN2: "API Abierta",
    planEntF1: "Multi-ubicación", planEntF2: "Miembros ilimitados", planEntF3: "API Abierta & Webhooks",
    planEntF4: "Integraciones personalizadas", planEntF5: "Soporte dedicado 24/7", planEntF6: "Onboarding asistido",
    planEntF7: "SLA garantizado", planEntF8: "Facturación centralizada",
    planFreeCta: "Empezar Gratis", planProCta: "Empezar Gratis 14 días", planEntCta: "Hablar con Ventas",
    faqTitle: "Preguntas",
    faqTitleHighlight: "frecuentes",
    faqBadge: "FAQ",
    faq1q: "¿Vytal funciona para yoga, pilates, artes marciales y otros tipos de espacio?",
    faq1a: "¡Sí! Vytal soporta 20+ tipos de espacios fitness y wellness, incluyendo CrossFit, yoga, pilates, artes marciales, natación, gimnasios tradicionales, entrenadores personales, estudios de danza y mucho más. Cada vertical tiene su propia configuración y terminología.",
    faq2q: "¿Puedo migrar mi espacio desde Regibox u otro software?",
    faq2a: "Absolutamente. Tenemos un equipo de onboarding dedicado que ayuda en la migración de datos (miembros, pagos, historial) desde cualquier plataforma anterior. La migración es gratuita en los planes Pro y Enterprise y normalmente tarda menos de 48 horas.",
    faq3q: "¿El sitio público de mi espacio es totalmente personalizable?",
    faq3a: "Sí. Cada espacio tiene su propio subdominio (vytal.fit/mi-gimnasio) o puede usar su propio dominio. Puedes personalizar colores, logo, fotos, textos, horarios, precios y mucho más — sin necesitar conocimientos técnicos.",
    faq4q: "¿Qué métodos de pago están soportados?",
    faq4a: "Soportamos MBWay, referencias Multibanco, transferencia SEPA, tarjeta de crédito/débito y débito directo. Para el mercado portugués, generamos SAF-T y ATCUD conformes con la AT. Próximamente también PayPal y Apple Pay.",
    faq5q: "¿Existe una app móvil para los atletas?",
    faq5a: "Sí, la app Vytal está disponible para iOS (App Store) y Android (Google Play). Los atletas pueden hacer check-in, consultar WODs, ver su progreso, hacer reservas y comunicarse con sus coaches directamente desde la app.",
    faq6q: "¿Vytal cumple con el RGPD (Reglamento General de Protección de Datos)?",
    faq6a: "Totalmente. Todos los datos están alojados en la Unión Europea (Portugal/Irlanda), con encriptación end-to-end, control de accesos por perfil, registro de consentimientos, derecho al olvido y exportación de datos. Proporcionamos DPA (Acuerdo de Procesamiento de Datos) para todos los clientes.",
    ctaBannerBadge: "Sin tarjeta de crédito",
    ctaBannerTitle: "¿Listo para transformar",
    ctaBannerTitleLine2: "tu espacio?",
    ctaBannerSubtitle: "Empieza gratis hoy. Configura tu espacio en menos de 5 minutos. Sin compromiso, sin tarjeta de crédito.",
    ctaBannerStart: "Empezar Gratis Ahora",
    ctaBannerDemo: "Ver Demo en Vivo",
    footerTagline: "La plataforma de gestión para espacios fitness y wellness — hecha en Portugal, para el mundo.",
    footerRights: "Todos los derechos reservados. Hecho con",
    footerInPortugal: "en Portugal.",
    footerAllSystems: "Todos los sistemas operativos",
    footerProduct: "Producto", footerResources: "Recursos", footerCompany: "Empresa", footerLegal: "Legal",
    fpFeat: "Funcionalidades", fpPricing: "Precios", fpNews: "Novedades", fpRoadmap: "Roadmap", fpApi: "API Docs",
    frHelp: "Centro de Ayuda", frBlog: "Blog", frVideos: "Tutoriales en Vídeo", frCommunity: "Comunidad", frStatus: "Estado del Sistema",
    fcAbout: "Sobre Nosotros", fcCareers: "Carreras", fcPartners: "Socios", fcPress: "Prensa", fcContact: "Contacto",
    flTerms: "Términos de Servicio", flPrivacy: "Política de Privacidad", flRgpd: "RGPD", flCookies: "Cookies", flDpa: "DPA",
    tabAdmin: "Admin", tabWebsite: "Sitio Web", tabMembro: "Miembro", tabMobile: "Móvil",
    tabAdminTitle: "Panel de control completo",
    tabAdminDesc: "Una visión 360° de tu espacio. Dashboards en tiempo real, gestión de miembros, finanzas y mucho más — todo en un solo lugar.",
    tabAdminI1: "Dashboard", tabAdminI2: "Miembros", tabAdminI3: "Clases", tabAdminI4: "CRM", tabAdminI5: "Finanzas", tabAdminI6: "Informes",
    tabWebsiteTitle: "Sitio público personalizable",
    tabWebsiteDesc: "Cada espacio tiene su sitio con dominio propio, colores de marca, horarios en vivo, tienda y formulario de contacto.",
    tabWebsiteI1: "Página Principal", tabWebsiteI2: "Horarios", tabWebsiteI3: "Planes", tabWebsiteI4: "Instructores", tabWebsiteI5: "Tienda", tabWebsiteI6: "Contacto",
    tabMembroTitle: "Portal del atleta",
    tabMembroDesc: "Tus miembros acceden online para ver horarios, hacer reservas, consultar resultados y gestionar su suscripción.",
    tabMembroI1: "Mis Clases", tabMembroI2: "Resultados", tabMembroI3: "Plan", tabMembroI4: "Pagos", tabMembroI5: "Perfil", tabMembroI6: "Progreso",
    tabMobileTitle: "App para iOS y Android",
    tabMobileDesc: "Los atletas llevan el gimnasio en el bolsillo. Check-in, entrenamientos, resultados y comunicaciones — todo en la app Vytal.",
    tabMobileI1: "WOD de Hoy", tabMobileI2: "Check-in", tabMobileI3: "Leaderboard", tabMobileI4: "Entrenamientos", tabMobileI5: "Mensajes", tabMobileI6: "Progreso",
    // Verticals
    verticalsTitle: "Un producto.",
    verticalsTitleHighlight: "20 verticales.",
    verticalsSubtitle: "De la box de CrossFit al estudio de danza — Vytal se adapta a tu negocio.",
    v_crossfit_box: "CrossFit Box",
    v_functional_training: "Entrenamiento Funcional",
    v_gym: "Gimnasio",
    v_yoga_studio: "Estudio de Yoga",
    v_pilates_studio: "Estudio de Pilates",
    v_martial_arts: "Artes Marciales",
    v_personal_training: "Entrenamiento Personal",
    v_swimming: "Natación",
    v_dance_studio: "Estudio de Danza",
    v_health_club: "Health Club",
    v_sports_club: "Club Deportivo",
    v_climbing_gym: "Gimnasio de Escalada",
    v_cycling_studio: "Estudio de Cycling",
    v_running_club: "Club de Running",
    v_gymnastics_academy: "Academia de Gimnasia",
    v_rehabilitation: "Rehabilitación",
    v_weightlifting_club: "Club de Halterofilia",
    v_bootcamp: "Bootcamp",
    v_surf_water_sports: "Surf & Deportes Acuáticos",
    v_other: "Otro",
    // Feature Deep Dive
    deepDiveBadge: "Funcionalidades en detalle",
    deepDiveCheckinTitle: "Check-in inteligente",
    deepDiveCheckinDesc: "Elimina las colas y el papel. El check-in es instantáneo, preciso e integrado con asistencia y pagos.",
    deepDiveCheckinB1: "Código QR único por atleta",
    deepDiveCheckinB2: "Check-in masivo para coaches",
    deepDiveCheckinB3: "Walk-in sin reserva previa",
    deepDiveCheckinB4: "Seguimiento automático de no-shows",
    deepDiveCrmTitle: "CRM & Pipeline de ventas",
    deepDiveCrmDesc: "Convierte más leads en miembros de pago con un pipeline visual y seguimientos automáticos.",
    deepDiveCrmB1: "Kanban drag-and-drop intuitivo",
    deepDiveCrmB2: "Lead scoring automático",
    deepDiveCrmB3: "Rastreo de fuente (Facebook, Google...)",
    deepDiveCrmB4: "Seguimiento automático por email/SMS",
    deepDiveWebsiteTitle: "Website builder completo",
    deepDiveWebsiteDesc: "Tu espacio merece una presencia digital profesional. Configúralo en minutos, sin código.",
    deepDiveWebsiteB1: "Dominio propio incluido",
    deepDiveWebsiteB2: "6 páginas: Inicio, Horarios, Planes, Equipo, Tienda, Contacto",
    deepDiveWebsiteB3: "Tienda online con carrito de compras",
    deepDiveWebsiteB4: "SEO, analytics y testimonios integrados",
    deepDiveAnalyticsTitle: "Informes & Analytics",
    deepDiveAnalyticsDesc: "Toma decisiones basadas en datos reales. Ve qué funciona y corrige lo que no.",
    deepDiveAnalyticsB1: "Heatmap de asistencia por hora/día",
    deepDiveAnalyticsB2: "Gráficos de ingresos y crecimiento",
    deepDiveAnalyticsB3: "Predicción de churn con IA",
    deepDiveAnalyticsB4: "Análisis de retención de miembros",
    // Payments
    paymentsTitle: "Pagos para",
    paymentsTitleHighlight: "Portugal",
    paymentsBadge: "Pagos",
    paymentsSubtitle: "Todos los métodos de pago que usan tus clientes — integrados desde el inicio.",
    paymentsMbway: "MB Way",
    paymentsMultibanco: "Multibanco",
    paymentsSepa: "SEPA",
    paymentsVisa: "Visa / MC",
    paymentsCash: "Efectivo",
    paymentsTransfer: "Transferencia",
    // Automations & AI
    autoTitle: "Automatizaciones &",
    autoTitleHighlight: "Inteligencia Artificial",
    autoBadge: "Automatizaciones & IA",
    autoSubtitle: "Ahorra horas por semana con automatizaciones inteligentes e insights generados por IA.",
    autoColLeft: "Automatizaciones",
    autoColRight: "AI Insights",
    autoA1Title: "Emails de hito", autoA1Desc: "Felicitaciones automáticas al 1.er mes, 6 meses, 1 año como miembro.",
    autoA2Title: "Campañas anti-churn", autoA2Desc: "Detecta miembros en riesgo y envía ofertas personalizadas.",
    autoA3Title: "Onboarding secuenciado", autoA3Desc: "Secuencia automática de bienvenida para nuevos miembros.",
    autoA4Title: "Mensajes de cumpleaños", autoA4Desc: "Felicita automáticamente en el día de cumpleaños del miembro.",
    autoB1Title: "Predicción de churn", autoB1Desc: "La IA identifica miembros que pueden cancelar en las próximas semanas.",
    autoB2Title: "Agendamiento inteligente", autoB2Desc: "Sugiere los mejores horarios basándose en la demanda histórica.",
    autoB3Title: "Sugerencia de WODs", autoB3Desc: "Recomienda entrenamientos adaptados al nivel e historial de cada atleta.",
    autoB4Title: "Readiness scoring", autoB4Desc: "Evalúa la disposición del atleta en base a entrenamientos y recuperación.",
    // Compliance
    complianceTitle: "Compliance &",
    complianceTitleHighlight: "Seguridad",
    complianceBadge: "Seguridad",
    complianceSubtitle: "Construido para cumplir los requisitos legales portugueses y europeos.",
    complianceRgpd: "RGPD Compliant",
    complianceSaft: "SAF-T / ATCUD Ready",
    complianceSsl: "SSL Encriptado",
    complianceUptime: "99.9% Uptime",
    complianceIso: "ISO 27001 (planificado)",
    complianceBackup: "Backups Diarios",
  },
};

function useLandingLang() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = (key: string) => LANDING_COPY[lang][key] ?? key;
  return { lang, setLang, t };
}

// ── Pricing toggle ──────────────────────────────────────────────────────────
function usePricingToggle() {
  const [annual, setAnnual] = useState(false);
  return { annual, setAnnual };
}

// ── FAQ accordion ───────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[rgba(34,197,94,0.12)] rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[rgba(34,197,94,0.04)] transition-colors duration-150"
      >
        <span className="font-medium text-vytal-text text-sm leading-snug pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-vytal-green transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-vytal-muted text-sm leading-relaxed border-t border-[rgba(34,197,94,0.08)] pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Nav ─────────────────────────────────────────────────────────────────────
function Navbar({ t, lang, setLang }: { t: (k: string) => string; lang: Lang; setLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  function toggleTheme() {
    const next = !lightMode;
    setLightMode(next);
    if (next) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: t("features"), href: "#funcionalidades" },
    { label: t("pricing"), href: "#precos" },
    { label: t("testimonials"), href: "#testemunhos" },
    { label: t("faq"), href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-vytal-bg/95 backdrop-blur-md border-b border-[rgba(34,197,94,0.1)] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-xl font-bold text-vytal-green tracking-tight">Vytal</span>
            <span className="text-xl font-bold text-vytal-muted tracking-tight">.fit</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-vytal-muted hover:text-vytal-text transition-colors duration-150"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1">
              {(["pt", "en", "es"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-all duration-150 ${
                    lang === l
                      ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
                      : "text-vytal-muted hover:text-vytal-text"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={lightMode ? "Switch to dark mode" : "Switch to light mode"}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(34,197,94,0.2)] text-vytal-muted hover:text-vytal-green hover:border-[rgba(34,197,94,0.4)] transition-all duration-150"
            >
              {lightMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg border border-[rgba(34,197,94,0.25)] text-vytal-text hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-vytal-green text-vytal-bg font-semibold hover:bg-[#16a34a] transition-colors duration-150"
            >
              {t("ctaStart")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-vytal-muted hover:text-vytal-text hover:bg-[rgba(34,197,94,0.06)] transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[rgba(34,197,94,0.1)] mt-1">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-vytal-muted hover:text-vytal-text hover:bg-[rgba(34,197,94,0.04)] rounded-lg transition-colors"
                >
                  {l.label}
                </a>
              ))}
              {/* Mobile lang switcher */}
              <div className="flex items-center gap-1 mt-2 px-1">
                {(["pt", "en", "es"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setMobileOpen(false); }}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded transition-all duration-150 ${
                      lang === l
                        ? "bg-[rgba(34,197,94,0.15)] text-vytal-green"
                        : "text-vytal-muted hover:text-vytal-text"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2 px-1">
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg border border-[rgba(34,197,94,0.25)] text-vytal-text"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg bg-vytal-green text-vytal-bg font-semibold"
                >
                  {t("ctaStart")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Floating UI Cards (Hero decorations) ─────────────────────────────────────
function FloatingStatsCard({ t }: { t: (k: string) => string }) {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(34,197,94,0.2)] bg-vytal-bg/85 backdrop-blur-md shadow-xl shadow-black/30 w-[150px]"
      style={{
        top: "18%",
        right: "6%",
        animation: "landing-float 6s ease-in-out infinite",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
          <TrendingUp size={10} className="text-vytal-green" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">{t("floatRevenue")}</span>
      </div>
      <span className="text-lg font-bold text-vytal-text">+32%</span>
      <div className="flex gap-0.5">
        {[40, 55, 35, 65, 50, 70, 80, 60, 90, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-vytal-green"
            style={{ height: `${h * 0.25}px`, opacity: 0.3 + (h / 100) * 0.7 }}
          />
        ))}
      </div>
    </div>
  );
}

function FloatingCalendarCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(0,212,255,0.2)] bg-vytal-bg/85 backdrop-blur-md shadow-xl shadow-black/30 w-[140px]"
      style={{
        bottom: "22%",
        left: "5%",
        animation: "landing-float-delayed 7s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
          <Calendar size={10} className="text-vytal-blue" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-1">
        {["09:00 CrossFit", "10:30 Yoga", "17:00 HIIT"].map((cls, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: ["#22c55e", "#c084fc", "#ffb300"][i] }} />
            <span className="text-[9px] text-vytal-muted">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingMembersCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1 p-3 rounded-xl border border-[rgba(192,132,252,0.2)] bg-vytal-bg/85 backdrop-blur-md shadow-xl shadow-black/30 w-[130px]"
      style={{
        top: "55%",
        right: "3%",
        animation: "landing-float 8s ease-in-out infinite",
        animationDelay: "2s",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(192,132,252,0.15)] flex items-center justify-center">
          <Users size={10} className="text-[#c084fc]" />
        </div>
        <span className="text-[9px] font-medium text-vytal-muted uppercase tracking-wider">Active</span>
      </div>
      <span className="text-lg font-bold text-vytal-text">247</span>
      <span className="text-[9px] text-vytal-green">+12 this week</span>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ t }: { t: (k: string) => string }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <DotGrid />
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] animate-auth-gradient"
          style={{
            background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
            top: "-150px",
            left: "-100px",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] animate-auth-gradient-delayed"
          style={{
            background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
            top: "30%",
            right: "-150px",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] animate-auth-gradient"
          style={{
            background: "radial-gradient(circle, #c084fc 0%, transparent 70%)",
            bottom: "-100px",
            left: "30%",
            animationDelay: "5s",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating UI cards */}
      <FloatingStatsCard t={t} />
      <FloatingCalendarCard />
      <FloatingMembersCard />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-enter">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.06)] mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-vytal-green animate-pulse" />
          <span className="text-xs font-medium text-vytal-green tracking-wide">
            {t("badge")}
          </span>
        </div>

        {/* Headline — larger with gradient text */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-vytal-text leading-[1.1] tracking-tight mb-6">
          <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("headline").split(" ").slice(0, 3).join(" ")}</span>{" "}
          {t("headline").split(" ").slice(3).join(" ")}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-vytal-muted max-w-2xl mx-auto leading-relaxed mb-10">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-16">
          {/* Animated gradient border CTA */}
          <div className="rounded-[14px] p-[1.5px] animated-gradient-border">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-vytal-green text-vytal-bg font-semibold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.25)] hover:shadow-[rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              {t("ctaStart")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link
            href="/@yoga-flow-porto"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[rgba(34,197,94,0.25)] text-vytal-text font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150 backdrop-blur-sm"
          >
            <Play size={15} className="text-vytal-green" />
            {t("ctaDemo")}
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(34,197,94,0.1)] rounded-2xl overflow-hidden border border-[rgba(34,197,94,0.1)] backdrop-blur-sm">
          {[
            { value: "20+", label: t("statVerticals") },
            { value: "500+", label: t("statFeatures") },
            { value: "3", label: t("statLangs") },
            { value: "100%", label: t("statLocal") },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-5 px-4 bg-vytal-bg/80 hover:bg-[rgba(34,197,94,0.04)] transition-colors"
            >
              <span className="text-2xl font-bold text-vytal-green">{s.value}</span>
              <span className="text-xs text-vytal-muted mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Social Proof ─────────────────────────────────────────────────────────────
function SocialProof({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();
  const gyms = [
    "CrossFit Aveiro",
    "Yoga Flow Porto",
    "Iron Temple",
    "Box 47",
    "Studio Zen",
    "PT Academy",
  ];

  return (
    <section className="py-16 border-t border-[rgba(34,197,94,0.08)]">
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-vytal-muted mb-10 tracking-wider uppercase">
          {t("trustedBy")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gyms.map((gym, i) => (
            <div
              key={gym}
              className="flex items-center justify-center px-4 py-3.5 rounded-xl border border-[rgba(34,197,94,0.1)] bg-vytal-bg3/40 hover:border-[rgba(34,197,94,0.25)] hover:bg-[rgba(34,197,94,0.04)] transition-all duration-150 group backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xs font-medium text-vytal-muted group-hover:text-vytal-text transition-colors text-center leading-tight">
                {gym}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURE_ICONS = [Users, Calendar, Dumbbell, TrendingUp, CreditCard, Globe];
const FEATURE_COLORS = ["#22c55e", "#00d4ff", "#c084fc", "#ffb300", "#ff8c42", "#22c55e"];
const FEATURE_KEYS = [
  { title: "feat1", desc: "feat1d", href: "/signup" },
  { title: "feat2", desc: "feat2d", href: "/signup" },
  { title: "feat3", desc: "feat3d", href: "/signup" },
  { title: "feat4", desc: "feat4d", href: "/signup" },
  { title: "feat5", desc: "feat5d", href: "/signup" },
  { title: "feat6", desc: "feat6d", href: "/signup" },
];

function Features({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="funcionalidades" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("features")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("everythingTitle").split(".")[0]}.{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("everythingTitle").split(".").slice(1).join(".").trim()}</span>
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
            {t("everythingSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURE_KEYS.map((keys, idx) => {
            const Icon = FEATURE_ICONS[idx];
            const color = FEATURE_COLORS[idx];
            return (
              <div
                key={keys.title}
                className="group relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-vytal-bg3/40 backdrop-blur-sm hover:border-[rgba(34,197,94,0.3)] hover:bg-vytal-bg3/70 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 0% 0%, ${color}08 0%, transparent 60%)`,
                  }}
                />
                {/* Decorative circle */}
                <svg className="absolute top-3 right-3 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none" aria-hidden="true">
                  <circle cx="32" cy="32" r="30" stroke={color} strokeWidth="1" fill="none" />
                  <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="0.5" fill="none" />
                </svg>
                {/* Decorative line */}
                <svg className="absolute bottom-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true">
                  <line x1="0" y1="0" x2="100%" y2="0" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
                </svg>
                {/* Icon with glow */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                    style={{ background: color }}
                  />
                  <div
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}14` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                </div>
                <h3 className="font-semibold text-vytal-text mb-2 text-sm">{t(keys.title)}</h3>
                <p className="text-xs text-vytal-muted leading-relaxed">{t(keys.desc)}</p>
                <Link
                  href={keys.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color }}
                >
                  {t("featLearnMore")} <ArrowRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Verticals Marquee ────────────────────────────────────────────────────────
const VERTICALS = [
  { emoji: "🏋️", key: "crossfit_box" },
  { emoji: "💪", key: "functional_training" },
  { emoji: "💪", key: "gym" },
  { emoji: "🧘", key: "yoga_studio" },
  { emoji: "🎓", key: "pilates_studio" },
  { emoji: "🥊", key: "martial_arts" },
  { emoji: "🎯", key: "personal_training" },
  { emoji: "🏊", key: "swimming" },
  { emoji: "🩰", key: "dance_studio" },
  { emoji: "🏢", key: "health_club" },
  { emoji: "⚽", key: "sports_club" },
  { emoji: "🧗", key: "climbing_gym" },
  { emoji: "🚴", key: "cycling_studio" },
  { emoji: "🏃", key: "running_club" },
  { emoji: "🤸", key: "gymnastics_academy" },
  { emoji: "🏥", key: "rehabilitation" },
  { emoji: "🏆", key: "weightlifting_club" },
  { emoji: "☀️", key: "bootcamp" },
  { emoji: "🏄", key: "surf_water_sports" },
  { emoji: "➕", key: "other" },
];

function VerticalsMarquee({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();
  const pills = VERTICALS.map((v) => ({ emoji: v.emoji, label: t(`v_${v.key}`) }));
  const doubled = [...pills, ...pills];

  return (
    <section className="py-20 border-t border-[rgba(34,197,94,0.08)] overflow-hidden">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <span className="text-xs font-medium text-vytal-green">Verticais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-3">
            {t("verticalsTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("verticalsTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("verticalsSubtitle")}</p>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-vytal-bg), transparent)" }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--color-vytal-bg), transparent)" }} />
          <div className="marquee-track gap-3 py-2">
            {doubled.map((pill, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(34,197,94,0.15)] bg-vytal-bg3/60 backdrop-blur-sm shrink-0 mx-1.5 hover:border-[rgba(34,197,94,0.4)] hover:bg-[rgba(34,197,94,0.07)] transition-all duration-150 cursor-default"
              >
                <span className="text-base leading-none">{pill.emoji}</span>
                <span className="text-xs font-medium text-vytal-text whitespace-nowrap">{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Product Showcase ──────────────────────────────────────────────────────────
const TAB_META = [
  { id: "admin",   gradient: "from-vytal-green/20 via-vytal-bg2 to-vytal-bg", accent: "#22c55e",
    labelKey: "tabAdmin", titleKey: "tabAdminTitle", descKey: "tabAdminDesc",
    itemKeys: ["tabAdminI1","tabAdminI2","tabAdminI3","tabAdminI4","tabAdminI5","tabAdminI6"] },
  { id: "website", gradient: "from-vytal-blue/20 via-vytal-bg2 to-vytal-bg", accent: "#00d4ff",
    labelKey: "tabWebsite", titleKey: "tabWebsiteTitle", descKey: "tabWebsiteDesc",
    itemKeys: ["tabWebsiteI1","tabWebsiteI2","tabWebsiteI3","tabWebsiteI4","tabWebsiteI5","tabWebsiteI6"] },
  { id: "membro",  gradient: "from-[#c084fc]/20 via-vytal-bg2 to-vytal-bg", accent: "#c084fc",
    labelKey: "tabMembro", titleKey: "tabMembroTitle", descKey: "tabMembroDesc",
    itemKeys: ["tabMembroI1","tabMembroI2","tabMembroI3","tabMembroI4","tabMembroI5","tabMembroI6"] },
  { id: "mobile",  gradient: "from-[#ff8c42]/20 via-vytal-bg2 to-vytal-bg", accent: "#ff8c42",
    labelKey: "tabMobile", titleKey: "tabMobileTitle", descKey: "tabMobileDesc",
    itemKeys: ["tabMobileI1","tabMobileI2","tabMobileI3","tabMobileI4","tabMobileI5","tabMobileI6"] },
];

function ProductShowcase({ t }: { t: (k: string) => string }) {
  const [activeTab, setActiveTab] = useState("admin");
  const tab = TAB_META.find((tb) => tb.id === activeTab)!;
  const mockItems = tab.itemKeys.map((k) => t(k));
  const ref = useScrollReveal();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <BarChart3 size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("showcaseBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("showcaseTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("showcaseTitleHighlight")}</span>
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
            {t("showcaseSubtitle")}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-xl bg-vytal-bg3/60 border border-[rgba(34,197,94,0.1)] w-fit mx-auto backdrop-blur-sm">
          {TAB_META.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tb.id
                  ? "bg-vytal-green text-vytal-bg"
                  : "text-vytal-muted hover:text-vytal-text"
              }`}
            >
              {t(tb.labelKey)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Mock screen */}
          <div
            className={`relative rounded-2xl border border-[rgba(34,197,94,0.15)] overflow-hidden h-80 bg-gradient-to-br ${tab.gradient}`}
          >
            {/* Mock UI chrome */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-vytal-bg/80 flex items-center gap-2 px-4 border-b border-[rgba(34,197,94,0.08)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff4757]/60" />
                <div className="w-3 h-3 rounded-full bg-vytal-amber/60" />
                <div className="w-3 h-3 rounded-full bg-vytal-green/60" />
              </div>
              <div className="flex-1 h-5 rounded bg-[rgba(34,197,94,0.06)] mx-4" />
            </div>
            {/* Mock content grid */}
            <div className="absolute top-12 left-4 right-4 bottom-4 grid grid-cols-3 gap-2">
              {mockItems.map((item, i) => (
                <div
                  key={item}
                  className="rounded-lg border border-[rgba(34,197,94,0.1)] bg-vytal-bg/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1 p-2 hover:border-[rgba(34,197,94,0.3)] transition-colors"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div
                    className="w-6 h-6 rounded-md"
                    style={{ background: `${tab.accent}20` }}
                  />
                  <span className="text-[10px] text-vytal-muted text-center leading-tight">{item}</span>
                </div>
              ))}
            </div>
            {/* Glow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: tab.accent }}
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-2xl font-bold text-vytal-text mb-4">{t(tab.titleKey)}</h3>
            <p className="text-vytal-muted leading-relaxed mb-6">{t(tab.descKey)}</p>
            <ul className="space-y-3">
              {mockItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-vytal-text">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${tab.accent}20` }}
                  >
                    <Check size={10} style={{ color: tab.accent }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-lg text-sm font-semibold text-vytal-bg transition-all duration-150 hover:-translate-y-0.5"
              style={{ background: tab.accent }}
            >
              {t("showcaseExplore")} {t(tab.labelKey)}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Feature Deep Dive ────────────────────────────────────────────────────────
function CheckinMockup() {
  const members = [
    { name: "Ana Costa", status: "checked" },
    { name: "João Silva", status: "checked" },
    { name: "Maria Santos", status: "noshow" },
  ];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg/90 p-5 shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold text-vytal-text">CrossFit 09:00</div>
          <div className="text-[10px] text-vytal-muted">12/15 atletas</div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.12)] flex items-center justify-center border border-[rgba(34,197,94,0.2)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        </div>
      </div>
      {/* Member rows */}
      <div className="space-y-2 mb-4">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-vytal-bg3/60 border border-[rgba(34,197,94,0.07)]">
            <div className="w-7 h-7 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center text-[10px] font-bold text-vytal-green">
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className="text-xs text-vytal-text flex-1">{m.name}</span>
            {m.status === "checked" ? (
              <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.2)] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M5 12l5 5L19 7" /></svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[rgba(255,71,87,0.15)] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* QR Button */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] cursor-pointer hover:bg-[rgba(34,197,94,0.15)] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          <path d="M14 14h.01M14 17h3M17 14v3M20 14h.01M20 20h.01" />
        </svg>
        <span className="text-xs font-medium text-vytal-green">Scan QR Code</span>
      </div>
    </div>
  );
}

function CRMMockup() {
  const columns = [
    { title: "Lead", color: "#6b8c72", cards: ["Sara M.", "Pedro F."] },
    { title: "Contactado", color: "#00d4ff", cards: ["Bruno A."] },
    { title: "Trial", color: "#ffb300", cards: ["Inês R.", "Rui C."] },
    { title: "Subscrito", color: "#22c55e", cards: ["Ana P."] },
  ];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg/90 p-4 shadow-xl shadow-black/40">
      <div className="text-xs font-semibold text-vytal-text mb-3">Pipeline de Vendas</div>
      <div className="grid grid-cols-4 gap-2">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: col.color }}>{col.title}</span>
            </div>
            {col.cards.map((card) => (
              <div key={card} className="px-2 py-2 rounded-lg border text-[9px] text-vytal-text bg-vytal-bg3/80 cursor-grab active:cursor-grabbing hover:border-opacity-50 transition-colors"
                style={{ borderColor: `${col.color}30` }}>
                {card}
              </div>
            ))}
            <div className="px-2 py-1.5 rounded-lg border border-dashed border-[rgba(34,197,94,0.1)] text-[9px] text-vytal-muted text-center">+ Add</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteMockup() {
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg/90 overflow-hidden shadow-xl shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-vytal-bg3/80 border-b border-[rgba(34,197,94,0.08)]">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-[#ff4757]/60" />
          <div className="w-2 h-2 rounded-full bg-vytal-amber/60" />
          <div className="w-2 h-2 rounded-full bg-vytal-green/60" />
        </div>
        <div className="flex-1 h-4 rounded bg-[rgba(34,197,94,0.06)] flex items-center px-2">
          <span className="text-[8px] text-vytal-muted">vytal.fit/@yoga-flow-porto</span>
        </div>
      </div>
      {/* Mini site */}
      <div className="p-3">
        {/* Nav */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(34,197,94,0.08)]">
          <span className="text-[9px] font-bold text-vytal-green">CrossFit Aveiro</span>
          <div className="flex gap-2">
            {["Horários", "Planos", "Equipa"].map((n) => (
              <span key={n} className="text-[7px] text-vytal-muted">{n}</span>
            ))}
          </div>
        </div>
        {/* Hero */}
        <div className="rounded-xl bg-gradient-to-br from-[rgba(34,197,94,0.12)] to-[rgba(0,212,255,0.06)] p-3 mb-2 border border-[rgba(34,197,94,0.1)]">
          <div className="text-[9px] font-bold text-vytal-text mb-1">Forja o Teu Melhor.</div>
          <div className="text-[7px] text-vytal-muted mb-2">CrossFit em Aveiro desde 2015</div>
          <div className="inline-flex px-2 py-1 rounded-md bg-vytal-green text-[7px] font-bold text-vytal-bg">Inscreve-te</div>
        </div>
        {/* Pricing mini cards */}
        <div className="grid grid-cols-3 gap-1">
          {[{ n: "Starter", p: "Free" }, { n: "Pro", p: "49€" }, { n: "Elite", p: "79€" }].map((plan) => (
            <div key={plan.n} className="rounded-lg border border-[rgba(34,197,94,0.1)] p-1.5 text-center">
              <div className="text-[7px] font-semibold text-vytal-text">{plan.n}</div>
              <div className="text-[8px] font-bold text-vytal-green">{plan.p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [30, 55, 40, 70, 60, 85, 75, 90, 65, 80, 95, 70];
  const stats = [{ label: "Receita", value: "€12.4k", change: "+18%" }, { label: "Membros", value: "247", change: "+12" }, { label: "Retenção", value: "87%", change: "+3%" }];
  return (
    <div className="rounded-2xl border border-[rgba(34,197,94,0.15)] bg-vytal-bg/90 p-4 shadow-xl shadow-black/40">
      <div className="text-xs font-semibold text-vytal-text mb-3">Analytics — Junho 2026</div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-vytal-bg3/60 border border-[rgba(34,197,94,0.08)] p-2">
            <div className="text-[8px] text-vytal-muted mb-0.5">{s.label}</div>
            <div className="text-xs font-bold text-vytal-text">{s.value}</div>
            <div className="text-[8px] text-vytal-green">{s.change}</div>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="rounded-xl bg-vytal-bg3/40 border border-[rgba(34,197,94,0.06)] p-3">
        <div className="text-[8px] text-vytal-muted mb-2">Presenças por mês</div>
        <div className="flex items-end gap-1 h-12">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(34,197,94,${0.2 + (h / 100) * 0.7})` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {["Jan", "Mar", "Mai", "Jun"].map((m) => (
            <span key={m} className="text-[6px] text-vytal-muted">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureDeepDive({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const features = [
    {
      side: "left" as const,
      titleKey: "deepDiveCheckinTitle",
      descKey: "deepDiveCheckinDesc",
      bulletKeys: ["deepDiveCheckinB1", "deepDiveCheckinB2", "deepDiveCheckinB3", "deepDiveCheckinB4"],
      accent: "#22c55e",
      Mockup: CheckinMockup,
    },
    {
      side: "right" as const,
      titleKey: "deepDiveCrmTitle",
      descKey: "deepDiveCrmDesc",
      bulletKeys: ["deepDiveCrmB1", "deepDiveCrmB2", "deepDiveCrmB3", "deepDiveCrmB4"],
      accent: "#00d4ff",
      Mockup: CRMMockup,
    },
    {
      side: "left" as const,
      titleKey: "deepDiveWebsiteTitle",
      descKey: "deepDiveWebsiteDesc",
      bulletKeys: ["deepDiveWebsiteB1", "deepDiveWebsiteB2", "deepDiveWebsiteB3", "deepDiveWebsiteB4"],
      accent: "#c084fc",
      Mockup: WebsiteMockup,
    },
    {
      side: "right" as const,
      titleKey: "deepDiveAnalyticsTitle",
      descKey: "deepDiveAnalyticsDesc",
      bulletKeys: ["deepDiveAnalyticsB1", "deepDiveAnalyticsB2", "deepDiveAnalyticsB3", "deepDiveAnalyticsB4"],
      accent: "#ffb300",
      Mockup: AnalyticsMockup,
    },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("deepDiveBadge")}</span>
          </div>
        </div>

        <div className="space-y-24">
          {features.map((feat) => {
            const { Mockup } = feat;
            const isLeft = feat.side === "left";
            const textBlock = (
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-vytal-text mb-4" style={{ color: feat.accent }}>
                  {t(feat.titleKey)}
                </h3>
                <p className="text-vytal-muted leading-relaxed mb-6 text-sm">{t(feat.descKey)}</p>
                <ul className="space-y-3">
                  {feat.bulletKeys.map((bk) => (
                    <li key={bk} className="flex items-start gap-3 text-sm text-vytal-text">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${feat.accent}20` }}
                      >
                        <Check size={11} style={{ color: feat.accent }} />
                      </div>
                      {t(bk)}
                    </li>
                  ))}
                </ul>
              </div>
            );
            const mockupBlock = (
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Mockup />
                </div>
              </div>
            );
            return (
              <div key={feat.titleKey} className="grid lg:grid-cols-2 gap-12 items-center">
                {isLeft ? (
                  <>
                    {textBlock}
                    {mockupBlock}
                  </>
                ) : (
                  <>
                    {mockupBlock}
                    {textBlock}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Payments Portugal ────────────────────────────────────────────────────────
function PaymentsPortugal({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const methods = [
    {
      key: "paymentsMbway",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(255,71,87,0.12)" />
          <path d="M12 24a12 12 0 1 1 24 0 12 12 0 0 1-24 0z" fill="none" stroke="#ff4757" strokeWidth="2.5"/>
          <path d="M20 20l4 4 4-4M20 28l4-4 4 4" stroke="#ff4757" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: "#ff4757",
    },
    {
      key: "paymentsMultibanco",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(0,100,200,0.12)" />
          <rect x="12" y="14" width="24" height="20" rx="3" stroke="#0064c8" strokeWidth="2.5" fill="none"/>
          <path d="M12 20h24" stroke="#0064c8" strokeWidth="2"/>
          <rect x="16" y="26" width="6" height="4" rx="1" fill="#0064c8" opacity="0.6"/>
        </svg>
      ),
      color: "#0064c8",
    },
    {
      key: "paymentsSepa",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(0,212,255,0.12)" />
          <circle cx="24" cy="24" r="10" stroke="#00d4ff" strokeWidth="2.5" fill="none"/>
          <path d="M19 24h10M22 20l-3 4 3 4" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#00d4ff",
    },
    {
      key: "paymentsVisa",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(192,132,252,0.12)" />
          <rect x="8" y="14" width="32" height="20" rx="4" stroke="#c084fc" strokeWidth="2" fill="none"/>
          <path d="M20 28l2-8 2 8M24 24h3" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="32" cy="24" r="3" fill="none" stroke="#c084fc" strokeWidth="1.5"/>
        </svg>
      ),
      color: "#c084fc",
    },
    {
      key: "paymentsCash",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(34,197,94,0.12)" />
          <rect x="8" y="16" width="32" height="16" rx="3" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
          <circle cx="24" cy="24" r="4" stroke="#22c55e" strokeWidth="2" fill="none"/>
          <path d="M12 20v8M36 20v8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      color: "#22c55e",
    },
    {
      key: "paymentsTransfer",
      icon: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="rgba(255,179,0,0.12)" />
          <path d="M10 24h28M30 16l8 8-8 8" stroke="#ffb300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#ffb300",
    },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <CreditCard size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("paymentsBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("paymentsTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("paymentsTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("paymentsSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {methods.map((m) => (
            <div
              key={m.key}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-vytal-bg3/40 backdrop-blur-sm hover:border-[rgba(34,197,94,0.3)] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-200 group"
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {m.icon}
              </div>
              <span className="text-xs font-semibold text-vytal-text text-center">{t(m.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Automations & AI ─────────────────────────────────────────────────────────
function AutomationsAI({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const automations = [
    { titleKey: "autoA1Title", descKey: "autoA1Desc", icon: "✉️", color: "#22c55e" },
    { titleKey: "autoA2Title", descKey: "autoA2Desc", icon: "🎯", color: "#ff8c42" },
    { titleKey: "autoA3Title", descKey: "autoA3Desc", icon: "🚀", color: "#00d4ff" },
    { titleKey: "autoA4Title", descKey: "autoA4Desc", icon: "🎂", color: "#c084fc" },
  ];

  const aiInsights = [
    { titleKey: "autoB1Title", descKey: "autoB1Desc", icon: "🔮", color: "#ff4757" },
    { titleKey: "autoB2Title", descKey: "autoB2Desc", icon: "🧠", color: "#22c55e" },
    { titleKey: "autoB3Title", descKey: "autoB3Desc", icon: "🏋️", color: "#00d4ff" },
    { titleKey: "autoB4Title", descKey: "autoB4Desc", icon: "📊", color: "#ffb300" },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("autoBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("autoTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("autoTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("autoSubtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Automations column */}
          <div className="rounded-2xl border border-[rgba(34,197,94,0.12)] bg-vytal-bg3/40 backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-vytal-green uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                <Zap size={11} className="text-vytal-green" />
              </div>
              {t("autoColLeft")}
            </h3>
            <div className="space-y-3">
              {automations.map((item) => (
                <div
                  key={item.titleKey}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(34,197,94,0.08)] bg-vytal-bg/40 hover:border-[rgba(34,197,94,0.2)] hover:bg-vytal-bg/60 transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-vytal-bg3/80 border border-[rgba(34,197,94,0.1)]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI column */}
          <div className="rounded-2xl border border-[rgba(0,212,255,0.12)] bg-[rgba(0,30,40,0.4)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-vytal-blue uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
                <BarChart3 size={11} className="text-vytal-blue" />
              </div>
              {t("autoColRight")}
            </h3>
            <div className="space-y-3">
              {aiInsights.map((item) => (
                <div
                  key={item.titleKey}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-[rgba(0,212,255,0.08)] bg-vytal-bg/40 hover:border-[rgba(0,212,255,0.2)] hover:bg-vytal-bg/60 transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-vytal-bg3/80 border border-[rgba(0,212,255,0.1)]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-vytal-text mb-0.5">{t(item.titleKey)}</div>
                    <div className="text-xs text-vytal-muted leading-relaxed">{t(item.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Compliance & Segurança ───────────────────────────────────────────────────
function ComplianceSecurity({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  const badges = [
    {
      key: "complianceRgpd",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      color: "#22c55e",
    },
    {
      key: "complianceSaft",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      color: "#00d4ff",
    },
    {
      key: "complianceSsl",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      color: "#c084fc",
    },
    {
      key: "complianceUptime",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      color: "#22c55e",
    },
    {
      key: "complianceIso",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      ),
      color: "#ffb300",
    },
    {
      key: "complianceBackup",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
        </svg>
      ),
      color: "#ff8c42",
    },
  ];

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Shield size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("complianceBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("complianceTitle")}{" "}
            <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">
              {t("complianceTitleHighlight")}
            </span>
          </h2>
          <p className="text-vytal-muted text-sm max-w-lg mx-auto">{t("complianceSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border bg-vytal-bg3/40 backdrop-blur-sm hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-200 group"
              style={{ borderColor: `${badge.color}20` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${badge.color}12` }}
              >
                {badge.icon}
              </div>
              <span className="text-xs font-semibold text-vytal-text text-center leading-tight">{t(badge.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Comparison ────────────────────────────────────────────────────────────────
const COMPARISON_DATA = [
  { key: "compRow1", vytal: true,  regibox: false, wodify: false, generic: false },
  { key: "compRow2", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow3", vytal: true,  regibox: false, wodify: false, generic: true  },
  { key: "compRow4", vytal: true,  regibox: false, wodify: true,  generic: false },
  { key: "compRow5", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow6", vytal: true,  regibox: true,  wodify: false, generic: false },
  { key: "compRow7", vytal: true,  regibox: false, wodify: false, generic: false },
  { key: "compRow8", vytal: true,  regibox: false, wodify: true,  generic: false },
];

function Comparison({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Shield size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("compBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("compTitle")}
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed">
            {t("compSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(34,197,94,0.12)] overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="grid grid-cols-5 bg-vytal-bg3/80">
            <div className="col-span-2 px-6 py-4 text-xs font-semibold text-vytal-muted uppercase tracking-wider">
              {t("compColFeature")}
            </div>
            {["Vytal", "Regibox", "Wodify", t("compGeneric")].map((name, i) => (
              <div
                key={name}
                className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  i === 0 ? "text-vytal-green bg-[rgba(34,197,94,0.08)]" : "text-vytal-muted"
                }`}
              >
                {i === 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-vytal-green text-vytal-bg text-[10px] font-bold">#1</span>
                    {name}
                  </span>
                ) : name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARISON_DATA.map((row, idx) => (
            <div
              key={row.key}
              className={`grid grid-cols-5 border-t border-[rgba(34,197,94,0.06)] ${
                idx % 2 === 0 ? "bg-vytal-bg/40" : "bg-vytal-bg3/20"
              } hover:bg-[rgba(34,197,94,0.03)] transition-colors`}
            >
              <div className="col-span-2 px-6 py-4 text-sm text-vytal-text">{t(row.key)}</div>
              {[row.vytal, row.regibox, row.wodify, row.generic].map((val, i) => (
                <div key={i} className={`px-4 py-4 flex items-center justify-center ${i === 0 ? "bg-[rgba(34,197,94,0.05)]" : ""}`}>
                  {val ? (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        i === 0
                          ? "bg-[rgba(34,197,94,0.15)]"
                          : "bg-[rgba(107,140,114,0.1)]"
                      }`}
                    >
                      <Check
                        size={12}
                        className={i === 0 ? "text-vytal-green" : "text-vytal-muted"}
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[rgba(255,71,87,0.08)] flex items-center justify-center">
                      <X size={12} className="text-[rgba(255,71,87,0.4)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIAL_META = [
  { quoteKey: "t1quote", nameKey: "t1name", roleKey: "t1role", gymKey: "t1gym", initials: "AF", color: "#22c55e" },
  { quoteKey: "t2quote", nameKey: "t2name", roleKey: "t2role", gymKey: "t2gym", initials: "RS", color: "#00d4ff" },
  { quoteKey: "t3quote", nameKey: "t3name", roleKey: "t3role", gymKey: "t3gym", initials: "SM", color: "#c084fc" },
];

function Testimonials({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="testemunhos" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Star size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("testimonialsBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("testimonialsTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("testimonialsTitleHighlight")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIAL_META.map((tm) => (
            <div
              key={tm.nameKey}
              className="relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-vytal-bg3/40 backdrop-blur-sm hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all duration-300 group"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-vytal-amber text-vytal-amber" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-vytal-muted leading-relaxed mb-6 group-hover:text-vytal-text transition-colors duration-200">
                &ldquo;{t(tm.quoteKey)}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-vytal-bg"
                  style={{ background: tm.color }}
                >
                  {tm.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-vytal-text">{t(tm.nameKey)}</p>
                  <p className="text-xs text-vytal-muted">
                    {t(tm.roleKey)} · {t(tm.gymKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLAN_META = [
  {
    nameKey: "free", priceVal: 0, highlighted: false, color: "#6b8c72",
    descKey: "planFreeDesc", periodKey: "planFreePeriod", ctaKey: "planFreeCta",
    featureKeys: ["planFreeF1","planFreeF2","planFreeF3","planFreeF4","planFreeF5","planFreeF6"],
    notIncludedKeys: ["planFreeN1","planFreeN2","planFreeN3","planFreeN4"],
  },
  {
    nameKey: "pro", priceVal: 49, highlighted: true, color: "#22c55e",
    descKey: "planProDesc", periodKey: "planProPeriod", ctaKey: "planProCta",
    featureKeys: ["planProF1","planProF2","planProF3","planProF4","planProF5","planProF6","planProF7","planProF8","planProF9"],
    notIncludedKeys: ["planProN1","planProN2"],
  },
  {
    nameKey: "enterprise", priceVal: null, highlighted: false, color: "#c084fc",
    descKey: "planEnterpriseDesc", periodKey: "planEnterprisePeriod", ctaKey: "planEntCta",
    featureKeys: ["planEntF1","planEntF2","planEntF3","planEntF4","planEntF5","planEntF6","planEntF7","planEntF8"],
    notIncludedKeys: [] as string[],
  },
];

function Pricing({ t }: { t: (k: string) => string }) {
  const { annual, setAnnual } = usePricingToggle();
  const ref = useScrollReveal();

  return (
    <section id="precos" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <CreditCard size={12} className="text-vytal-green" />
            <span className="text-xs font-medium text-vytal-green">{t("pricingBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("pricingTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("pricingTitleHighlight")}</span>
          </h2>
          <p className="text-vytal-muted max-w-xl mx-auto text-sm leading-relaxed mb-8">
            {t("pricingSubtitle")}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-vytal-bg3/60 border border-[rgba(34,197,94,0.1)] backdrop-blur-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                !annual ? "bg-[rgba(34,197,94,0.15)] text-vytal-green" : "text-vytal-muted"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                annual ? "bg-[rgba(34,197,94,0.15)] text-vytal-green" : "text-vytal-muted"
              }`}
            >
              {t("annual")}
              <span className="text-[10px] bg-vytal-green text-vytal-bg px-1.5 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_META.map((plan) => {
            const displayPrice =
              plan.priceVal === null
                ? null
                : plan.priceVal === 0
                ? 0
                : annual
                ? Math.round(plan.priceVal * 0.8)
                : plan.priceVal;

            return (
              <div
                key={plan.nameKey}
                className={`relative flex flex-col ${
                  plan.highlighted ? "md:-mt-2 md:mb-[-8px]" : ""
                }`}
              >
                {/* Animated gradient border for popular plan */}
                {plan.highlighted && (
                  <div className="absolute -inset-[1.5px] rounded-[18px] animated-gradient-border opacity-60" />
                )}
                <div
                  className={`relative p-6 rounded-2xl border transition-all duration-200 flex flex-col flex-1 ${
                    plan.highlighted
                      ? "border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.04)] shadow-lg shadow-[rgba(34,197,94,0.08)] backdrop-blur-sm"
                      : "border-[rgba(34,197,94,0.1)] bg-vytal-bg3/40 backdrop-blur-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className="px-3 py-1 rounded-full bg-vytal-green text-vytal-bg text-xs font-bold inline-flex items-center gap-1.5"
                        style={{ animation: "landing-pulse-glow 2s ease-in-out infinite" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-vytal-bg animate-pulse" />
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-bold text-vytal-text text-lg mb-1">{t(plan.nameKey)}</h3>
                    <p className="text-xs text-vytal-muted mb-4">{t(plan.descKey)}</p>
                    <div className="flex items-end gap-1">
                      {displayPrice === null ? (
                        <span className="text-3xl font-bold text-vytal-text">{t("onRequest")}</span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-vytal-text tracking-tight">
                            {displayPrice === 0 ? t("free") : `${displayPrice}€`}
                          </span>
                          {displayPrice > 0 && (
                            <span className="text-sm text-vytal-muted mb-2">/mo</span>
                          )}
                        </>
                      )}
                    </div>
                    {annual && plan.priceVal && plan.priceVal > 0 && (
                      <p className="text-xs text-vytal-green mt-1">
                        {t("billedAnnually")} {plan.priceVal * 12 - Math.round(plan.priceVal * 0.8) * 12}{t("perYear")}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.featureKeys.map((fk) => (
                      <li key={fk} className="flex items-start gap-2.5 text-sm text-vytal-text">
                        <Check size={14} className="text-vytal-green shrink-0 mt-0.5" />
                        {t(fk)}
                      </li>
                    ))}
                    {plan.notIncludedKeys.map((fk) => (
                      <li key={fk} className="flex items-start gap-2.5 text-sm text-vytal-muted/50">
                        <X size={14} className="text-[rgba(255,71,87,0.3)] shrink-0 mt-0.5" />
                        {t(fk)}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.nameKey === "enterprise" ? "/login" : "/signup"}
                    className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      plan.highlighted
                        ? "bg-vytal-green text-vytal-bg hover:bg-[#16a34a] shadow-md shadow-[rgba(34,197,94,0.2)]"
                        : "border border-[rgba(34,197,94,0.25)] text-vytal-text hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)]"
                    }`}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-vytal-muted mt-8">
          {t("pricingNote")}
        </p>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_KEYS = [
  { q: "faq1q", a: "faq1a" },
  { q: "faq2q", a: "faq2a" },
  { q: "faq3q", a: "faq3a" },
  { q: "faq4q", a: "faq4a" },
  { q: "faq5q", a: "faq5a" },
  { q: "faq6q", a: "faq6a" },
];

function FAQ({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="faq" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider flip color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <span className="text-xs font-medium text-vytal-green">{t("faqBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
            {t("faqTitle")} <span className="bg-gradient-to-r from-vytal-green to-vytal-blue bg-clip-text text-transparent">{t("faqTitleHighlight")}</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ_KEYS.map((item) => (
            <FAQItem key={item.q} question={t(item.q)} answer={t(item.a)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <div ref={ref} className="scroll-reveal max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl border border-[rgba(34,197,94,0.2)] bg-vytal-bg3/60 backdrop-blur-sm p-12 overflow-hidden">
          {/* Background blobs */}
          <div
            className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-vytal-green animate-pulse" />
              <span className="text-xs font-medium text-vytal-green">{t("ctaBannerBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-vytal-text mb-4">
              {t("ctaBannerTitle")} <br />{t("ctaBannerTitleLine2")}
            </h2>
            <p className="text-vytal-muted mb-8 max-w-md mx-auto text-sm leading-relaxed">
              {t("ctaBannerSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="rounded-[14px] p-[1.5px] animated-gradient-border inline-flex">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-vytal-green text-vytal-bg font-bold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.3)] hover:-translate-y-0.5"
                >
                  {t("ctaBannerStart")}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <Link
                href="/@yoga-flow-porto"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[rgba(34,197,94,0.25)] text-vytal-text font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
              >
                <Play size={14} className="text-vytal-green" />
                {t("ctaBannerDemo")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
const FOOTER_COL_META = [
  {
    titleKey: "footerProduct",
    links: [
      { labelKey: "fpFeat",    href: "#funcionalidades" },
      { labelKey: "fpPricing", href: "#precos" },
      { labelKey: "fpNews",    href: "#" },
      { labelKey: "fpRoadmap", href: "#" },
      { labelKey: "fpApi",     href: "#" },
    ],
  },
  {
    titleKey: "footerResources",
    links: [
      { labelKey: "frHelp",      href: "#" },
      { labelKey: "frBlog",      href: "#" },
      { labelKey: "frVideos",    href: "#" },
      { labelKey: "frCommunity", href: "#" },
      { labelKey: "frStatus",    href: "#" },
    ],
  },
  {
    titleKey: "footerCompany",
    links: [
      { labelKey: "fcAbout",    href: "#" },
      { labelKey: "fcCareers",  href: "#" },
      { labelKey: "fcPartners", href: "#" },
      { labelKey: "fcPress",    href: "#" },
      { labelKey: "fcContact",  href: "#" },
    ],
  },
  {
    titleKey: "footerLegal",
    links: [
      { labelKey: "flTerms",   href: "#" },
      { labelKey: "flPrivacy", href: "#" },
      { labelKey: "flRgpd",    href: "#" },
      { labelKey: "flCookies", href: "#" },
      { labelKey: "flDpa",     href: "#" },
    ],
  },
];

function Footer({ t }: { t: (k: string) => string }) {
  return (
    <footer className="border-t border-[rgba(34,197,94,0.08)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-0.5 mb-4">
              <span className="text-xl font-bold text-vytal-green">Vytal</span>
              <span className="text-xl font-bold text-vytal-muted">.fit</span>
            </a>
            <p className="text-xs text-vytal-muted leading-relaxed mb-4">
              {t("footerTagline")}
            </p>
            {/* Social links */}
            <div className="flex gap-2">
              {[
                { label: "Instagram", icon: "IG" },
                { label: "LinkedIn", icon: "LI" },
                { label: "Twitter/X", icon: "X" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="https://vytal.fit"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-[rgba(34,197,94,0.15)] flex items-center justify-center text-[10px] font-bold text-vytal-muted hover:border-[rgba(34,197,94,0.4)] hover:text-vytal-green transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_COL_META.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-semibold text-vytal-text uppercase tracking-wider mb-4">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-xs text-vytal-muted hover:text-vytal-text transition-colors duration-150"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[rgba(34,197,94,0.08)] gap-4">
          <p className="text-xs text-vytal-muted">
            © 2026 Vytal. {t("footerRights")} <span className="text-vytal-green">♥</span> {t("footerInPortugal")}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-vytal-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-vytal-green" />
              {t("footerAllSystems")}
            </span>
            <span className="text-xs text-vytal-muted">PT · EN · ES</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang, setLang, t } = useLandingLang();

  return (
    <div className="min-h-screen bg-vytal-bg text-vytal-text">
      {/* Injected keyframes */}
      <style dangerouslySetInnerHTML={{ __html: LANDING_KEYFRAMES }} />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat" }}
        aria-hidden="true"
      />

      <Navbar t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <SocialProof t={t} />
        <Features t={t} />
        <VerticalsMarquee t={t} />
        <ProductShowcase t={t} />
        <FeatureDeepDive t={t} />
        <PaymentsPortugal t={t} />
        <AutomationsAI t={t} />
        <Comparison t={t} />
        <Testimonials t={t} />
        <Pricing t={t} />
        <ComplianceSecurity t={t} />
        <FAQ t={t} />
        <CTABanner t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}
