import app from './index.js';

const APPROVED_PRICE_MARKUP = `
  <div class="payment-price payment-price-v2">
    <div class="price-main">
      <span class="currency">R$</span>
      <span class="amount">250</span>
    </div>
    <div class="period">por mês</div>
  </div>`;

const APPROVED_PRICE_STYLES = `
<style id="approved-price-v2-styles">
  .payment-price-v2 {
    margin: 16px 0 28px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 5px !important;
    color: #172033 !important;
    line-height: 1 !important;
  }
  .payment-price-v2 .price-main {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
  }
  .payment-price-v2 .currency {
    padding: 0 !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: 1.15rem !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    letter-spacing: 0 !important;
  }
  .payment-price-v2 .amount {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: clamp(3.15rem, 5.5vw, 4.05rem) !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    letter-spacing: 0 !important;
    -webkit-font-smoothing: auto !important;
    text-rendering: auto !important;
  }
  .payment-price-v2 .period {
    padding: 0 !important;
    color: #7d8798 !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-size: .9rem !important;
    font-weight: 600 !important;
    line-height: 1.35 !important;
    letter-spacing: 0 !important;
  }
  @media (max-width: 440px) {
    .payment-price-v2 .currency { font-size: 1rem !important; }
    .payment-price-v2 .amount { font-size: 3.25rem !important; }
    .payment-price-v2 .period { font-size: .85rem !important; }
  }
</style>`;

const HERO_CTA = `<a href="#preco" class="btn" id="cta-hero" onclick="event.preventDefault(); var target=document.getElementById('preco'); if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}">Quero começar minha transformação</a>`;

function applyApprovedLayout(html) {
  const currentPrice = /<div class="payment-price"><span class="currency">R\$<\/span><span class="amount">250<\/span><span class="period">\/mês<\/span><\/div>/;
  const currentHeroCta = /<a href="" class="btn" id="cta-hero" onclick="event\.preventDefault\(\); window\.location\.href = state\.checkoutUrl;">Quero começar minha transformação<\/a>/;

  let updated = html.replace(currentPrice, APPROVED_PRICE_MARKUP);
  updated = updated.replace(currentHeroCta, HERO_CTA);
  updated = updated.replace('<span class="payment-badge">PLANO MENSAL</span>', '<span class="payment-badge">PLANO RECORRENTE</span>');

  if (!updated.includes('approved-price-v2-styles')) {
    updated = updated.replace('</head>', `${APPROVED_PRICE_STYLES}\n</head>`);
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

    return new Response(applyApprovedLayout(html), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
