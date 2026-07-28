/**
 * A homepage é a primeira experiência do produto, e a copy é metade dela.
 *
 * A versão anterior explicava o intervalo em blocos editoriais e só depois
 * mostrava uma ilustração. Esta faz o contrário: a primeira coisa que aparece
 * é uma pergunta com três respostas possíveis, e a folha responde à escolha
 * antes de qualquer parágrafo institucional.
 *
 * Três regras que governam cada frase aqui:
 *
 * **Nunca se pede um texto íntimo.** Todas as escolhas são de baixa exposição:
 * categorias curtas, nunca uma caixa de texto. Uma homepage não é sítio para
 * alguém escrever o que lhe aconteceu.
 *
 * **A forma nomeia a decisão, não a pessoa.** Os quatro objetos descrevem o
 * que a pessoa decidiu fazer — levar, guardar, atravessar, suspender. Nenhum
 * descreve como ela está.
 *
 * **Nada do que se escolhe sai daqui.** A demonstração vive no estado do
 * componente e termina ao sair, e a copy diz isso em voz alta em vez de o
 * esconder num rodapé.
 *
 * As duas variantes são localizações editoriais completas. O tipo nasce da
 * variante portuguesa e `check:i18n` impede que uma alteração seja publicada
 * apenas numa delas.
 */
export const homePT = {
  shell: {
    eyebrow: "Entre uma sessão e a próxima",
    title: "O que fica entre sessões não desaparece. Ganha forma.",
    lede: "Além da Sessão dá lugar ao que acontece nos dias entre duas conversas — conduzido por profissionais, decidido por si.",
    privacy: "Esta demonstração fica neste dispositivo e termina ao sair.",
  },
  scene: {
    label: "A folha",
    description:
      "Uma folha de papel pousada no centro do palco. A cada escolha ganha um vinco novo, e a última escolha dobra-a num objeto: um barco, uma caixa, um grou ou uma folha que fica por dobrar.",
  },
  intro: {
    question: "Entre uma sessão e a próxima, alguma coisa ficou consigo?",
    begin: "Sim, ficou",
    explore: "Só quero conhecer o espaço",
    returning: "Já utilizo o Além da Sessão",
  },
  nav: {
    progress: "Passo {current} de {total}",
    back: "Voltar",
    advance: "Continuar",
    restart: "Recomeçar",
  },
  steps: {
    notice: {
      number: "01",
      name: "Notar",
      title: "Não precisa de escrever nada.",
      body: "Escolha apenas o que mais se aproxima. Não há resposta certa e nenhuma escolha é registada.",
      prompt: "O que ficou?",
      options: [
        {
          id: "idea",
          label: "Uma ideia",
          hint: "Alguma coisa que se armou sozinha depois da conversa.",
        },
        {
          id: "feeling",
          label: "Uma sensação",
          hint: "Algo que se sente antes de se conseguir dizer.",
        },
        {
          id: "question",
          label: "Uma pergunta",
          hint: "Ficou por perguntar, ou ficou por responder.",
        },
        {
          id: "decision",
          label: "Uma decisão",
          hint: "Alguma coisa à espera de ser feita.",
        },
        {
          id: "unnamed",
          label: "Algo difícil de nomear",
          hint: "Também isto conta, e não precisa de nome.",
        },
      ],
    },
    form: {
      number: "02",
      name: "Dar forma",
      title: "E como está agora?",
      body: "A folha faz a segunda dobra. Continua a ser a mesma folha.",
      prompt: "Neste momento, isso:",
      options: [
        {
          id: "clear",
          label: "Está claro",
          hint: "Já tem contornos.",
        },
        {
          id: "tangled",
          label: "Continua confuso",
          hint: "Ainda não assenta.",
        },
        {
          id: "carry",
          label: "Quero levar comigo",
          hint: "Vai fazer falta mais à frente.",
        },
        {
          id: "rest",
          label: "Quero deixar repousar",
          hint: "Não é para agora.",
        },
      ],
    },
    decide: {
      number: "03",
      name: "Decidir",
      title: "O que quer fazer com isso?",
      body: "É esta escolha que dá a forma final. Nenhuma delas é melhor do que as outras.",
      prompt: "A minha intenção é:",
      options: [
        {
          id: "carry",
          label: "Levar para a próxima sessão",
          hint: "Chega à conversa sem se perder pelo caminho.",
        },
        {
          id: "keep",
          label: "Guardar só para mim",
          hint: "Fica consigo, e continua a existir.",
        },
        {
          id: "cross",
          label: "Explorar uma experiência",
          hint: "Atravessar para uma ferramenta, sem compromisso.",
        },
        {
          id: "rest",
          label: "Deixar em suspenso",
          hint: "Fica por dobrar, e está bem assim.",
        },
      ],
    },
  },
  result: {
    eyebrow: "A forma que a decisão tomou",
    note: "A forma nomeia a decisão, não a pessoa. Nada foi interpretado, enviado ou guardado.",
    primary: "Ver as experiências",
    secondary: "Ver a plataforma completa",
    objects: {
      boat: {
        name: "Barco",
        body: "Levar algo adiante. Na plataforma, isto é uma nota de intervalo que chega à próxima sessão porque decidiu partilhá-la.",
      },
      box: {
        name: "Caixa",
        body: "Guardar consigo. Na plataforma, isto fica no seu espaço pessoal e o profissional não vê que existe.",
      },
      crane: {
        name: "Grou",
        body: "Atravessar para uma experiência. Na plataforma, isto abre uma ferramenta estruturada que pode fazer sozinho.",
      },
      "suspended-sheet": {
        name: "Folha por dobrar",
        body: "Deixar em suspenso. Na plataforma, isto continua a existir sem lhe pedir nada — sem lembretes, sem sequências, sem contagem.",
      },
    },
  },
  explore: {
    eyebrow: "Sem começar por si",
    title: "O intervalo, visto de fora.",
    body: "O Além da Sessão é uma plataforma independente para profissionais de psicologia e psiquiatria e para as pessoas que acompanham. Organiza o que acontece entre sessões: experiências estruturadas de um lado, gestão da prática do outro, e uma fronteira explícita entre os dois.",
    primary: "Ver a plataforma completa",
    secondary: "Ver segurança e privacidade",
  },
  returning: {
    eyebrow: "A porta certa, sem desvios",
    title: "Retome onde o seu dia está.",
    body: "Sem repetir a apresentação. Escolha o lado por onde entra.",
    assigned: {
      label: "Indicado pelo profissional",
      title: "Continuar o que foi indicado",
      body: "A experiência em curso, a próxima sessão e o que está por rever.",
      cta: "Continuar",
    },
    personal: {
      label: "Só meu",
      title: "Entrar no espaço pessoal",
      body: "O que criou por sua iniciativa e continua a ser só seu.",
      cta: "Entrar",
    },
  },
  about: {
    eyebrow: "Uma plataforma, dois ritmos",
    title: "A tecnologia fica à volta. A relação permanece no centro.",
    lede: "Não é um terapeuta artificial nem outra aplicação a pedir uso diário. É infraestrutura conduzida por profissionais, para prolongar continuidade, autonomia e contexto.",
    client: {
      index: "Para quem está em processo",
      title: "Um espaço que não exige desempenho.",
      body: "Experiências guiadas, sem sequências obrigatórias, e privacidade por defeito. Cada resultado pode ficar só consigo.",
      cta: "Explorar experiências",
    },
    professional: {
      index: "Para quem acompanha",
      title: "O contexto certo antes da próxima conversa.",
      body: "Agenda, clientes, sessões e partilhas deliberadas, sem transformar a prática num painel de vigilância.",
      cta: "Conhecer a área profissional",
    },
  },
  close: {
    eyebrow: "Além da sessão, não além do profissional",
    title: "Uma presença digital que devolve a conversa às pessoas.",
    body: "A plataforma organiza o intervalo. O cuidado, a leitura clínica e as decisões continuam onde devem estar: na relação entre a pessoa e o profissional.",
    primary: "Entrar na demonstração",
    secondary: "Ver segurança e privacidade",
  },
};

export type HomeCopy = typeof homePT;

export const homeBR: HomeCopy = {
  shell: {
    eyebrow: "Entre uma sessão e a próxima",
    title: "O que fica entre sessões não desaparece. Ganha forma.",
    lede: "Além da Sessão dá lugar ao que acontece nos dias entre duas conversas — conduzido por profissionais, decidido por você.",
    privacy: "Esta demonstração fica neste dispositivo e termina ao sair.",
  },
  scene: {
    label: "A folha",
    description:
      "Uma folha de papel apoiada no centro do palco. A cada escolha ganha uma dobra nova, e a última escolha a transforma em um objeto: um barco, uma caixa, um tsuru ou uma folha que fica sem dobrar.",
  },
  intro: {
    question: "Entre uma sessão e a próxima, alguma coisa ficou com você?",
    begin: "Sim, ficou",
    explore: "Só quero conhecer o espaço",
    returning: "Já utilizo o Além da Sessão",
  },
  nav: {
    progress: "Passo {current} de {total}",
    back: "Voltar",
    advance: "Continuar",
    restart: "Recomeçar",
  },
  steps: {
    notice: {
      number: "01",
      name: "Notar",
      title: "Você não precisa escrever nada.",
      body: "Escolha apenas o que mais se aproxima. Não existe resposta certa e nenhuma escolha é registrada.",
      prompt: "O que ficou?",
      options: [
        {
          id: "idea",
          label: "Uma ideia",
          hint: "Algo que se armou sozinho depois da conversa.",
        },
        {
          id: "feeling",
          label: "Uma sensação",
          hint: "Algo que se sente antes de conseguir dizer.",
        },
        {
          id: "question",
          label: "Uma pergunta",
          hint: "Ficou sem perguntar, ou ficou sem resposta.",
        },
        {
          id: "decision",
          label: "Uma decisão",
          hint: "Algo esperando para ser feito.",
        },
        {
          id: "unnamed",
          label: "Algo difícil de nomear",
          hint: "Isso também conta, e não precisa de nome.",
        },
      ],
    },
    form: {
      number: "02",
      name: "Dar forma",
      title: "E como está agora?",
      body: "A folha faz a segunda dobra. Continua sendo a mesma folha.",
      prompt: "Neste momento, isso:",
      options: [
        {
          id: "clear",
          label: "Está claro",
          hint: "Já tem contornos.",
        },
        {
          id: "tangled",
          label: "Continua confuso",
          hint: "Ainda não assentou.",
        },
        {
          id: "carry",
          label: "Quero levar comigo",
          hint: "Vai fazer falta mais adiante.",
        },
        {
          id: "rest",
          label: "Quero deixar descansar",
          hint: "Não é para agora.",
        },
      ],
    },
    decide: {
      number: "03",
      name: "Decidir",
      title: "O que você quer fazer com isso?",
      body: "É esta escolha que dá a forma final. Nenhuma delas é melhor que as outras.",
      prompt: "Minha intenção é:",
      options: [
        {
          id: "carry",
          label: "Levar para a próxima sessão",
          hint: "Chega na conversa sem se perder no caminho.",
        },
        {
          id: "keep",
          label: "Guardar só para mim",
          hint: "Fica com você, e continua existindo.",
        },
        {
          id: "cross",
          label: "Explorar uma experiência",
          hint: "Atravessar para uma ferramenta, sem compromisso.",
        },
        {
          id: "rest",
          label: "Deixar em suspenso",
          hint: "Fica sem dobrar, e está tudo bem.",
        },
      ],
    },
  },
  result: {
    eyebrow: "A forma que a decisão tomou",
    note: "A forma nomeia a decisão, não você. Nada foi interpretado, enviado ou salvo.",
    primary: "Ver as experiências",
    secondary: "Ver a plataforma completa",
    objects: {
      boat: {
        name: "Barco",
        body: "Levar algo adiante. Na plataforma, isso é uma nota de intervalo que chega à próxima sessão porque você decidiu compartilhar.",
      },
      box: {
        name: "Caixa",
        body: "Guardar com você. Na plataforma, isso fica no seu espaço pessoal e o profissional não vê que existe.",
      },
      crane: {
        name: "Tsuru",
        body: "Atravessar para uma experiência. Na plataforma, isso abre uma ferramenta estruturada que você pode fazer sozinho.",
      },
      "suspended-sheet": {
        name: "Folha sem dobrar",
        body: "Deixar em suspenso. Na plataforma, isso continua existindo sem pedir nada a você — sem lembretes, sem sequências, sem contagem.",
      },
    },
  },
  explore: {
    eyebrow: "Sem começar por você",
    title: "O intervalo, visto de fora.",
    body: "O Além da Sessão é uma plataforma independente para profissionais de psicologia e psiquiatria e para as pessoas que acompanham. Organiza o que acontece entre sessões: experiências estruturadas de um lado, gestão da prática do outro, e uma fronteira explícita entre os dois.",
    primary: "Ver a plataforma completa",
    secondary: "Ver segurança e privacidade",
  },
  returning: {
    eyebrow: "A porta certa, sem desvios",
    title: "Retome onde o seu dia está.",
    body: "Sem repetir a apresentação. Escolha o lado por onde entra.",
    assigned: {
      label: "Indicado pelo profissional",
      title: "Continuar o que foi indicado",
      body: "A experiência em andamento, a próxima sessão e o que está para revisar.",
      cta: "Continuar",
    },
    personal: {
      label: "Só meu",
      title: "Entrar no espaço pessoal",
      body: "O que você criou por iniciativa própria e continua sendo só seu.",
      cta: "Entrar",
    },
  },
  about: {
    eyebrow: "Uma plataforma, dois ritmos",
    title: "A tecnologia fica em volta. A relação permanece no centro.",
    lede: "Não é um terapeuta artificial nem mais um aplicativo pedindo uso diário. É infraestrutura conduzida por profissionais, para prolongar continuidade, autonomia e contexto.",
    client: {
      index: "Para quem está em processo",
      title: "Um espaço que não exige desempenho.",
      body: "Experiências guiadas, sem sequências obrigatórias, e privacidade por padrão. Cada resultado pode ficar só com você.",
      cta: "Explorar experiências",
    },
    professional: {
      index: "Para quem acompanha",
      title: "O contexto certo antes da próxima conversa.",
      body: "Agenda, clientes, sessões e compartilhamentos deliberados, sem transformar a prática em um painel de vigilância.",
      cta: "Conhecer a área profissional",
    },
  },
  close: {
    eyebrow: "Além da sessão, não além do profissional",
    title: "Uma presença digital que devolve a conversa às pessoas.",
    body: "A plataforma organiza o intervalo. O cuidado, a leitura clínica e as decisões continuam onde devem estar: na relação entre a pessoa e o profissional.",
    primary: "Entrar na demonstração",
    secondary: "Ver segurança e privacidade",
  },
};
