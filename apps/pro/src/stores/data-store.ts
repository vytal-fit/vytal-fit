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
  STORAGE_KEYS,
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
  NotificationType,
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

export interface WebsiteTestimonial {
  name: string;
  text: string;
  rating: number;
}

export interface WebsiteFaqEntry {
  question: string;
  answer: string;
}

export type StoreProductCategory = "apparel" | "equipment" | "supplements" | "accessories";
export type StoreProductFulfillment = "in_house" | "external";
export type StoreSupplierRegion = "china" | "portugal" | "europe";
export type StoreSupplierStatus = "active" | "paused";
export type StoreSaleStatus = "completed" | "refunded" | "pending";
export type StorePaymentMethod = "cash" | "card" | "mbway" | "transfer";
export type StoreOrderStatus =
  | "draft"
  | "sent"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: StoreProductCategory;
  active: boolean;
  style: string;
  color: string;
  size: string;
  branding: string;
  supplierId: string;
  fulfillment: StoreProductFulfillment;
  sku: string;
}

export interface StoreSaleItem {
  productName: string;
  qty: number;
}

export interface StoreSale {
  id: string;
  date: string;
  memberName: string;
  items: StoreSaleItem[];
  total: number;
  paymentMethod: StorePaymentMethod;
  status: StoreSaleStatus;
}

export interface StoreSupplier {
  id: string;
  name: string;
  region: StoreSupplierRegion;
  country: string;
  dealer: string;
  website: string;
  leadTimeDays: number;
  minOrderQty: number;
  status: StoreSupplierStatus;
  channels: string[];
}

export interface StoreOrder {
  id: string;
  date: string;
  productName: string;
  supplierId: string;
  quantity: number;
  total: number;
  status: StoreOrderStatus;
  tracking: string;
  eta: string;
  source: string;
}

export interface WebsiteConfig {
  // ── Pages ──────────────────────────────────────────────────────────────────
  // Hero (always enabled)
  hero: {
    enabled: boolean;
    slogan: string;
    showCoverImage: boolean;
    ctaText: string;
    ctaLink: string;
    showStats: boolean;
    showQuickLinks: boolean;
  };
  // About (legacy, kept for backward compat)
  about: {
    enabled: boolean;
    description: string;
    foundingYear: string;
  };
  // Schedule page
  schedule: {
    enabled: boolean;
    classTypeIds: string[];
    showBookingButton: boolean;
    showOpeningHours: boolean;
    headerText: string;
  };
  // Pricing page
  pricing: {
    enabled: boolean;
    planIds: string[];
    showComparisonTable: boolean;
    showFaq: boolean;
    faqEntries: WebsiteFaqEntry[];
  };
  // Shop page
  shop: {
    enabled: boolean;
    showCategories: boolean;
    currencyFormat: string;
    headerText: string;
  };
  // Team page
  team: {
    enabled: boolean;
    coachIds: string[];
    showCertifications: boolean;
    showBio: boolean;
    headerText: string;
  };
  // Contact page
  contact: {
    enabled: boolean;
    showForm: boolean;
    showMap: boolean;
    showOpeningHours: boolean;
    successMessage: string;
    submissionsEmail: string;
  };
  // Gallery
  gallery: {
    enabled: boolean;
  };
  // Testimonials
  testimonials: {
    enabled: boolean;
    items: WebsiteTestimonial[];
  };
  // ── Design ────────────────────────────────────────────────────────────────
  design: {
    theme: "dark" | "light";
    primaryColor: string;
    logoFileName: string;
    faviconFileName: string;
    font: "Inter" | "Plus Jakarta Sans" | "DM Sans";
    borderRadius: number;
    navStyle: "topbar" | "sidebar";
    footerText: string;
    showSocialLinks: boolean;
    showPoweredBy: boolean;
  };
  // ── Domain ────────────────────────────────────────────────────────────────
  domain: {
    customDomain: string;
    wwwRedirect: boolean;
  };
  // ── SEO ───────────────────────────────────────────────────────────────────
  seo: {
    metaTitle: string;
    metaDescription: string;
    showOgImage: boolean;
    gaTrackingId: string;
    fbPixelId: string;
    allowIndexing: boolean;
    autoSitemap: boolean;
  };
  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    aboutText: string;
    announcementBar: boolean;
    announcementText: string;
    announcementColor: string;
    cookieConsent: boolean;
    cookieText: string;
    privacyPolicyUrl: string;
    termsUrl: string;
  };
  // Contact Form (legacy alias)
  contactForm: {
    enabled: boolean;
  };
}

export interface PaymentMethodConfig {
  mbway?: { enabled: boolean; phone?: string; merchantId?: string };
  multibanco?: { enabled: boolean; entity?: string; subEntity?: string };
  sepa?: { enabled: boolean; iban?: string; bic?: string; creditorId?: string };
  card?: { enabled: boolean; processor?: string };
  cash?: { enabled: boolean };
  transfer?: { enabled: boolean; iban?: string; bankName?: string; accountHolder?: string };
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
  websiteConfig?: WebsiteConfig;
  paymentMethods?: PaymentMethodConfig;
}

// ---------------------------------------------------------------------------
// Per-org settings defaults
// ---------------------------------------------------------------------------

const ORG_SETTINGS_KEY_PREFIX = STORAGE_KEYS.orgSettings;

const defaultOrgSettingsMap: Record<string, OrgSettings> = {
  "org-1": {
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
  },
  "org-2": {
    name: "Yoga Flow Porto",
    slug: "yoga-flow-porto",
    email: "hello@yogaflowporto.pt",
    phone: "+351 222 123 456",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    country: "Portugal",
    address: "Rua das Flores 88",
    city: "Porto",
    zipCode: "4000-200",
    website: "https://yogaflowporto.pt",
    facebook: "https://facebook.com/yogaflowporto",
    instagram: "https://instagram.com/yogaflowporto",
    youtube: "",
    slogan: "Find Your Flow",
    businessType: "yoga_studio",
    features: ORGANIZATION_CONFIGS.yoga_studio?.features as OrganizationFeatures,
  },
  "org-3": {
    name: "Iron Temple",
    slug: "iron-temple",
    email: "info@irontemple.pt",
    phone: "+351 211 987 654",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    country: "Portugal",
    address: "Avenida da Força 15",
    city: "Lisboa",
    zipCode: "1200-300",
    website: "https://irontemple.pt",
    facebook: "https://facebook.com/irontemple",
    instagram: "https://instagram.com/irontemple",
    youtube: "",
    slogan: "Forge Your Strength",
    businessType: "weightlifting_club",
    features: ORGANIZATION_CONFIGS.weightlifting_club?.features as OrganizationFeatures,
  },
};

// Fallback for unknown orgs
const defaultOrgSettings: OrgSettings = defaultOrgSettingsMap["org-1"];

function getOrgSettingsKey(orgId: string): string {
  return `${ORG_SETTINGS_KEY_PREFIX}-${orgId}`;
}

function getDefaultOrgSettings(orgId: string): OrgSettings {
  return defaultOrgSettingsMap[orgId] ?? defaultOrgSettings;
}

function loadOrgSettings(orgId: string): OrgSettings {
  if (typeof window === "undefined") return getDefaultOrgSettings(orgId);
  try {
    const raw = localStorage.getItem(getOrgSettingsKey(orgId));
    if (!raw) return getDefaultOrgSettings(orgId);
    return { ...getDefaultOrgSettings(orgId), ...JSON.parse(raw) };
  } catch {
    return getDefaultOrgSettings(orgId);
  }
}

function persistOrgSettings(settings: OrgSettings, orgId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getOrgSettingsKey(orgId), JSON.stringify(settings));
}

/** Format currency using org settings */
export function formatCurrency(amount: number, currency?: string): string {
  const cur = currency ?? loadOrgSettings("org-1").currency;
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
  const cur = currency ?? loadOrgSettings("org-1").currency;
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

const DATA_KEY_PREFIX = STORAGE_KEYS.data;
const MESSAGES_KEY_PREFIX = STORAGE_KEYS.messages;

function getDataKey(orgId: string): string {
  return `${DATA_KEY_PREFIX}-${orgId}`;
}

function getMessagesKey(orgId: string): string {
  return `${MESSAGES_KEY_PREFIX}-${orgId}`;
}

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
  storeProducts: StoreProduct[];
  storeSales: StoreSale[];
  storeSuppliers: StoreSupplier[];
  storeOrders: StoreOrder[];
}

function defaultStoreData() {
  const products: StoreProduct[] = [
    { id: "p1", name: "Aero Tee", price: 25, stock: 48, category: "apparel", active: true, style: "Relaxed fit", color: "Black", size: "S-XXL", branding: "Front chest logo", supplierId: "sup-1", fulfillment: "external", sku: "VT-AERO-TEE-BLK" },
    { id: "p2", name: "Crop Top", price: 22, stock: 35, category: "apparel", active: true, style: "Athletic crop", color: "Sand", size: "XS-L", branding: "Back print", supplierId: "sup-2", fulfillment: "external", sku: "VT-CROP-SND" },
    { id: "p3", name: "Heavy Hoodie", price: 35, stock: 20, category: "apparel", active: true, style: "Oversized hoodie", color: "Graphite", size: "S-XXL", branding: "Sleeve mark", supplierId: "sup-3", fulfillment: "external", sku: "VT-HOOD-GPH" },
    { id: "p4", name: "Training Backpack", price: 45, stock: 12, category: "accessories", active: true, style: "Daily carry", color: "Black", size: "One size", branding: "Debossed logo", supplierId: "sup-3", fulfillment: "external", sku: "VT-BACKPACK-BLK" },
    { id: "p5", name: "Gymnastics Grips", price: 18, stock: 60, category: "equipment", active: true, style: "2-hole", color: "Tan", size: "S-L", branding: "Laser mark", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-GRIPS-2H" },
    { id: "p6", name: "Knee Sleeves", price: 30, stock: 42, category: "equipment", active: true, style: "5mm support", color: "Red", size: "S-XL", branding: "Heat transfer", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-KNEE-5MM" },
    { id: "p7", name: "Wrist Wraps", price: 12, stock: 55, category: "equipment", active: true, style: "Competition", color: "Black", size: "One size", branding: "Printed logo", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-WRIST-COMP" },
    { id: "p8", name: "Jump Rope", price: 20, stock: 30, category: "equipment", active: true, style: "Speed cable", color: "Blue", size: "Adjustable", branding: "Etched handle", supplierId: "sup-4", fulfillment: "in_house", sku: "VT-ROPE-SPD" },
    { id: "p9", name: "Athletic Tape", price: 5, stock: 120, category: "accessories", active: true, style: "Performance", color: "White", size: "Roll", branding: "Wrapped label", supplierId: "sup-3", fulfillment: "external", sku: "VT-TAPE-WHT" },
    { id: "p10", name: "Chalk Bag", price: 8, stock: 75, category: "accessories", active: true, style: "Magnetic clip", color: "Grey", size: "One size", branding: "Woven patch", supplierId: "sup-3", fulfillment: "external", sku: "VT-CHALK-GRY" },
    { id: "p11", name: "Water Bottle", price: 15, stock: 50, category: "accessories", active: true, style: "Insulated", color: "Silver", size: "750ml", branding: "Laser logo", supplierId: "sup-2", fulfillment: "external", sku: "VT-BOTTLE-750" },
    { id: "p12", name: "Protein Shaker", price: 10, stock: 65, category: "accessories", active: false, style: "Twist cap", color: "White", size: "600ml", branding: "Silk screen", supplierId: "sup-2", fulfillment: "external", sku: "VT-SHAKER-600" },
  ];

  const sales: StoreSale[] = [
    { id: "s1", date: "2026-06-04", memberName: "Ana Silva", items: [{ productName: "T-Shirt Box", qty: 1 }, { productName: "Wrist Wraps", qty: 1 }], total: 37, paymentMethod: "card", status: "completed" },
    { id: "s2", date: "2026-06-03", memberName: "Pedro Almeida", items: [{ productName: "Knee Sleeves", qty: 1 }], total: 30, paymentMethod: "mbway", status: "completed" },
    { id: "s3", date: "2026-06-03", memberName: "Sofia Santos", items: [{ productName: "Jump Rope", qty: 1 }, { productName: "Chalk Bag", qty: 2 }], total: 36, paymentMethod: "cash", status: "completed" },
    { id: "s4", date: "2026-06-02", memberName: "Miguel Costa", items: [{ productName: "Crop Top", qty: 2 }], total: 44, paymentMethod: "card", status: "completed" },
    { id: "s5", date: "2026-06-02", memberName: "Ines Ferreira", items: [{ productName: "Gymnastics Grips", qty: 1 }], total: 18, paymentMethod: "mbway", status: "completed" },
    { id: "s6", date: "2026-06-01", memberName: "Tiago Neves", items: [{ productName: "Sweater Vytal", qty: 1 }], total: 35, paymentMethod: "transfer", status: "refunded" },
    { id: "s7", date: "2026-05-31", memberName: "Maria Oliveira", items: [{ productName: "Backpack", qty: 1 }, { productName: "Water Bottle", qty: 1 }], total: 60, paymentMethod: "card", status: "completed" },
    { id: "s8", date: "2026-05-30", memberName: "Jose Fonte", items: [{ productName: "Athletic Tape", qty: 3 }, { productName: "Protein Shaker", qty: 1 }], total: 25, paymentMethod: "cash", status: "pending" },
  ];

  const suppliers: StoreSupplier[] = [
    { id: "sup-1", name: "Yiwu Textile Hub", region: "china", country: "China", dealer: "Yiwu Sportswear Co.", website: "https://yiwutextile.example", leadTimeDays: 18, minOrderQty: 50, status: "active", channels: ["Alibaba", "1688"] },
    { id: "sup-2", name: "Shenzhen Apparel Works", region: "china", country: "China", dealer: "Shenzhen Merch Dealer", website: "https://shenzhenapparel.example", leadTimeDays: 15, minOrderQty: 30, status: "active", channels: ["Alibaba", "Taobao"] },
    { id: "sup-3", name: "Porto Merch Lab", region: "portugal", country: "Portugal", dealer: "Porto Print Studio", website: "https://portomerch.example", leadTimeDays: 4, minOrderQty: 10, status: "active", channels: ["Local dealer", "CSV import"] },
    { id: "sup-4", name: "EU Athletic Supply", region: "europe", country: "Spain", dealer: "Barcelona Dealer Network", website: "https://euathletic.example", leadTimeDays: 7, minOrderQty: 20, status: "paused", channels: ["B2B portal", "API feed"] },
  ];

  const orders: StoreOrder[] = [
    { id: "o-1", date: "2026-06-25", productName: "Aero Tee", supplierId: "sup-1", quantity: 120, total: 1440, status: "in_production", tracking: "CN-7819-AV", eta: "2026-07-14", source: "Alibaba" },
    { id: "o-2", date: "2026-06-23", productName: "Crop Top", supplierId: "sup-2", quantity: 60, total: 720, status: "confirmed", tracking: "CN-6621-ZK", eta: "2026-07-09", source: "Taobao" },
    { id: "o-3", date: "2026-06-21", productName: "Training Backpack", supplierId: "sup-3", quantity: 24, total: 624, status: "shipped", tracking: "PT-3348-LX", eta: "2026-06-30", source: "Dealer portal" },
    { id: "o-4", date: "2026-06-19", productName: "Water Bottle", supplierId: "sup-2", quantity: 100, total: 900, status: "delivered", tracking: "CN-5542-QP", eta: "2026-06-27", source: "Alibaba" },
    { id: "o-5", date: "2026-06-18", productName: "Heavy Hoodie", supplierId: "sup-1", quantity: 80, total: 2400, status: "sent", tracking: "CN-9910-DR", eta: "2026-07-18", source: "1688" },
    { id: "o-6", date: "2026-06-17", productName: "Protein Shaker", supplierId: "sup-2", quantity: 70, total: 700, status: "cancelled", tracking: "CN-1188-PX", eta: "2026-07-05", source: "Taobao" },
  ];

  return {
    storeProducts: products,
    storeSales: sales,
    storeSuppliers: suppliers,
    storeOrders: orders,
  };
}

// ---------------------------------------------------------------------------
// Org-1: CrossFit Aveiro — uses the shared mock data
// ---------------------------------------------------------------------------

function defaultDataOrg1(): PersistedData {
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
    ...defaultStoreData(),
  };
}

// ---------------------------------------------------------------------------
// Org-2: Yoga Flow Porto — yoga-style mock data
// ---------------------------------------------------------------------------

const org2Coaches: Coach[] = [
  { id: "coach-21", organizationId: "org-2", name: "Sofia Menezes", email: "sofia@yogaflowporto.pt", photo: undefined, role: "head_coach" },
  { id: "coach-22", organizationId: "org-2", name: "Beatriz Ramos", email: "beatriz@yogaflowporto.pt", photo: undefined, role: "coach" },
];

const org2Locations: Location[] = [
  { id: "loc-21", organizationId: "org-2", name: "Sala Principal", capacity: 20 },
  { id: "loc-22", organizationId: "org-2", name: "Sala de Meditação", capacity: 10 },
];

const org2ClassTypes: ClassType[] = [
  { id: "ct-21", organizationId: "org-2", name: "Vinyasa Flow", abbreviation: "VIN", color: "#8b5cf6", active: true },
  { id: "ct-22", organizationId: "org-2", name: "Hatha Yoga", abbreviation: "HAT", color: "#a78bfa", active: true },
  { id: "ct-23", organizationId: "org-2", name: "Yin Yoga", abbreviation: "YIN", color: "#c4b5fd", active: true },
  { id: "ct-24", organizationId: "org-2", name: "Meditação", abbreviation: "MED", color: "#7c3aed", active: true },
];

const today2 = new Date().toISOString().split("T")[0] as string;
const tomorrow2 = new Date(Date.now() + 86400000).toISOString().split("T")[0] as string;

const org2Classes: Class[] = [
  { id: "cl-21", organizationId: "org-2", classTypeId: "ct-21", classType: org2ClassTypes[0], locationId: "loc-21", location: org2Locations[0], coachIds: ["coach-21"], coaches: [org2Coaches[0]], date: today2, startTime: "07:30", endTime: "08:30", maxCapacity: 15, enrolledCount: 12, waitlistCount: 0 },
  { id: "cl-22", organizationId: "org-2", classTypeId: "ct-22", classType: org2ClassTypes[1], locationId: "loc-21", location: org2Locations[0], coachIds: ["coach-22"], coaches: [org2Coaches[1]], date: today2, startTime: "09:00", endTime: "10:00", maxCapacity: 15, enrolledCount: 8, waitlistCount: 0 },
  { id: "cl-23", organizationId: "org-2", classTypeId: "ct-23", classType: org2ClassTypes[2], locationId: "loc-22", location: org2Locations[1], coachIds: ["coach-21"], coaches: [org2Coaches[0]], date: today2, startTime: "18:00", endTime: "19:30", maxCapacity: 10, enrolledCount: 10, waitlistCount: 2 },
  { id: "cl-24", organizationId: "org-2", classTypeId: "ct-21", classType: org2ClassTypes[0], locationId: "loc-21", location: org2Locations[0], coachIds: ["coach-22"], coaches: [org2Coaches[1]], date: tomorrow2, startTime: "07:30", endTime: "08:30", maxCapacity: 15, enrolledCount: 6, waitlistCount: 0 },
  { id: "cl-25", organizationId: "org-2", classTypeId: "ct-24", classType: org2ClassTypes[3], locationId: "loc-22", location: org2Locations[1], coachIds: ["coach-21"], coaches: [org2Coaches[0]], date: tomorrow2, startTime: "19:00", endTime: "20:00", maxCapacity: 10, enrolledCount: 5, waitlistCount: 0 },
];

const org2Members: Member[] = [
  { id: "m-21", organizationId: "org-2", memberNumber: 1, name: "Leonor Azevedo", email: "leonor@example.com", phone: "912111001", status: "active", gender: "female", joinedAt: "2025-01-10", lastCheckIn: "2026-06-03", streakWeeks: 10, totalCheckIns: 198 },
  { id: "m-22", organizationId: "org-2", memberNumber: 2, name: "Marta Vieira", email: "marta@example.com", phone: "913222002", status: "active", gender: "female", joinedAt: "2025-03-15", lastCheckIn: "2026-06-02", streakWeeks: 7, totalCheckIns: 142 },
  { id: "m-23", organizationId: "org-2", memberNumber: 3, name: "Joana Pinto", email: "joana@example.com", phone: "914333003", status: "active", gender: "female", joinedAt: "2025-06-01", lastCheckIn: "2026-06-01", streakWeeks: 4, totalCheckIns: 87 },
  { id: "m-24", organizationId: "org-2", memberNumber: 4, name: "Ricardo Faria", email: "ricardo@example.com", phone: "915444004", status: "trial", gender: "male", joinedAt: "2026-05-20", lastCheckIn: "2026-06-02", streakWeeks: 1, totalCheckIns: 5 },
  { id: "m-25", organizationId: "org-2", memberNumber: 5, name: "Catarina Braga", email: "catarina@example.com", phone: "916555005", status: "inactive", gender: "female", joinedAt: "2024-09-01", lastCheckIn: "2026-03-10", streakWeeks: 0, totalCheckIns: 320 },
];

const org2Plans: SubscriptionPlan[] = [
  { id: "plan-21", organizationId: "org-2", name: "Mensal Livre", type: "monthly", price: 55, currency: "EUR", allowedClassTypes: ["ct-21", "ct-22", "ct-23", "ct-24"], active: true },
  { id: "plan-22", organizationId: "org-2", name: "8 Aulas/Mês", type: "monthly", price: 45, currency: "EUR", maxSessions: 8, allowedClassTypes: ["ct-21", "ct-22"], active: true },
  { id: "plan-23", organizationId: "org-2", name: "Trimestral Livre", type: "semester", price: 150, currency: "EUR", allowedClassTypes: ["ct-21", "ct-22", "ct-23", "ct-24"], active: true },
  { id: "plan-24", organizationId: "org-2", name: "Aula Avulso", type: "day_pass", price: 12, currency: "EUR", allowedClassTypes: ["ct-21", "ct-22"], active: true },
];

const org2Subscriptions: Subscription[] = [
  { id: "sub-21", memberId: "m-21", planId: "plan-21", plan: org2Plans[0], startDate: "2025-01-10", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-22", memberId: "m-22", planId: "plan-22", plan: org2Plans[1], startDate: "2025-03-15", status: "active", sessionsUsed: 5, nextBillingDate: "2026-07-01" },
  { id: "sub-23", memberId: "m-23", planId: "plan-21", plan: org2Plans[0], startDate: "2025-06-01", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-24", memberId: "m-24", planId: "plan-24", plan: org2Plans[3], startDate: "2026-05-20", status: "active", sessionsUsed: 5 },
];

const org2Leads: Lead[] = [
  { id: "lead-21", organizationId: "org-2", name: "Ana Peixoto", email: "ana.p@email.com", phone: "912100001", stage: "lead", source: "Instagram", createdAt: "2026-06-01T10:00:00Z" },
  { id: "lead-22", organizationId: "org-2", name: "Vera Carvalho", email: "vera.c@email.com", phone: "913200002", stage: "contacted", source: "Website", assignedCoachId: "coach-21", createdAt: "2026-05-28T09:00:00Z", lastContactAt: "2026-05-30T11:00:00Z" },
  { id: "lead-23", organizationId: "org-2", name: "Nuno Seabra", email: "nuno.s@email.com", phone: "914300003", stage: "prospect", source: "Referral", assignedCoachId: "coach-22", createdAt: "2026-05-20T11:00:00Z", lastContactAt: "2026-06-01T15:00:00Z", trialDate: "2026-06-07" },
  { id: "lead-24", organizationId: "org-2", name: "Filipa Monteiro", email: "filipa.m@email.com", phone: "915400004", stage: "subscribed", source: "Walk-in", assignedCoachId: "coach-21", createdAt: "2026-04-10T12:00:00Z", lastContactAt: "2026-05-15T10:00:00Z" },
];

const org2Notifications: Notification[] = [
  { id: "notif-21", memberId: "m-21", type: "new_member" as NotificationType, title: "Nova atleta inscrita", body: "Leonor Azevedo inscreveu-se no plano Mensal Livre.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "notif-22", memberId: "m-21", type: "class_full" as NotificationType, title: "Aula lotada", body: "Yin Yoga das 18:00 está lotada com lista de espera.", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const org2Exercises: Exercise[] = [
  { id: "ex-21", name: "Surya Namaskar", category: "mobility", description: "Saudação ao Sol - sequência de 12 posturas de yoga", muscleGroups: ["full_body"] },
  { id: "ex-22", name: "Pranayama", category: "other", description: "Técnicas de controlo da respiração", muscleGroups: [] },
  { id: "ex-23", name: "Warrior I", category: "strength", description: "Postura do Guerreiro I", muscleGroups: ["legs", "core"] },
];

function defaultDataOrg2(): PersistedData {
  return {
    members: [...org2Members],
    classes: [...org2Classes],
    leads: [...org2Leads],
    coaches: [...org2Coaches],
    locations: [...org2Locations],
    classTypes: [...org2ClassTypes],
    plans: [...org2Plans],
    subscriptions: [...org2Subscriptions],
    notifications: [...org2Notifications],
    exercises: [...org2Exercises],
    personalRecords: [],
    wods: [],
    ...defaultStoreData(),
  };
}

// ---------------------------------------------------------------------------
// Org-3: Iron Temple — weightlifting mock data
// ---------------------------------------------------------------------------

const org3Coaches: Coach[] = [
  { id: "coach-31", organizationId: "org-3", name: "Rui Lameira", email: "rui@irontemple.pt", photo: undefined, role: "head_coach" },
  { id: "coach-32", organizationId: "org-3", name: "Sandro Pires", email: "sandro@irontemple.pt", photo: undefined, role: "coach" },
];

const org3Locations: Location[] = [
  { id: "loc-31", organizationId: "org-3", name: "Plataforma Principal", capacity: 25 },
  { id: "loc-32", organizationId: "org-3", name: "Sala de Levantamento", capacity: 12 },
];

const org3ClassTypes: ClassType[] = [
  { id: "ct-31", organizationId: "org-3", name: "Levantamento Olímpico", abbreviation: "OLY", color: "#ef4444", active: true },
  { id: "ct-32", organizationId: "org-3", name: "Powerlifting", abbreviation: "PL", color: "#dc2626", active: true },
  { id: "ct-33", organizationId: "org-3", name: "Força Geral", abbreviation: "STR", color: "#f87171", active: true },
  { id: "ct-34", organizationId: "org-3", name: "Acessórios", abbreviation: "ACC", color: "#fca5a5", active: true },
];

const today3 = new Date().toISOString().split("T")[0] as string;
const tomorrow3 = new Date(Date.now() + 86400000).toISOString().split("T")[0] as string;

const org3Classes: Class[] = [
  { id: "cl-31", organizationId: "org-3", classTypeId: "ct-31", classType: org3ClassTypes[0], locationId: "loc-32", location: org3Locations[1], coachIds: ["coach-31"], coaches: [org3Coaches[0]], date: today3, startTime: "06:30", endTime: "08:00", maxCapacity: 10, enrolledCount: 8, waitlistCount: 0 },
  { id: "cl-32", organizationId: "org-3", classTypeId: "ct-33", classType: org3ClassTypes[2], locationId: "loc-31", location: org3Locations[0], coachIds: ["coach-32"], coaches: [org3Coaches[1]], date: today3, startTime: "09:00", endTime: "10:30", maxCapacity: 20, enrolledCount: 15, waitlistCount: 0 },
  { id: "cl-33", organizationId: "org-3", classTypeId: "ct-32", classType: org3ClassTypes[1], locationId: "loc-32", location: org3Locations[1], coachIds: ["coach-31"], coaches: [org3Coaches[0]], date: today3, startTime: "18:00", endTime: "19:30", maxCapacity: 10, enrolledCount: 10, waitlistCount: 1 },
  { id: "cl-34", organizationId: "org-3", classTypeId: "ct-31", classType: org3ClassTypes[0], locationId: "loc-32", location: org3Locations[1], coachIds: ["coach-31"], coaches: [org3Coaches[0]], date: tomorrow3, startTime: "06:30", endTime: "08:00", maxCapacity: 10, enrolledCount: 7, waitlistCount: 0 },
  { id: "cl-35", organizationId: "org-3", classTypeId: "ct-34", classType: org3ClassTypes[3], locationId: "loc-31", location: org3Locations[0], coachIds: ["coach-32"], coaches: [org3Coaches[1]], date: tomorrow3, startTime: "10:00", endTime: "11:00", maxCapacity: 20, enrolledCount: 12, waitlistCount: 0 },
];

const org3Members: Member[] = [
  { id: "m-31", organizationId: "org-3", memberNumber: 1, name: "Goncalo Vieira", email: "goncalo@example.com", phone: "912100011", status: "active", gender: "male", joinedAt: "2024-05-01", lastCheckIn: "2026-06-03", streakWeeks: 20, totalCheckIns: 410 },
  { id: "m-32", organizationId: "org-3", memberNumber: 2, name: "Vitor Santos", email: "vitor@example.com", phone: "913200022", status: "active", gender: "male", joinedAt: "2024-09-10", lastCheckIn: "2026-06-02", streakWeeks: 14, totalCheckIns: 280 },
  { id: "m-33", organizationId: "org-3", memberNumber: 3, name: "Patricia Lima", email: "patricia@example.com", phone: "914300033", status: "active", gender: "female", joinedAt: "2025-02-20", lastCheckIn: "2026-06-01", streakWeeks: 9, totalCheckIns: 165 },
  { id: "m-34", organizationId: "org-3", memberNumber: 4, name: "Hugo Rodrigues", email: "hugo@example.com", phone: "915400044", status: "trial", gender: "male", joinedAt: "2026-05-28", lastCheckIn: "2026-06-03", streakWeeks: 1, totalCheckIns: 4 },
];

const org3Plans: SubscriptionPlan[] = [
  { id: "plan-31", organizationId: "org-3", name: "Mensal Completo", type: "monthly", price: 80, currency: "EUR", allowedClassTypes: ["ct-31", "ct-32", "ct-33", "ct-34"], active: true },
  { id: "plan-32", organizationId: "org-3", name: "Levantamento Olímpico", type: "monthly", price: 65, currency: "EUR", allowedClassTypes: ["ct-31"], active: true },
  { id: "plan-33", organizationId: "org-3", name: "Semestral Completo", type: "semester", price: 440, currency: "EUR", allowedClassTypes: ["ct-31", "ct-32", "ct-33", "ct-34"], active: true },
];

const org3Subscriptions: Subscription[] = [
  { id: "sub-31", memberId: "m-31", planId: "plan-33", plan: org3Plans[2], startDate: "2024-05-01", status: "active", nextBillingDate: "2026-11-01" },
  { id: "sub-32", memberId: "m-32", planId: "plan-31", plan: org3Plans[0], startDate: "2024-09-10", status: "active", nextBillingDate: "2026-07-01" },
  { id: "sub-33", memberId: "m-33", planId: "plan-32", plan: org3Plans[1], startDate: "2025-02-20", status: "active", nextBillingDate: "2026-07-01" },
];

const org3Leads: Lead[] = [
  { id: "lead-31", organizationId: "org-3", name: "Tiago Cunha", email: "tiago.c@email.com", phone: "912100031", stage: "lead", source: "Instagram", createdAt: "2026-06-02T10:00:00Z" },
  { id: "lead-32", organizationId: "org-3", name: "Luis Moreira", email: "luis.m@email.com", phone: "913200032", stage: "prospect", source: "Referral", assignedCoachId: "coach-31", createdAt: "2026-05-25T11:00:00Z", lastContactAt: "2026-06-01T15:00:00Z", trialDate: "2026-06-10" },
  { id: "lead-33", organizationId: "org-3", name: "Fabio Alves", email: "fabio.a@email.com", phone: "914300033", stage: "subscribed", source: "Walk-in", assignedCoachId: "coach-32", createdAt: "2026-04-01T12:00:00Z", lastContactAt: "2026-05-01T10:00:00Z" },
];

const org3Notifications: Notification[] = [
  { id: "notif-31", memberId: "m-34", type: "new_member" as NotificationType, title: "Novo atleta inscrito", body: "Hugo Rodrigues iniciou período de trial.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "notif-32", memberId: "m-31", type: "class_full" as NotificationType, title: "Aula lotada", body: "Powerlifting das 18:00 está lotado com lista de espera.", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const org3Exercises: Exercise[] = [
  { id: "ex-31", name: "Snatch", category: "weightlifting", description: "Arranco — movimento completo do halter do chão acima da cabeça", muscleGroups: ["full_body", "shoulders", "legs"] },
  { id: "ex-32", name: "Clean & Jerk", category: "weightlifting", description: "Arremesso — dois tempos: clean e jerk", muscleGroups: ["full_body", "shoulders", "legs"] },
  { id: "ex-33", name: "Back Squat", category: "strength", description: "Agachamento com barra às costas", muscleGroups: ["legs", "glutes", "core"] },
  { id: "ex-34", name: "Deadlift", category: "strength", description: "Peso morto", muscleGroups: ["back", "legs", "glutes"] },
  { id: "ex-35", name: "Bench Press", category: "strength", description: "Supino reto", muscleGroups: ["chest", "shoulders", "triceps"] },
];

const org3PersonalRecords: PersonalRecord[] = [
  { id: "pr-31", memberId: "m-31", exerciseId: "ex-31", exercise: org3Exercises[0], value: "110", unit: "kg", achievedAt: "2026-05-15" },
  { id: "pr-32", memberId: "m-31", exerciseId: "ex-32", exercise: org3Exercises[1], value: "135", unit: "kg", achievedAt: "2026-04-20" },
  { id: "pr-33", memberId: "m-32", exerciseId: "ex-33", exercise: org3Exercises[2], value: "180", unit: "kg", achievedAt: "2026-05-28" },
  { id: "pr-34", memberId: "m-32", exerciseId: "ex-34", exercise: org3Exercises[3], value: "220", unit: "kg", achievedAt: "2026-06-01" },
  { id: "pr-35", memberId: "m-33", exerciseId: "ex-35", exercise: org3Exercises[4], value: "90", unit: "kg", achievedAt: "2026-05-10" },
];

function defaultDataOrg3(): PersistedData {
  return {
    members: [...org3Members],
    classes: [...org3Classes],
    leads: [...org3Leads],
    coaches: [...org3Coaches],
    locations: [...org3Locations],
    classTypes: [...org3ClassTypes],
    plans: [...org3Plans],
    subscriptions: [...org3Subscriptions],
    notifications: [...org3Notifications],
    exercises: [...org3Exercises],
    personalRecords: [...org3PersonalRecords],
    wods: [],
    ...defaultStoreData(),
  };
}

// ---------------------------------------------------------------------------
// Generic default data dispatcher
// ---------------------------------------------------------------------------

function defaultData(orgId = "org-1"): PersistedData {
  if (orgId === "org-2") return defaultDataOrg2();
  if (orgId === "org-3") return defaultDataOrg3();
  return defaultDataOrg1();
}

function loadData(orgId = "org-1"): PersistedData {
  if (typeof window === "undefined") return defaultData(orgId);
  try {
    const raw = localStorage.getItem(getDataKey(orgId));
    if (!raw) return defaultData(orgId);
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    const defaults = defaultData(orgId);
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
    storeProducts: parsed.storeProducts ?? defaults.storeProducts,
    storeSales: parsed.storeSales ?? defaults.storeSales,
    storeSuppliers: parsed.storeSuppliers ?? defaults.storeSuppliers,
    storeOrders: parsed.storeOrders ?? defaults.storeOrders,
  };
  } catch {
    return defaultData(orgId);
  }
}

function persistData(data: PersistedData, orgId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDataKey(orgId), JSON.stringify(data));
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

function loadConversations(orgId: string): Conversation[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getMessagesKey(orgId));
    if (!raw) return null;
    return JSON.parse(raw) as Conversation[];
  } catch {
    return null;
  }
}

function persistConversations(conversations: Conversation[], orgId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getMessagesKey(orgId), JSON.stringify(conversations));
}

// ---------------------------------------------------------------------------
// Per-org default conversations
// ---------------------------------------------------------------------------

const defaultConversationsOrg2: Conversation[] = [
  {
    id: "conv-21",
    contactName: "Leonor Azevedo",
    contactInitials: "LA",
    contactStatus: "active",
    online: true,
    unreadCount: 1,
    lastMessageTime: "5m ago",
    messages: [
      { text: "Boa tarde! Queria confirmar a minha aula de Yin Yoga de hoje.", fromMe: false, time: "17:10" },
      { text: "Boa tarde Leonor! Sim, está confirmada para as 18:00. Traga um tapete se tiver.", fromMe: true, time: "17:15" },
      { text: "Perfeito, obrigada!", fromMe: false, time: "17:16" },
    ],
  },
  {
    id: "conv-22",
    contactName: "Marta Vieira",
    contactInitials: "MV",
    contactStatus: "active",
    online: false,
    unreadCount: 0,
    lastMessageTime: "1h ago",
    messages: [
      { text: "Olá! Posso trazer uma amiga para experimentar a aula de Vinyasa?", fromMe: false, time: "16:00" },
      { text: "Claro, Marta! Basta registar a aula experimental pela app. É gratuita!", fromMe: true, time: "16:10" },
    ],
  },
];

const defaultConversationsOrg3: Conversation[] = [
  {
    id: "conv-31",
    contactName: "Goncalo Vieira",
    contactInitials: "GV",
    contactStatus: "active",
    online: true,
    unreadCount: 2,
    lastMessageTime: "10m ago",
    messages: [
      { text: "Rui, as plataformas de levantamento estão disponíveis amanhã cedo?", fromMe: false, time: "19:00" },
      { text: "Sim Gonçalo, abre às 06:30. Tens a sessão de Olímpico marcada.", fromMe: true, time: "19:05" },
      { text: "Óptimo! Vou tentar bater o meu PR no Snatch amanhã.", fromMe: false, time: "19:06" },
      { text: "Força! Prepara bem o aquecimento.", fromMe: true, time: "19:08" },
    ],
  },
  {
    id: "conv-32",
    contactName: "Vitor Santos",
    contactInitials: "VS",
    contactStatus: "active",
    online: false,
    unreadCount: 0,
    lastMessageTime: "2h ago",
    messages: [
      { text: "Quando é a próxima competição interna de powerlifting?", fromMe: false, time: "17:30" },
      { text: "Estamos a planear para Julho. Vamos anunciar em breve!", fromMe: true, time: "17:45" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

function getDefaultConversationsForOrg(orgId: string): Conversation[] {
  if (orgId === "org-2") return defaultConversationsOrg2;
  if (orgId === "org-3") return defaultConversationsOrg3;
  return defaultConversations;
}

interface DataStore {
  // Active org tracking
  activeOrgId: string;
  switchOrgData: (orgId: string) => void;

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

  // Store / Merch
  storeProducts: StoreProduct[];
  storeSales: StoreSale[];
  storeSuppliers: StoreSupplier[];
  storeOrders: StoreOrder[];
  addStoreProduct: (product: Omit<StoreProduct, "id">) => string;
  updateStoreProduct: (id: string, partial: Partial<StoreProduct>) => void;
  deleteStoreProduct: (id: string) => void;
  toggleStoreProductActive: (id: string) => void;
  updateStoreSupplier: (id: string, partial: Partial<StoreSupplier>) => void;
  updateStoreOrder: (id: string, partial: Partial<StoreOrder>) => void;

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
  storeProducts: state.storeProducts,
  storeSales: state.storeSales,
  storeSuppliers: state.storeSuppliers,
  storeOrders: state.storeOrders,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

// Determine the initial active org from persisted auth (if available)
function getInitialOrgId(): string {
  if (typeof window === "undefined") return "org-1";
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return "org-1";
    const auth = JSON.parse(raw) as { activeOrganizationId?: string };
    return auth.activeOrganizationId ?? "org-1";
  } catch {
    return "org-1";
  }
}

const INITIAL_ORG_ID = getInitialOrgId();
const initialData = loadData(INITIAL_ORG_ID);

export const useDataStore = create<DataStore>((set, get) => ({
  // ---- Active Org ----
  activeOrgId: INITIAL_ORG_ID,

  switchOrgData: (orgId: string) => {
    const orgData = loadData(orgId);
    const orgConvs = loadConversations(orgId) ?? getDefaultConversationsForOrg(orgId);
    const orgSettings = loadOrgSettings(orgId);
    set({
      activeOrgId: orgId,
      ...orgData,
      conversations: orgConvs,
      orgSettings,
    });
  },

  // ---- Conversations ----
  conversations: loadConversations(INITIAL_ORG_ID) ?? getDefaultConversationsForOrg(INITIAL_ORG_ID),

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
      persistConversations(updated, state.activeOrgId);
      return { conversations: updated };
    });
  },

  markAsRead: (conversationId: string) => {
    set((state) => {
      const updated = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      persistConversations(updated, state.activeOrgId);
      return { conversations: updated };
    });
  },

  totalUnread: () => {
    return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },

  // ---- Org Settings ----
  orgSettings: loadOrgSettings(INITIAL_ORG_ID),

  updateOrgSettings: (partial: Partial<OrgSettings>) => {
    set((state) => {
      const updated = { ...state.orgSettings, ...partial };
      persistOrgSettings(updated, state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { members: updated };
    });
  },

  deleteMember: (id) => {
    set((state) => {
      const updated = state.members.filter((m) => m.id !== id);
      const newState = { ...state, members: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { classes: updated };
    });
  },

  deleteClass: (id) => {
    set((state) => {
      const updated = state.classes.filter((c) => c.id !== id);
      const newState = { ...state, classes: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { leads: updated };
    });
  },

  deleteLead: (id) => {
    set((state) => {
      const updated = state.leads.filter((l) => l.id !== id);
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { leads: updated };
    });
  },

  moveLead: (id, stage) => {
    set((state) => {
      const updated = state.leads.map((l) =>
        l.id === id ? { ...l, stage, lastContactAt: new Date().toISOString() } : l
      );
      const newState = { ...state, leads: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { coaches: updated };
    });
  },

  deleteCoach: (id) => {
    set((state) => {
      const updated = state.coaches.filter((c) => c.id !== id);
      const newState = { ...state, coaches: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { locations: updated };
    });
  },

  deleteLocation: (id) => {
    set((state) => {
      const updated = state.locations.filter((l) => l.id !== id);
      const newState = { ...state, locations: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { classTypes: updated };
    });
  },

  deleteClassType: (id) => {
    set((state) => {
      const updated = state.classTypes.filter((ct) => ct.id !== id);
      const newState = { ...state, classTypes: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { plans: updated };
    });
  },

  deletePlan: (id) => {
    set((state) => {
      const updated = state.plans.filter((p) => p.id !== id);
      const newState = { ...state, plans: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { notifications: updated };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      const newState = { ...state, notifications: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { notifications: updated };
    });
  },

  // ---- Store / Merch ----
  storeProducts: initialData.storeProducts,
  storeSales: initialData.storeSales,
  storeSuppliers: initialData.storeSuppliers,
  storeOrders: initialData.storeOrders,

  addStoreProduct: (product) => {
    const id = `p-${generateId()}`;
    set((state) => {
      const updated = [...state.storeProducts, { ...product, id }];
      const newState = { ...state, storeProducts: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeProducts: updated };
    });
    return id;
  },

  updateStoreProduct: (id, partial) => {
    set((state) => {
      const updated = state.storeProducts.map((product) =>
        product.id === id ? { ...product, ...partial } : product
      );
      const newState = { ...state, storeProducts: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeProducts: updated };
    });
  },

  deleteStoreProduct: (id) => {
    set((state) => {
      const updated = state.storeProducts.filter((product) => product.id !== id);
      const newState = { ...state, storeProducts: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeProducts: updated };
    });
  },

  toggleStoreProductActive: (id) => {
    set((state) => {
      const updated = state.storeProducts.map((product) =>
        product.id === id ? { ...product, active: !product.active } : product
      );
      const newState = { ...state, storeProducts: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeProducts: updated };
    });
  },

  updateStoreSupplier: (id, partial) => {
    set((state) => {
      const updated = state.storeSuppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...partial } : supplier
      );
      const newState = { ...state, storeSuppliers: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeSuppliers: updated };
    });
  },

  updateStoreOrder: (id, partial) => {
    set((state) => {
      const updated = state.storeOrders.map((order) =>
        order.id === id ? { ...order, ...partial } : order
      );
      const newState = { ...state, storeOrders: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { storeOrders: updated };
    });
  },

  // ---- Exercises ----
  exercises: initialData.exercises,

  addExercise: (exercise) => {
    const id = `ex-${generateId()}`;
    set((state) => {
      const updated = [...state.exercises, { ...exercise, id }];
      const newState = { ...state, exercises: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { exercises: updated };
    });
  },

  deleteExercise: (id) => {
    set((state) => {
      const updated = state.exercises.filter((e) => e.id !== id);
      const newState = { ...state, exercises: updated };
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
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
      persistData(snapshotData(newState as unknown as DataStore), state.activeOrgId);
      return { wods: updated };
    });
  },

  // ---- Reset ----
  resetAllData: () => {
    const orgId = get().activeOrgId;
    if (typeof window !== "undefined") {
      localStorage.removeItem(getDataKey(orgId));
      localStorage.removeItem(getMessagesKey(orgId));
      localStorage.removeItem(getOrgSettingsKey(orgId));
    }
    const fresh = defaultData(orgId);
    set({
      ...fresh,
      conversations: getDefaultConversationsForOrg(orgId),
      orgSettings: getDefaultOrgSettings(orgId),
    });
  },
}));
