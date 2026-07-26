# Investigação de produto — cor e experiências entre sessões

Data: 26 de julho de 2026.

## Pergunta

Como evitar que o Além da Sessão seja apenas um software de gestão com
questionários e transformar cada ferramenta numa experiência estruturada, sem
usar IA como terapeuta e sem aumentar a carga de escrita?

## Evidência consultada

### Atividades entre sessões

A revisão sistemática de Ryum, Bennion e Kazantzis reuniu 25 estudos, 1.304
clientes e 118 terapeutas. Entre os comportamentos associados a maior
envolvimento estão explicar a razão da atividade, desenhá-la de forma
colaborativa e flexível, alinhá-la com o que a pessoa retirou da sessão e
revê-la depois. Isto sustenta atribuições configuráveis e uma ligação explícita
à conversa seguinte, em vez de “trabalhos de casa” genéricos.

Fonte:
[Integrating between-session homework in psychotherapy](https://pubmed.ncbi.nlm.nih.gov/37104804/).

Uma meta-análise com 23 estudos e 2.183 participantes encontrou uma associação
pequena a moderada entre adesão a atividades entre sessões e resultado
terapêutico. A associação não prova causalidade e não autoriza a plataforma a
medir “qualidade terapêutica”; justifica tornar as atividades possíveis de
concluir e de rever com o profissional.

Fonte:
[The Relationship Between Homework Compliance and Therapy Outcomes](https://pubmed.ncbi.nlm.nih.gov/20930925/).

### Envolvimento digital

Uma revisão de 208 estudos identificou como barreiras frequentes a falta de
personalização, problemas técnicos e preocupações de privacidade. Sensação de
controlo e aumento de insight aparecem como facilitadores. Por isso, as engines
usam escolhas da pessoa, rascunho privado, partilha granular e linguagem que
não interpreta resultados.

Fonte:
[Barriers to and Facilitators of User Engagement With Digital Mental Health Interventions](https://pmc.ncbi.nlm.nih.gov/articles/PMC8074985/).

Uma revisão sobre personalização encontrou variação planeada em 66% das
intervenções estudadas. Escolha do utilizador e regras explícitas foram muito
mais comuns do que aprendizagem automática. Isto suporta personalização sem IA:
ordem, seleção, intensidade, destino e partilha podem ser definidos pela
própria pessoa ou pelo profissional.

Fonte:
[Personalization strategies in digital mental health interventions](https://pmc.ncbi.nlm.nih.gov/articles/PMC10239832/).

Uma meta-análise de 92 ensaios aleatorizados não encontrou associação
significativa entre a simples contagem de princípios persuasivos e eficácia ou
envolvimento. A decisão é não adicionar pontos, streaks ou animações como
substitutos de uma boa engine.

Fonte:
[A meta-analysis of persuasive design, engagement, and efficacy in 92 RCTs](https://pmc.ncbi.nlm.nih.gov/articles/PMC12041226/).

### Mercado adjacente

O Quenza oferece atividades personalizáveis, entrega programada, progresso
guardado e controlo sobre quem vê os resultados. É uma referência funcional,
mas a sua unidade principal continua a ser um construtor de atividades.

Fonte: [Quenza Activities](https://quenza.com/features/activities).

A oportunidade do Além da Sessão não está em ter “mais worksheets”. Está em
criar engines autorais em que a interação é parte do significado: selecionar
cargas, dar-lhes peso, distinguir como chegaram, escolher um movimento e
produzir um artefacto controlado.

### Cor e acessibilidade

Uma revisão de 132 estudos e mais de 40.000 participantes encontrou associações
sistemáticas entre atributos cromáticos e emoções, mas cada cor corresponde a
várias emoções. Tons mais claros tendem a associar-se a emoções mais positivas;
maior saturação aumenta ativação. A paleta usa isto apenas como orientação de
intensidade, não como promessa psicológica.

Fonte:
[Do we feel colours? A systematic review of 128 years](https://doi.org/10.3758/s13423-024-02615-z).

As WCAG 2.2 exigem `4.5:1` para texto normal, `3:1` para texto grande e `3:1`
para informação necessária em componentes. Também não se deve depender apenas
de cor para comunicar estado.

Fontes:
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) e
[GOV.UK Design System — Colour](https://design-system.service.gov.uk/styles/colour/).

## Decisões aplicadas

1. Substituir o verde dominante por violeta estrutural e uma base mineral clara.
2. Usar pastéis como superfícies e cores intensas apenas para ação/foco.
3. Transformar texto longo obrigatório em bibliotecas de escolhas.
4. Fazer a experiência produzir um objeto legível, não uma sequência de
   respostas.
5. Separar guardar, selecionar para partilha, pré-visualizar e confirmar.
6. Permitir escrita curta apenas quando acrescenta voz própria.
7. Não produzir scores emocionais, recomendações clínicas ou diagnósticos.
8. Avaliar as engines futuramente com psicólogos e pessoas com experiência
   vivida; a implementação técnica não equivale a validação clínica.

## Adaptação de “O Peso que Carregas”

O documento de conceito enviado introduz uma linguagem de engenharia,
materialidade mineral e um ritual de deposição. A nova versão de **Estruturas
de Carga** preserva o que torna esse conceito autoral, mas adapta-o ao contrato
de uma plataforma de continuidade entre cliente e profissional.

### Preservado

- linguagem estrutural — carga, compressão, proveniência, ancoragem e planta;
- uma responsabilidade concreta como unidade mínima, limitada a 220 caracteres;
- duração e alcance como dimensões separadas;
- monólitos SVG gerados deterministicamente a partir das escolhas;
- gesto tátil de sustentar para ancorar, com alternativa por teclado;
- entrada lenta, contraste mineral e acento ferrugem;
- artefacto final legível, em vez de uma página de resultados.

### Adaptado deliberadamente

- o depósito público tornou-se uma decisão posterior ao rascunho privado e
  reversível, nunca uma consequência automática de concluir a experiência;
- a parede recebe apenas a estrutura mínima; notas para a sessão, marcas,
  apoio escolhido e limite de visibilidade não saem do rascunho;
- o apoio comunitário é um gesto não textual, sem comentários, perfis,
  seguidores ou contacto direto;
- estruturas predefinidas podem ser aprovadas automaticamente; qualquer escrita
  livre entra em revisão e padrões de contacto são bloqueados;
- a linguagem evita sugerir diagnóstico, colapso inevitável ou interpretação
  automática da pessoa;
- a massa estrutural é explicitamente simbólica e serve apenas para organizar
  a conversa;
- a partilha exige pré-visualização, seleção granular e confirmação;
- nomes de pessoas e empresas são desencorajados na escrita livre;
- o gesto de sustentação tem alternativa equivalente por `Enter` ou `Espaço`.

O resultado não é uma cópia reduzida do microsite original nem um questionário
com tema visual. É uma engine com cinco decisões conectadas: assentar, medir,
identificar proveniência, escolher uma ancoragem e construir a planta. No
percurso público, a pessoa decide depois se quer depositar um recorte anónimo na
parede; no percurso terapêutico, pode preparar um snapshot diferente para a
próxima sessão.

## Padrão de interação

As etapas seguem uma pergunta principal por superfície, progresso simples,
retorno sem perda de estado e ação explícita para continuar. Perguntas sensíveis
explicam por que a informação é pedida. Controlos binários usam semântica de
switch, rótulo estável, estado exposto por `aria-checked` e foco visível.

Fontes:
[GOV.UK — Question pages](https://design-system.service.gov.uk/patterns/question-pages/),
[NHS — Asking users for sensitive information](https://service-manual.nhs.uk/design-system/patterns/asking-users-for-sensitive-information)
e
[WAI-ARIA — Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

## Anatomia mínima de uma engine

Cada nova experiência precisa de:

- verdade humana e objetivo explícitos;
- biblioteca de objetos/ações, não só perguntas;
- progressão com decisões reversíveis;
- estado privado por defeito;
- síntese visual significativa;
- seleção granular do que partilhar;
- snapshot imutável;
- localização de linguagem e contexto;
- manifesto versionado;
- revisão de privacidade, acessibilidade e uso clínico.
