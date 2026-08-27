import app from './index-v2.js';

const TRUST_FOOTER_STYLES = `
<style id="trust-footer-styles">
  #footer .trust-strip {
    margin: 20px auto 0;
    max-width: 920px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  #footer .trust-item {
    padding: 14px 16px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px;
    background: rgba(255,255,255,.04);
    text-align: left;
  }
  #footer .trust-item strong {
    display: block;
    margin-bottom: 4px;
    color: #f8fafc;
    font-size: .78rem;
  }
  #footer .trust-item span {
    color: #94a3b8;
    font-size: .7rem;
    line-height: 1.45;
  }
  #footer .footer-security-note {
    max-width: 860px;
    margin: 16px auto 0;
    color: #7f8aa0;
    font-size: .68rem;
    line-height: 1.55;
  }
  @media (max-width: 720px) {
    #footer .trust-strip { grid-template-columns: 1fr; }
    #footer .trust-item { text-align: center; }
  }
</style>`;

const TRUST_BLOCK = `
<div class="trust-strip" aria-label="Informações de confiança e segurança">
  <div class="trust-item">
    <strong>Checkout externo seguro</strong>
    <span>O plano recorrente é concluído no ambiente da MFit Personal, fora deste site.</span>
  </div>
  <div class="trust-item">
    <strong>Pagamento protegido</strong>
    <span>Este site não coleta nem armazena dados de cartão do checkout recorrente.</span>
  </div>
  <div class="trust-item">
    <strong>Atendimento direto</strong>
    <span>Em caso de dúvida, o suporte pode ser feito diretamente com a Bruna por WhatsApp ou e-mail.</span>
  </div>
</div>
<p class="footer-security-note">As transações do plano recorrente são processadas no ambiente do provedor de checkout informado na página. Pagamentos via PIX são realizados diretamente pelo aplicativo bancário do cliente.</p>`;

function applyFooterTrust(html) {
  let updated = html
    .replace(/©\s*2024\s*Bruna Affonso - Consultoria Online\. Todos os direitos reservados\./g, '© 2026 Bruna Affonso - Consultoria Online. Todos os direitos reservados.')
    .replace(/bruna@consultoriaba\.com/g, 'brunaribeiroac@gmail.com')
    .replace(/PLANO MENSAL/g, 'PLANO RECORRENTE')
    .replace(/Assinar plano mensal/g, 'Assinar plano recorrente');

  if (!updated.includes('trust-footer-styles')) {
    updated = updated.replace('</head>', `${TRUST_FOOTER_STYLES}\n</head>`);
  }

  updated = updated.replace(
    /(<p style="font-size: 0\.75rem; color: #999; margin-top: 1rem;">Desenvolvido com ❤️ para transformar vidas<\/p>)/,
    `$1\n${TRUST_BLOCK}`
  );

  const runtimeFix = `
<script id="footer-runtime-fix">
(function(){
  function enforceFooter(){
    var footerText=document.getElementById('footer-text');
    var footerEmail=document.getElementById('footer-email');
    if(footerText){footerText.textContent='© 2026 Bruna Affonso - Consultoria Online. Todos os direitos reservados.';}
    if(footerEmail){footerEmail.href='mailto:brunaribeiroac@gmail.com';footerEmail.textContent='📧 brunaribeiroac@gmail.com';}
    if(typeof state==='object' && state){
      state.contactEmail='brunaribeiroac@gmail.com';
      state.footerText='© 2026 Bruna Affonso - Consultoria Online. Todos os direitos reservados.';
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',enforceFooter);}else{enforceFooter();}
  setTimeout(enforceFooter,250);
  setTimeout(enforceFooter,1000);
})();
</script>`;

  if (!updated.includes('footer-runtime-fix')) {
    updated = updated.replace('</body>', `${runtimeFix}\n</body>`);
  }

  return updated;
}

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) return response;

    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('Content-Length');

    return new Response(applyFooterTrust(html), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
