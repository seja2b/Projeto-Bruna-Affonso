import app from './index-v3.js';

const PRIVACY_STYLES = `
<style id="privacy-link-styles">
  #footer .legal-links {
    margin: 18px auto 0;
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    font-size: .72rem;
  }
  #footer .legal-links a {
    color: #c5cbe0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  #footer .legal-links a:hover { color: #ffffff; }
</style>`;

const PRIVACY_LINKS = `
<div class="legal-links" aria-label="Privacidade e informações legais">
  <a href="/privacidade">Política de Privacidade</a>
  <a href="mailto:brunaribeiroac@gmail.com?subject=Privacidade%20e%20dados%20pessoais">Canal de privacidade</a>
</div>`;

const PRIVACY_PAGE = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Política de Privacidade · Bruna Affonso</title>
  <meta name="description" content="Informações sobre privacidade e tratamento de dados pessoais nos serviços digitais de Bruna Affonso.">
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b1020;color:#e8ecf6;line-height:1.7}.wrap{width:min(880px,calc(100% - 36px));margin:0 auto;padding:64px 0 90px}.back{display:inline-block;margin-bottom:30px;color:#d7b8ff;text-decoration:none}.card{padding:clamp(26px,5vw,52px);border:1px solid rgba(255,255,255,.09);border-radius:26px;background:#121a30;box-shadow:0 28px 70px rgba(0,0,0,.24)}h1{margin:0 0 10px;font-size:clamp(2rem,5vw,3.5rem);line-height:1.08}h2{margin:34px 0 10px;font-size:1.2rem;color:#f4eaff}p,li{color:#b8c1d6}strong{color:#fff}a{color:#d7b8ff}ul{padding-left:22px}.meta{margin-bottom:30px;color:#8591aa;font-size:.82rem}.notice{margin-top:34px;padding:18px;border:1px solid rgba(167,139,250,.2);border-radius:16px;background:rgba(124,58,237,.08);font-size:.9rem}
  </style>
</head>
<body>
  <main class="wrap">
    <a class="back" href="/">← Voltar ao site</a>
    <article class="card">
      <h1>Política de Privacidade</h1>
      <p class="meta">Última atualização: 27 de agosto de 2026</p>
      <p>Esta página explica, de forma transparente, como dados pessoais podem ser tratados nos serviços digitais relacionados à consultoria de <strong>Bruna Ribeiro Affonso</strong>. Para questões de privacidade, solicitações ou dúvidas, utilize <a href="mailto:brunaribeiroac@gmail.com">brunaribeiroac@gmail.com</a>.</p>

      <h2>1. Dados tratados</h2>
      <p>A página comercial pode ser acessada sem criação de conta. Quando o usuário utiliza a plataforma de acompanhamento ou serviços vinculados, podem ser tratados dados como nome, e-mail, telefone, foto de perfil, registros de treino, progresso, perguntas, respostas e observações fornecidas durante o acompanhamento.</p>

      <h2>2. Finalidades</h2>
      <ul>
        <li>viabilizar cadastro, autenticação e acesso à plataforma;</li>
        <li>prestar e personalizar o acompanhamento contratado;</li>
        <li>registrar progresso, treinos, perguntas e feedbacks;</li>
        <li>realizar atendimento e comunicações relacionadas ao serviço;</li>
        <li>proteger contas, prevenir abuso e manter a segurança dos sistemas;</li>
        <li>cumprir obrigações legais e exercer direitos quando aplicável.</li>
      </ul>

      <h2>3. Pagamentos e serviços de terceiros</h2>
      <p>Os dados de cartão do plano recorrente não são coletados nem armazenados por este site. O checkout é realizado em ambiente externo da MFit Personal. Pagamentos via PIX são concluídos no aplicativo bancário do próprio usuário. Ao acessar serviços externos, o tratamento realizado pelo respectivo provedor também fica sujeito às políticas e termos desse terceiro.</p>

      <h2>4. Dados relacionados à saúde</h2>
      <p>Informações inseridas em campos de acompanhamento podem, dependendo do conteúdo, revelar dados relacionados à saúde. A orientação é fornecer apenas o necessário para a prestação do serviço e evitar o envio de informações clínicas que não sejam necessárias. Quando houver tratamento de dado pessoal sensível, devem ser observadas as hipóteses e salvaguardas específicas previstas na LGPD.</p>

      <h2>5. Segurança</h2>
      <p>São utilizados controles técnicos de autenticação, autorização, limitação de tentativas, conexão HTTPS e outras medidas de segurança. Nenhum sistema conectado à internet pode ser considerado invulnerável; os controles são revisados e aprimorados de forma contínua.</p>

      <h2>6. Retenção</h2>
      <p>Os dados devem ser mantidos pelo período necessário para as finalidades do acompanhamento, cumprimento de obrigações legais e exercício regular de direitos. A política operacional de retenção e descarte está em processo de formalização técnica e administrativa.</p>

      <h2>7. Direitos do titular</h2>
      <p>O titular pode solicitar informações, acesso, correção, portabilidade quando aplicável, anonimização, bloqueio ou eliminação nos casos previstos em lei, além de esclarecimentos sobre o tratamento de seus dados. As solicitações podem ser encaminhadas para <a href="mailto:brunaribeiroac@gmail.com?subject=Solicita%C3%A7%C3%A3o%20LGPD">brunaribeiroac@gmail.com</a>. Poderá ser necessário confirmar a identidade do solicitante antes de atender pedidos que envolvam dados pessoais.</p>

      <h2>8. Atualizações</h2>
      <p>Esta política pode ser atualizada para refletir mudanças nos serviços, fornecedores, requisitos legais ou controles de segurança.</p>

      <div class="notice"><strong>Nota:</strong> esta política descreve o estado técnico observado dos serviços. A definição final de bases legais, prazos de retenção e cláusulas com operadores deve ser validada pela responsável pelo tratamento com suporte jurídico quando necessário.</div>
    </article>
  </main>
</body>
</html>`;

function addPrivacyLinks(html) {
  let updated = html;
  if (!updated.includes('privacy-link-styles')) {
    updated = updated.replace('</head>', `${PRIVACY_STYLES}\n</head>`);
  }
  if (!updated.includes('class="legal-links"')) {
    updated = updated.replace('</footer>', `${PRIVACY_LINKS}\n</footer>`);
  }
  return updated;
}

function securityHeaders(headers, request, pathname, contentType) {
  const secured = new Headers(headers);
  const origin = request.headers.get('Origin');
  const ownOrigin = new URL(request.url).origin;

  secured.set('X-Content-Type-Options', 'nosniff');
  secured.set('X-Frame-Options', 'DENY');
  secured.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  secured.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  secured.set('X-Permitted-Cross-Domain-Policies', 'none');
  secured.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // A landing atual usa CSS e handlers inline. O CSP reduz origens externas,
  // mas mantém unsafe-inline até que o HTML legado seja refatorado.
  if (contentType.includes('text/html')) {
    secured.set('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self' https://pages.mfitpersonal.com.br https://client.mfitpersonal.com.br",
      'upgrade-insecure-requests'
    ].join('; '));
  }

  if (pathname.startsWith('/api/admin')) {
    secured.set('Cache-Control', 'no-store');
    secured.delete('Access-Control-Allow-Origin');
    if (origin && origin === ownOrigin) {
      secured.set('Access-Control-Allow-Origin', origin);
    }
    secured.set('Vary', 'Origin');
  }

  secured.delete('Content-Length');
  return secured;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/privacidade' && request.method === 'GET') {
      const headers = securityHeaders(new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }), request, url.pathname, 'text/html');
      return new Response(PRIVACY_PAGE, { status: 200, headers });
    }

    const response = await app.fetch(request, env, ctx);
    const contentType = response.headers.get('Content-Type') || '';
    const headers = securityHeaders(response.headers, request, url.pathname, contentType);

    if (!contentType.includes('text/html')) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    const html = addPrivacyLinks(await response.text());
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
