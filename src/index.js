export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 📧 ROTA: Enviar código por e-mail
      if (url.pathname === '/api/send-code' && request.method === 'POST') {
        const { email } = await request.json();

        if (!email) {
          return new Response(JSON.stringify({ success: false, error: 'E-mail obrigatório' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await env.CODES.put(`code:${email}`, code, { expirationTtl: 600 });

        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: 'noreply@consultoriaba.com', name: 'Consultoria BA' },
            subject: '🔐 Seu código de validação - Consultoria BA',
            content: [{
              type: 'text/html',
              value: `
                <h1 style="color: #ec4899;">Consultoria BA</h1>
                <p>Seu código de acesso é:</p>
                <h2 style="font-size: 32px; color: #ec4899; letter-spacing: 5px;">${code}</h2>
                <p style="color: #999;">Válido por 10 minutos</p>
              `
            }]
          }),
        });

        return new Response(JSON.stringify({ success: sendgridResponse.ok }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // ✅ ROTA: Validar código
      if (url.pathname === '/api/validate-code' && request.method === 'POST') {
        const { email, code } = await request.json();
        const storedCode = await env.CODES.get(`code:${email}`);

        if (storedCode === code) {
          await env.CODES.delete(`code:${email}`);
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify({ success: false, error: 'Código inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Se não for API, redireciona para o arquivo estático no GitHub Pages
      return Response.redirect('https://raw.githubusercontent.com/seja2b/Projeto-Bruna-Affonso/main/public/index.html', 200);

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
