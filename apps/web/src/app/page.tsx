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
        <span className="font-medium text-[#dceee0] text-sm leading-snug pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#22c55e] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#6b8c72] text-sm leading-relaxed border-t border-[rgba(34,197,94,0.08)] pt-4">
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
          ? "bg-[#080c0a]/95 backdrop-blur-md border-b border-[rgba(34,197,94,0.1)] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-0.5 shrink-0">
            <span className="text-xl font-bold text-[#22c55e] tracking-tight">Vytal</span>
            <span className="text-xl font-bold text-[#6b8c72] tracking-tight">.fit</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[#6b8c72] hover:text-[#dceee0] transition-colors duration-150"
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
                      ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                      : "text-[#6b8c72] hover:text-[#dceee0]"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg border border-[rgba(34,197,94,0.25)] text-[#dceee0] hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-[#22c55e] text-[#080c0a] font-semibold hover:bg-[#16a34a] transition-colors duration-150"
            >
              {t("ctaStart")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#6b8c72] hover:text-[#dceee0] hover:bg-[rgba(34,197,94,0.06)] transition-colors"
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
                  className="px-3 py-2.5 text-sm text-[#6b8c72] hover:text-[#dceee0] hover:bg-[rgba(34,197,94,0.04)] rounded-lg transition-colors"
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
                        ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                        : "text-[#6b8c72] hover:text-[#dceee0]"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2 px-1">
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg border border-[rgba(34,197,94,0.25)] text-[#dceee0]"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg bg-[#22c55e] text-[#080c0a] font-semibold"
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
function FloatingStatsCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[rgba(8,12,10,0.85)] backdrop-blur-md shadow-xl shadow-black/30 w-[150px]"
      style={{
        top: "18%",
        right: "6%",
        animation: "landing-float 6s ease-in-out infinite",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
          <TrendingUp size={10} className="text-[#22c55e]" />
        </div>
        <span className="text-[9px] font-medium text-[#6b8c72] uppercase tracking-wider">Revenue</span>
      </div>
      <span className="text-lg font-bold text-[#dceee0]">+32%</span>
      <div className="flex gap-0.5">
        {[40, 55, 35, 65, 50, 70, 80, 60, 90, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-[#22c55e]"
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
      className="absolute hidden lg:flex flex-col gap-1.5 p-3.5 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(8,12,10,0.85)] backdrop-blur-md shadow-xl shadow-black/30 w-[140px]"
      style={{
        bottom: "22%",
        left: "5%",
        animation: "landing-float-delayed 7s ease-in-out infinite",
        animationDelay: "1s",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-md bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
          <Calendar size={10} className="text-[#00d4ff]" />
        </div>
        <span className="text-[9px] font-medium text-[#6b8c72] uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-1">
        {["09:00 CrossFit", "10:30 Yoga", "17:00 HIIT"].map((cls, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: ["#22c55e", "#c084fc", "#ffb300"][i] }} />
            <span className="text-[9px] text-[#6b8c72]">{cls}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingMembersCard() {
  return (
    <div
      className="absolute hidden lg:flex flex-col gap-1 p-3 rounded-xl border border-[rgba(192,132,252,0.2)] bg-[rgba(8,12,10,0.85)] backdrop-blur-md shadow-xl shadow-black/30 w-[130px]"
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
        <span className="text-[9px] font-medium text-[#6b8c72] uppercase tracking-wider">Active</span>
      </div>
      <span className="text-lg font-bold text-[#dceee0]">247</span>
      <span className="text-[9px] text-[#22c55e]">+12 this week</span>
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
      <FloatingStatsCard />
      <FloatingCalendarCard />
      <FloatingMembersCard />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center page-enter">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.06)] mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-xs font-medium text-[#22c55e] tracking-wide">
            {t("badge")}
          </span>
        </div>

        {/* Headline — larger with gradient text */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#dceee0] leading-[1.1] tracking-tight mb-6">
          <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("headline").split(" ").slice(0, 3).join(" ")}</span>{" "}
          {t("headline").split(" ").slice(3).join(" ")}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#6b8c72] max-w-2xl mx-auto leading-relaxed mb-10">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-16">
          {/* Animated gradient border CTA */}
          <div className="rounded-[14px] p-[1.5px] animated-gradient-border">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#22c55e] text-[#080c0a] font-semibold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.25)] hover:shadow-[rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              {t("ctaStart")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <Link
            href="/@crossfit-aveiro"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[rgba(34,197,94,0.25)] text-[#dceee0] font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150 backdrop-blur-sm"
          >
            <Play size={15} className="text-[#22c55e]" />
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
              className="flex flex-col items-center justify-center py-5 px-4 bg-[#080c0a]/80 hover:bg-[rgba(34,197,94,0.04)] transition-colors"
            >
              <span className="text-2xl font-bold text-[#22c55e]">{s.value}</span>
              <span className="text-xs text-[#6b8c72] mt-0.5">{s.label}</span>
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
        <p className="text-center text-sm text-[#6b8c72] mb-10 tracking-wider uppercase">
          {t("trustedBy")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gyms.map((gym, i) => (
            <div
              key={gym}
              className="flex items-center justify-center px-4 py-3.5 rounded-xl border border-[rgba(34,197,94,0.1)] bg-[rgba(22,32,24,0.4)] hover:border-[rgba(34,197,94,0.25)] hover:bg-[rgba(34,197,94,0.04)] transition-all duration-150 group backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-xs font-medium text-[#6b8c72] group-hover:text-[#dceee0] transition-colors text-center leading-tight">
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
  { title: "feat1", desc: "feat1d" },
  { title: "feat2", desc: "feat2d" },
  { title: "feat3", desc: "feat3d" },
  { title: "feat4", desc: "feat4d" },
  { title: "feat5", desc: "feat5d" },
  { title: "feat6", desc: "feat6d" },
];

function Features({ t }: { t: (k: string) => string }) {
  const ref = useScrollReveal();

  return (
    <section id="funcionalidades" className="py-24 border-t border-[rgba(34,197,94,0.08)]">
      <WaveDivider color="rgba(34,197,94,0.03)" />
      <div ref={ref} className="scroll-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.05)] mb-4">
            <Zap size={12} className="text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">{t("features")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("everythingTitle").split(".")[0]}.{" "}
            <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("everythingTitle").split(".").slice(1).join(".").trim()}</span>
          </h2>
          <p className="text-[#6b8c72] max-w-xl mx-auto text-sm leading-relaxed">
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
                className="group relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[rgba(22,32,24,0.4)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.3)] hover:bg-[rgba(22,32,24,0.7)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-300 overflow-hidden"
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
                <h3 className="font-semibold text-[#dceee0] mb-2 text-sm">{t(keys.title)}</h3>
                <p className="text-xs text-[#6b8c72] leading-relaxed">{t(keys.desc)}</p>
                <div
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color }}
                >
                  {t("featLearnMore")} <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Product Showcase ──────────────────────────────────────────────────────────
const TAB_META = [
  { id: "admin",   gradient: "from-[#22c55e]/20 via-[#0f1610] to-[#080c0a]", accent: "#22c55e",
    labelKey: "tabAdmin", titleKey: "tabAdminTitle", descKey: "tabAdminDesc",
    itemKeys: ["tabAdminI1","tabAdminI2","tabAdminI3","tabAdminI4","tabAdminI5","tabAdminI6"] },
  { id: "website", gradient: "from-[#00d4ff]/20 via-[#0f1610] to-[#080c0a]", accent: "#00d4ff",
    labelKey: "tabWebsite", titleKey: "tabWebsiteTitle", descKey: "tabWebsiteDesc",
    itemKeys: ["tabWebsiteI1","tabWebsiteI2","tabWebsiteI3","tabWebsiteI4","tabWebsiteI5","tabWebsiteI6"] },
  { id: "membro",  gradient: "from-[#c084fc]/20 via-[#0f1610] to-[#080c0a]", accent: "#c084fc",
    labelKey: "tabMembro", titleKey: "tabMembroTitle", descKey: "tabMembroDesc",
    itemKeys: ["tabMembroI1","tabMembroI2","tabMembroI3","tabMembroI4","tabMembroI5","tabMembroI6"] },
  { id: "mobile",  gradient: "from-[#ff8c42]/20 via-[#0f1610] to-[#080c0a]", accent: "#ff8c42",
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
            <BarChart3 size={12} className="text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">{t("showcaseBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("showcaseTitle")} <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("showcaseTitleHighlight")}</span>
          </h2>
          <p className="text-[#6b8c72] max-w-xl mx-auto text-sm leading-relaxed">
            {t("showcaseSubtitle")}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-xl bg-[rgba(22,32,24,0.6)] border border-[rgba(34,197,94,0.1)] w-fit mx-auto backdrop-blur-sm">
          {TAB_META.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tb.id
                  ? "bg-[#22c55e] text-[#080c0a]"
                  : "text-[#6b8c72] hover:text-[#dceee0]"
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
            <div className="absolute top-0 left-0 right-0 h-10 bg-[rgba(8,12,10,0.8)] flex items-center gap-2 px-4 border-b border-[rgba(34,197,94,0.08)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff4757]/60" />
                <div className="w-3 h-3 rounded-full bg-[#ffb300]/60" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
              </div>
              <div className="flex-1 h-5 rounded bg-[rgba(34,197,94,0.06)] mx-4" />
            </div>
            {/* Mock content grid */}
            <div className="absolute top-12 left-4 right-4 bottom-4 grid grid-cols-3 gap-2">
              {mockItems.map((item, i) => (
                <div
                  key={item}
                  className="rounded-lg border border-[rgba(34,197,94,0.1)] bg-[rgba(8,12,10,0.6)] backdrop-blur-sm flex flex-col items-center justify-center gap-1 p-2 hover:border-[rgba(34,197,94,0.3)] transition-colors"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div
                    className="w-6 h-6 rounded-md"
                    style={{ background: `${tab.accent}20` }}
                  />
                  <span className="text-[10px] text-[#6b8c72] text-center leading-tight">{item}</span>
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
            <h3 className="text-2xl font-bold text-[#dceee0] mb-4">{t(tab.titleKey)}</h3>
            <p className="text-[#6b8c72] leading-relaxed mb-6">{t(tab.descKey)}</p>
            <ul className="space-y-3">
              {mockItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#dceee0]">
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
              href="/login"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#080c0a] transition-all duration-150 hover:-translate-y-0.5"
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
            <Shield size={12} className="text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">{t("compBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("compTitle")}
          </h2>
          <p className="text-[#6b8c72] max-w-xl mx-auto text-sm leading-relaxed">
            {t("compSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(34,197,94,0.12)] overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="grid grid-cols-5 bg-[rgba(22,32,24,0.8)]">
            <div className="col-span-2 px-6 py-4 text-xs font-semibold text-[#6b8c72] uppercase tracking-wider">
              {t("compColFeature")}
            </div>
            {["Vytal", "Regibox", "Wodify", t("compGeneric")].map((name, i) => (
              <div
                key={name}
                className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  i === 0 ? "text-[#22c55e] bg-[rgba(34,197,94,0.08)]" : "text-[#6b8c72]"
                }`}
              >
                {i === 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#22c55e] text-[#080c0a] text-[10px] font-bold">#1</span>
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
                idx % 2 === 0 ? "bg-[rgba(8,12,10,0.4)]" : "bg-[rgba(22,32,24,0.2)]"
              } hover:bg-[rgba(34,197,94,0.03)] transition-colors`}
            >
              <div className="col-span-2 px-6 py-4 text-sm text-[#dceee0]">{t(row.key)}</div>
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
                        className={i === 0 ? "text-[#22c55e]" : "text-[#6b8c72]"}
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
            <Star size={12} className="text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">{t("testimonialsBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("testimonialsTitle")} <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("testimonialsTitleHighlight")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIAL_META.map((tm) => (
            <div
              key={tm.nameKey}
              className="relative p-6 rounded-2xl border border-[rgba(34,197,94,0.1)] bg-[rgba(22,32,24,0.4)] backdrop-blur-sm hover:border-[rgba(34,197,94,0.22)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all duration-300 group"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-[#ffb300] text-[#ffb300]" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-[#6b8c72] leading-relaxed mb-6 group-hover:text-[#dceee0] transition-colors duration-200">
                &ldquo;{t(tm.quoteKey)}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#080c0a]"
                  style={{ background: tm.color }}
                >
                  {tm.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#dceee0]">{t(tm.nameKey)}</p>
                  <p className="text-xs text-[#6b8c72]">
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
            <CreditCard size={12} className="text-[#22c55e]" />
            <span className="text-xs font-medium text-[#22c55e]">{t("pricingBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("pricingTitle")} <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("pricingTitleHighlight")}</span>
          </h2>
          <p className="text-[#6b8c72] max-w-xl mx-auto text-sm leading-relaxed mb-8">
            {t("pricingSubtitle")}
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-[rgba(22,32,24,0.6)] border border-[rgba(34,197,94,0.1)] backdrop-blur-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                !annual ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]" : "text-[#6b8c72]"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                annual ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]" : "text-[#6b8c72]"
              }`}
            >
              {t("annual")}
              <span className="text-[10px] bg-[#22c55e] text-[#080c0a] px-1.5 py-0.5 rounded-full font-bold">
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
                      : "border-[rgba(34,197,94,0.1)] bg-[rgba(22,32,24,0.4)] backdrop-blur-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className="px-3 py-1 rounded-full bg-[#22c55e] text-[#080c0a] text-xs font-bold inline-flex items-center gap-1.5"
                        style={{ animation: "landing-pulse-glow 2s ease-in-out infinite" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#080c0a] animate-pulse" />
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-bold text-[#dceee0] text-lg mb-1">{t(plan.nameKey)}</h3>
                    <p className="text-xs text-[#6b8c72] mb-4">{t(plan.descKey)}</p>
                    <div className="flex items-end gap-1">
                      {displayPrice === null ? (
                        <span className="text-3xl font-bold text-[#dceee0]">{t("onRequest")}</span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-[#dceee0] tracking-tight">
                            {displayPrice === 0 ? t("free") : `${displayPrice}€`}
                          </span>
                          {displayPrice > 0 && (
                            <span className="text-sm text-[#6b8c72] mb-2">/mo</span>
                          )}
                        </>
                      )}
                    </div>
                    {annual && plan.priceVal && plan.priceVal > 0 && (
                      <p className="text-xs text-[#22c55e] mt-1">
                        {t("billedAnnually")} {plan.priceVal * 12 - Math.round(plan.priceVal * 0.8) * 12}{t("perYear")}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.featureKeys.map((fk) => (
                      <li key={fk} className="flex items-start gap-2.5 text-sm text-[#dceee0]">
                        <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                        {t(fk)}
                      </li>
                    ))}
                    {plan.notIncludedKeys.map((fk) => (
                      <li key={fk} className="flex items-start gap-2.5 text-sm text-[#6b8c72]/50">
                        <X size={14} className="text-[rgba(255,71,87,0.3)] shrink-0 mt-0.5" />
                        {t(fk)}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      plan.highlighted
                        ? "bg-[#22c55e] text-[#080c0a] hover:bg-[#16a34a] shadow-md shadow-[rgba(34,197,94,0.2)]"
                        : "border border-[rgba(34,197,94,0.25)] text-[#dceee0] hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)]"
                    }`}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#6b8c72] mt-8">
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
            <span className="text-xs font-medium text-[#22c55e]">{t("faqBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
            {t("faqTitle")} <span className="bg-gradient-to-r from-[#22c55e] to-[#00d4ff] bg-clip-text text-transparent">{t("faqTitleHighlight")}</span>
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
        <div className="relative rounded-3xl border border-[rgba(34,197,94,0.2)] bg-[rgba(22,32,24,0.6)] backdrop-blur-sm p-12 overflow-hidden">
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs font-medium text-[#22c55e]">{t("ctaBannerBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#dceee0] mb-4">
              {t("ctaBannerTitle")} <br />{t("ctaBannerTitleLine2")}
            </h2>
            <p className="text-[#6b8c72] mb-8 max-w-md mx-auto text-sm leading-relaxed">
              {t("ctaBannerSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="rounded-[14px] p-[1.5px] animated-gradient-border inline-flex">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#22c55e] text-[#080c0a] font-bold text-sm hover:bg-[#16a34a] transition-all duration-150 shadow-lg shadow-[rgba(34,197,94,0.3)] hover:-translate-y-0.5"
                >
                  {t("ctaBannerStart")}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <Link
                href="/@crossfit-aveiro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[rgba(34,197,94,0.25)] text-[#dceee0] font-medium text-sm hover:border-[rgba(34,197,94,0.5)] hover:bg-[rgba(34,197,94,0.05)] transition-all duration-150"
              >
                <Play size={14} className="text-[#22c55e]" />
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
            <a href="#" className="flex items-center gap-0.5 mb-4">
              <span className="text-xl font-bold text-[#22c55e]">Vytal</span>
              <span className="text-xl font-bold text-[#6b8c72]">.fit</span>
            </a>
            <p className="text-xs text-[#6b8c72] leading-relaxed mb-4">
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
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-[rgba(34,197,94,0.15)] flex items-center justify-center text-[10px] font-bold text-[#6b8c72] hover:border-[rgba(34,197,94,0.4)] hover:text-[#22c55e] transition-all duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_COL_META.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-semibold text-[#dceee0] uppercase tracking-wider mb-4">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-xs text-[#6b8c72] hover:text-[#dceee0] transition-colors duration-150"
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
          <p className="text-xs text-[#6b8c72]">
            © 2026 Vytal. {t("footerRights")} <span className="text-[#22c55e]">♥</span> {t("footerInPortugal")}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#6b8c72]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {t("footerAllSystems")}
            </span>
            <span className="text-xs text-[#6b8c72]">PT · EN · ES</span>
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
    <div className="min-h-screen bg-[#080c0a] text-[#dceee0]">
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
        <ProductShowcase t={t} />
        <Comparison t={t} />
        <Testimonials t={t} />
        <Pricing t={t} />
        <FAQ t={t} />
        <CTABanner t={t} />
      </main>
      <Footer t={t} />
    </div>
  );
}
