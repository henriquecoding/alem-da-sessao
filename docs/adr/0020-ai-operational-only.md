# ADR-020 — IA apenas sobre dados operacionais do profissional

**Estado:** aceite. Relatório v2 §4.7 e §8.3.

Nenhum conteúdo de cliente é enviado a qualquer modelo, em qualquer
circunstância. A IA pode existir do lado do profissional e apenas em
superfícies administrativas — horários, emails operacionais, resumo de agenda
— nunca sobre conteúdo clínico.

**Porquê.** É o contraposicionamento central: _a IA nunca lê o que você
escreve_. A inteligência que importa aqui é a do psicólogo, não a do modelo.

**Consequência regulatória.** O Artigo 50 do AI Act (transparência) aplica-se
desde 02/08/2026: qualquer IA voltada ao profissional exige divulgação da
interação. Reconhecimento de emoções é proibido em trabalho e ensino e de alto
risco fora deles — qualquer funcionalidade que infira estado emocional a
partir de texto, voz ou imagem entra nesse regime. Nós não entramos.

**Verificação.** `check:privacy` (regra F2) falha o build se qualquer pacote de
conteúdo importar um cliente de LLM.
