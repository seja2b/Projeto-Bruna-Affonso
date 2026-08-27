# Auditoria de Segurança e Preparação LGPD — Landing/Worker

Data: 2026-08-27

> Revisão técnica. Não é certificação de segurança nem parecer jurídico de conformidade com a LGPD.

## Escopo

- Cloudflare Worker `projeto-bruna-affonso`;
- landing page carregada de `public/index.html`;
- endpoints `/api/admin/login`, `/api/admin/session` e `/api/admin/logout`;
- checkout/cadastro externos apontados pela landing.

## Controles positivos encontrados

- código de acesso administrativo não está hardcoded no repositório e é esperado via secret `ADMIN_ACCESS_CODE`;
- comparação do código usa hash e comparação constante;
- limite de 5 tentativas com janela de 15 minutos;
- identificação de tentativa usa `CF-Connecting-IP` quando disponível;
- sessão administrativa usa token aleatório de 256 bits;
- somente hash do token de sessão é salvo no KV;
- sessão expira em 8 horas;
- logout remove a sessão do KV;
- mensagens de erro não revelam o código administrativo;
- checkout recorrente e dados de cartão ficam fora deste site, no provedor externo informado;
- PIX é concluído no aplicativo bancário do usuário.

## Hardening aplicado na branch

- nova camada `src/index-v4.js`;
- HSTS;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY` e `frame-ancestors 'none'` contra clickjacking;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `X-Permitted-Cross-Domain-Policies: none`;
- Content Security Policy compatível com o HTML legado;
- `Cache-Control: no-store` nas rotas administrativas;
- CORS das rotas administrativas limitado à própria origem do site;
- página `/privacidade`;
- canal de privacidade no rodapé.

## Achados pendentes

### MÉDIO/ALTO — HTML legado utiliza `innerHTML` extensivamente

O editor administrativo renderiza muitos campos editáveis com `innerHTML`. Conteúdo malformado/injetado pode produzir XSS no navegador do administrador. Hoje os dados editáveis são mantidos em `localStorage`, reduzindo a exposição remota, mas a prática continua sendo frágil.

Recomendação: refatorar o editor para `textContent`, atributos validados e criação de elementos DOM/templating seguro. Depois disso, remover `unsafe-inline` do CSP.

### MÉDIO — token administrativo fica em `sessionStorage`

O token fica apenas durante a sessão da aba, o que é melhor que armazenamento persistente, mas scripts executados na mesma origem ainda conseguem lê-lo.

Recomendação futura: migrar a sessão administrativa para cookie `HttpOnly`, `Secure`, `SameSite=Strict` e eliminar exposição do token ao JavaScript.

### MÉDIO — dependência runtime do HTML bruto do GitHub

O Worker busca `public/index.html` da branch `main` do GitHub durante as requisições. Isso simplifica publicação, porém cria dependência de disponibilidade e integridade do GitHub e faz qualquer mudança na `main` refletir no site sem um artefato imutável.

Recomendação: empacotar o HTML no deploy do Worker ou fixar uma versão/commit e publicar por CI controlado.

### LGPD — transparência e fornecedores

A landing não coleta dados de cartão. Entretanto, o fluxo direciona usuários para serviços de terceiros (MFit e instituição bancária/PIX). A responsável deve manter registro dos operadores efetivamente utilizados, verificar contratos/políticas e avaliar eventual transferência internacional de dados.

## Política de Privacidade

A página `/privacidade` foi adicionada com:

- categorias de dados;
- finalidades;
- explicação de pagamentos externos;
- aviso sobre possíveis dados relacionados à saúde;
- medidas de segurança;
- retenção;
- direitos do titular;
- canal de contato `brunaribeiroac@gmail.com`.

A definição final de bases legais, prazo de retenção e cláusulas com fornecedores deve ser validada juridicamente antes de declarar conformidade integral.
