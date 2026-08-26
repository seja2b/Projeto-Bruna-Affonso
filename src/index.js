const SESSION_TTL = 60 * 60 * 8;
const ATTEMPT_TTL = 60 * 15;
const MAX_ATTEMPTS = 5;

const PAYMENT_SECTION = `
  <section id="preco">
    <div class="container">
      <p class="investment-eyebrow">● INVESTIMENTO</p>
      <h2>Escolha a melhor forma de começar</h2>
      <p class="investment-lead">Tenha acompanhamento personalizado com uma forma de pagamento que faça sentido para você.</p>

      <div class="payment-shell">
        <div class="payment-tabs" role="tablist" aria-label="Formas de pagamento">
          <button class="payment-tab active" type="button" role="tab" aria-selected="true" aria-controls="payment-monthly" data-payment-tab="monthly" onclick="switchPaymentTab('monthly')">
            <span class="payment-tab-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span><strong>Mensal recorrente</strong><small>R$ 250 por mês</small></span>
          </button>
          <button class="payment-tab" type="button" role="tab" aria-selected="false" aria-controls="payment-pix" data-payment-tab="pix" onclick="switchPaymentTab('pix')">
            <span class="payment-tab-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m8.1 4.6 2.2-2.2a2.4 2.4 0 0 1 3.4 0l2.2 2.2M4.6 8.1 2.4 10.3a2.4 2.4 0 0 0 0 3.4l2.2 2.2M15.9 19.4l-2.2 2.2a2.4 2.4 0 0 1-3.4 0l-2.2-2.2M19.4 15.9l2.2-2.2a2.4 2.4 0 0 0 0-3.4l-2.2-2.2M8.3 8.3l7.4 7.4M15.7 8.3l-7.4 7.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span><strong>Pagamento via PIX</strong><small>3 ou 6 meses</small></span>
          </button>
        </div>

        <div id="payment-monthly" class="payment-panel active" data-payment-panel="monthly" role="tabpanel">
          <div class="payment-card payment-card-featured">
            <div class="payment-card-copy">
              <span class="payment-badge">PLANO MENSAL</span>
              <h3>Acompanhamento recorrente</h3>
              <p class="payment-description">Cobrança mensal automática para você manter o acompanhamento ativo de forma simples e prática.</p>
              <div class="payment-benefits">
                <div><span>✓</span> Treinos personalizados</div>
                <div><span>✓</span> Acompanhamento individual</div>
                <div><span>✓</span> Correção dos exercícios</div>
                <div><span>✓</span> Videoaulas e conteúdos extras</div>
              </div>
            </div>
            <div class="payment-card-action">
              <span class="payment-price-label">Investimento mensal</span>
              <div class="payment-price"><span>R$</span> 250<small>/mês</small></div>
              <a class="payment-primary-btn" href="https://pages.mfitpersonal.com.br/p/lsk?checkout=true" target="_blank" rel="noopener noreferrer">Assinar plano mensal</a>
              <p class="payment-note">Checkout seguro pela MFit Personal</p>
            </div>
          </div>
        </div>

        <div id="payment-pix" class="payment-panel" data-payment-panel="pix" role="tabpanel" hidden>
          <div class="pix-heading">
            <span class="payment-badge payment-badge-soft">PAGAMENTO À VISTA</span>
            <h3>Escolha o período de acompanhamento</h3>
            <p>Copie o PIX da opção desejada e conclua o pagamento no seu banco.</p>
          </div>

          <div class="pix-plans">
            <article class="pix-plan-card">
              <div>
                <span class="pix-plan-period">3 MESES</span>
                <h4>Acompanhamento trimestral</h4>
                <p>Três meses de acompanhamento personalizado.</p>
              </div>
              <div class="pix-plan-price">R$ 600</div>
              <button class="copy-pix-btn" type="button" data-pix="00020126590014BR.GOV.BCB.PIX0111083141835470222consultoria trimestral5204000053039865406600.005802BR5924Bruna Ribeiro Affonso de6009SAO PAULO62140510Ok1WygFVZZ6304C4D2" onclick="copyPixCode(this)">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                <span>Copiar código PIX</span>
              </button>
            </article>

            <article class="pix-plan-card">
              <div>
                <span class="pix-plan-period">6 MESES</span>
                <h4>Acompanhamento semestral</h4>
                <p>Seis meses de acompanhamento personalizado.</p>
              </div>
              <div class="pix-plan-price">R$ 1.200</div>
              <button class="copy-pix-btn" type="button" data-pix="00020126330014BR.GOV.BCB.PIX01110831418354752040000530398654071200.005802BR5924Bruna Ribeiro Affonso de6009SAO PAULO62140510oKLFius8uy6304156C" onclick="copyPixCode(this)">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                <span>Copiar código PIX</span>
              </button>
            </article>
          </div>

          <div class="signup-after-pix">
            <div class="signup-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M15 19v-1.5A3.5 3.5 0 0 0 11.5 14h-5A3.5 3.5 0 0 0 3 17.5V19M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 8v6M14 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </div>
            <div>
              <strong>Já realizou o pagamento?</strong>
              <p>Crie seu cadastro para iniciar o acesso à plataforma e dar sequência ao acompanhamento.</p>
            </div>
            <a href="https://client.mfitpersonal.com.br/out/signup-link/Njk2NjE=" target="_blank" rel="noopener noreferrer">Criar meu cadastro</a>
          </div>
        </div>
      </div>

      <div class="payment-support">
        <div class="support-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L4 20l1.1-4a8.4 8.4 0 1 1 15.4-4.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.2 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7.4.8 1 1.5 1.7 2 .8.6 1.5.8 1.8.9.3.1.5 0 .7-.2l.8-1c.2-.2.4-.3.7-.2l1.8.8c.3.1.5.2.5.4 0 .2 0 1-.5 1.8-.5.8-1.5 1.5-2.8 1.5-1.3 0-3-.5-5.2-2.4-2.3-2-3.7-4.4-3.8-6-.1-1.5.6-2.4 1-2.8.4-.4.9-.6 1.5-.6Z" fill="currentColor" opacity=".75"/></svg>
        </div>
        <div>
          <span>PRECISA DE AJUDA?</span>
          <strong>Ficou com alguma dúvida sobre o pagamento?</strong>
          <p>Fale diretamente com a Bruna pelo WhatsApp.</p>
        </div>
        <a class="whatsapp-btn" href="https://wa.me/5571984369339?text=Ol%C3%A1%2C%20Bruna!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20consultoria%20e%20as%20formas%20de%20pagamento." target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
      </div>
    </div>
  </section>`;

const PAYMENT_STYLES = `
<style id="payment-options-styles">
  #preco { padding: 92px 0; }
  #preco .investment-eyebrow { margin: 0 0 10px; text-align: center; color: #b7c0d3; font-size: 12px; font-weight: 800; letter-spacing: .16em; }
  #preco .investment-lead { max-width: 650px; margin: 0 auto; text-align: center; color: #9ca7bb; font-size: 15px; line-height: 1.7; }
  .payment-shell { max-width: 1000px; margin: 42px auto 0; overflow: hidden; border: 1px solid rgba(255,255,255,.08); border-radius: 30px; background: #fff; box-shadow: 0 36px 90px rgba(0,0,0,.3); }
  .payment-tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 8px; gap: 8px; border-bottom: 1px solid #e8eaf0; background: #f5f6fa; }
  .payment-tab { min-width: 0; padding: 16px 18px; display: flex; align-items: center; justify-content: center; gap: 12px; border: 0; border-radius: 18px; color: #667085; background: transparent; cursor: pointer; font: inherit; text-align: left; transition: .22s ease; }
  .payment-tab:hover { color: #6d28d9; background: rgba(124,58,237,.06); }
  .payment-tab.active { color: white; background: linear-gradient(100deg, #7c3aed, #a936ca 55%, #ec4899); box-shadow: 0 12px 28px rgba(124,58,237,.22); }
  .payment-tab-icon { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 12px; opacity: .9; }
  .payment-tab-icon svg { width: 20px; height: 20px; }
  .payment-tab strong, .payment-tab small { display: block; }
  .payment-tab strong { margin-bottom: 2px; font-size: 14px; }
  .payment-tab small { color: inherit; font-size: 11px; opacity: .72; }
  .payment-panel { padding: 34px; }
  .payment-panel[hidden] { display: none !important; }
  .payment-card { display: grid; grid-template-columns: 1.05fr .95fr; overflow: hidden; border: 1px solid #e8e7ef; border-radius: 24px; background: #fff; }
  .payment-card-copy { padding: 38px; color: white; background: radial-gradient(circle at 0 0, rgba(255,255,255,.18), transparent 35%), linear-gradient(145deg, #7c3aed, #a936ca 54%, #ec4899); }
  .payment-badge { display: inline-flex; padding: 7px 11px; border: 1px solid rgba(255,255,255,.3); border-radius: 999px; font-size: 10px; font-weight: 850; letter-spacing: .15em; }
  .payment-card-copy h3 { margin: 22px 0 10px; font-size: clamp(1.8rem, 3vw, 2.4rem); letter-spacing: -.045em; }
  .payment-description { max-width: 470px; margin: 0; color: rgba(255,255,255,.78); font-size: 14px; line-height: 1.7; }
  .payment-benefits { display: grid; gap: 11px; margin-top: 26px; }
  .payment-benefits div { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; }
  .payment-benefits span { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; color: #7429b7; background: white; font-size: 11px; }
  .payment-card-action { padding: 38px; display: flex; flex-direction: column; justify-content: center; text-align: center; background: linear-gradient(180deg, #fff, #fbfaff); }
  .payment-price-label { color: #687386; font-size: 12px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; }
  .payment-price { margin: 10px 0 24px; color: #151d31; font-size: clamp(3.4rem, 7vw, 5rem); font-weight: 850; line-height: .95; letter-spacing: -.065em; }
  .payment-price > span { margin-right: 4px; font-size: .32em; vertical-align: top; letter-spacing: 0; }
  .payment-price small { margin-left: 5px; color: #7d8798; font-size: .21em; font-weight: 700; letter-spacing: 0; }
  .payment-primary-btn { width: 100%; padding: 16px 20px; border-radius: 999px; color: white; text-decoration: none; font-weight: 800; background: linear-gradient(90deg, #7c3aed, #ec4899); box-shadow: 0 16px 34px rgba(124,58,237,.24); transition: .22s ease; }
  .payment-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 38px rgba(124,58,237,.3); }
  .payment-note { margin: 12px 0 0; color: #98a2b3; font-size: 11px; }
  .pix-heading { max-width: 680px; margin: 0 auto 28px; text-align: center; }
  .payment-badge-soft { color: #7c3aed; border-color: rgba(124,58,237,.18); background: #f3edff; }
  .pix-heading h3 { margin: 14px 0 7px; color: #151d31; font-size: 1.8rem; letter-spacing: -.035em; }
  .pix-heading p { margin: 0; color: #727d90; font-size: 13px; }
  .pix-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .pix-plan-card { padding: 26px; display: flex; flex-direction: column; border: 1px solid #e6e7ed; border-radius: 20px; background: linear-gradient(180deg, #fff, #fbfbfd); box-shadow: 0 12px 32px rgba(15,23,42,.06); }
  .pix-plan-period { color: #7c3aed; font-size: 10px; font-weight: 850; letter-spacing: .15em; }
  .pix-plan-card h4 { margin: 8px 0 5px; color: #172033; font-size: 18px; letter-spacing: -.025em; }
  .pix-plan-card p { min-height: 42px; margin: 0; color: #798396; font-size: 12px; line-height: 1.6; }
  .pix-plan-price { margin: 22px 0 18px; color: #151d31; font-size: 2.35rem; font-weight: 850; letter-spacing: -.055em; }
  .copy-pix-btn { width: 100%; min-height: 48px; margin-top: auto; padding: 12px 15px; display: flex; align-items: center; justify-content: center; gap: 9px; border: 1px solid rgba(124,58,237,.18); border-radius: 13px; color: #6d28d9; background: #f5f0ff; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; transition: .2s ease; }
  .copy-pix-btn:hover { background: #ede4ff; transform: translateY(-1px); }
  .copy-pix-btn.copied { color: #087a45; border-color: rgba(16,185,129,.22); background: #ecfdf5; }
  .copy-pix-btn svg { width: 18px; height: 18px; }
  .signup-after-pix { margin-top: 20px; padding: 22px 24px; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; border: 1px solid #e8e8ef; border-radius: 18px; background: #f8f9fc; }
  .signup-icon { width: 45px; height: 45px; display: grid; place-items: center; border-radius: 14px; color: #7c3aed; background: #ede7ff; }
  .signup-icon svg { width: 22px; height: 22px; }
  .signup-after-pix strong { color: #172033; font-size: 14px; }
  .signup-after-pix p { margin: 3px 0 0; color: #7a8496; font-size: 11px; line-height: 1.55; }
  .signup-after-pix a { padding: 12px 17px; white-space: nowrap; border-radius: 12px; color: white; text-decoration: none; font-size: 12px; font-weight: 800; background: #172033; }
  .payment-support { max-width: 1000px; margin: 20px auto 0; padding: 22px 24px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 17px; border: 1px solid rgba(255,255,255,.09); border-radius: 20px; color: white; background: rgba(255,255,255,.055); backdrop-filter: blur(12px); }
  .support-icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 15px; color: #25d366; background: rgba(37,211,102,.1); }
  .support-icon svg { width: 25px; height: 25px; }
  .payment-support span { display: block; margin-bottom: 3px; color: #25d366; font-size: 9px; font-weight: 850; letter-spacing: .15em; }
  .payment-support strong { display: block; font-size: 14px; }
  .payment-support p { margin: 2px 0 0; color: #9ba6ba; font-size: 11px; }
  .whatsapp-btn { padding: 12px 18px; white-space: nowrap; border-radius: 999px; color: #072d1a; text-decoration: none; font-size: 12px; font-weight: 850; background: #25d366; box-shadow: 0 12px 28px rgba(37,211,102,.18); transition: .2s ease; }
  .whatsapp-btn:hover { transform: translateY(-2px); background: #31df73; }
  @media (max-width: 760px) {
    #preco { padding: 72px 0; }
    .payment-shell { margin-top: 32px; border-radius: 23px; }
    .payment-tabs { grid-template-columns: 1fr; }
    .payment-tab { justify-content: flex-start; }
    .payment-panel { padding: 20px; }
    .payment-card, .pix-plans { grid-template-columns: 1fr; }
    .payment-card-copy, .payment-card-action { padding: 28px 24px; }
    .pix-plan-card p { min-height: 0; }
    .signup-after-pix, .payment-support { grid-template-columns: auto 1fr; }
    .signup-after-pix a, .whatsapp-btn { grid-column: 1 / -1; width: 100%; text-align: center; }
  }
  @media (max-width: 440px) {
    .payment-panel { padding: 14px; }
    .payment-card-copy, .payment-card-action, .pix-plan-card { padding: 24px 20px; }
    .payment-price { font-size: 3.6rem; }
    .payment-support { padding: 18px; }
  }
</style>`;

const PAYMENT_SCRIPT = `
<script id="payment-options-script">
  function switchPaymentTab(tab) {
    document.querySelectorAll('[data-payment-tab]').forEach(function(button) {
      var active = button.dataset.paymentTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-payment-panel]').forEach(function(panel) {
      var active = panel.dataset.paymentPanel === tab;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  async function copyPixCode(button) {
    var code = button.dataset.pix || '';
    var label = button.querySelector('span');
    var original = label ? label.textContent : 'Copiar código PIX';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        var textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      button.classList.add('copied');
      if (label) label.textContent = 'PIX copiado!';
      window.setTimeout(function() {
        button.classList.remove('copied');
        if (label) label.textContent = original;
      }, 2600);
    } catch (error) {
      if (label) label.textContent = 'Não foi possível copiar';
      window.setTimeout(function() {
        if (label) label.textContent = original;
      }, 2600);
    }
  }
</script>`;

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowed = new Set([
    'https://htmlpreview.github.io',
    'https://projeto-bruna-affonso.seja2b-br.workers.dev'
  ]);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin'
  };
  if (origin && allowed.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(request, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request) }
  });
}

function enhancePaymentSection(html) {
  const sectionPattern = /<section id="preco">[\s\S]*?<\/section>/;
  if (!sectionPattern.test(html)) return html;

  let enhanced = html.replace(sectionPattern, PAYMENT_SECTION);
  if (!enhanced.includes('payment-options-styles')) {
    enhanced = enhanced.replace('</head>', `${PAYMENT_STYLES}\
</head>`);
  }
  if (!enhanced.includes('payment-options-script')) {
    enhanced = enhanced.replace('</body>', `${PAYMENT_SCRIPT}\
</body>`);
  }
  return enhanced;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function safeHexEquals(left, right) {
  let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function secureEquals(left, right) {
  if (!left || !right) return false;
  const [leftHash, rightHash] = await Promise.all([sha256(left), sha256(right)]);
  return safeHexEquals(leftHash, rightHash);
}

function randomToken() {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return [...buffer].map(value => value.toString(16).padStart(2, '0')).join('');
}

function bearerToken(request) {
  const value = request.headers.get('Authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

async function attemptKey(request) {
  const source = request.headers.get('CF-Connecting-IP') || request.headers.get('User-Agent') || 'unknown';
  return `admin-attempts:${await sha256(source)}`;
}

async function login(request, env) {
  if (!env.ADMIN_ACCESS_CODE) {
    console.error('[Admin Auth] ADMIN_ACCESS_CODE is missing');
    return json(request, { success: false, error: 'Acesso administrativo indisponível.' }, 503);
  }

  const key = await attemptKey(request);
  const attempts = Number(await env.CODES.get(key) || 0);
  if (attempts >= MAX_ATTEMPTS) {
    return json(request, { success: false, error: 'Muitas tentativas. Aguarde 15 minutos.' }, 429);
  }

  const { accessCode = '' } = await request.json();
  if (!(await secureEquals(accessCode, env.ADMIN_ACCESS_CODE))) {
    await env.CODES.put(key, String(attempts + 1), { expirationTtl: ATTEMPT_TTL });
    return json(request, { success: false, error: 'Código de acesso inválido.' }, 401);
  }

  await env.CODES.delete(key);
  const sessionToken = randomToken();
  await env.CODES.put(`admin-session:${await sha256(sessionToken)}`, JSON.stringify({ createdAt: Date.now() }), {
    expirationTtl: SESSION_TTL
  });
  return json(request, { success: true, sessionToken, expiresIn: SESSION_TTL });
}

async function validateSession(request, env) {
  const token = bearerToken(request);
  if (!token) return json(request, { success: false }, 401);
  const session = await env.CODES.get(`admin-session:${await sha256(token)}`);
  return session ? json(request, { success: true }) : json(request, { success: false }, 401);
}

async function logout(request, env) {
  const token = bearerToken(request);
  if (token) await env.CODES.delete(`admin-session:${await sha256(token)}`);
  return json(request, { success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
    try {
      if (url.pathname === '/api/admin/login' && request.method === 'POST') return await login(request, env);
      if (url.pathname === '/api/admin/session' && request.method === 'GET') return await validateSession(request, env);
      if (url.pathname === '/api/admin/logout' && request.method === 'POST') return await logout(request, env);

      const page = await fetch('https://raw.githubusercontent.com/seja2b/Projeto-Bruna-Affonso/main/public/index.html');
      const html = enhancePaymentSection(await page.text());
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders(request) } });
    } catch (error) {
      console.error('[Worker Error]', error);
      return json(request, { success: false, error: 'Erro interno. Tente novamente.' }, 500);
    }
  }
};
