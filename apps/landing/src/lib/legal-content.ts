// ── Legal document content ───────────────────────────────────────────────────
// Substantive, Portugal-appropriate legal boilerplate for a SaaS operating under
// RGPD (Regulamento Geral de Proteção de Dados). Trilingual (PT/EN/ES). Kept
// out of copy.ts because of its size · consumed by app/legal/[doc]/page.tsx.
import type { Lang } from "@/lib/copy";

export const LEGAL_SLUGS = ["terms", "privacy", "gdpr", "cookies", "dpa"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

type LegalContent = Record<Lang, Record<LegalSlug, LegalDoc>>;

export const LEGAL_CONTENT: LegalContent = {
  pt: {
    terms: {
      title: "Termos de Serviço",
      intro:
        "Estes Termos de Serviço regem a utilização da plataforma Vytal, disponibilizada pela Vytal, com sede em Aveiro, Portugal. Ao criar uma conta ou utilizar os nossos serviços, aceita estes termos.",
      sections: [
        {
          heading: "1. Objeto e âmbito",
          body: [
            "A Vytal disponibiliza software de gestão para espaços de fitness e wellness, incluindo gestão de membros, aulas, pagamentos, CRM e website público.",
            "Estes termos aplicam-se a todos os utilizadores, sejam gestores, staff ou atletas, que acedam à plataforma através da web ou das aplicações móveis.",
          ],
        },
        {
          heading: "2. Conta e responsabilidade",
          body: [
            "O utilizador é responsável por manter a confidencialidade das suas credenciais e por toda a atividade realizada na sua conta.",
            "Deve fornecer informação verdadeira e mantê-la atualizada. Contas com informação falsa ou utilização abusiva podem ser suspensas.",
          ],
        },
        {
          heading: "3. Planos e pagamentos",
          body: [
            "Os planos pagos são faturados de forma mensal ou anual, conforme o plano escolhido. Os valores são apresentados em euros e podem incluir IVA à taxa legal em vigor.",
            "A falta de pagamento pode levar à suspensão do acesso às funcionalidades pagas. Pode cancelar a qualquer momento; o cancelamento produz efeitos no fim do período já faturado.",
          ],
        },
        {
          heading: "4. Utilização aceitável",
          body: [
            "É proibido utilizar a plataforma para fins ilícitos, para carregar conteúdo que viole direitos de terceiros ou para tentar comprometer a segurança do serviço.",
            "Reservamo-nos o direito de remover conteúdo ou suspender contas que violem estas regras.",
          ],
        },
        {
          heading: "5. Propriedade intelectual",
          body: [
            "A plataforma, o software, a marca e todos os materiais associados são propriedade da Vytal. Os dados que o cliente introduz permanecem propriedade do cliente.",
          ],
        },
        {
          heading: "6. Limitação de responsabilidade",
          body: [
            "A Vytal esforça-se por manter o serviço disponível e seguro, mas não garante disponibilidade ininterrupta. Na medida permitida por lei, a nossa responsabilidade limita-se aos montantes pagos pelo cliente nos 12 meses anteriores.",
          ],
        },
        {
          heading: "7. Lei aplicável",
          body: [
            "Estes termos regem-se pela lei portuguesa. Para a resolução de litígios é competente o foro da comarca de Aveiro, sem prejuízo dos direitos do consumidor previstos na lei.",
          ],
        },
        {
          heading: "8. Contacto",
          body: ["Para questões sobre estes termos, contacte-nos através de geral@vytal.fit."],
        },
      ],
    },
    privacy: {
      title: "Política de Privacidade",
      intro:
        "A sua privacidade é importante para nós. Esta política explica que dados pessoais recolhemos, como os utilizamos e quais os seus direitos, em conformidade com o RGPD.",
      sections: [
        {
          heading: "1. Responsável pelo tratamento",
          body: [
            "A Vytal, com sede em Aveiro, Portugal, é a responsável pelo tratamento dos dados pessoais recolhidos através da plataforma. Pode contactar-nos em privacidade@vytal.fit.",
          ],
        },
        {
          heading: "2. Dados que recolhemos",
          body: [
            "Recolhemos dados de conta (nome, email), dados de faturação, dados de utilização da plataforma e, quando aplicável, dados dos membros geridos pelos nossos clientes.",
            "Recolhemos apenas os dados necessários para prestar o serviço.",
          ],
        },
        {
          heading: "3. Finalidades e fundamento legal",
          body: [
            "Tratamos os dados para executar o contrato de prestação de serviços, cumprir obrigações legais (por exemplo, fiscais) e, com o seu consentimento, para comunicações de marketing.",
          ],
        },
        {
          heading: "4. Partilha de dados",
          body: [
            "Não vendemos dados pessoais. Partilhamos dados apenas com subcontratantes necessários à prestação do serviço (alojamento, pagamentos, email), sempre sujeitos a obrigações de confidencialidade.",
          ],
        },
        {
          heading: "5. Conservação",
          body: [
            "Conservamos os dados pelo período necessário às finalidades descritas ou pelo prazo exigido por lei. Após esse período, os dados são eliminados ou anonimizados.",
          ],
        },
        {
          heading: "6. Segurança",
          body: [
            "Os dados são alojados na União Europeia, com encriptação em trânsito e em repouso, controlo de acessos por perfil e backups regulares.",
          ],
        },
        {
          heading: "7. Os seus direitos",
          body: [
            "Tem direito de acesso, retificação, apagamento, limitação, portabilidade e oposição ao tratamento dos seus dados. Pode exercer estes direitos em privacidade@vytal.fit e apresentar reclamação junto da CNPD.",
          ],
        },
      ],
    },
    gdpr: {
      title: "RGPD · Proteção de Dados",
      intro:
        "A Vytal está comprometida com o cumprimento do Regulamento Geral de Proteção de Dados (RGPD, Regulamento (UE) 2016/679). Esta página resume as medidas que aplicamos.",
      sections: [
        {
          heading: "1. Princípios",
          body: [
            "Tratamos dados de forma lícita, leal e transparente, limitada às finalidades declaradas, minimizada ao necessário e mantida com exatidão e segurança.",
          ],
        },
        {
          heading: "2. Papéis: responsável e subcontratante",
          body: [
            "Relativamente aos dados dos nossos clientes diretos, a Vytal é responsável pelo tratamento. Relativamente aos dados que os clientes carregam sobre os seus membros, a Vytal atua como subcontratante, nos termos do nosso DPA.",
          ],
        },
        {
          heading: "3. Direitos dos titulares",
          body: [
            "Garantimos o exercício dos direitos de acesso, retificação, apagamento (direito a ser esquecido), limitação, portabilidade e oposição. Os pedidos são respondidos no prazo legal de 30 dias.",
          ],
        },
        {
          heading: "4. Transferências internacionais",
          body: [
            "Os dados são alojados na União Europeia. Caso alguma transferência para fora do EEE seja necessária, aplicamos cláusulas contratuais-tipo aprovadas pela Comissão Europeia.",
          ],
        },
        {
          heading: "5. Violações de dados",
          body: [
            "Em caso de violação de dados pessoais que represente risco, notificamos a CNPD no prazo de 72 horas e, quando aplicável, os titulares afetados.",
          ],
        },
        {
          heading: "6. Encarregado de Proteção de Dados",
          body: [
            "Pode contactar o nosso encarregado de proteção de dados (DPO) em dpo@vytal.fit para qualquer questão relacionada com proteção de dados.",
          ],
        },
      ],
    },
    cookies: {
      title: "Política de Cookies",
      intro:
        "Esta política explica o que são cookies, quais utilizamos e como pode geri-los. Utilizamos cookies para fazer a plataforma funcionar e para melhorar a sua experiência.",
      sections: [
        {
          heading: "1. O que são cookies",
          body: [
            "Cookies são pequenos ficheiros de texto guardados no seu dispositivo quando visita um site. Permitem lembrar preferências e reconhecer sessões.",
          ],
        },
        {
          heading: "2. Cookies essenciais",
          body: [
            "São necessários para o funcionamento da plataforma, incluindo autenticação e segurança. Sem estes, o serviço não funciona. Não requerem consentimento.",
          ],
        },
        {
          heading: "3. Cookies de preferências",
          body: [
            "Guardam escolhas como o idioma (PT/EN/ES) e o tema (claro/escuro), para que a sua experiência seja consistente entre visitas.",
          ],
        },
        {
          heading: "4. Cookies analíticos",
          body: [
            "Ajudam-nos a compreender como a plataforma é utilizada, de forma agregada, para a melhorarmos. Estes cookies só são ativados com o seu consentimento.",
          ],
        },
        {
          heading: "5. Como gerir cookies",
          body: [
            "Pode gerir ou apagar cookies nas definições do seu navegador. A desativação de cookies essenciais pode afetar o funcionamento da plataforma.",
          ],
        },
      ],
    },
    dpa: {
      title: "DPA · Acordo de Processamento de Dados",
      intro:
        "Este Acordo de Processamento de Dados (DPA) regula o tratamento de dados pessoais que a Vytal, enquanto subcontratante, realiza por conta dos seus clientes (responsáveis pelo tratamento), nos termos do artigo 28.º do RGPD.",
      sections: [
        {
          heading: "1. Objeto",
          body: [
            "A Vytal trata dados pessoais dos membros e contactos que o cliente carrega na plataforma, exclusivamente para prestar os serviços contratados e de acordo com as instruções documentadas do cliente.",
          ],
        },
        {
          heading: "2. Obrigações da Vytal",
          body: [
            "Tratamos os dados apenas segundo as instruções do cliente, garantimos a confidencialidade de quem os trata, aplicamos medidas técnicas e organizativas adequadas e apoiamos o cliente no cumprimento das suas obrigações.",
          ],
        },
        {
          heading: "3. Subcontratantes ulteriores",
          body: [
            "Recorremos a subcontratantes (alojamento, pagamentos, email) que cumprem obrigações equivalentes às deste acordo. Informamos o cliente de alterações e permitimos oposição fundamentada.",
          ],
        },
        {
          heading: "4. Segurança",
          body: [
            "Aplicamos encriptação, controlo de acessos, registo de atividade e backups. As medidas são revistas periodicamente face ao estado da técnica.",
          ],
        },
        {
          heading: "5. Notificação de violações",
          body: [
            "Notificamos o cliente sem demora injustificada após tomar conhecimento de qualquer violação de dados pessoais, com a informação necessária para o cliente cumprir os seus deveres de notificação.",
          ],
        },
        {
          heading: "6. Devolução e eliminação",
          body: [
            "No fim da prestação dos serviços, e a pedido do cliente, devolvemos ou eliminamos os dados pessoais, salvo obrigação legal de conservação.",
          ],
        },
        {
          heading: "7. Auditoria",
          body: [
            "Disponibilizamos ao cliente a informação necessária para demonstrar o cumprimento deste acordo e cooperamos em auditorias razoáveis.",
          ],
        },
      ],
    },
  },
  en: {
    terms: {
      title: "Terms of Service",
      intro:
        "These Terms of Service govern the use of the Vytal platform, provided by Vytal, based in Aveiro, Portugal. By creating an account or using our services, you accept these terms.",
      sections: [
        {
          heading: "1. Purpose and scope",
          body: [
            "Vytal provides management software for fitness and wellness spaces, including member management, classes, payments, CRM and a public website.",
            "These terms apply to all users · managers, staff or athletes · who access the platform via the web or the mobile apps.",
          ],
        },
        {
          heading: "2. Account and responsibility",
          body: [
            "You are responsible for keeping your credentials confidential and for all activity carried out under your account.",
            "You must provide accurate information and keep it up to date. Accounts with false information or abusive use may be suspended.",
          ],
        },
        {
          heading: "3. Plans and payments",
          body: [
            "Paid plans are billed monthly or annually, depending on the chosen plan. Prices are shown in euros and may include VAT at the applicable legal rate.",
            "Non-payment may lead to suspension of access to paid features. You can cancel at any time; cancellation takes effect at the end of the period already billed.",
          ],
        },
        {
          heading: "4. Acceptable use",
          body: [
            "It is prohibited to use the platform for unlawful purposes, to upload content that infringes third-party rights, or to attempt to compromise the security of the service.",
            "We reserve the right to remove content or suspend accounts that breach these rules.",
          ],
        },
        {
          heading: "5. Intellectual property",
          body: [
            "The platform, software, brand and all associated materials are the property of Vytal. Data entered by the customer remains the property of the customer.",
          ],
        },
        {
          heading: "6. Limitation of liability",
          body: [
            "Vytal strives to keep the service available and secure but does not guarantee uninterrupted availability. To the extent permitted by law, our liability is limited to the amounts paid by the customer in the preceding 12 months.",
          ],
        },
        {
          heading: "7. Governing law",
          body: [
            "These terms are governed by Portuguese law. The courts of Aveiro are competent for the resolution of disputes, without prejudice to consumer rights provided by law.",
          ],
        },
        {
          heading: "8. Contact",
          body: ["For questions about these terms, contact us at geral@vytal.fit."],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "Your privacy matters to us. This policy explains what personal data we collect, how we use it and what your rights are, in accordance with the GDPR (RGPD in Portugal).",
      sections: [
        {
          heading: "1. Data controller",
          body: [
            "Vytal, based in Aveiro, Portugal, is the controller for personal data collected through the platform. You can contact us at privacidade@vytal.fit.",
          ],
        },
        {
          heading: "2. Data we collect",
          body: [
            "We collect account data (name, email), billing data, platform usage data and, where applicable, data about members managed by our customers.",
            "We only collect the data necessary to provide the service.",
          ],
        },
        {
          heading: "3. Purposes and legal basis",
          body: [
            "We process data to perform the service contract, to comply with legal obligations (for example, tax obligations) and, with your consent, for marketing communications.",
          ],
        },
        {
          heading: "4. Data sharing",
          body: [
            "We do not sell personal data. We share data only with processors necessary to provide the service (hosting, payments, email), always subject to confidentiality obligations.",
          ],
        },
        {
          heading: "5. Retention",
          body: [
            "We retain data for as long as necessary for the described purposes or for the period required by law. After that period, data is deleted or anonymized.",
          ],
        },
        {
          heading: "6. Security",
          body: [
            "Data is hosted in the European Union, with encryption in transit and at rest, role-based access control and regular backups.",
          ],
        },
        {
          heading: "7. Your rights",
          body: [
            "You have the right to access, rectify, erase, restrict, port and object to the processing of your data. You can exercise these rights at privacidade@vytal.fit and lodge a complaint with the Portuguese authority (CNPD).",
          ],
        },
      ],
    },
    gdpr: {
      title: "GDPR · Data Protection",
      intro:
        "Vytal is committed to complying with the General Data Protection Regulation (GDPR, Regulation (EU) 2016/679, known as RGPD in Portugal). This page summarizes the measures we apply.",
      sections: [
        {
          heading: "1. Principles",
          body: [
            "We process data lawfully, fairly and transparently, limited to the stated purposes, minimized to what is necessary and kept accurate and secure.",
          ],
        },
        {
          heading: "2. Roles: controller and processor",
          body: [
            "For the data of our direct customers, Vytal is the controller. For data that customers upload about their members, Vytal acts as a processor, under our DPA.",
          ],
        },
        {
          heading: "3. Data subject rights",
          body: [
            "We guarantee the exercise of the rights of access, rectification, erasure (right to be forgotten), restriction, portability and objection. Requests are answered within the legal 30-day period.",
          ],
        },
        {
          heading: "4. International transfers",
          body: [
            "Data is hosted in the European Union. Should any transfer outside the EEA be necessary, we apply Standard Contractual Clauses approved by the European Commission.",
          ],
        },
        {
          heading: "5. Data breaches",
          body: [
            "In the event of a personal data breach that poses a risk, we notify the supervisory authority (CNPD) within 72 hours and, where applicable, the affected data subjects.",
          ],
        },
        {
          heading: "6. Data Protection Officer",
          body: [
            "You can contact our Data Protection Officer (DPO) at dpo@vytal.fit for any data-protection matter.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      intro:
        "This policy explains what cookies are, which ones we use and how you can manage them. We use cookies to make the platform work and to improve your experience.",
      sections: [
        {
          heading: "1. What cookies are",
          body: [
            "Cookies are small text files stored on your device when you visit a site. They let us remember preferences and recognize sessions.",
          ],
        },
        {
          heading: "2. Essential cookies",
          body: [
            "These are required for the platform to work, including authentication and security. Without them, the service does not function. They do not require consent.",
          ],
        },
        {
          heading: "3. Preference cookies",
          body: [
            "These store choices such as language (PT/EN/ES) and theme (light/dark), so your experience is consistent between visits.",
          ],
        },
        {
          heading: "4. Analytics cookies",
          body: [
            "These help us understand, in aggregate, how the platform is used so we can improve it. They are only enabled with your consent.",
          ],
        },
        {
          heading: "5. Managing cookies",
          body: [
            "You can manage or delete cookies in your browser settings. Disabling essential cookies may affect how the platform works.",
          ],
        },
      ],
    },
    dpa: {
      title: "DPA · Data Processing Agreement",
      intro:
        "This Data Processing Agreement (DPA) governs the processing of personal data that Vytal, as processor, carries out on behalf of its customers (controllers), under Article 28 of the GDPR.",
      sections: [
        {
          heading: "1. Subject matter",
          body: [
            "Vytal processes personal data of the members and contacts that the customer uploads to the platform, exclusively to provide the contracted services and in accordance with the customer's documented instructions.",
          ],
        },
        {
          heading: "2. Vytal's obligations",
          body: [
            "We process data only on the customer's instructions, ensure the confidentiality of those handling it, apply appropriate technical and organizational measures, and support the customer in meeting its obligations.",
          ],
        },
        {
          heading: "3. Sub-processors",
          body: [
            "We use sub-processors (hosting, payments, email) that meet obligations equivalent to those in this agreement. We inform the customer of changes and allow reasoned objection.",
          ],
        },
        {
          heading: "4. Security",
          body: [
            "We apply encryption, access control, activity logging and backups. Measures are reviewed periodically against the state of the art.",
          ],
        },
        {
          heading: "5. Breach notification",
          body: [
            "We notify the customer without undue delay after becoming aware of any personal data breach, with the information needed for the customer to meet its notification duties.",
          ],
        },
        {
          heading: "6. Return and deletion",
          body: [
            "At the end of the services, and at the customer's request, we return or delete personal data, except where a legal retention obligation applies.",
          ],
        },
        {
          heading: "7. Audit",
          body: [
            "We make available to the customer the information necessary to demonstrate compliance with this agreement and cooperate with reasonable audits.",
          ],
        },
      ],
    },
  },
  es: {
    terms: {
      title: "Términos de Servicio",
      intro:
        "Estos Términos de Servicio rigen el uso de la plataforma Vytal, proporcionada por Vytal, con sede en Aveiro, Portugal. Al crear una cuenta o usar nuestros servicios, aceptas estos términos.",
      sections: [
        {
          heading: "1. Objeto y ámbito",
          body: [
            "Vytal proporciona software de gestión para espacios de fitness y wellness, incluyendo gestión de miembros, clases, pagos, CRM y sitio web público.",
            "Estos términos se aplican a todos los usuarios · gestores, staff o atletas · que accedan a la plataforma a través de la web o de las aplicaciones móviles.",
          ],
        },
        {
          heading: "2. Cuenta y responsabilidad",
          body: [
            "El usuario es responsable de mantener la confidencialidad de sus credenciales y de toda la actividad realizada en su cuenta.",
            "Debe proporcionar información veraz y mantenerla actualizada. Las cuentas con información falsa o uso abusivo pueden ser suspendidas.",
          ],
        },
        {
          heading: "3. Planes y pagos",
          body: [
            "Los planes de pago se facturan de forma mensual o anual, según el plan elegido. Los importes se muestran en euros y pueden incluir IVA al tipo legal vigente.",
            "La falta de pago puede llevar a la suspensión del acceso a las funcionalidades de pago. Puedes cancelar en cualquier momento; la cancelación surte efecto al final del periodo ya facturado.",
          ],
        },
        {
          heading: "4. Uso aceptable",
          body: [
            "Está prohibido usar la plataforma para fines ilícitos, para cargar contenido que viole derechos de terceros o para intentar comprometer la seguridad del servicio.",
            "Nos reservamos el derecho de eliminar contenido o suspender cuentas que infrinjan estas reglas.",
          ],
        },
        {
          heading: "5. Propiedad intelectual",
          body: [
            "La plataforma, el software, la marca y todos los materiales asociados son propiedad de Vytal. Los datos que introduce el cliente siguen siendo propiedad del cliente.",
          ],
        },
        {
          heading: "6. Limitación de responsabilidad",
          body: [
            "Vytal se esfuerza por mantener el servicio disponible y seguro, pero no garantiza una disponibilidad ininterrumpida. En la medida permitida por la ley, nuestra responsabilidad se limita a los importes pagados por el cliente en los 12 meses anteriores.",
          ],
        },
        {
          heading: "7. Ley aplicable",
          body: [
            "Estos términos se rigen por la ley portuguesa. Para la resolución de litigios es competente el foro de Aveiro, sin perjuicio de los derechos del consumidor previstos por la ley.",
          ],
        },
        {
          heading: "8. Contacto",
          body: ["Para cuestiones sobre estos términos, contáctanos en geral@vytal.fit."],
        },
      ],
    },
    privacy: {
      title: "Política de Privacidad",
      intro:
        "Tu privacidad es importante para nosotros. Esta política explica qué datos personales recogemos, cómo los usamos y cuáles son tus derechos, conforme al RGPD.",
      sections: [
        {
          heading: "1. Responsable del tratamiento",
          body: [
            "Vytal, con sede en Aveiro, Portugal, es la responsable del tratamiento de los datos personales recogidos a través de la plataforma. Puedes contactarnos en privacidade@vytal.fit.",
          ],
        },
        {
          heading: "2. Datos que recogemos",
          body: [
            "Recogemos datos de cuenta (nombre, email), datos de facturación, datos de uso de la plataforma y, cuando corresponde, datos de los miembros gestionados por nuestros clientes.",
            "Solo recogemos los datos necesarios para prestar el servicio.",
          ],
        },
        {
          heading: "3. Finalidades y base legal",
          body: [
            "Tratamos los datos para ejecutar el contrato de prestación de servicios, cumplir obligaciones legales (por ejemplo, fiscales) y, con tu consentimiento, para comunicaciones de marketing.",
          ],
        },
        {
          heading: "4. Compartición de datos",
          body: [
            "No vendemos datos personales. Compartimos datos solo con encargados necesarios para la prestación del servicio (alojamiento, pagos, email), siempre sujetos a obligaciones de confidencialidad.",
          ],
        },
        {
          heading: "5. Conservación",
          body: [
            "Conservamos los datos durante el tiempo necesario para las finalidades descritas o el plazo exigido por la ley. Tras ese periodo, los datos se eliminan o anonimizan.",
          ],
        },
        {
          heading: "6. Seguridad",
          body: [
            "Los datos se alojan en la Unión Europea, con encriptación en tránsito y en reposo, control de accesos por perfil y backups regulares.",
          ],
        },
        {
          heading: "7. Tus derechos",
          body: [
            "Tienes derecho de acceso, rectificación, supresión, limitación, portabilidad y oposición al tratamiento de tus datos. Puedes ejercerlos en privacidade@vytal.fit y presentar reclamación ante la autoridad portuguesa (CNPD).",
          ],
        },
      ],
    },
    gdpr: {
      title: "RGPD · Protección de Datos",
      intro:
        "Vytal está comprometida con el cumplimiento del Reglamento General de Protección de Datos (RGPD, Reglamento (UE) 2016/679). Esta página resume las medidas que aplicamos.",
      sections: [
        {
          heading: "1. Principios",
          body: [
            "Tratamos los datos de forma lícita, leal y transparente, limitada a las finalidades declaradas, minimizada a lo necesario y mantenida con exactitud y seguridad.",
          ],
        },
        {
          heading: "2. Roles: responsable y encargado",
          body: [
            "Respecto a los datos de nuestros clientes directos, Vytal es la responsable del tratamiento. Respecto a los datos que los clientes cargan sobre sus miembros, Vytal actúa como encargada, conforme a nuestro DPA.",
          ],
        },
        {
          heading: "3. Derechos de los interesados",
          body: [
            "Garantizamos el ejercicio de los derechos de acceso, rectificación, supresión (derecho al olvido), limitación, portabilidad y oposición. Las solicitudes se responden en el plazo legal de 30 días.",
          ],
        },
        {
          heading: "4. Transferencias internacionales",
          body: [
            "Los datos se alojan en la Unión Europea. Si fuera necesaria alguna transferencia fuera del EEE, aplicamos cláusulas contractuales tipo aprobadas por la Comisión Europea.",
          ],
        },
        {
          heading: "5. Violaciones de datos",
          body: [
            "En caso de violación de datos personales que suponga un riesgo, notificamos a la autoridad (CNPD) en un plazo de 72 horas y, cuando corresponda, a los interesados afectados.",
          ],
        },
        {
          heading: "6. Delegado de Protección de Datos",
          body: [
            "Puedes contactar a nuestro delegado de protección de datos (DPO) en dpo@vytal.fit para cualquier cuestión relacionada con la protección de datos.",
          ],
        },
      ],
    },
    cookies: {
      title: "Política de Cookies",
      intro:
        "Esta política explica qué son las cookies, cuáles usamos y cómo puedes gestionarlas. Usamos cookies para que la plataforma funcione y para mejorar tu experiencia.",
      sections: [
        {
          heading: "1. Qué son las cookies",
          body: [
            "Las cookies son pequeños archivos de texto que se guardan en tu dispositivo cuando visitas un sitio. Permiten recordar preferencias y reconocer sesiones.",
          ],
        },
        {
          heading: "2. Cookies esenciales",
          body: [
            "Son necesarias para el funcionamiento de la plataforma, incluyendo autenticación y seguridad. Sin ellas, el servicio no funciona. No requieren consentimiento.",
          ],
        },
        {
          heading: "3. Cookies de preferencias",
          body: [
            "Guardan elecciones como el idioma (PT/EN/ES) y el tema (claro/oscuro), para que tu experiencia sea consistente entre visitas.",
          ],
        },
        {
          heading: "4. Cookies analíticas",
          body: [
            "Nos ayudan a entender, de forma agregada, cómo se usa la plataforma para mejorarla. Solo se activan con tu consentimiento.",
          ],
        },
        {
          heading: "5. Cómo gestionar las cookies",
          body: [
            "Puedes gestionar o eliminar cookies en la configuración de tu navegador. Desactivar las cookies esenciales puede afectar al funcionamiento de la plataforma.",
          ],
        },
      ],
    },
    dpa: {
      title: "DPA · Acuerdo de Procesamiento de Datos",
      intro:
        "Este Acuerdo de Procesamiento de Datos (DPA) regula el tratamiento de datos personales que Vytal, como encargada, realiza por cuenta de sus clientes (responsables del tratamiento), conforme al artículo 28 del RGPD.",
      sections: [
        {
          heading: "1. Objeto",
          body: [
            "Vytal trata datos personales de los miembros y contactos que el cliente carga en la plataforma, exclusivamente para prestar los servicios contratados y de acuerdo con las instrucciones documentadas del cliente.",
          ],
        },
        {
          heading: "2. Obligaciones de Vytal",
          body: [
            "Tratamos los datos solo según las instrucciones del cliente, garantizamos la confidencialidad de quienes los tratan, aplicamos medidas técnicas y organizativas adecuadas y apoyamos al cliente en el cumplimiento de sus obligaciones.",
          ],
        },
        {
          heading: "3. Subencargados",
          body: [
            "Recurrimos a subencargados (alojamiento, pagos, email) que cumplen obligaciones equivalentes a las de este acuerdo. Informamos al cliente de los cambios y permitimos oposición fundamentada.",
          ],
        },
        {
          heading: "4. Seguridad",
          body: [
            "Aplicamos encriptación, control de accesos, registro de actividad y backups. Las medidas se revisan periódicamente según el estado de la técnica.",
          ],
        },
        {
          heading: "5. Notificación de violaciones",
          body: [
            "Notificamos al cliente sin demora indebida tras tener conocimiento de cualquier violación de datos personales, con la información necesaria para que el cliente cumpla sus deberes de notificación.",
          ],
        },
        {
          heading: "6. Devolución y eliminación",
          body: [
            "Al finalizar los servicios, y a petición del cliente, devolvemos o eliminamos los datos personales, salvo obligación legal de conservación.",
          ],
        },
        {
          heading: "7. Auditoría",
          body: [
            "Ponemos a disposición del cliente la información necesaria para demostrar el cumplimiento de este acuerdo y cooperamos en auditorías razonables.",
          ],
        },
      ],
    },
  },
};
