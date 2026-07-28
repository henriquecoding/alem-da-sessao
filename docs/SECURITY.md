# Segurança

Esta fundação é uma arquitetura segura para prototipagem, não uma declaração de
prontidão clínica.

## Garantias já presentes

- dados fictícios por padrão;
- rascunhos íntimos apenas em memória no primeiro runtime de experiência;
- dois planos de dados documentados e migrations separadas;
- RLS deny-by-default com testes negativos iniciais;
- partilha modelada como snapshot;
- notas modeladas como `draft → signed → amended`;
- administração comum sem acesso a conteúdo clínico;
- headers defensivos e `noindex` global enquanto não existe lançamento;
- nenhuma chave privilegiada importável pelo browser;
- parede comunitária num plano público separado, sem ligação a registos
  clínicos;
- contrato público remove notas, marcas, apoio escolhido e limite de
  visibilidade;
- cookie comunitário `HttpOnly` pseudonimizado por HMAC, sem IP bruto
  persistido;
- publicação limitada, conteúdo identificável bloqueado, escrita livre sujeita
  a moderação e estruturas com expiração;
- apoio sem texto, identidade, perfil ou contacto direto;
- nenhuma IA clínica, chat, áudio ou vídeo.
- autenticação obrigatória fora do modo fixture e MFA/AAL2 para superfícies
  profissionais e administrativas;
- permissões clínicas limitadas por papel e relação de cuidado ativa;
- faturação isolada noutro projeto Supabase, sem joins ou chaves para o plano
  clínico;
- lançamento público bloqueado por evidências externas verificáveis, nunca por
  um boolean isolado.

## Antes de dados reais

- revisão jurídica e DPIA/AIPD Portugal–Brasil;
- revisão clínica independente de cada experiência;
- Supabase pago e isolado na região escolhida;
- MFA/AAL2 obrigatório;
- testes RLS completos contra JWTs reais;
- cifragem no DAL com gestão e rotação de chaves;
- rate limit, idempotência, outbox e auditoria operacionais;
- fila e SLA de moderação, denúncia, ocultação e recurso para conteúdo público;
- backups, Storage backup e ensaio de restauro;
- gestão de incidentes e break-glass com segunda autorização;
- pentest/revisão externa proporcional ao risco.

## Comunicação de vulnerabilidades

O repositório pode estar publicamente visível, mas uma vulnerabilidade não deve
ser descrita numa issue pública. Use **Security → Report a vulnerability** no
GitHub quando o formulário privado estiver disponível. Se não estiver, contacte
o proprietário através do perfil verificado sem enviar dados pessoais, tokens
ou uma prova explorável. Um contacto dedicado e SLA são gates obrigatórios
antes do beta.
