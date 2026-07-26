# Threat model inicial

## Ativos

- identidade e sessões;
- relações de cuidado;
- agenda e localizações privadas;
- notas e respostas de experiências;
- snapshots partilhados;
- consentimentos, auditoria e dados comerciais.

## Cenários prioritários

1. acesso cruzado entre organizações;
2. profissional sem relação tenta abrir um cliente;
3. assistente tenta ler notas ou snapshots;
4. cliente tenta enumerar outro cliente;
5. administrador usa suporte para procurar conteúdo;
6. rascunho privado é enviado antes de uma partilha;
7. token de convite ou link assinado é reutilizado;
8. webhook falso altera entitlements;
9. logs, URL, email ou analytics recebem conteúdo sensível;
10. retry duplica sessão, cobrança ou snapshot;
11. restore reintroduz dados eliminados;
12. uma migration remove grants necessários ou abre uma policy.

## Fronteiras

- browser → Next.js;
- Next.js → DAL server-only;
- DAL → Supabase clínico;
- site público → Supabase público;
- worker → outbox e fornecedores;
- administração → metadata operacional;
- experiência → runtime versionado e snapshot.

## Regra de lançamento

Nenhum cenário acima pode ser aceite por confiança na interface. Cada um precisa
de controlo no servidor/base, teste negativo e evidência antes do beta.
