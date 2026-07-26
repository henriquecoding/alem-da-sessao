export const locales = ["pt-PT", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export type LocaleSegment = "pt-pt" | "pt-br";

export const defaultLocale: Locale = "pt-PT";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isLocaleSegment(value: string): value is LocaleSegment {
  return value === "pt-pt" || value === "pt-br";
}

export function localeFromSegment(segment: string): Locale {
  return segment.toLowerCase() === "pt-br" ? "pt-BR" : "pt-PT";
}

export function segmentFromLocale(locale: Locale): LocaleSegment {
  return locale === "pt-BR" ? "pt-br" : "pt-pt";
}

const ptPT = {
  localeLabel: "Português (Portugal)",
  common: {
    brand: "Além da Sessão",
    localPreview: "Ambiente local · dados fictícios",
    openMenu: "Abrir navegação",
    closeMenu: "Fechar navegação",
    switchArea: "Mudar de área",
    viewAll: "Ver tudo",
    continue: "Continuar",
    back: "Voltar",
  },
  public: {
    eyebrow: "Continuidade terapêutica, com presença humana",
    title: "O cuidado não precisa de desaparecer entre duas sessões.",
    description:
      "Um espaço para profissionais organizarem a sua prática e para clientes transformarem o que acontece entre sessões em matéria útil para a próxima conversa — sempre com escolha, contexto e privacidade.",
    primaryAction: "Explorar a demonstração",
    secondaryAction: "Conhecer as experiências",
    professionalTitle: "Menos trabalho disperso. Mais atenção ao que importa.",
    clientTitle: "Um lugar para continuar sem ser observado.",
    trustLine:
      "Não diagnostica, não prescreve e não substitui o acompanhamento profissional.",
  },
  nav: {
    today: "Hoje",
    schedule: "Agenda",
    clients: "Clientes",
    experiences: "Experiências",
    finance: "Financeiro",
    reports: "Relatórios",
    team: "Equipa",
    settings: "Definições",
    sessions: "Sessões",
    shares: "Partilhas",
    account: "Conta",
    operation: "Operação",
  },
  professional: {
    greeting: "Bom dia, Inês.",
    subtitle: "O que precisa da sua atenção hoje, sem ruído.",
    nextSession: "Próxima sessão",
    todaySchedule: "Agenda de hoje",
    pending: "Pendências",
    newRequests: "Novos pedidos",
    unsignedNotes: "Notas por assinar",
    sharedExperiences: "Partilhas por rever",
    pendingPayments: "Pagamentos pendentes",
    openClient: "Abrir cliente",
    synthetic: "Informação inteiramente fictícia para validação local.",
  },
  client: {
    greeting: "Boa tarde, Marta.",
    subtitle: "Hoje pode escolher uma coisa de cada vez.",
    nextSession: "A sua próxima sessão",
    assignedExperience: "Experiência disponível",
    privateByDefault: "Privado até decidir partilhar",
    resume: "Continuar experiência",
    privacyTitle: "O que guarda não é partilhado automaticamente.",
    privacyBody:
      "Antes de qualquer partilha, verá exatamente o que o profissional poderá consultar.",
  },
  admin: {
    title: "Operação da plataforma",
    subtitle:
      "Assinaturas, verificações e saúde técnica — sem acesso clínico normal.",
  },
};

const ptBR: typeof ptPT = {
  localeLabel: "Português (Brasil)",
  common: {
    brand: "Além da Sessão",
    localPreview: "Ambiente local · dados fictícios",
    openMenu: "Abrir navegação",
    closeMenu: "Fechar navegação",
    switchArea: "Mudar de área",
    viewAll: "Ver tudo",
    continue: "Continuar",
    back: "Voltar",
  },
  public: {
    eyebrow: "Continuidade terapêutica, com presença humana",
    title: "O cuidado não precisa desaparecer entre duas sessões.",
    description:
      "Um espaço para profissionais organizarem sua prática e para clientes transformarem o que acontece entre sessões em material útil para a próxima conversa — sempre com escolha, contexto e privacidade.",
    primaryAction: "Explorar a demonstração",
    secondaryAction: "Conhecer as experiências",
    professionalTitle: "Menos trabalho disperso. Mais atenção ao que importa.",
    clientTitle: "Um lugar para continuar sem ser observado.",
    trustLine:
      "Não diagnostica, não prescreve e não substitui o acompanhamento profissional.",
  },
  nav: {
    today: "Hoje",
    schedule: "Agenda",
    clients: "Clientes",
    experiences: "Experiências",
    finance: "Financeiro",
    reports: "Relatórios",
    team: "Equipe",
    settings: "Configurações",
    sessions: "Sessões",
    shares: "Compartilhamentos",
    account: "Conta",
    operation: "Operação",
  },
  professional: {
    greeting: "Bom dia, Inês.",
    subtitle: "O que precisa da sua atenção hoje, sem ruído.",
    nextSession: "Próxima sessão",
    todaySchedule: "Agenda de hoje",
    pending: "Pendências",
    newRequests: "Novos pedidos",
    unsignedNotes: "Notas para assinar",
    sharedExperiences: "Compartilhamentos para revisar",
    pendingPayments: "Pagamentos pendentes",
    openClient: "Abrir cliente",
    synthetic: "Informações inteiramente fictícias para validação local.",
  },
  client: {
    greeting: "Boa tarde, Marta.",
    subtitle: "Hoje você pode escolher uma coisa de cada vez.",
    nextSession: "Sua próxima sessão",
    assignedExperience: "Experiência disponível",
    privateByDefault: "Privado até você decidir compartilhar",
    resume: "Continuar experiência",
    privacyTitle: "O que você salva não é compartilhado automaticamente.",
    privacyBody:
      "Antes de qualquer compartilhamento, você verá exatamente o que o profissional poderá consultar.",
  },
  admin: {
    title: "Operação da plataforma",
    subtitle:
      "Assinaturas, verificações e saúde técnica — sem acesso clínico normal.",
  },
};

export type Messages = typeof ptPT;

const messages: Record<Locale, Messages> = {
  "pt-PT": ptPT,
  "pt-BR": ptBR,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function getLocaleAlternates(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutLocale = normalized.replace(/^\/pt-(?:pt|br)(?=\/|$)/, "");

  return {
    "pt-PT": `/pt-pt${withoutLocale || ""}`,
    "pt-BR": `/pt-br${withoutLocale || ""}`,
  } as const;
}
