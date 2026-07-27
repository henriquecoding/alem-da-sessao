# ADR-027 — Toda experiência produz artefacto determinístico e exportável

**Estado:** aceite. Relatório v2 §4.1.

Nenhuma experiência termina com "concluído". Toda experiência produz um objeto
com forma visual própria, revisível, comparável e reconhecível como daquela
pessoa. Uma tarefa concluída desaparece; um artefacto acumula.

**Determinismo.** Mesma entrada, mesma imagem, sempre. Sem aleatoriedade e sem
IA generativa — SVG versionado, gerado por função pura. `deterministic` é um
tipo literal `true` no manifesto: não aceita `false`.

**A restrição ética.** O artefacto não pode ficar "melhor" quando a pessoa está
"melhor". Regista forma, não valor. A estrutura não desaba nem se estabiliza
com respostas "boas" — isso reintroduziria o score pela porta dos fundos.

**Unit economics.** SVG procedural tem custo marginal ≈ 0, o que importa num
produto onde o cliente não paga (§1.6).

**Verificação.** `check:tools` exige `artifact` com `deterministic: true` e
`format: "svg"`.
