# Direção visual

As sete referências fornecidas pelo criador orientam o sistema sem serem
copiadas. A direção foi revista depois de a primeira versão se apoiar demasiado
num verde institucional que não representava o projeto.

## Ideia central

**Clareza acolhedora com energia editorial.**

O Além da Sessão não deve parecer uma clínica, uma aplicação bancária nem um
produto genérico de bem-estar. A base é clara, mineral e silenciosa. Violeta dá
estrutura e identidade. Lavanda, azul-neblina, pêssego, rosa e amarelo criam
famílias de informação. Coral introduz calor em pontos pequenos.

## O que foi incorporado das referências

- superfícies quase brancas sobre uma base suavemente colorida;
- sidebar compacta em tinta violeta, não verde;
- grelha modular de cartões com espaço negativo generoso;
- cantos amplos, pills e bordas finas;
- calendários densos no desktop e listas legíveis no mobile;
- hierarquia por escala e posição, sem sombras pesadas;
- cartões pastel para distinguir tipos de informação;
- amarelo intenso apenas para seleção na navegação;
- violeta intenso reservado à ação principal.

## Paleta “Luz de Intervalo”

### Estrutura

| Token             | Valor     | Utilização                     |
| ----------------- | --------- | ------------------------------ |
| Fundo             | `#F7F5F8` | base com ligeiro viés violeta  |
| Fundo profundo    | `#EEEAF2` | áreas secundárias              |
| Superfície quente | `#FFFCFA` | cartões e formulários          |
| Tinta             | `#282431` | texto principal                |
| Tinta secundária  | `#6B6373` | texto de apoio                 |
| Violeta           | `#6848C6` | ação, foco e seleção           |
| Violeta profundo  | `#51349F` | hover e contraste              |
| Sidebar           | `#231E2D` | navegação e áreas de gravidade |

### Superfícies

| Família       | Valor     | Papel                         |
| ------------- | --------- | ----------------------------- |
| Lavanda       | `#DED6FA` | experiências e identidade     |
| Azul-neblina  | `#DCEAF7` | informação e agenda           |
| Água          | `#D7ECEE` | conclusão e segurança         |
| Rosa          | `#F4D6E2` | relação e cuidado             |
| Pêssego       | `#F6D3C4` | proximidade e vida quotidiana |
| Amarelo suave | `#F7E6A8` | atenção sem alarme            |

### Acentos

| Acento       | Valor     | Regra                                   |
| ------------ | --------- | --------------------------------------- |
| Coral        | `#D7654E` | detalhe visual; não recebe texto branco |
| Coral escuro | `#7A3022` | texto sobre coral suave                 |
| Amarelo      | `#F2CF63` | item ativo na navegação                 |

## Regras

1. Cor não comunica estado sozinha; ícone e texto acompanham sempre.
2. Pastéis são superfícies, nunca texto de baixo contraste.
3. Violeta é a única cor de ação principal.
4. Coral e amarelo são acentos, não competem com a ação.
5. Verde não é uma cor de marca. O sucesso usa uma família água/teal discreta.
6. Experiências podem combinar famílias pastel, mas herdam tipografia, foco,
   privacidade e contraste do sistema.
7. Combinações de texto normal têm contraste mínimo de `4.5:1`; componentes e
   estados interativos têm pelo menos `3:1`.

## Câmara mineral das experiências

Experiências autorais podem abrir uma câmara visual própria dentro da interface,
sem trocar a identidade do produto inteiro. **Estruturas de Carga** usa esta
exceção para criar concentração e materialidade:

| Token            | Valor     | Utilização                               |
| ---------------- | --------- | ---------------------------------------- |
| Basalto          | `#17191D` | fundo da câmara                          |
| Estrato          | `#202228` | controlos e superfícies                  |
| Calcário         | `#F1EDE5` | texto principal                          |
| Cinza mineral    | `#9DA2AD` | instruções e metadados                   |
| Ferrugem         | `#D58B57` | ação, progresso e pontos de ancoragem    |
| Linha estrutural | `#3B3F48` | bordas, divisões e desenho dos monólitos |

Esta paleta começa no hero da experiência e termina com o seu artefacto. A
biblioteca usa apenas uma amostra dela; agenda, definições e restantes áreas
continuam a usar “Luz de Intervalo”. Assim, a mudança de atmosfera comunica
entrada num ritual sem fragmentar o sistema.

Monólitos são diagramas, não ilustrações decorativas: altura representa duração,
espessura representa alcance e linhas de tensão respondem à proveniência. A
legenda permanece textual para que a forma nunca seja a única portadora de
informação.

## Contrastes verificados

- tinta/fundo: `13.97:1`;
- texto secundário/superfície: `5.62:1`;
- branco/violeta: `6.30:1`;
- texto coral/coral suave: `7.03:1`;
- texto da sidebar/sidebar: `15.40:1`;
- tinta da sidebar/amarelo ativo: `10.72:1`.

Os rácios são cobertos por teste automatizado para impedir regressões.
