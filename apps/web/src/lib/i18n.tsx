"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type Language = "pt" | "en" | "es";

const LANG_STORAGE_KEY = "vytal-language";

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.members": "Membros",
    "nav.classes": "Aulas",
    "nav.wods": "WODs",
    "nav.crm": "CRM",
    "nav.staff": "Staff",
    "nav.classTypes": "Tipos de Aula",
    "nav.locations": "Localizações",
    "nav.exercises": "Exercícios",
    "nav.plans": "Planos",
    "nav.financials": "Financeiro",
    "nav.reports": "Relatórios",
    "nav.communications": "Comunicações",
    "nav.settings": "Definições",
    "nav.automations": "Automações",
    "nav.dropins": "Drop-ins",

    // Nav group titles
    "nav.group.management": "Gestão",
    "nav.group.operations": "Operações",
    "nav.group.settings": "Definições",

    // Common actions
    "action.save": "Guardar",
    "action.cancel": "Cancelar",
    "action.create": "Criar",
    "action.edit": "Editar",
    "action.delete": "Eliminar",
    "action.search": "Pesquisar",
    "action.filter": "Filtrar",
    "action.export": "Exportar",
    "action.import": "Importar",
    "action.back": "Voltar",
    "action.next": "Seguinte",
    "action.login": "Entrar",
    "action.logout": "Sair",
    "action.register": "Registar",
    "action.confirm": "Confirmar",
    "action.publish": "Publicar",
    "action.saveDraft": "Guardar rascunho",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Esqueceu a password?",
    "auth.createAccount": "Criar conta",
    "auth.login": "Entrar",
    "auth.register": "Registar",
    "auth.welcome": "Bem-vindo",
    "auth.subtitle": "Plataforma inteligente para o seu espaço fitness",
    "auth.noAccount": "Não tem conta?",
    "auth.hasAccount": "Já tem conta?",
    "auth.name": "Nome",
    "auth.phone": "Telefone",
    "auth.optional": "opcional",
    "auth.confirmPassword": "Confirmar Password",
    "auth.registerSubtitle": "Crie a sua conta para começar",
    "auth.namePlaceholder": "O seu nome",
    "auth.emailPlaceholder": "voce@exemplo.com",
    "auth.passwordPlaceholder": "A sua password",
    "auth.confirmPlaceholder": "Repita a password",
    "auth.minChars": "Mínimo 10 caracteres",
    "auth.nameRequired": "Nome é obrigatório",
    "auth.emailRequired": "Email é obrigatório",
    "auth.passwordMinLength": "Password deve ter pelo menos 10 caracteres",
    "auth.passwordMismatch": "Passwords não coincidem",
    "auth.phonePlaceholder": "+351 912 345 678",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Visão geral do desempenho do seu box",
    "dashboard.totalMembers": "Total de Membros",
    "dashboard.activeMembers": "Membros Ativos",
    "dashboard.todaysClasses": "Aulas Hoje",
    "dashboard.occupancy": "Ocupação",
    "dashboard.monthlyRevenue": "Receita Mensal",
    "dashboard.churnRate": "Taxa de Churn",
    "dashboard.atRiskMembers": "Membros em Risco",
    "dashboard.prsToday": "PRs Hoje",
    "dashboard.checkInsToday": "Check-ins Hoje",
    "dashboard.todaysSchedule": "Agenda de Hoje",
    "dashboard.ofTotal": "do total",
    "dashboard.aboveTarget": "Acima da meta",
    "dashboard.belowTarget": "Abaixo da meta de 80%",
    "dashboard.healthy": "Saudável",
    "dashboard.needsAttention": "Precisa de atenção",
    "dashboard.noTraining7Days": "Sem treino há 7+ dias",
    "dashboard.noClassesToday": "Sem aulas agendadas para hoje",

    // Members
    "members.title": "Membros",
    "members.subtitle": "Gerir os membros do seu box",
    "members.searchPlaceholder": "Pesquisar por nome, email ou número de membro...",
    "members.name": "Nome",
    "members.email": "Email",
    "members.phone": "Telefone",
    "members.status": "Estado",
    "members.active": "Ativo",
    "members.inactive": "Inativo",
    "members.trial": "Experimental",
    "members.suspended": "Suspenso",
    "members.plan": "Plano",
    "members.lastCheckIn": "Último Check-in",
    "members.streak": "Sequência",
    "members.checkIns": "Check-ins",
    "members.memberDetail": "Detalhe do membro",
    "members.editMember": "Editar membro",
    "members.importMembers": "Importar membros",
    "members.total": "Total",
    "members.noResults": "Nenhum membro encontrado para",

    // Classes
    "classes.schedule": "Agenda de aulas",
    "classes.calendarView": "Vista de calendário",
    "classes.createClass": "Criar aula",
    "classes.location": "Localização",
    "classes.coach": "Coach",
    "classes.capacity": "Capacidade",
    "classes.enrolled": "Inscritos",
    "classes.waitlist": "Lista de espera",
    "classes.available": "Disponível",
    "classes.fillingUp": "A encher",
    "classes.full": "Lotado",

    // WODs
    "wods.title": "Workout of the Day",
    "wods.createWod": "Criar WOD",
    "wods.warmUp": "Aquecimento",
    "wods.strength": "Força",
    "wods.coolDown": "Retorno à calma",
    "wods.timeCap": "Tempo limite",
    "wods.rounds": "Rondas",
    "wods.exercises": "Exercícios",

    // CRM
    "crm.leads": "Leads",
    "crm.contacted": "Contactado",
    "crm.prospect": "Prospeto",
    "crm.trialBooked": "Trial Agendado",
    "crm.subscribed": "Subscrito",
    "crm.lost": "Perdido",
    "crm.source": "Origem",
    "crm.assignedTo": "Atribuído a",
    "crm.notes": "Notas",

    // Common UI
    "ui.notifications": "Notificações",
    "ui.noData": "Sem dados",
    "ui.loading": "A carregar",
    "ui.error": "Erro",
    "ui.confirm": "Confirmar",
    "ui.areYouSure": "Tem a certeza?",
    "ui.yes": "Sim",
    "ui.no": "Não",
    "ui.today": "Hoje",
    "ui.yesterday": "Ontem",
    "ui.thisWeek": "Esta semana",
    "ui.thisMonth": "Este mês",
    "ui.new": "novo",
    "ui.yourOrganizations": "As suas organizações",
    "ui.createNewOrg": "Criar nova organização",
    "ui.selectOrg": "Selecionar organização",
    "ui.language": "Idioma",
    "ui.theme": "Tema",
    "ui.darkMode": "Modo escuro",
    "ui.lightMode": "Modo claro",
    "ui.never": "Nunca",

    // Time
    "time.justNow": "Agora mesmo",
    "time.mAgo": "m atrás",
    "time.hAgo": "h atrás",
    "time.dAgo": "d atrás",
  },

  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.members": "Members",
    "nav.classes": "Classes",
    "nav.wods": "WODs",
    "nav.crm": "CRM",
    "nav.staff": "Staff",
    "nav.classTypes": "Class Types",
    "nav.locations": "Locations",
    "nav.exercises": "Exercises",
    "nav.plans": "Plans",
    "nav.financials": "Financials",
    "nav.reports": "Reports",
    "nav.communications": "Communications",
    "nav.settings": "Settings",
    "nav.automations": "Automations",
    "nav.dropins": "Drop-ins",

    // Nav group titles
    "nav.group.management": "Management",
    "nav.group.operations": "Operations",
    "nav.group.settings": "Settings",

    // Common actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.create": "Create",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export",
    "action.import": "Import",
    "action.back": "Back",
    "action.next": "Next",
    "action.login": "Login",
    "action.logout": "Logout",
    "action.register": "Register",
    "action.confirm": "Confirm",
    "action.publish": "Publish",
    "action.saveDraft": "Save draft",

    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.createAccount": "Create account",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.welcome": "Welcome",
    "auth.subtitle": "Intelligent platform for your fitness space",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.name": "Name",
    "auth.phone": "Phone",
    "auth.optional": "optional",
    "auth.confirmPassword": "Confirm Password",
    "auth.registerSubtitle": "Create your account to get started",
    "auth.namePlaceholder": "Your name",
    "auth.emailPlaceholder": "you@example.com",
    "auth.passwordPlaceholder": "Your password",
    "auth.confirmPlaceholder": "Repeat password",
    "auth.minChars": "Minimum 10 characters",
    "auth.nameRequired": "Name is required",
    "auth.emailRequired": "Email is required",
    "auth.passwordMinLength": "Password must have at least 10 characters",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.phonePlaceholder": "+351 912 345 678",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Overview of your box performance",
    "dashboard.totalMembers": "Total Members",
    "dashboard.activeMembers": "Active Members",
    "dashboard.todaysClasses": "Today's Classes",
    "dashboard.occupancy": "Occupancy",
    "dashboard.monthlyRevenue": "Monthly Revenue",
    "dashboard.churnRate": "Churn Rate",
    "dashboard.atRiskMembers": "At-Risk Members",
    "dashboard.prsToday": "PRs Today",
    "dashboard.checkInsToday": "Check-ins Today",
    "dashboard.todaysSchedule": "Today's Schedule",
    "dashboard.ofTotal": "of total",
    "dashboard.aboveTarget": "Above target",
    "dashboard.belowTarget": "Below 80% target",
    "dashboard.healthy": "Healthy",
    "dashboard.needsAttention": "Needs attention",
    "dashboard.noTraining7Days": "Haven't trained in 7+ days",
    "dashboard.noClassesToday": "No classes scheduled for today",

    // Members
    "members.title": "Members",
    "members.subtitle": "Manage your box members",
    "members.searchPlaceholder": "Search by name, email or member number...",
    "members.name": "Name",
    "members.email": "Email",
    "members.phone": "Phone",
    "members.status": "Status",
    "members.active": "Active",
    "members.inactive": "Inactive",
    "members.trial": "Trial",
    "members.suspended": "Suspended",
    "members.plan": "Plan",
    "members.lastCheckIn": "Last Check-in",
    "members.streak": "Streak",
    "members.checkIns": "Check-ins",
    "members.memberDetail": "Member detail",
    "members.editMember": "Edit member",
    "members.importMembers": "Import members",
    "members.total": "Total",
    "members.noResults": "No members found matching",

    // Classes
    "classes.schedule": "Class schedule",
    "classes.calendarView": "Calendar view",
    "classes.createClass": "Create class",
    "classes.location": "Location",
    "classes.coach": "Coach",
    "classes.capacity": "Capacity",
    "classes.enrolled": "Enrolled",
    "classes.waitlist": "Waitlist",
    "classes.available": "Available",
    "classes.fillingUp": "Filling up",
    "classes.full": "Full",

    // WODs
    "wods.title": "Workout of the Day",
    "wods.createWod": "Create WOD",
    "wods.warmUp": "Warm Up",
    "wods.strength": "Strength",
    "wods.coolDown": "Cool Down",
    "wods.timeCap": "Time cap",
    "wods.rounds": "Rounds",
    "wods.exercises": "Exercises",

    // CRM
    "crm.leads": "Leads",
    "crm.contacted": "Contacted",
    "crm.prospect": "Prospect",
    "crm.trialBooked": "Trial Booked",
    "crm.subscribed": "Subscribed",
    "crm.lost": "Lost",
    "crm.source": "Source",
    "crm.assignedTo": "Assigned to",
    "crm.notes": "Notes",

    // Common UI
    "ui.notifications": "Notifications",
    "ui.noData": "No data",
    "ui.loading": "Loading",
    "ui.error": "Error",
    "ui.confirm": "Confirm",
    "ui.areYouSure": "Are you sure?",
    "ui.yes": "Yes",
    "ui.no": "No",
    "ui.today": "Today",
    "ui.yesterday": "Yesterday",
    "ui.thisWeek": "This week",
    "ui.thisMonth": "This month",
    "ui.new": "new",
    "ui.yourOrganizations": "Your organizations",
    "ui.createNewOrg": "Create new organization",
    "ui.selectOrg": "Select organization",
    "ui.language": "Language",
    "ui.theme": "Theme",
    "ui.darkMode": "Dark mode",
    "ui.lightMode": "Light mode",
    "ui.never": "Never",

    // Time
    "time.justNow": "Just now",
    "time.mAgo": "m ago",
    "time.hAgo": "h ago",
    "time.dAgo": "d ago",
  },

  es: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.members": "Miembros",
    "nav.classes": "Clases",
    "nav.wods": "WODs",
    "nav.crm": "CRM",
    "nav.staff": "Staff",
    "nav.classTypes": "Tipos de Clase",
    "nav.locations": "Ubicaciones",
    "nav.exercises": "Ejercicios",
    "nav.plans": "Planes",
    "nav.financials": "Finanzas",
    "nav.reports": "Informes",
    "nav.communications": "Comunicaciones",
    "nav.settings": "Ajustes",
    "nav.automations": "Automatizaciones",
    "nav.dropins": "Drop-ins",

    // Nav group titles
    "nav.group.management": "Gestión",
    "nav.group.operations": "Operaciones",
    "nav.group.settings": "Ajustes",

    // Common actions
    "action.save": "Guardar",
    "action.cancel": "Cancelar",
    "action.create": "Crear",
    "action.edit": "Editar",
    "action.delete": "Eliminar",
    "action.search": "Buscar",
    "action.filter": "Filtrar",
    "action.export": "Exportar",
    "action.import": "Importar",
    "action.back": "Volver",
    "action.next": "Siguiente",
    "action.login": "Iniciar sesión",
    "action.logout": "Cerrar sesión",
    "action.register": "Registrarse",
    "action.confirm": "Confirmar",
    "action.publish": "Publicar",
    "action.saveDraft": "Guardar borrador",

    // Auth
    "auth.email": "Email",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidaste la contraseña?",
    "auth.createAccount": "Crear cuenta",
    "auth.login": "Iniciar sesión",
    "auth.register": "Registrarse",
    "auth.welcome": "Bienvenido",
    "auth.subtitle": "Plataforma inteligente para tu espacio fitness",
    "auth.noAccount": "¿No tienes cuenta?",
    "auth.hasAccount": "¿Ya tienes cuenta?",
    "auth.name": "Nombre",
    "auth.phone": "Teléfono",
    "auth.optional": "opcional",
    "auth.confirmPassword": "Confirmar Contraseña",
    "auth.registerSubtitle": "Crea tu cuenta para empezar",
    "auth.namePlaceholder": "Tu nombre",
    "auth.emailPlaceholder": "tu@ejemplo.com",
    "auth.passwordPlaceholder": "Tu contraseña",
    "auth.confirmPlaceholder": "Repite la contraseña",
    "auth.minChars": "Mínimo 10 caracteres",
    "auth.nameRequired": "El nombre es obligatorio",
    "auth.emailRequired": "El email es obligatorio",
    "auth.passwordMinLength": "La contraseña debe tener al menos 10 caracteres",
    "auth.passwordMismatch": "Las contraseñas no coinciden",
    "auth.phonePlaceholder": "+34 612 345 678",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Visión general del rendimiento de tu box",
    "dashboard.totalMembers": "Total de Miembros",
    "dashboard.activeMembers": "Miembros Activos",
    "dashboard.todaysClasses": "Clases Hoy",
    "dashboard.occupancy": "Ocupación",
    "dashboard.monthlyRevenue": "Ingresos Mensuales",
    "dashboard.churnRate": "Tasa de Baja",
    "dashboard.atRiskMembers": "Miembros en Riesgo",
    "dashboard.prsToday": "PRs Hoy",
    "dashboard.checkInsToday": "Check-ins Hoy",
    "dashboard.todaysSchedule": "Agenda de Hoy",
    "dashboard.ofTotal": "del total",
    "dashboard.aboveTarget": "Por encima del objetivo",
    "dashboard.belowTarget": "Por debajo del objetivo del 80%",
    "dashboard.healthy": "Saludable",
    "dashboard.needsAttention": "Necesita atención",
    "dashboard.noTraining7Days": "Sin entrenar hace 7+ días",
    "dashboard.noClassesToday": "No hay clases programadas para hoy",

    // Members
    "members.title": "Miembros",
    "members.subtitle": "Gestiona los miembros de tu box",
    "members.searchPlaceholder": "Buscar por nombre, email o número de miembro...",
    "members.name": "Nombre",
    "members.email": "Email",
    "members.phone": "Teléfono",
    "members.status": "Estado",
    "members.active": "Activo",
    "members.inactive": "Inactivo",
    "members.trial": "Prueba",
    "members.suspended": "Suspendido",
    "members.plan": "Plan",
    "members.lastCheckIn": "Último Check-in",
    "members.streak": "Racha",
    "members.checkIns": "Check-ins",
    "members.memberDetail": "Detalle del miembro",
    "members.editMember": "Editar miembro",
    "members.importMembers": "Importar miembros",
    "members.total": "Total",
    "members.noResults": "No se encontraron miembros para",

    // Classes
    "classes.schedule": "Agenda de clases",
    "classes.calendarView": "Vista de calendario",
    "classes.createClass": "Crear clase",
    "classes.location": "Ubicación",
    "classes.coach": "Coach",
    "classes.capacity": "Capacidad",
    "classes.enrolled": "Inscritos",
    "classes.waitlist": "Lista de espera",
    "classes.available": "Disponible",
    "classes.fillingUp": "Llenándose",
    "classes.full": "Lleno",

    // WODs
    "wods.title": "Workout of the Day",
    "wods.createWod": "Crear WOD",
    "wods.warmUp": "Calentamiento",
    "wods.strength": "Fuerza",
    "wods.coolDown": "Vuelta a la calma",
    "wods.timeCap": "Tiempo límite",
    "wods.rounds": "Rondas",
    "wods.exercises": "Ejercicios",

    // CRM
    "crm.leads": "Leads",
    "crm.contacted": "Contactado",
    "crm.prospect": "Prospecto",
    "crm.trialBooked": "Prueba Agendada",
    "crm.subscribed": "Suscrito",
    "crm.lost": "Perdido",
    "crm.source": "Origen",
    "crm.assignedTo": "Asignado a",
    "crm.notes": "Notas",

    // Common UI
    "ui.notifications": "Notificaciones",
    "ui.noData": "Sin datos",
    "ui.loading": "Cargando",
    "ui.error": "Error",
    "ui.confirm": "Confirmar",
    "ui.areYouSure": "¿Estás seguro?",
    "ui.yes": "Sí",
    "ui.no": "No",
    "ui.today": "Hoy",
    "ui.yesterday": "Ayer",
    "ui.thisWeek": "Esta semana",
    "ui.thisMonth": "Este mes",
    "ui.new": "nuevo",
    "ui.yourOrganizations": "Tus organizaciones",
    "ui.createNewOrg": "Crear nueva organización",
    "ui.selectOrg": "Seleccionar organización",
    "ui.language": "Idioma",
    "ui.theme": "Tema",
    "ui.darkMode": "Modo oscuro",
    "ui.lightMode": "Modo claro",
    "ui.never": "Nunca",

    // Time
    "time.justNow": "Ahora mismo",
    "time.mAgo": "m atrás",
    "time.hAgo": "h atrás",
    "time.dAgo": "d atrás",
  },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (stored && translations[stored]) {
      setLanguageState(stored);
    }
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations.pt[key] ?? key;
    },
    [language]
  );

  // Prevent flash of wrong language
  if (!hydrated) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
