const KEY = 'editorial:page:v1';
const MAX_BYTES = 6 * 1024 * 1024;
// Conteúdo legado já publicado contém uma foto da criadora com cerca de 2,8 MB.
// Novos uploads são otimizados no navegador, mas a validação precisa aceitar a
// imagem existente para que ela não bloqueie o salvamento das demais seções.
const MAX_STRING_LENGTH = 4 * 1024 * 1024;
const PAGE_KEYS = [
  'videoUrlHero', 'heroTitle', 'heroDesc', 'ctaHeroText', 'afterVideoText',
  'proof', 'proofIntro', 'proofComum', 'diferenciais', 'metodImages',
  'personasIntro', 'personas', 'personasOutro', 'divertidoText',
  'priceTitle', 'priceMain', 'priceVista', 'creatorName', 'creatorDesc',
  'creatorImage', 'creatorYears', 'creatorFollowers', 'creatorStats', 'faq',
  'closeDecision', 'closeNegative', 'closePositive', 'closeCall',
  'contactEmail', 'footerText', 'checkoutUrl'
];

const reply = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}
});

async function readJson(request) {
  let size = 0;
  const chunks = [];
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new Error('TOO_LARGE');
      }
      chunks.push(value);
    }
  }
  return JSON.parse(await new Blob(chunks).text());
}

function validValue(value, depth = 0) {
  if (depth > 4) return false;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return true;
  if (typeof value === 'string') return value.length <= MAX_STRING_LENGTH;
  if (Array.isArray(value)) return value.length <= 100 && value.every(item => validValue(item, depth + 1));
  if (!value || typeof value !== 'object' || Object.keys(value).length > 30) return false;
  return Object.entries(value).every(([key, item]) => key !== '__proto__' && key !== 'constructor' && validValue(item, depth + 1));
}

export async function pageContent(request, env, authorized) {
  if (request.method !== 'GET' && request.method !== 'POST') return reply({error: 'Método inválido.'}, 405);
  if (request.method === 'POST' && !authorized) return reply({error: 'Entre novamente no painel para publicar.'}, 401);
  const current = JSON.parse(await env.CODES.get(KEY) || 'null');
  if (request.method === 'GET') return reply(current || {page: null, revision: null});

  let data;
  try {
    data = await readJson(request);
  } catch (error) {
    if (error.message === 'TOO_LARGE') return reply({error: 'O conteúdo e as imagens ultrapassam o limite permitido.'}, 413);
    return reply({error: 'Conteúdo inválido.'}, 400);
  }
  if (!data || data.revision !== (current?.revision ?? null) || !data.page || typeof data.page !== 'object') {
    return reply({error: 'O conteúdo foi atualizado em outra sessão. Recarregue a página antes de publicar.'}, 409);
  }
  const page = Object.fromEntries(PAGE_KEYS.filter(key => key in data.page).map(key => [key, data.page[key]]));
  if (!Object.values(page).every(value => validValue(value))) return reply({error: 'Revise o conteúdo antes de publicar.'}, 400);
  const saved = {page, revision: crypto.randomUUID()};
  await env.CODES.put(KEY, JSON.stringify(saved));
  return reply(saved);
}
