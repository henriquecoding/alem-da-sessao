# Anti-padrões

Revisto em cada PR que toque em interface. Relatório v2 §6.7.

Um anti-padrão aqui não é uma questão de gosto: cada um destes já custou
credibilidade ou dinheiro a alguém neste mercado. Onde existe um check
automatizado, ele está indicado — o resto depende desta lista ser lida.

---

## 1. Gráficos de progresso do estado emocional de uma pessoa

Um gráfico de humor ao longo do tempo transforma uma pessoa numa linha, e uma
linha que desce numa falha. Também é um dos gatilhos de qualificação como
dispositivo médico (§8.4).

> Verificado por `check:claims` (termos _mede progresso_, _avalia risco_).

## 2. Streaks, badges, confetes, gamificação

O produto não tem incentivo financeiro para prender ninguém — a receita vem da
assinatura de um profissional, não da atenção do cliente (§1.3). Um streak
seria fazer o Woebot de graça.

**Nunca celebre um ato que pode ter sido doloroso.** Alguém acabou de escrever
sobre o pai que morreu; não atire papel picado.

> Verificado por `voice.ts` (frases proibidas: _com sucesso_, _parabéns_).

## 3. Ilustrações de pessoas genéricas sem rosto

O corpo sem rosto é a estética de stock de todo o mercado de saúde mental.
Comunica "alguém, qualquer pessoa" a quem chegou aqui precisamente por não ser
qualquer pessoa. Composição procedural em vez disso (§4.1).

## 4. Gradientes roxo-azul

A armadilha _wellness_ do §6.1: infantiliza o cliente e desqualifica o produto
aos olhos do profissional que paga.

## 5. Vidro fosco sobre conteúdo clínico

A armadilha _SaaS 2026_. Utilizadores em sofrimento descrevem interfaces
brilhantes e animadas como "chocantes, até fisicamente desconfortáveis".

## 6. Estados vazios que soam a acusação

"Não tem itens" diz à pessoa que ela devia ter. Um intervalo vazio é normal e
é apresentado como normal (§4.2).

> Verificado por `voice.ts` (_não tem itens_, _nenhum resultado_, _lista vazia_).

## 7. Notificações com urgência

Um lembrete, se houver prazo atribuído. Um. Sem conteúdo, sem urgência: _"Há
algo à sua espera."_ Nunca _"Não perca!"_.

> Verificado por `voice.ts` (_não perca_, _última chance_, _urgente_).

## 8. Emojis como taxonomia emocional

Cinco caras não são um sistema de classificação de estados internos, e
escolher uma é responder a uma pergunta que ninguém fez.

## 9. Modais para decisões importantes

Uma decisão que merece ser pensada merece um URL recuperável. A
pré-visualização de partilha é uma página, não um modal (§4.5). Os recursos de
crise são um `<details>` que a pessoa abre, nunca um modal que interrompe
(§4.9).

## 10. Cor como único portador de significado

Privado e partilhado têm de ser distinguíveis num relance e nunca só por cor
(WCAG 1.4.1). Cor **mais** forma de borda **mais** ícone **mais** texto — é o
que `components/sensitivity.tsx` faz.

## 11. Densidade de dashboard corporativo do lado do cliente

O Care OS é denso porque a densidade ajuda a decidir. A superfície do cliente
tem uma tarefa por ecrã. Os dois modos são separados por construção.

> Verificado por `check:budgets`.

## 12. Microcópia de e-commerce sobre relato de sofrimento

"Ops! Algo correu mal" depois de alguém escrever sobre a coisa mais difícil da
vida dela. A regra número um é **nunca perder o texto da pessoa**, e a
mensagem de erro tem de o dizer explicitamente.

> Verificado por `voice.ts` (_ops_, _algo correu mal_, _erro inesperado_).

---

## O teste de qualidade (§6.8)

Antes de aprovar um ecrã novo:

1. **Se eu descrever esta tela por telefone, sem falar de cor ou layout,
   continua interessante?** — se não, o problema é de conceito.
2. **Alguém em sofrimento, às 23h, com pouca energia, faz a coisa principal em
   menos de 30 segundos?** — se não, o problema é de fricção.
3. **Esta tela poderia pertencer a outro produto se eu trocasse o logo?** — se
   sim, você fez SaaS.

A terceira pergunta é a única com resposta automatizável, e é por isso que o
contrato de originalidade existe: `check:tools` recusa um manifesto sem
`humanTruth`, `metaphor`, `gesture` e `differentiation`. Uma experiência que
não sabe dizer por que não é um formulário com ilustração não entra no build.
