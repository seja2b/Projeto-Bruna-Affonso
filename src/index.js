const SESSION_TTL = 60 * 60 * 8;
const ATTEMPT_TTL = 60 * 15;
const MAX_ATTEMPTS = 5;

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
      return new Response(await page.text(), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders(request) } });
    } catch (error) {
      console.error('[Worker Error]', error);
      return json(request, { success: false, error: 'Erro interno. Tente novamente.' }, 500);
    }
  }
};

