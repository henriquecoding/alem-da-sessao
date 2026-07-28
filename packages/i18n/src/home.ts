/**
 * A homepage é a primeira experiência do produto.
 *
 * Em vez de explicar o intervalo numa sequência de secções, oferece um
 * pequeno ensaio do modelo mental da plataforma: algo acontece, ganha forma
 * e só atravessa para o profissional por decisão explícita. Nenhuma escolha
 * sai do estado transitório do componente.
 *
 * As duas variantes são localizações editoriais completas. O tipo nasce da
 * variante portuguesa e impede que uma alteração seja publicada apenas numa
 * delas.
 */
export const homePT = {
  shell: {
    eyebrow: "Um lugar entre duas sessões",
    title: "A sessão termina. A vida continua.",
    lede: "Além da Sessão dá forma ao que acontece nos dias entre duas conversas — sem substituir a relação, apressar o processo ou transformar cada momento num dado.",
    exploreTab: "Conhecer o espaço",
    returnTab: "Já utilizo",
    privacy:
      "Esta experiência é privada e efémera. Nada do que escolher fica guardado.",
  },
  scene: {
    label: "Uma semana, sete dobras",
    previous: "Sessão anterior",
    next: "Próxima sessão",
    privateSide: "Continua consigo",
    sharedSide: "Atravessou por decisão",
    days: ["Sessão", "Dia 2", "Dia 3", "Hoje", "Dia 5", "Dia 6", "Sessão"],
    description:
      "Uma faixa de papel com sete dobras liga a sessão anterior à próxima. Conforme a escolha, uma folha ganha a forma reconhecível de um pássaro, uma raposa ou um barco e só atravessa por decisão explícita.",
  },
  ritual: {
    progress: "Passo {current} de {total}",
    back: "Voltar",
    next: "Continuar",
    restart: "Recomeçar",
    startTool: "Experimentar a experiência",
    seeDemo: "Ver a plataforma completa",
    steps: {
      notice: {
        number: "01",
        name: "Notar",
        title: "Alguma coisa ficou consigo.",
        body: "Não precisa de escrever nem de explicar. Escolha apenas a forma que mais se aproxima do que aconteceu no intervalo.",
        prompt: "O que encontrou pelo caminho?",
        options: [
          {
            id: "echo",
            label: "Algo ficou",
            hint: "Um peso, uma frase ou uma sensação que regressou.",
            object: "Pássaro de regresso",
            response:
              "Reconhecer que ficou já é diferente de o perder até à próxima sessão.",
            tool: "Estruturas de Carga",
            toolBody:
              "Uma experiência visual para separar o que pesa, o que sustenta e o que já pode mudar de lugar.",
          },
          {
            id: "clarity",
            label: "Algo ganhou forma",
            hint: "Uma ligação que só apareceu depois da conversa.",
            object: "Raposa atenta",
            response:
              "Uma perceção pode conservar a sua forma sem ser transformada imediatamente numa conclusão.",
            tool: "Inventário da Sessão",
            toolBody:
              "Um percurso para reconstruir o que ficou da sessão sem depender de uma página em branco.",
          },
          {
            id: "intention",
            label: "Algo quer seguir",
            hint: "Uma intenção que gostaria de levar consigo.",
            object: "Barco de partida",
            response:
              "Chegar preparado não significa chegar com tudo resolvido.",
            tool: "Inventário da Sessão",
            toolBody:
              "Um percurso que ajuda a escolher o que merece regressar à próxima conversa.",
          },
        ],
      },
      form: {
        number: "02",
        name: "Dar forma",
        title: "Uma folha pode guardar mais do que uma resposta.",
        body: "Cada experiência tem uma engine própria: dobras, objetos, relações, estados e pequenas decisões. A ferramenta adapta-se ao trabalho — o trabalho não é reduzido a um formulário.",
        selectedLabel: "O que escolheu tornou-se",
        recommendationLabel: "Um caminho possível",
      },
      decide: {
        number: "03",
        name: "Decidir",
        title: "Existir não é o mesmo que partilhar.",
        body: "O resultado continua privado. Só um resumo atravessa para o profissional quando a pessoa escolhe fazê-lo.",
        privateAction: "Manter deste lado",
        shareAction: "Fazer atravessar",
        privateTitle: "Continua privado.",
        privateBody:
          "O profissional não vê atividade, rascunhos ou o facto de alguma coisa ter sido criada.",
        sharedTitle: "Atravessou.",
        sharedBody:
          "Apenas o resumo escolhido chegaria ao profissional. Nesta demonstração, nada foi enviado.",
      },
    },
  },
  returning: {
    eyebrow: "A porta certa, sem desvios",
    title: "Retome onde o seu dia realmente está.",
    body: "A mesma entrada reconhece dois ritmos. O espaço do cliente abre devagar; a área profissional leva diretamente ao que pede atenção.",
    client: {
      label: "Estou em processo",
      title: "Retomar o meu intervalo",
      body: "Voltar à experiência em curso, à próxima sessão e ao que continua privado.",
      cta: "Entrar no meu espaço",
    },
    professional: {
      label: "Acompanho pessoas",
      title: "Abrir o meu dia",
      body: "Ver agenda, contexto, partilhas por rever e gestão da prática numa superfície compacta.",
      cta: "Entrar na área profissional",
    },
  },
  roles: {
    eyebrow: "Uma plataforma, dois ritmos",
    title: "A tecnologia fica à volta. A relação permanece no centro.",
    lede: "Não é um terapeuta artificial, um mural de respostas ou outra aplicação a pedir uso diário. É uma infraestrutura conduzida por profissionais para prolongar continuidade, autonomia e contexto.",
    client: {
      index: "01 · Para quem está em processo",
      title: "Um espaço que não exige desempenho.",
      body: "Experiências guiadas, progresso sem streaks e privacidade por defeito. Cada resultado pode permanecer só consigo.",
      cta: "Explorar experiências",
    },
    professional: {
      index: "02 · Para quem acompanha",
      title: "O contexto certo antes da próxima conversa.",
      body: "Agenda, clientes, sessões, experiências e partilhas deliberadas sem transformar a prática num feed de vigilância.",
      cta: "Conhecer a área profissional",
    },
  },
  close: {
    eyebrow: "Além da sessão, não além do profissional",
    title: "Uma presença digital que devolve a conversa às pessoas.",
    body: "A plataforma organiza o intervalo. O cuidado, a interpretação e as decisões clínicas continuam onde devem estar: na relação entre cliente e profissional.",
    primary: "Entrar na demonstração",
    secondary: "Ver segurança e privacidade",
  },
};

export type HomeCopy = typeof homePT;

export const homeBR: HomeCopy = {
  shell: {
    eyebrow: "Um lugar entre duas sessões",
    title: "A sessão termina. A vida continua.",
    lede: "Além da Sessão dá forma ao que acontece nos dias entre duas conversas — sem substituir a relação, apressar o processo ou transformar cada momento em um dado.",
    exploreTab: "Conhecer o espaço",
    returnTab: "Já utilizo",
    privacy:
      "Esta experiência é privada e efêmera. Nada do que você escolher fica salvo.",
  },
  scene: {
    label: "Uma semana, sete dobras",
    previous: "Sessão anterior",
    next: "Próxima sessão",
    privateSide: "Continua com você",
    sharedSide: "Atravessou por decisão",
    days: ["Sessão", "Dia 2", "Dia 3", "Hoje", "Dia 5", "Dia 6", "Sessão"],
    description:
      "Uma faixa de papel com sete dobras liga a sessão anterior à próxima. Conforme a escolha, uma folha ganha a forma reconhecível de um pássaro, uma raposa ou um barco e só atravessa por decisão explícita.",
  },
  ritual: {
    progress: "Passo {current} de {total}",
    back: "Voltar",
    next: "Continuar",
    restart: "Recomeçar",
    startTool: "Experimentar a experiência",
    seeDemo: "Ver a plataforma completa",
    steps: {
      notice: {
        number: "01",
        name: "Notar",
        title: "Alguma coisa ficou com você.",
        body: "Você não precisa escrever nem explicar. Escolha apenas a forma que mais se aproxima do que aconteceu no intervalo.",
        prompt: "O que você encontrou pelo caminho?",
        options: [
          {
            id: "echo",
            label: "Algo ficou",
            hint: "Um peso, uma frase ou uma sensação que voltou.",
            object: "Pássaro de retorno",
            response:
              "Reconhecer que ficou já é diferente de perder isso até a próxima sessão.",
            tool: "Estruturas de Carga",
            toolBody:
              "Uma experiência visual para separar o que pesa, o que sustenta e o que já pode mudar de lugar.",
          },
          {
            id: "clarity",
            label: "Algo ganhou forma",
            hint: "Uma ligação que só apareceu depois da conversa.",
            object: "Raposa atenta",
            response:
              "Uma percepção pode conservar sua forma sem ser transformada imediatamente em uma conclusão.",
            tool: "Inventário da Sessão",
            toolBody:
              "Um percurso para reconstruir o que ficou da sessão sem depender de uma página em branco.",
          },
          {
            id: "intention",
            label: "Algo quer seguir",
            hint: "Uma intenção que você gostaria de levar consigo.",
            object: "Barco de partida",
            response:
              "Chegar preparado não significa chegar com tudo resolvido.",
            tool: "Inventário da Sessão",
            toolBody:
              "Um percurso que ajuda a escolher o que merece voltar à próxima conversa.",
          },
        ],
      },
      form: {
        number: "02",
        name: "Dar forma",
        title: "Uma folha pode guardar mais do que uma resposta.",
        body: "Cada experiência tem uma engine própria: dobras, objetos, relações, estados e pequenas decisões. A ferramenta se adapta ao trabalho — o trabalho não é reduzido a um formulário.",
        selectedLabel: "O que você escolheu se tornou",
        recommendationLabel: "Um caminho possível",
      },
      decide: {
        number: "03",
        name: "Decidir",
        title: "Existir não é o mesmo que compartilhar.",
        body: "O resultado continua privado. Só um resumo atravessa para o profissional quando a pessoa escolhe fazer isso.",
        privateAction: "Manter deste lado",
        shareAction: "Fazer atravessar",
        privateTitle: "Continua privado.",
        privateBody:
          "O profissional não vê atividade, rascunhos ou o fato de alguma coisa ter sido criada.",
        sharedTitle: "Atravessou.",
        sharedBody:
          "Apenas o resumo escolhido chegaria ao profissional. Nesta demonstração, nada foi enviado.",
      },
    },
  },
  returning: {
    eyebrow: "A porta certa, sem desvios",
    title: "Retome onde o seu dia realmente está.",
    body: "A mesma entrada reconhece dois ritmos. O espaço do cliente abre devagar; a área profissional leva diretamente ao que pede atenção.",
    client: {
      label: "Estou em processo",
      title: "Retomar o meu intervalo",
      body: "Voltar à experiência em curso, à próxima sessão e ao que continua privado.",
      cta: "Entrar no meu espaço",
    },
    professional: {
      label: "Acompanho pessoas",
      title: "Abrir o meu dia",
      body: "Ver agenda, contexto, compartilhamentos para revisar e gestão da prática em uma superfície compacta.",
      cta: "Entrar na área profissional",
    },
  },
  roles: {
    eyebrow: "Uma plataforma, dois ritmos",
    title: "A tecnologia fica ao redor. A relação permanece no centro.",
    lede: "Não é um terapeuta artificial, um mural de respostas ou outro aplicativo pedindo uso diário. É uma infraestrutura conduzida por profissionais para prolongar continuidade, autonomia e contexto.",
    client: {
      index: "01 · Para quem está em processo",
      title: "Um espaço que não exige desempenho.",
      body: "Experiências guiadas, progresso sem streaks e privacidade por padrão. Cada resultado pode permanecer só com você.",
      cta: "Explorar experiências",
    },
    professional: {
      index: "02 · Para quem acompanha",
      title: "O contexto certo antes da próxima conversa.",
      body: "Agenda, clientes, sessões, experiências e compartilhamentos deliberados sem transformar a prática em um feed de vigilância.",
      cta: "Conhecer a área profissional",
    },
  },
  close: {
    eyebrow: "Além da sessão, não além do profissional",
    title: "Uma presença digital que devolve a conversa às pessoas.",
    body: "A plataforma organiza o intervalo. O cuidado, a interpretação e as decisões clínicas continuam onde devem estar: na relação entre cliente e profissional.",
    primary: "Entrar na demonstração",
    secondary: "Ver segurança e privacidade",
  },
};
