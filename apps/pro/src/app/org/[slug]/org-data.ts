// ---------------------------------------------------------------------------
// Shared mock data for public org pages
// In production, this would be fetched from the API
// ---------------------------------------------------------------------------

export interface OrgScheduleClass {
  id: string;
  day: number; // 0=Mon, 1=Tue, ..., 6=Sun
  time: string;
  duration: number; // minutes
  name: string;
  coach: string;
  spots: number;
  spotsLeft: number;
  color: string;
}

export interface OrgCoach {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  certifications: string[];
  initials: string;
  color: string;
}

export interface OrgProduct {
  id: string;
  name: string;
  price: number;
  category: "clothing" | "accessories" | "supplements" | "equipment";
  description: string;
  color: string;
  badge?: string;
}

export interface OrgPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export interface OrgData {
  name: string;
  type: string;
  slogan: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  website: string;
  instagram: string;
  facebook?: string;
  youtube?: string;
  schedule: { day: string; hours: string }[];
  stats: { members: number; classes: number; coaches: number; rating: number };
  weeklyClasses: OrgScheduleClass[];
  coaches: OrgCoach[];
  products: OrgProduct[];
  plans: OrgPlan[];
}

export const MOCK_ORGS: Record<string, OrgData> = {
  "crossfit-aveiro": {
    name: "CrossFit Aveiro",
    type: "crossfit_box",
    slogan: "Stronger Every Day",
    email: "info@crossfitaveiro.pt",
    phone: "+351 234 567 890",
    address: "Rua do Desporto 42",
    city: "Aveiro",
    country: "Portugal",
    zipCode: "3800-100",
    website: "https://crossfitaveiro.pt",
    instagram: "@crossfitaveiro",
    facebook: "https://facebook.com/crossfitaveiro",
    schedule: [
      { day: "Segunda - Sexta", hours: "06:30 - 21:00" },
      { day: "Sábado", hours: "09:00 - 13:00" },
      { day: "Domingo", hours: "Fechado" },
    ],
    stats: { members: 245, classes: 35, coaches: 6, rating: 4.9 },
    weeklyClasses: [
      { id: "c1", day: 0, time: "06:30", duration: 60, name: "CrossFit", coach: "Miguel Santos", spots: 12, spotsLeft: 4, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c2", day: 0, time: "09:00", duration: 60, name: "CrossFit", coach: "Ana Lima", spots: 12, spotsLeft: 8, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c3", day: 0, time: "12:00", duration: 60, name: "Olympic Lifting", coach: "Carlos Faria", spots: 8, spotsLeft: 3, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "c4", day: 0, time: "18:00", duration: 60, name: "CrossFit", coach: "Miguel Santos", spots: 14, spotsLeft: 6, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c5", day: 0, time: "19:00", duration: 60, name: "CrossFit", coach: "Ana Lima", spots: 14, spotsLeft: 2, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c6", day: 1, time: "06:30", duration: 60, name: "CrossFit", coach: "João Pereira", spots: 12, spotsLeft: 7, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c7", day: 1, time: "10:00", duration: 60, name: "Gymnastics", coach: "Sara Costa", spots: 10, spotsLeft: 5, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "c8", day: 1, time: "18:00", duration: 60, name: "CrossFit", coach: "Carlos Faria", spots: 14, spotsLeft: 9, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c9", day: 1, time: "19:30", duration: 60, name: "Endurance", coach: "João Pereira", spots: 12, spotsLeft: 4, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "c10", day: 2, time: "06:30", duration: 60, name: "CrossFit", coach: "Ana Lima", spots: 12, spotsLeft: 6, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c11", day: 2, time: "09:00", duration: 60, name: "Open Gym", coach: "Miguel Santos", spots: 20, spotsLeft: 14, color: "bg-vytal-muted/20 text-vytal-muted border-vytal-border" },
      { id: "c12", day: 2, time: "18:00", duration: 60, name: "CrossFit", coach: "Sara Costa", spots: 14, spotsLeft: 3, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c13", day: 2, time: "19:00", duration: 60, name: "Olympic Lifting", coach: "Carlos Faria", spots: 8, spotsLeft: 1, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "c14", day: 3, time: "06:30", duration: 60, name: "CrossFit", coach: "João Pereira", spots: 12, spotsLeft: 8, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c15", day: 3, time: "12:00", duration: 60, name: "Gymnastics", coach: "Ana Lima", spots: 10, spotsLeft: 7, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "c16", day: 3, time: "18:00", duration: 60, name: "CrossFit", coach: "Miguel Santos", spots: 14, spotsLeft: 5, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c17", day: 3, time: "19:30", duration: 60, name: "CrossFit", coach: "Carlos Faria", spots: 14, spotsLeft: 0, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c18", day: 4, time: "06:30", duration: 60, name: "CrossFit", coach: "Sara Costa", spots: 12, spotsLeft: 9, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c19", day: 4, time: "09:00", duration: 60, name: "Open Gym", coach: "João Pereira", spots: 20, spotsLeft: 11, color: "bg-vytal-muted/20 text-vytal-muted border-vytal-border" },
      { id: "c20", day: 4, time: "18:00", duration: 60, name: "CrossFit", coach: "Ana Lima", spots: 14, spotsLeft: 4, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c21", day: 4, time: "19:30", duration: 60, name: "Endurance", coach: "Miguel Santos", spots: 12, spotsLeft: 6, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "c22", day: 5, time: "09:00", duration: 90, name: "CrossFit", coach: "Carlos Faria", spots: 16, spotsLeft: 7, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "c23", day: 5, time: "10:30", duration: 90, name: "Olympic Lifting", coach: "Miguel Santos", spots: 8, spotsLeft: 3, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ],
    coaches: [
      {
        id: "coach-1",
        name: "Miguel Santos",
        role: "Head Coach",
        specialty: "CrossFit & Olympic Lifting",
        bio: "CrossFit Level 3 Trainer com mais de 10 anos de experiência. Campeão nacional de Weightlifting em 2019. Apaixonado por ajudar atletas a atingir o seu máximo potencial.",
        certifications: ["CF-L3", "USAW Level 2", "CPR/AED"],
        initials: "MS",
        color: "bg-vytal-green/20 text-vytal-green",
      },
      {
        id: "coach-2",
        name: "Ana Lima",
        role: "Coach",
        specialty: "Gymnastics & Mobility",
        bio: "Ex-ginasta de competição com 8 anos de experiência no CrossFit. Especialista em movimentos de ginástica e mobilidade. Certificada em nutrição desportiva.",
        certifications: ["CF-L2", "Gymnastics Cert", "Nutrition Cert"],
        initials: "AL",
        color: "bg-blue-500/20 text-blue-400",
      },
      {
        id: "coach-3",
        name: "Carlos Faria",
        role: "Coach & Programmer",
        specialty: "Strength & Conditioning",
        bio: "Especialista em programação de treino com foco em força. Formado em Ciências do Desporto pela Universidade de Coimbra. 7 anos de coaching profissional.",
        certifications: ["CF-L2", "CSCS", "FMS Level 2"],
        initials: "CF",
        color: "bg-purple-500/20 text-purple-400",
      },
      {
        id: "coach-4",
        name: "Sara Costa",
        role: "Coach",
        specialty: "Endurance & Rowing",
        bio: "Triatleta profissional e especialista em condicionamento aeróbico. Traz uma abordagem científica ao treino de resistência no CrossFit.",
        certifications: ["CF-L2", "Rowing Cert", "Triathlon Coach"],
        initials: "SC",
        color: "bg-orange-500/20 text-orange-400",
      },
      {
        id: "coach-5",
        name: "João Pereira",
        role: "Coach",
        specialty: "Olympic Lifting",
        bio: "Ex-atleta olímpico e coach certificado pela Federação Portuguesa de Halterofilismo. Especializado no desenvolvimento técnico dos movimentos olímpicos.",
        certifications: ["CF-L1", "USAW Level 2", "Olympic Lifting Cert"],
        initials: "JP",
        color: "bg-red-500/20 text-red-400",
      },
      {
        id: "coach-6",
        name: "Rita Oliveira",
        role: "Coach & Nutrition",
        specialty: "Nutrition & Wellness",
        bio: "Nutricionista e CrossFit coach. Combina o conhecimento em nutrição com o coaching para resultados holísticos e sustentáveis nos atletas.",
        certifications: ["CF-L1", "Registered Dietitian", "Precision Nutrition"],
        initials: "RO",
        color: "bg-pink-500/20 text-pink-400",
      },
    ],
    products: [
      { id: "p1", name: "CrossFit Aveiro T-Shirt", price: 29.99, category: "clothing", description: "T-shirt técnica de alta qualidade, ideal para treino intenso", color: "bg-vytal-green/20", badge: "Novo" },
      { id: "p2", name: "Hoodie CrossFit Aveiro", price: 54.99, category: "clothing", description: "Hoodie premium com forro polar, perfeito para o pós-treino", color: "bg-blue-500/20" },
      { id: "p3", name: "Shorts de Treino", price: 34.99, category: "clothing", description: "Shorts leves com bolsos laterais e cintura elástica", color: "bg-purple-500/20" },
      { id: "p4", name: "Wrist Wraps Pro", price: 19.99, category: "accessories", description: "Suporte de pulso para levantamentos pesados, 60cm", color: "bg-orange-500/20" },
      { id: "p5", name: "Chalk CrossFit", price: 7.99, category: "accessories", description: "Magnésio em bloco para melhor grip nos levantamentos", color: "bg-gray-500/20" },
      { id: "p6", name: "Shaker Vytal 700ml", price: 12.99, category: "accessories", description: "Shaker com compartimento de suplementos e filtro antimissiles", color: "bg-vytal-green/20" },
      { id: "p7", name: "Proteína Whey 1kg", price: 39.99, category: "supplements", description: "Whey protein isolada, 25g de proteína por dose, sabor chocolate", color: "bg-amber-500/20", badge: "Popular" },
      { id: "p8", name: "Creatina Monohidratada", price: 24.99, category: "supplements", description: "Creatina pura 300g, comprovada para ganhos de força e massa muscular", color: "bg-blue-500/20" },
      { id: "p9", name: "Jump Rope Speed", price: 22.99, category: "equipment", description: "Corda de saltar de velocidade com cabo de aço ajustável", color: "bg-red-500/20" },
      { id: "p10", name: "Resistance Bands Set", price: 29.99, category: "equipment", description: "Set de 5 bandas elásticas de resistência variada para mobilidade", color: "bg-purple-500/20" },
    ],
    plans: [
      {
        id: "plan-1",
        name: "Aula Avulso",
        price: 15,
        period: "por aula",
        features: ["1 aula de CrossFit", "Acesso ao duche", "Sem contrato", "Reserva online"],
      },
      {
        id: "plan-2",
        name: "8 Aulas/Mês",
        price: 55,
        period: "por mês",
        features: ["8 aulas por mês", "Acesso ao duche", "Reserva online", "App de treino", "Sem inscrição"],
      },
      {
        id: "plan-3",
        name: "Ilimitado",
        price: 75,
        period: "por mês",
        features: ["Aulas ilimitadas", "Open Gym", "Acesso ao duche", "App de treino", "1 sessão PT/mês", "Desconto na loja"],
        popular: true,
        badge: "Mais Popular",
      },
      {
        id: "plan-4",
        name: "Família",
        price: 130,
        period: "por mês",
        features: ["2 membros ilimitados", "Open Gym", "Acesso ao duche", "App de treino", "2 sessões PT/mês", "20% desconto na loja"],
        badge: "Melhor Valor",
      },
    ],
  },

  "yoga-flow-porto": {
    name: "Yoga Flow Porto",
    type: "yoga_studio",
    slogan: "Find Your Balance",
    email: "hello@yogaflowporto.pt",
    phone: "+351 222 333 444",
    address: "Rua das Flores 15",
    city: "Porto",
    country: "Portugal",
    zipCode: "4050-262",
    website: "https://yogaflowporto.pt",
    instagram: "@yogaflowporto",
    schedule: [
      { day: "Segunda - Sexta", hours: "07:00 - 21:30" },
      { day: "Sábado", hours: "08:00 - 14:00" },
      { day: "Domingo", hours: "09:00 - 12:00" },
    ],
    stats: { members: 180, classes: 28, coaches: 4, rating: 4.8 },
    weeklyClasses: [
      { id: "y1", day: 0, time: "07:00", duration: 60, name: "Yoga Hatha", coach: "Inês Rodrigues", spots: 15, spotsLeft: 6, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "y2", day: 0, time: "09:30", duration: 75, name: "Vinyasa Flow", coach: "Carla Mendes", spots: 12, spotsLeft: 4, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y3", day: 0, time: "18:30", duration: 60, name: "Yin Yoga", coach: "Inês Rodrigues", spots: 12, spotsLeft: 9, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "y4", day: 1, time: "07:00", duration: 60, name: "Vinyasa Flow", coach: "Tiago Alves", spots: 15, spotsLeft: 7, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y5", day: 1, time: "10:00", duration: 60, name: "Yoga Nidra", coach: "Carla Mendes", spots: 15, spotsLeft: 12, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "y6", day: 1, time: "19:00", duration: 60, name: "Yoga Hatha", coach: "Patrícia Silva", spots: 12, spotsLeft: 3, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "y7", day: 2, time: "07:00", duration: 60, name: "Ashtanga", coach: "Inês Rodrigues", spots: 10, spotsLeft: 2, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "y8", day: 2, time: "18:30", duration: 90, name: "Vinyasa Flow", coach: "Carla Mendes", spots: 12, spotsLeft: 5, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y9", day: 3, time: "07:00", duration: 60, name: "Yoga Hatha", coach: "Tiago Alves", spots: 15, spotsLeft: 8, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "y10", day: 3, time: "19:00", duration: 60, name: "Yin Yoga", coach: "Patrícia Silva", spots: 12, spotsLeft: 6, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "y11", day: 4, time: "07:00", duration: 60, name: "Vinyasa Flow", coach: "Inês Rodrigues", spots: 15, spotsLeft: 10, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y12", day: 4, time: "12:00", duration: 60, name: "Yoga Hatha", coach: "Carla Mendes", spots: 12, spotsLeft: 4, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "y13", day: 4, time: "18:30", duration: 60, name: "Restorative Yoga", coach: "Tiago Alves", spots: 10, spotsLeft: 7, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
      { id: "y14", day: 5, time: "08:00", duration: 90, name: "Vinyasa Flow", coach: "Patrícia Silva", spots: 15, spotsLeft: 6, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y15", day: 5, time: "10:00", duration: 60, name: "Yoga Hatha", coach: "Inês Rodrigues", spots: 12, spotsLeft: 3, color: "bg-vytal-green/20 text-vytal-green border-vytal-green/30" },
      { id: "y16", day: 6, time: "09:00", duration: 90, name: "Vinyasa Suave", coach: "Carla Mendes", spots: 15, spotsLeft: 9, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { id: "y17", day: 6, time: "11:00", duration: 60, name: "Meditação", coach: "Tiago Alves", spots: 20, spotsLeft: 14, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ],
    coaches: [
      {
        id: "ycoach-1",
        name: "Inês Rodrigues",
        role: "Fundadora & Head Teacher",
        specialty: "Ashtanga & Vinyasa",
        bio: "Professora de yoga com 15 anos de prática e 10 de ensino. Formada em Mysore, Índia. Viajou por mais de 20 países aprofundando a sua prática e ensinando.",
        certifications: ["RYT-500", "Ashtanga Authorized", "Yin Yoga Cert"],
        initials: "IR",
        color: "bg-vytal-green/20 text-vytal-green",
      },
      {
        id: "ycoach-2",
        name: "Carla Mendes",
        role: "Professora",
        specialty: "Yin & Restorative Yoga",
        bio: "Especialista em yoga restaurativo e técnicas de relaxamento profundo. Psicóloga de formação, integra saúde mental e física nas suas aulas.",
        certifications: ["RYT-200", "Yin Yoga Cert", "Yoga Nidra Cert"],
        initials: "CM",
        color: "bg-purple-500/20 text-purple-400",
      },
      {
        id: "ycoach-3",
        name: "Tiago Alves",
        role: "Professor",
        specialty: "Hatha & Meditação",
        bio: "Praticante de meditação há 12 anos. Formado em filosofia budista e yoga tradicional. Combina prática física com mindfulness e meditação.",
        certifications: ["RYT-200", "Meditation Cert", "Pranayama Cert"],
        initials: "TA",
        color: "bg-blue-500/20 text-blue-400",
      },
      {
        id: "ycoach-4",
        name: "Patrícia Silva",
        role: "Professora",
        specialty: "Vinyasa & Pilates",
        bio: "Ex-bailarina clássica com transição para o yoga e pilates. Traz a precisão e elegância da dança para as suas aulas. 8 anos de ensino.",
        certifications: ["RYT-200", "Pilates Cert", "Dance Medicine"],
        initials: "PS",
        color: "bg-pink-500/20 text-pink-400",
      },
    ],
    products: [
      { id: "yp1", name: "Tapete de Yoga Premium 6mm", price: 69.99, category: "equipment", description: "Tapete antiderrapante de alta densidade, 183x61cm", color: "bg-purple-500/20", badge: "Best Seller" },
      { id: "yp2", name: "Bloco de Yoga Cork", price: 18.99, category: "accessories", description: "Bloco de cortiça natural, leve e sustentável", color: "bg-amber-500/20" },
      { id: "yp3", name: "Cinto de Yoga Orgânico", price: 14.99, category: "accessories", description: "Cinto em algodão orgânico, 183cm, com fivela metálica", color: "bg-vytal-green/20" },
      { id: "yp4", name: "Legging Yoga Flow", price: 49.99, category: "clothing", description: "Legging de alto desempenho, cintura alta, tecido respirável", color: "bg-pink-500/20", badge: "Novo" },
      { id: "yp5", name: "Top de Yoga", price: 29.99, category: "clothing", description: "Top sem costas com suporte integrado, tecido sustentável", color: "bg-blue-500/20" },
      { id: "yp6", name: "Óleo Essencial Relaxante", price: 24.99, category: "supplements", description: "Blend de lavanda e eucalipto para relaxamento pós-aula", color: "bg-purple-500/20" },
      { id: "yp7", name: "Bolsa de Tapete de Yoga", price: 22.99, category: "accessories", description: "Bolsa de lona reciclada para transporte do tapete", color: "bg-orange-500/20" },
      { id: "yp8", name: "Almofada de Meditação", price: 39.99, category: "equipment", description: "Zafu em algodão orgânico com enchimento de espelta", color: "bg-amber-500/20" },
    ],
    plans: [
      {
        id: "yplan-1",
        name: "Aula Única",
        price: 13,
        period: "por aula",
        features: ["1 aula à escolha", "Tapete disponível", "Sem inscrição"],
      },
      {
        id: "yplan-2",
        name: "Pack 10 Aulas",
        price: 99,
        period: "válido 3 meses",
        features: ["10 aulas à escolha", "Tapete disponível", "Sem data de expiração mensal"],
        popular: true,
        badge: "Mais Popular",
      },
      {
        id: "yplan-3",
        name: "Mensal Ilimitado",
        price: 65,
        period: "por mês",
        features: ["Aulas ilimitadas", "Tapete grátis", "10% loja", "Meditação online"],
      },
    ],
  },

  "iron-temple": {
    name: "Iron Temple",
    type: "weightlifting_club",
    slogan: "Lift Heavy, Live Strong",
    email: "info@irontemple.pt",
    phone: "+351 211 222 333",
    address: "Av. da Liberdade 100",
    city: "Lisboa",
    country: "Portugal",
    zipCode: "1250-096",
    website: "https://irontemple.pt",
    instagram: "@irontemple",
    youtube: "https://youtube.com/@irontemple",
    schedule: [
      { day: "Segunda - Sexta", hours: "06:00 - 22:00" },
      { day: "Sábado", hours: "08:00 - 18:00" },
      { day: "Domingo", hours: "09:00 - 14:00" },
    ],
    stats: { members: 120, classes: 20, coaches: 3, rating: 4.7 },
    weeklyClasses: [
      { id: "i1", day: 0, time: "07:00", duration: 90, name: "Powerlifting", coach: "Bruno Ferreira", spots: 8, spotsLeft: 3, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i2", day: 0, time: "12:00", duration: 60, name: "Olympic WL", coach: "Marta Coelho", spots: 8, spotsLeft: 5, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "i3", day: 0, time: "19:00", duration: 90, name: "Powerlifting", coach: "Diogo Nunes", spots: 10, spotsLeft: 4, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i4", day: 1, time: "07:00", duration: 60, name: "Olympic WL", coach: "Bruno Ferreira", spots: 8, spotsLeft: 6, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "i5", day: 1, time: "18:00", duration: 90, name: "Strongman", coach: "Diogo Nunes", spots: 6, spotsLeft: 2, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "i6", day: 2, time: "07:00", duration: 90, name: "Powerlifting", coach: "Marta Coelho", spots: 8, spotsLeft: 4, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i7", day: 2, time: "19:00", duration: 60, name: "Olympic WL", coach: "Bruno Ferreira", spots: 8, spotsLeft: 1, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "i8", day: 3, time: "07:00", duration: 90, name: "Powerlifting", coach: "Diogo Nunes", spots: 10, spotsLeft: 7, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i9", day: 3, time: "18:00", duration: 90, name: "Strongman", coach: "Bruno Ferreira", spots: 6, spotsLeft: 3, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "i10", day: 4, time: "07:00", duration: 60, name: "Olympic WL", coach: "Marta Coelho", spots: 8, spotsLeft: 5, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "i11", day: 4, time: "19:00", duration: 90, name: "Powerlifting", coach: "Diogo Nunes", spots: 10, spotsLeft: 8, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i12", day: 5, time: "09:00", duration: 120, name: "Powerlifting", coach: "Bruno Ferreira", spots: 10, spotsLeft: 5, color: "bg-red-500/20 text-red-400 border-red-500/30" },
      { id: "i13", day: 5, time: "11:30", duration: 90, name: "Olympic WL", coach: "Marta Coelho", spots: 8, spotsLeft: 4, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { id: "i14", day: 6, time: "09:00", duration: 90, name: "Strongman", coach: "Diogo Nunes", spots: 6, spotsLeft: 3, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { id: "i15", day: 6, time: "11:00", duration: 60, name: "Open Gym", coach: "Bruno Ferreira", spots: 20, spotsLeft: 12, color: "bg-vytal-muted/20 text-vytal-muted border-vytal-border" },
    ],
    coaches: [
      {
        id: "icoach-1",
        name: "Bruno Ferreira",
        role: "Fundador & Head Coach",
        specialty: "Powerlifting & Força",
        bio: "Campeão nacional de powerlifting IPF 2018 e 2021. Recordista nacional no arranque +105kg. Coach certificado com mais de 12 anos de experiência no levantamento de pesos.",
        certifications: ["IPF Coach Cert", "NSCA-CSCS", "FPH Level 3"],
        initials: "BF",
        color: "bg-red-500/20 text-red-400",
      },
      {
        id: "icoach-2",
        name: "Marta Coelho",
        role: "Coach de Halterofilismo",
        specialty: "Olympic Weightlifting",
        bio: "Ex-atleta olímpica, participante nos Jogos Olímpicos de Tóquio 2020. Treinadora certificada pela IWF com foco no desenvolvimento técnico dos levantamentos olímpicos.",
        certifications: ["IWF Level 3", "USAW Level 2", "FPH Coach"],
        initials: "MC",
        color: "bg-blue-500/20 text-blue-400",
      },
      {
        id: "icoach-3",
        name: "Diogo Nunes",
        role: "Coach de Strongman",
        specialty: "Strongman & Força Funcional",
        bio: "Atleta de strongman com 8 anos de competição profissional. Top 5 no Strongman Champions League. Traz a mentalidade competitiva para o treino de todos os atletas.",
        certifications: ["SCL Coach", "NSCA-CPT", "Kettlebell Cert"],
        initials: "DN",
        color: "bg-orange-500/20 text-orange-400",
      },
    ],
    products: [
      { id: "ip1", name: "Cinto de Levantamento IPF", price: 89.99, category: "equipment", description: "Cinto de couro genuíno aprovado pela IPF, 10cm, fivela simples", color: "bg-amber-500/20", badge: "Pro" },
      { id: "ip2", name: "Straps de Levantamento", price: 14.99, category: "accessories", description: "Straps de algodão reforçado para deadlift e rows", color: "bg-gray-500/20" },
      { id: "ip3", name: "Chalk Magnésio 500g", price: 12.99, category: "accessories", description: "Magnésio em bloco 500g para grip máximo", color: "bg-gray-400/20" },
      { id: "ip4", name: "Knee Sleeves 7mm", price: 49.99, category: "equipment", description: "Joelheiras de neoprene 7mm aprovadas IPF, par", color: "bg-red-500/20", badge: "Best Seller" },
      { id: "ip5", name: "Elbow Sleeves", price: 34.99, category: "equipment", description: "Cotovelos de neoprene 5mm para bench press e overhead", color: "bg-blue-500/20" },
      { id: "ip6", name: "Iron Temple T-Shirt", price: 24.99, category: "clothing", description: "T-shirt de algodão premium com logo bordado", color: "bg-red-500/20" },
      { id: "ip7", name: "Creatina + Beta-Alanina", price: 34.99, category: "supplements", description: "Stack de força com creatina monohidratada e beta-alanina", color: "bg-orange-500/20" },
      { id: "ip8", name: "Proteína Whey Gold", price: 54.99, category: "supplements", description: "Whey protein de alta qualidade, 2kg, sabor baunilha ou chocolate", color: "bg-amber-500/20", badge: "Novo" },
      { id: "ip9", name: "Grip Pad Pro", price: 17.99, category: "accessories", description: "Pad de grip para proteger as mãos nos puxões", color: "bg-gray-500/20" },
    ],
    plans: [
      {
        id: "iplan-1",
        name: "Drop-in",
        price: 20,
        period: "por sessão",
        features: ["1 sessão de treino", "Acesso ao ginásio", "Sem contrato"],
      },
      {
        id: "iplan-2",
        name: "Mensal",
        price: 80,
        period: "por mês",
        features: ["Acesso ilimitado", "Open gym", "Programação incluída", "App de treino"],
        popular: true,
        badge: "Mais Popular",
      },
      {
        id: "iplan-3",
        name: "Coaching Online",
        price: 120,
        period: "por mês",
        features: ["Programação personalizada", "Vídeo análise", "Mensagens ilimitadas", "Check-ins semanais", "Acesso ginásio"],
        badge: "Premium",
      },
    ],
  },
};
