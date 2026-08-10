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

        // Gera código aleatório
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salva no KV
        await env.CODES.put(`code:${email}`, code, { expirationTtl: 600 });

        // 🔧 MODO TESTE: Log do código no console (remover depois!)
        console.log(`[TESTE] Código para ${email}: ${code}`);

        // TENTA enviar via SendGrid (se falhar, continua mesmo assim)
        try {
          if (env.SENDGRID_API_KEY) {
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

            if (sendgridResponse.ok) {
              console.log('[SendGrid] E-mail enviado com sucesso!');
            } else {
              const error = await sendgridResponse.text();
              console.log('[SendGrid] Erro ao enviar:', error);
            }
          }
        } catch (sendgridError) {
          console.log('[SendGrid] Erro de conexão:', sendgridError.message);
        }

        // RETORNA SUCESSO independente do SendGrid (para testes)
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Código gerado! (Modo teste - veja o console)',
          testCode: code 
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // ✅ ROTA: Validar código
      if (url.pathname === '/api/validate-code' && request.method === 'POST') {
        const { email, code } = await request.json();
        const storedCode = await env.CODES.get(`code:${email}`);

        if (storedCode === code) {
          await env.CODES.delete(`code:${email}`);
          console.log(`[Validação] Código correto para ${email}`);
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        console.log(`[Validação] Código inválido para ${email}`);
        return new Response(JSON.stringify({ success: false, error: 'Código inválido ou expirado' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Serve o HTML
      const htmlResponse = await fetch('https://raw.githubusercontent.com/seja2b/Projeto-Bruna-Affonso/main/public/index.html');
      const html = await htmlResponse.text();

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('[Erro]', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
