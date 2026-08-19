const SESSION_TTL = 60 * 60 * 8;
const CODE_TTL = 60 * 10;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const emailHash = email => sha256(normalizeEmail(email));

function allowedEmails(env) {
  return new Set((env.ADMIN_EMAILS || '').split(',').map(normalizeEmail).filter(Boolean));
}

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

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function secureEquals(left, right) {
  if (!left || !right) return false;
  const [a, b] = await Promise.all([sha256(left), sha256(right)]);
  return safeHexEquals(a, b);
}

function safeHexEquals(a, b) {
  let difference = a.length ^ b.length;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
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

async function requestCode(request, env) {
  if (!env.ADMIN_ACCESS_CODE || !env.ADMIN_EMAILS || !env.SENDGRID_API_KEY) {
    console.error('[Admin Auth] Required secrets are missing');
    return json(request, { success: false, error: 'Autenticação administrativa indisponível.' }, 503);
  }

  const { email: rawEmail, accessCode = '' } = await request.json();
  const email = normalizeEmail(rawEmail);
  const isAuthorized = allowedEmails(env).has(email) && await secureEquals(accessCode, env.ADMIN_ACCESS_CODE);
  if (!isAuthorized) return json(request, { success: false, error: 'Código privado ou e-mail não autorizado.' }, 403);

  const hash = await emailHash(email);
  if (await env.CODES.get(`admin-cooldown:${hash}`)) {
    return json(request, { success: false, error: 'Aguarde um minuto antes de solicitar outro código.' }, 429);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeKey = `admin-code:${hash}`;
  await env.CODES.put(codeKey, JSON.stringify({ hash: await sha256(code), attempts: 0 }), { expirationTtl: CODE_TTL });
  await env.CODES.put(`admin-cooldown:${hash}`, '1', { expirationTtl: 60 });

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: env.ADMIN_FROM_EMAIL || 'noreply@consultoriaba.com', name: 'Bruna Affonso' },
      subject: 'Seu código de acesso administrativo',
      content: [{ type: 'text/html', value: emailTemplate(code) }]
    })
  });

  if (!response.ok) {
    await env.CODES.delete(codeKey);
    console.error('[Admin Auth] SendGrid error', response.status);
    return json(request, { success: false, error: 'Não foi possível enviar o código por e-mail.' }, 502);
  }
  return json(request, { success: true, message: 'Código enviado para o e-mail autorizado.' });
}

function emailTemplate(code) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#172033"><div style="display:inline-block;padding:12px 16px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;font-weight:700">BA</div><h1 style="font-size:24px;margin:24px 0 8px">Acesso administrativo</h1><p style="color:#667085">Use o código abaixo para acessar o painel. Ele expira em 10 minutos e funciona uma única vez.</p><div style="margin:28px 0;padding:20px;border-radius:14px;background:#f5f1ff;color:#7c3aed;font-size:34px;font-weight:800;letter-spacing:10px;text-align:center">${code}</div><p style="font-size:12px;color:#98a2b3">Se você não solicitou este acesso, ignore este e-mail.</p></div>`;
}

async function validateCode(request, env) {
  const { email: rawEmail, code = '' } = await request.json();
  const email = normalizeEmail(rawEmail);
  if (!allowedEmails(env).has(email) || !/^\d{6}$/.test(code)) {
    return json(request, { success: false, error: 'Código inválido ou expirado.' }, 400);
  }

  const key = `admin-code:${await emailHash(email)}`;
  const stored = await env.CODES.get(key, 'json');
  if (!stored || stored.attempts >= MAX_ATTEMPTS) {
    await env.CODES.delete(key);
    return json(request, { success: false, error: 'Código inválido ou expirado.' }, 401);
  }

  if (!safeHexEquals(await sha256(code), stored.hash)) {
    stored.attempts += 1;
    await env.CODES.put(key, JSON.stringify(stored), { expirationTtl: CODE_TTL });
    return json(request, { success: false, error: 'Código inválido ou expirado.' }, 401);
  }

  await env.CODES.delete(key);
  const sessionToken = randomToken();
  await env.CODES.put(`admin-session:${await sha256(sessionToken)}`, JSON.stringify({ email }), { expirationTtl: SESSION_TTL });
  return json(request, { success: true, sessionToken, expiresIn: SESSION_TTL });
}

async function validateSession(request, env) {
  const token = bearerToken(request);
  if (!token) return json(request, { success: false }, 401);
  const session = await env.CODES.get(`admin-session:${await sha256(token)}`, 'json');
  return session ? json(request, { success: true, email: session.email }) : json(request, { success: false }, 401);
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
      if (url.pathname === '/api/send-code' && request.method === 'POST') return await requestCode(request, env);
      if (url.pathname === '/api/validate-code' && request.method === 'POST') return await validateCode(request, env);
      if (url.pathname === '/api/admin/session' && request.method === 'GET') return await validateSession(request, env);
      if (url.pathname === '/api/admin/logout' && request.method === 'POST') return await logout(request, env);

      const page = await fetch('https://raw.githubusercontent.com/seja2b/Projeto-Bruna-Affonso/main/public/index.html');
      return new Response(await page.text(), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders(request) } });
    } catch (error) {
      console.error('[Worker Error]', error);
      return json(request, { success: false, error: 'Erro interno. Tente novamente.' }, 500);
    }
  }
};

