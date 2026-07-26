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
- nenhuma IA clínica, chat, áudio ou vídeo.

## Antes de dados reais

- revisão jurídica e DPIA/AIPD Portugal–Brasil;
- revisão clínica independente de cada experiência;
- Supabase pago e isolado na região escolhida;
- MFA/AAL2 obrigatório;
- testes RLS completos contra JWTs reais;
- cifragem no DAL com gestão e rotação de chaves;
- rate limit, idempotência, outbox e auditoria operacionais;
- backups, Storage backup e ensaio de restauro;
- gestão de incidentes e break-glass com segunda autorização;
- pentest/revisão externa proporcional ao risco.

## Comunicação de vulnerabilidades

Enquanto o projeto for privado, registe a ocorrência diretamente com o
proprietário sem colocar dados, tokens ou provas sensíveis numa issue. O canal
público de segurança só será definido antes do beta.
