const KEY = 'editorial:steps:v1';
const MAX_BYTES = 6 * 1024 * 1024;

export async function stepsContent(request, env, authorized) {
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}
  });
  if (request.method !== 'GET' && request.method !== 'POST') return reply({error: 'Método inválido.'}, 405);
  if (request.method === 'POST' && !authorized) return reply({error: 'Entre novamente no painel para publicar.'}, 401);
  const current = JSON.parse(await env.CODES.get(KEY) || 'null');
  if (request.method === 'GET') return reply(current || {steps: null, revision: null});
  // Bound the streamed body before parsing data URLs.
  let size = 0;
  const chunks = [];
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {await reader.cancel(); return reply({error: 'Imagens muito grandes. Reduza o tamanho antes de publicar.'}, 413);}
      chunks.push(value);
    }
  }
  let data;
  try {data = JSON.parse(await new Blob(chunks).text());} catch {return reply({error: 'Conteúdo inválido.'}, 400);}
  if (!data || data.revision !== (current?.revision ?? null)) return reply({error: 'O conteúdo foi atualizado em outra sessão. Recarregue a página antes de publicar.'}, 409);
  const text = (v, max) => typeof v === 'string' && v.length <= max;
  if (!Array.isArray(data.steps) || data.steps.length > 50 || !data.steps.every(s =>
    s && text(s.title, 200) && text(s.desc, 5000) && Array.isArray(s.items) && s.items.length <= 30 &&
    s.items.every(i => text(i, 500)) && text(s.image, 700000) &&
    (!s.image || /^https:\/\/[^\s]+$/i.test(s.image) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(s.image))
  )) return reply({error: 'Revise títulos, descrições, destaques e imagens. São permitidas até 50 etapas e 30 destaques por etapa.'}, 400);
  const saved = {steps: data.steps, revision: crypto.randomUUID()};
  await env.CODES.put(KEY, JSON.stringify(saved));
  return reply(saved);
}
