# Engine — Estruturas de Carga

Versão funcional: `0.3.0`

## Promessa

Transformar responsabilidades difusas numa planta privada e legível. A pessoa
pode usá-la para preparar a próxima conversa ou depositar um recorte anónimo na
parede pública. A experiência não avalia a pessoa, não recomenda conduta
clínica e não publica informação por defeito.

## Percurso

| Etapa        | Decisão da pessoa                                 | Resposta visual                        |
| ------------ | ------------------------------------------------- | -------------------------------------- |
| Assentar     | selecionar até quatro responsabilidades concretas | blocos entram na fundação              |
| Medir        | indicar alcance, duração e marcas percebidas      | monólitos ganham altura e espessura    |
| Proveniência | distinguir carga assumida, partilhada ou herdada  | traçado estrutural muda                |
| Ancorar      | escolher movimento, apoio possível e visibilidade | gesto de sustentação confirma intenção |
| Planta       | rever, excluir itens e decidir se quer partilhar  | artefacto final com legenda e nota     |

## Estado

Cada carga guarda:

- identificador e rótulo concreto;
- alcance de `1` a `5`;
- duração em meses;
- proveniência;
- movimento escolhido;
- inclusão ou exclusão da partilha.

A síntese inclui ainda marcas percebidas, apoio que pode entrar, pessoas de quem
a carga tem sido escondida e uma nota curta para a próxima sessão.

## Regras de produto

1. Guardar e partilhar são ações diferentes.
2. Voltar não elimina decisões já tomadas.
3. A escrita livre é curta e desencoraja dados identificáveis.
4. A “massa estrutural” é `alcance × duração`, uma representação simbólica sem
   significado clínico.
5. Nada é partilhado sem pré-visualização e confirmação.
6. A engine funciona integralmente por teclado; o gesto tátil tem alternativa
   equivalente.
7. A localização em português europeu e brasileiro inclui instruções, erros e
   metadados — não apenas títulos.

## Percurso público e gratuito

As rotas `/pt/experiencias/estruturas-de-carga` e
`/br/experiencias/estruturas-de-carga` funcionam sem conta. Ao confirmar um
depósito, o servidor recebe somente as cargas assinaladas, medidas simbólicas,
proveniência e movimento. Os seguintes campos são excluídos do contrato público:

- marcas de compressão;
- apoio escolhido;
- limite de visibilidade;
- nota para a próxima sessão;
- qualquer identificador de cliente, profissional ou registo clínico.

Opções predefinidas podem aparecer imediatamente. Cargas com escrita livre
ficam pendentes; padrões de email, URL, telefone e identificadores sociais são
bloqueados. Cada navegador recebe um identificador aleatório em cookie
`HttpOnly`, pseudonimizado no servidor por HMAC. O valor bruto não entra na
base, e o hash serve apenas para limitar depósitos e impedir apoio repetido.

A parede não oferece texto livre de resposta. “Sustentar por um instante” é um
gesto sem mensagem, identidade ou ligação entre pessoas. Estruturas expiram
após 180 dias e a moderação pode ocultá-las.

## Qualidade verificável

O esquema partilhado valida limites e enumerações antes de qualquer persistência.
Testes cobrem o percurso principal, localização e semântica dos controlos
binários. A verificação de release pode ser executada sem GitHub Actions:

```bash
pnpm verify:release
```

O comando executa lint, TypeScript, testes, verificações de localização e
privacidade, seguido do build de produção.
