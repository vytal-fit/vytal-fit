import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
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
}

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

interface DataStore {
  // Messages
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
  totalUnread: () => number;
  // Org settings
  orgSettings: OrgSettings;
  updateOrgSettings: (partial: Partial<OrgSettings>) => void;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "vytal-messages";

function loadConversations(): Conversation[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Conversation[];
  } catch {
    return null;
  }
}

function persistConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

// ---------------------------------------------------------------------------
// Default seed data (union of layout.tsx FloatingChat + messages/page.tsx)
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

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDataStore = create<DataStore>((set, get) => ({
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

  // Org settings
  orgSettings: loadOrgSettings(),

  updateOrgSettings: (partial: Partial<OrgSettings>) => {
    set((state) => {
      const updated = { ...state.orgSettings, ...partial };
      persistOrgSettings(updated);
      return { orgSettings: updated };
    });
  },
}));
