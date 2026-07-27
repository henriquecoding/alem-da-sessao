/**
 * A homepage não descreve o intervalo. **É um intervalo.**
 *
 * Quem chega aterra dentro do espaço entre duas sessões e atravessa-o de cima
 * a baixo: a chegada, o que acontece lá dentro, por que é que ninguém o
 * modelou, o gesto que o produto inteiro é, e as duas portas.
 *
 * A copy vive aqui, separada dos componentes, por duas razões. A primeira é
 * `check:i18n`, que exige as mesmas chaves nas duas variantes — texto dentro
 * de JSX escapa a essa verificação e foi assim que meia interface acabou só em
 * português de Portugal. A segunda é que as duas variantes não são uma
 * tradução: `Está aqui` e `Você está aqui` são a mesma frase em duas línguas
 * que tratam o leitor de maneira diferente, e isso escreve-se lado a lado ou
 * não se escreve de todo.
 *
 * Uma nota sobre a voz dos momentos (§7.5). Estão no infinitivo — «Acordar às
 * três com aquilo outra vez» — e não na segunda pessoa. Um site que diz «você
 * acordou às três» está a afirmar que sabe, e não sabe. O infinitivo nomeia a
 * experiência sem a atribuir a ninguém, que é exatamente a distância certa
 * para um primeiro parágrafo.
 */

export const homePT = {
  /* Tempo 1 — a chegada. */
  arrival: {
    fromDay: "Quarta, 14 de julho",
    fromDetail: "50 minutos",
    fromState: "terminou",
    toDay: "Quarta, 21 de julho",
    toDetail: "50 minutos",
    toState: "ainda não",
    hereLabel: "está aqui",
    title: "Está aqui.",
    lede: "Entre duas sessões. É onde vive quase todo um tratamento, e é o único sítio que nenhum produto de saúde mental modela — porque o intervalo não fatura.",
    cue: "Atravessar",
    span: "sete dias",
    measureLabel: "do tratamento acontece aqui",
  },

  /* A pergunta de chegada. Reordena a página e não sai desta visita. */
  question: {
    label: "O que o traz aqui?",
    forget: "Fica só nesta visita — nada é guardado.",
    change: "Mudar",
    options: {
      professional: {
        label: "Acompanho pessoas",
        hint: "Psicologia, psicoterapia ou psiquiatria.",
      },
      client: {
        label: "Estou em processo",
        hint: "Tenho sessões com alguém.",
      },
      curious: {
        label: "Só a olhar",
        hint: "Ainda a decidir.",
      },
    },
  },

  /* Tempo 2 — o que acontece dentro do intervalo. */
  moments: {
    eyebrow: "Dentro do intervalo",
    title: "O que acontece aqui não cabe numa nota de sessão.",
    lede: "Sete dias entre duas conversas de cinquenta minutos. Isto é uma semana qualquer, e nenhuma destas linhas tem onde ficar.",
    items: [
      {
        when: "Quinta · 03:14",
        text: "Acordar com aquilo outra vez. Às nove, já não há palavras para o quê.",
      },
      {
        when: "Sexta · 12:40",
        text: "Ensaiar uma frase na fila do café e decidir que não vale a pena dizê-la.",
      },
      {
        when: "Sábado",
        text: "Um dia bom, sem motivo aparente. Ninguém regista os dias bons.",
      },
      {
        when: "Domingo · 22:05",
        text: "Perceber uma coisa inteira, no escuro, e não ter onde a pousar.",
      },
      {
        when: "Terça · 18:40",
        text: "Escolher as três coisas que vai contar. As outras nove ficam de fora.",
      },
      {
        when: "Quarta · 09:58",
        text: "Chegar, e começar por «não me lembro bem da semana».",
      },
    ],
    closing:
      "Nada disto é registo clínico. É o processo a acontecer sem testemunha, todas as semanas, em toda a gente.",
  },

  /* Tempo 3 — o argumento. */
  why: {
    eyebrow: "A pergunta óbvia",
    title: "Não é que ninguém tenha pensado nisto.",
    subtitle: "É que o modelo de negócio de todos os outros impede.",
    rows: [
      {
        who: "Registos clínicos eletrónicos",
        what: "modelam o encontro, porque é o encontro que fatura. O intervalo não fatura, logo não existe na base de dados.",
      },
      {
        who: "Marketplaces de terapia",
        what: "vivem de comissão por sessão. Um intervalo bem cuidado não gera comissão nenhuma.",
      },
      {
        who: "Aplicações diretas ao consumidor",
        what: "monetizam uso em escala. Pôr um profissional humano no circuito destrói a escala — por isso não põem.",
      },
    ],
    conclusion:
      "Aqui quem paga a assinatura é o profissional. É por isso que este produto pode recusar sequências, notificações diárias e pontuações de humor sem perder receita — e é por isso que pode dar forma ao intervalo.",
  },

  /* Tempo 4 — o gesto. */
  crossing: {
    eyebrow: "O gesto",
    title: "Escrever é privado. Atravessar é uma decisão.",
    lede: "Tudo o que se escreve fica deste lado. Nada chega ao profissional por existir: chega porque alguém o levou até lá, num gesto que demora o tempo da decisão.",
    invite: "Experimente — não há nada em jogo.",
    recipient: "Inês Almeida",
    doneTitle: "Atravessou.",
    doneBody:
      "Numa sessão real, a Dra. Inês veria isto — e só isto — antes da próxima conversa. O resto continuava deste lado.",
    again: "Outra vez",
    access:
      "Arrastar, Enter ou as setas do teclado. Os três caminhos valem o mesmo, por desenho.",
  },

  /* Tempo 5 — as duas portas. */
  doors: {
    eyebrow: "Duas portas",
    title: "Ritmos opostos, e ainda bem.",
    lede: "Quem acompanha chega com pressa e precisa de decidir. Quem está em processo chega devagar e precisa de espaço. A mesma plataforma não pode ter o mesmo ritmo para os dois.",
    professional: {
      eyebrow: "Acompanha pessoas",
      body: "Densidade alta, tudo numa vista, latência baixa. A gestão da prática é o bilhete de entrada; o intervalo é o argumento.",
      cta: "Entrar na área profissional",
    },
    client: {
      eyebrow: "Está em processo",
      body: "Uma decisão por ecrã, ritmo lento, sem contagens nem sequências a manter. Não é um registo clínico reduzido — é um lugar.",
      cta: "Entrar na área do cliente",
    },
    already: {
      title: "Já tem sessões com alguém?",
      body: "Então o intervalo já existe — só não tinha forma. Quem o abre é o seu profissional, e o que lá puser continua seu até decidir o contrário.",
      cta: "Ver como funciona a partilha",
    },
    open: "Experimentar sem conta",
  },
};

/**
 * O tipo vem da variante de Portugal e é imposto à do Brasil. `check:i18n`
 * compara as chaves em tempo de execução; isto falha antes, na compilação, e
 * com o nome da chave que falta.
 */
export type HomeCopy = typeof homePT;

export const homeBR: HomeCopy = {
  arrival: {
    fromDay: "Quarta, 14 de julho",
    fromDetail: "50 minutos",
    fromState: "terminou",
    toDay: "Quarta, 21 de julho",
    toDetail: "50 minutos",
    toState: "ainda não",
    hereLabel: "você está aqui",
    title: "Você está aqui.",
    lede: "Entre duas sessões. É onde vive quase todo um tratamento, e é o único lugar que nenhum produto de saúde mental modela — porque o intervalo não fatura.",
    cue: "Atravessar",
    span: "sete dias",
    measureLabel: "do tratamento acontece aqui",
  },

  question: {
    label: "O que traz você aqui?",
    forget: "Fica só nesta visita — nada é guardado.",
    change: "Mudar",
    options: {
      professional: {
        label: "Acompanho pessoas",
        hint: "Psicologia, psicoterapia ou psiquiatria.",
      },
      client: {
        label: "Estou em processo",
        hint: "Tenho sessões com alguém.",
      },
      curious: {
        label: "Só olhando",
        hint: "Ainda decidindo.",
      },
    },
  },

  moments: {
    eyebrow: "Dentro do intervalo",
    title: "O que acontece aqui não cabe numa nota de sessão.",
    lede: "Sete dias entre duas conversas de cinquenta minutos. Isto é uma semana qualquer, e nenhuma dessas linhas tem onde ficar.",
    items: [
      {
        when: "Quinta · 03:14",
        text: "Acordar com aquilo de novo. Às nove, já não há palavras para o quê.",
      },
      {
        when: "Sexta · 12:40",
        text: "Ensaiar uma frase na fila do café e decidir que não vale a pena falar.",
      },
      {
        when: "Sábado",
        text: "Um dia bom, sem motivo aparente. Ninguém registra os dias bons.",
      },
      {
        when: "Domingo · 22:05",
        text: "Entender uma coisa inteira, no escuro, e não ter onde deixá-la.",
      },
      {
        when: "Terça · 18:40",
        text: "Escolher as três coisas que vai contar. As outras nove ficam de fora.",
      },
      {
        when: "Quarta · 09:58",
        text: "Chegar, e começar por “não lembro bem da semana”.",
      },
    ],
    closing:
      "Nada disso é registro clínico. É o processo acontecendo sem testemunha, toda semana, em todo mundo.",
  },

  why: {
    eyebrow: "A pergunta óbvia",
    title: "Não é que ninguém tenha pensado nisso.",
    subtitle: "É que o modelo de negócio de todos os outros impede.",
    rows: [
      {
        who: "Prontuários eletrônicos",
        what: "modelam o encontro, porque é o encontro que fatura. O intervalo não fatura, logo não existe no banco de dados.",
      },
      {
        who: "Marketplaces de terapia",
        what: "vivem de comissão por sessão. Um intervalo bem cuidado não gera comissão nenhuma.",
      },
      {
        who: "Aplicativos diretos ao consumidor",
        what: "monetizam uso em escala. Colocar um profissional humano no circuito destrói a escala — por isso não colocam.",
      },
    ],
    conclusion:
      "Aqui quem paga a assinatura é o profissional. É por isso que este produto pode recusar sequências, notificações diárias e pontuações de humor sem perder receita — e é por isso que pode dar forma ao intervalo.",
  },

  crossing: {
    eyebrow: "O gesto",
    title: "Escrever é privado. Atravessar é uma decisão.",
    lede: "Tudo o que você escreve fica deste lado. Nada chega ao profissional por existir: chega porque alguém levou até lá, num gesto que dura o tempo da decisão.",
    invite: "Experimente — não há nada em jogo.",
    recipient: "Inês Almeida",
    doneTitle: "Atravessou.",
    doneBody:
      "Numa sessão real, a Dra. Inês veria isso — e só isso — antes da próxima conversa. O resto continuava deste lado.",
    again: "De novo",
    access:
      "Arrastar, Enter ou as setas do teclado. Os três caminhos valem o mesmo, por design.",
  },

  doors: {
    eyebrow: "Duas portas",
    title: "Ritmos opostos, e ainda bem.",
    lede: "Quem acompanha chega com pressa e precisa decidir. Quem está em processo chega devagar e precisa de espaço. A mesma plataforma não pode ter o mesmo ritmo para os dois.",
    professional: {
      eyebrow: "Acompanha pessoas",
      body: "Densidade alta, tudo numa visão, latência baixa. A gestão da prática é o bilhete de entrada; o intervalo é o argumento.",
      cta: "Entrar na área profissional",
    },
    client: {
      eyebrow: "Está em processo",
      body: "Uma decisão por tela, ritmo lento, sem contagens nem sequências a manter. Não é um prontuário reduzido — é um lugar.",
      cta: "Entrar na área do cliente",
    },
    already: {
      title: "Você já tem sessões com alguém?",
      body: "Então o intervalo já existe — só não tinha forma. Quem abre é o seu profissional, e o que você colocar lá continua seu até decidir o contrário.",
      cta: "Ver como funciona o compartilhamento",
    },
    open: "Experimentar sem conta",
  },
};
