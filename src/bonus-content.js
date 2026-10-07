const KEY = 'editorial:bonus:v1';
const MAX_BYTES = 6 * 1024 * 1024;

export async function bonusContent(request, env, authorized) {
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}
  });
  if (request.method !== 'GET' && request.method !== 'POST') return reply({error: 'Método inválido.'}, 405);
  if (request.method === 'POST' && !authorized) return reply({error: 'Entre novamente no painel para publicar.'}, 401);
  const current = JSON.parse(await env.CODES.get(KEY) || 'null');
  if (request.method === 'GET') return reply(current || {bonus: null, revision: null});

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
  const text = (value, max) => typeof value === 'string' && value.length <= max;
  if (!Array.isArray(data.bonus) || data.bonus.length > 30 || !data.bonus.every(item =>
    item && text(item.title, 200) && text(item.desc, 3000) && text(item.value, 100) && text(item.image, 900000) &&
    (!item.image || /^https:\/\/[^\s]+$/i.test(item.image) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(item.image))
  )) return reply({error: 'Revise os títulos, descrições, valores e imagens dos bônus.'}, 400);
  const saved = {bonus: data.bonus, revision: crypto.randomUUID()};
  await env.CODES.put(KEY, JSON.stringify(saved));
  return reply(saved);
}
