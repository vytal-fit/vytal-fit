import { create } from "zustand";
import {
  mockMembers,
  mockClasses,
  mockLeads,
  mockCoaches,
  mockLocations,
  mockClassTypes,
  mockPlans,
  mockNotifications,
  mockExercises,
  mockPersonalRecords,
  mockSubscriptions,
  mockWODs,
  ORGANIZATION_CONFIGS,
} from "@vytal-fit/shared";
import type {
  Member,
  Class,
  Lead,
  LeadStage,
  Coach,
  Location,
  ClassType,
  SubscriptionPlan,
  Notification,
  Exercise,
  PersonalRecord,
  Subscription,
  WOD,
  OrganizationFeatures,
} from "@vytal-fit/shared";

// ---------------------------------------------------------------------------
// Chat types (kept from original)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  text: string;
  fromMe: boolean;
  time: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  contactInitials: string;
  contactStatus: "active" | "inactive" | "trial";
  online: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessageTime: string;
}

export interface OrgSettings {
  name: string;
  slug: string;
  email: string;
  phone: string;
  currency: string;
  timezone: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  slogan: string;
  businessType: string;
  features?: Partial<OrganizationFeatures>;
}

// ---------------------------------------------------------------------------
// Org Settings persistence (separate key, kept as-is)
// ---------------------------------------------------------------------------

const ORG_SETTINGS_KEY = "vytal-org-settings";

const defaultOrgSettings: OrgSettings = {
  name: "CrossFit Aveiro",
  slug: "crossfit-aveiro",
  email: "info@crossfitaveiro.pt",
  phone: "+351 234 567 890",
  currency: "EUR",
  timezone: "Europe/Lisbon",
  country: "Portugal",
  address: "Rua do Desporto 42",
  city: "Aveiro",
  zipCode: "3800-100",
  website: "https://crossfitaveiro.pt",
  facebook: "https://facebook.com/crossfitaveiro",
  instagram: "https://instagram.com/crossfitaveiro",
  youtube: "",
  slogan: "Stronger Every Day",
  businessType: "crossfit_box",
  features: ORGANIZATION_CONFIGS.crossfit_box?.features as OrganizationFeatures,
};

function loadOrgSettings(): OrgSettings {
  if (typeof window === "undefined") return defaultOrgSettings;
  try {
    const raw = localStorage.getItem(ORG_SETTINGS_KEY);
    if (!raw) return defaultOrgSettings;
    return { ...defaultOrgSettings, ...JSON.parse(raw) };
  } catch {
    return defaultOrgSettings;
  }
}

function persistOrgSettings(settings: OrgSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(settings));
}

/** Format currency using org settings */
export function formatCurrency(amount: number, currency?: string): string {
  const cur = currency ?? loadOrgSettings().currency;
  const localeMap: Record<string, string> = {
    EUR: "pt-PT", USD: "en-US", GBP: "en-GB", BRL: "pt-BR",
    CHF: "de-CH", MZN: "pt-MZ", MAD: "fr-MA", AOA: "pt-AO", CVE: "pt-CV",
  };
  return new Intl.NumberFormat(localeMap[cur] ?? "pt-PT", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format currency with compact notation (e.g. 15K, 1.2M) for chart axes */
export function formatCurrencyCompact(amount: number, currency?: string): string {
  const cur = currency ?? loadOrgSettings().currency;
  const localeMap: Record<string, string> = {
    EUR: "pt-PT", USD: "en-US", GBP: "en-GB", BRL: "pt-BR",
    CHF: "de-CH", MZN: "pt-MZ", MAD: "fr-MA", AOA: "pt-AO", CVE: "pt-CV",
  };
  return new Intl.NumberFormat(localeMap[cur] ?? "pt-PT", {
    style: "currency",
    currency: cur,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Unified data persistence
// ---------------------------------------------------------------------------

const DATA_KEY = "vytal-data";
const MESSAGES_KEY = "vytal-messages";

interface PersistedData {
  members: Member[];
  classes: Class[];
  leads: Lead[];
  coaches: Coach[];
  locations: Location[];
  classTypes: ClassType[];
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  notifications: Notification[];
  exercises: Exercise[];
  personalRecords: PersonalRecord[];
  wods: WOD[];
}

function defaultData(): PersistedData {
  return {
    members: [...mockMembers],
    classes: [...mockClasses],
    leads: [...mockLeads],
    coaches: [...mockCoaches],
    locations: [...mockLocations],
    classTypes: [...mockClassTypes],
    plans: [...mockPlans],
    subscriptions: [...mockSubscriptions],
    notifications: [...mockNotifications],
    exercises: [...mockExercises],
    personalRecords: [...mockPersonalRecords],
    wods: [...mockWODs],
  };
}

function loadData(): PersistedData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    const defaults = defaultData();
    return {
      members: parsed.members ?? defaults.members,
      classes: parsed.classes ?? defaults.classes,
      leads: parsed.leads ?? defaults.leads,
      coaches: parsed.coaches ?? defaults.coaches,
      locations: parsed.locations ?? defaults.locations,
      classTypes: parsed.classTypes ?? defaults.classTypes,
      plans: parsed.plans ?? defaults.plans,
      subscriptions: parsed.subscriptions ?? defaults.subscriptions,
      notifications: parsed.notifications ?? defaults.notifications,
      exercises: parsed.exercises ?? defaults.exercises,
      personalRecords: parsed.personalRecords ?? defaults.personalRecords,
      wods: parsed.wods ?? defaults.wods,
    };
  } catch {
    return defaultData();
  }
}

function persistData(data: PersistedData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Conversation seed data
// ---------------------------------------------------------------------------

const defaultConversations: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Ana Silva",
    contactInitials: "AS",
    contactStatus: "active",
    online: true,
    unreadCount: 2,
    lastMessageTime: "2m ago",
    messages: [
      { text: "Ola, gostaria de saber sobre o plano semestral", fromMe: false, time: "10:15" },
      { text: "Claro! O plano semestral custa 390\u20AC e inclui todas as aulas.", fromMe: true, time: "10:18" },
      { text: "Posso fazer uma aula experimental primeiro?", fromMe: false, time: "10:20" },
      { text: "Sim, claro! Pode agendar uma aula experimental gratuita pela app ou diretamente connosco.", fromMe: true, time: "10:22" },
      { text: "Optimo! Gostaria de experimentar a aula das 18:00 de quarta-feira", fromMe: false, time: "10:25" },
      { text: "Perfeito! Fica registada a sua aula experimental para quarta-feira as 18:00. Traga roupa confortavel e uma garrafa de agua.", fromMe: true, time: "10:28" },
      { text: "E preciso ter alguma experiencia previa?", fromMe: false, time: "10:30" },
      { text: "Nao, todas as aulas sao adaptadas ao nivel de cada atleta. O nosso coach vai acompanha-la durante toda a aula.", fromMe: true, time: "10:33" },
      { text: "Excelente! Muito obrigada pela ajuda!", fromMe: false, time: "10:35" },
      { text: "Obrigada pela informacao!", fromMe: false, time: "10:36" },
    ],
  },
  {
    id: "conv-2",
    contactName: "Pedro Almeida",
    contactInitials: "PA",
    contactStatus: "active",
    online: true,
    unreadCount: 1,
    lastMessageTime: "15m ago",
    messages: [
      { text: "Bom dia! Queria saber se amanha ha Open Box de manha", fromMe: false, time: "09:00" },
      { text: "Bom dia Pedro! Sim, temos Open Box amanha das 08:00 as 10:00", fromMe: true, time: "09:05" },
      { text: "E preciso reservar lugar?", fromMe: false, time: "09:08" },
      { text: "Sim, recomendamos que reserve pela app para garantir o seu lugar. A capacidade e limitada.", fromMe: true, time: "09:12" },
      { text: "Vou passar amanha de manha", fromMe: false, time: "09:15" },
    ],
  },
  {
    id: "conv-3",
    contactName: "Tiago Neves",
    contactInitials: "TN",
    contactStatus: "trial",
    online: false,
    unreadCount: 0,
    lastMessageTime: "1h ago",
    messages: [
      { text: "Ola! Fiz a minha aula experimental ontem e gostei muito!", fromMe: false, time: "14:00" },
      { text: "Que otimo, Tiago! Ficamos contentes que tenha gostado. Gostaria de conhecer os nossos planos?", fromMe: true, time: "14:10" },
      { text: "Sim! Pode consultar o horario na app.", fromMe: true, time: "14:12" },
      { text: "Onde posso ver os horarios?", fromMe: false, time: "14:20" },
    ],
  },
  {
    id: "conv-4",
    contactName: "Sofia Santos",
    contactInitials: "SS",
    contactStatus: "active",
    online: false,
    unreadCount: 0,
    lastMessageTime: "3h ago",
    messages: [
      { text: "Boa tarde, o meu pagamento mensal foi processado?", fromMe: false, time: "11:00" },
      { text: "Boa tarde Sofia! Sim, o pagamento foi processado com sucesso. Pode consultar o recibo na app.", fromMe: true, time: "11:15" },
      { text: "O pagamento foi processado?", fromMe: false, time: "11:00" },
    ],
  },
  {
    id: "conv-5",
    contactName: "Miguel Costa",
    contactInitials: "MC",
    contactStatus: "active",
    online: true,
    unreadCount: 0,
    lastMessageTime: "5h ago",
    messages: [
      { text: "Ola, gostaria de cancelar a minha aula de amanha", fromMe: false, time: "08:00" },
      { text: "Bom dia Miguel! Pode cancelar diretamente pela app ate 2 horas antes da aula.", fromMe: true, time: "08:10" },
      { text: "Nao consigo pela app, da-me um erro", fromMe: false, time: "08:15" },
      { text: "Pode contactar-nos pelo telefone tambem. Ja cancelamos a sua aula.", fromMe: true, time: "08:20" },
    ],
  },
  {
    id: "conv-6",
    contactName: "Maria Oliveira",
    contactInitials: "MO",
    contactStatus: "inactive",
    online: false,
    unreadCount: 0,
    lastMessageTime: "Yesterday",
    messages: [
      { text: "Ola, estive ausente uns meses. Gostava de voltar ao treino", fromMe: false, time: "16:00" },
      { text: "Ola Maria! Ficamos contentes em sabe-lo. Temos disponibilidade esta semana para uma conversa?", fromMe: true, time: "16:30" },
    ],
  },
  {
    id: "conv-7",
    contactName: "Ines Ferreira",
    contactInitials: "IF",
    contactStatus: "active",
    online: false,
    unreadCount: 0,
    lastMessageTime: "Yesterday",
    messages: [
      { text: "Ola! Trouxe uma amiga que quer experimentar. Pode vir amanha?", fromMe: false, time: "18:00" },
      { text: "Claro, Ines! A sua aula experimental esta confirmada! Pode vir as 18:00.", fromMe: true, time: "18:15" },
      { text: "A minha aula experimental esta confirmada?", fromMe: false, time: "18:20" },
    ],
  },
  {
    id: "conv-8",
    contactName: "Jose Fonte",
    contactInitials: "JF",
    contactStatus: "active",
    online: false,
    unreadCount: 0,
    lastMessageTime: "2d ago",
    messages: [
      { text: "Bom dia! Quero mudar para o plano anual. Como faco?", fromMe: false, time: "10:00" },
      { text: "Bom dia Jose! Pode fazer a mudanca diretamente na app em 'O Meu Plano'. Obrigado pela mensagem!", fromMe: true, time: "10:30" },
      { text: "Obrigado pela mensagem!", fromMe: false, time: "10:35" },
    ],
  },
];

function loadConversations(): Conversation[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Conversation[];
  } catch {
    return null;
  }
}

function persistConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface DataStore {
  // Messages
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
  totalUnread: () => number;

  // Org settings
  orgSettings: OrgSettings;
  updateOrgSettings: (partial: Partial<OrgSettings>) => void;

  // Members
  members: Member[];
  addMember: (member: Omit<Member, "id">) => string;
  updateMember: (id: string, partial: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  // Classes
  classes: Class[];
  addClass: (cls: Omit<Class, "id">) => string;
  updateClass: (id: string, partial: Partial<Class>) => void;
  deleteClass: (id: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => string;
  updateLead: (id: string, partial: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (id: string, stage: LeadStage) => void;

  // Coaches
  coaches: Coach[];
  addCoach: (coach: Omit<Coach, "id">) => string;
  updateCoach: (id: string, partial: Partial<Coach>) => void;
  deleteCoach: (id: string) => void;

  // Locations
  locations: Location[];
  addLocation: (loc: Omit<Location, "id">) => string;
  updateLocation: (id: string, partial: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // ClassTypes
  classTypes: ClassType[];
  addClassType: (ct: Omit<ClassType, "id">) => string;
  updateClassType: (id: string, partial: Partial<ClassType>) => void;
  deleteClassType: (id: string) => void;

  // Plans
  plans: SubscriptionPlan[];
  addPlan: (plan: Omit<SubscriptionPlan, "id">) => string;
  updatePlan: (id: string, partial: Partial<SubscriptionPlan>) => void;
  deletePlan: (id: string) => void;

  // Subscriptions
  subscriptions: Subscription[];

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Exercises
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, "id">) => string;
  updateExercise: (id: string, partial: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // Personal Records
  personalRecords: PersonalRecord[];

  // WODs
  wods: WOD[];
  updateWOD: (id: string, partial: Partial<WOD>) => void;

  // Reset all data
  resetAllData: () => void;
}

// ---------------------------------------------------------------------------
// Helper: snapshot persisted data from state
// ---------------------------------------------------------------------------

function snapshotData(state: DataStore): PersistedData {
  return {
    members: state.members,
    classes: state.classes,
    leads: state.leads,
    coaches: state.coaches,
    locations: state.locations,
    classTypes: state.classTypes,
    plans: state.plans,
    subscriptions: state.subscriptions,
    notifications: state.notifications,
    exercises: state.exercises,
    personalRecords: state.personalRecords,
    wods: state.wods,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialData = loadData();

export const useDataStore = create<DataStore>((set, get) => ({
  // ---- Conversations ----
  conversations: loadConversations() ?? defaultConversations,

  sendMessage: (conversationId: string, text: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    set((state) => {
      const updated = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, { text, fromMe: true, time }],
              lastMessageTime: "Just now",
            }
          : c
      );
      persistConversations(updated);
      return { conversations: updated };
    });
  },

  markAsRead: (conversationId: string) => {
    set((state) => {
      const updated = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      persistConversations(updated);
      return { conversations: updated };
    });
  },

  totalUnread: () => {
    return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },

  // ---- Org Settings ----
  orgSettings: loadOrgSettings(),

  updateOrgSettings: (partial: Partial<OrgSettings>) => {
    set((state) => {
      const updated = { ...state.orgSettings, ...partial };
      persistOrgSettings(updated);
      return { orgSettings: updated };
    });
  },

  // ---- Members ----
  members: initialData.members,

  addMember: (member) => {
    const id = `m-${generateId()}`;
    set((state) => {
      const updated = [...state.members, { ...member, id }];
      const newState = { ...state, members: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { members: updated };
    });
    return id;
  },

  updateMember: (id, partial) => {
    set((state) => {
      const updated = state.members.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      );
      const newState = { ...state, members: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { members: updated };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const updated = state.members.filter((m) => m.id !== id);
      const newState = { ...state, members: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { members: updated };
    });
  },

  // ---- Classes ----
  classes: initialData.classes,

  addClass: (cls) => {
    const id = `cl-${generateId()}`;
    set((state) => {
      const updated = [...state.classes, { ...cls, id }];
      const newState = { ...state, classes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classes: updated };
    });
    return id;
  },

  updateClass: (id, partial) => {
    set((state) => {
      const updated = state.classes.map((c) =>
        c.id === id ? { ...c, ...partial } : c
      );
      const newState = { ...state, classes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classes: updated };
    });
  },

  deleteClass: (id) => {
    set((state) => {
      const updated = state.classes.filter((c) => c.id !== id);
      const newState = { ...state, classes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classes: updated };
    });
  },

  // ---- Leads ----
  leads: initialData.leads,

  addLead: (lead) => {
    const id = `lead-${generateId()}`;
    set((state) => {
      const updated = [...state.leads, { ...lead, id, createdAt: new Date().toISOString() }];
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { leads: updated };
    });
    return id;
  },

  updateLead: (id, partial) => {
    set((state) => {
      const updated = state.leads.map((l) =>
        l.id === id ? { ...l, ...partial } : l
      );
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { leads: updated };
    });
  },

  deleteLead: (id) => {
    set((state) => {
      const updated = state.leads.filter((l) => l.id !== id);
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { leads: updated };
    });
  },

  moveLead: (id, stage) => {
    set((state) => {
      const updated = state.leads.map((l) =>
        l.id === id ? { ...l, stage, lastContactAt: new Date().toISOString() } : l
      );
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { leads: updated };
    });
  },

  // ---- Coaches ----
  coaches: initialData.coaches,

  addCoach: (coach) => {
    const id = `coach-${generateId()}`;
    set((state) => {
      const updated = [...state.coaches, { ...coach, id }];
      const newState = { ...state, coaches: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { coaches: updated };
    });
    return id;
  },

  updateCoach: (id, partial) => {
    set((state) => {
      const updated = state.coaches.map((c) =>
        c.id === id ? { ...c, ...partial } : c
      );
      const newState = { ...state, coaches: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { coaches: updated };
    });
  },

  deleteCoach: (id) => {
    set((state) => {
      const updated = state.coaches.filter((c) => c.id !== id);
      const newState = { ...state, coaches: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { coaches: updated };
    });
  },

  // ---- Locations ----
  locations: initialData.locations,

  addLocation: (loc) => {
    const id = `loc-${generateId()}`;
    set((state) => {
      const updated = [...state.locations, { ...loc, id }];
      const newState = { ...state, locations: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { locations: updated };
    });
    return id;
  },

  updateLocation: (id, partial) => {
    set((state) => {
      const updated = state.locations.map((l) =>
        l.id === id ? { ...l, ...partial } : l
      );
      const newState = { ...state, locations: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { locations: updated };
    });
  },

  deleteLocation: (id) => {
    set((state) => {
      const updated = state.locations.filter((l) => l.id !== id);
      const newState = { ...state, locations: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { locations: updated };
    });
  },

  // ---- ClassTypes ----
  classTypes: initialData.classTypes,

  addClassType: (ct) => {
    const id = `ct-${generateId()}`;
    set((state) => {
      const updated = [...state.classTypes, { ...ct, id }];
      const newState = { ...state, classTypes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classTypes: updated };
    });
    return id;
  },

  updateClassType: (id, partial) => {
    set((state) => {
      const updated = state.classTypes.map((ct) =>
        ct.id === id ? { ...ct, ...partial } : ct
      );
      const newState = { ...state, classTypes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classTypes: updated };
    });
  },

  deleteClassType: (id) => {
    set((state) => {
      const updated = state.classTypes.filter((ct) => ct.id !== id);
      const newState = { ...state, classTypes: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { classTypes: updated };
    });
  },

  // ---- Plans ----
  plans: initialData.plans,

  addPlan: (plan) => {
    const id = `plan-${generateId()}`;
    set((state) => {
      const updated = [...state.plans, { ...plan, id }];
      const newState = { ...state, plans: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { plans: updated };
    });
    return id;
  },

  updatePlan: (id, partial) => {
    set((state) => {
      const updated = state.plans.map((p) =>
        p.id === id ? { ...p, ...partial } : p
      );
      const newState = { ...state, plans: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { plans: updated };
    });
  },

  deletePlan: (id) => {
    set((state) => {
      const updated = state.plans.filter((p) => p.id !== id);
      const newState = { ...state, plans: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { plans: updated };
    });
  },

  // ---- Subscriptions ----
  subscriptions: initialData.subscriptions,

  // ---- Notifications ----
  notifications: initialData.notifications,

  markNotificationRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const newState = { ...state, notifications: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { notifications: updated };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      const newState = { ...state, notifications: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { notifications: updated };
    });
  },

  // ---- Exercises ----
  exercises: initialData.exercises,

  addExercise: (exercise) => {
    const id = `ex-${generateId()}`;
    set((state) => {
      const updated = [...state.exercises, { ...exercise, id }];
      const newState = { ...state, exercises: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { exercises: updated };
    });
    return id;
  },

  updateExercise: (id, partial) => {
    set((state) => {
      const updated = state.exercises.map((e) =>
        e.id === id ? { ...e, ...partial } : e
      );
      const newState = { ...state, exercises: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { exercises: updated };
    });
  },

  deleteExercise: (id) => {
    set((state) => {
      const updated = state.exercises.filter((e) => e.id !== id);
      const newState = { ...state, exercises: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { exercises: updated };
    });
  },

  // ---- Personal Records ----
  personalRecords: initialData.personalRecords,

  // ---- WODs ----
  wods: initialData.wods,

  updateWOD: (id, partial) => {
    set((state) => {
      const updated = state.wods.map((w) =>
        w.id === id ? { ...w, ...partial } : w
      );
      const newState = { ...state, wods: updated };
      persistData(snapshotData(newState as unknown as DataStore));
      return { wods: updated };
    });
  },

  // ---- Reset ----
  resetAllData: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DATA_KEY);
      localStorage.removeItem(MESSAGES_KEY);
      localStorage.removeItem(ORG_SETTINGS_KEY);
    }
    const fresh = defaultData();
    set({
      ...fresh,
      conversations: defaultConversations,
      orgSettings: defaultOrgSettings,
    });
  },
}));
