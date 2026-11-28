const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('payment section offers the correct card checkouts', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');

  assert.ok(source.includes('data-payment-tab="card"'));
  assert.ok(source.includes('data-payment-panel="card"'));
  assert.ok(source.includes('<strong>Cartão de crédito</strong>'));
  assert.ok(source.includes('href="https://mpago.la/2aMZLAA"'));
  assert.ok(source.includes('href="https://mpago.la/1hs7QDT"'));
  assert.ok(source.includes('<div class="pix-plan-price">R$ 700</div>'));
  assert.ok(source.includes('<div class="pix-plan-price">R$ 1.200</div>'));
  assert.ok(source.includes('href="https://nubank.com.br/cobrar/m7i4x/6b08bee0-5166-4436-8e56-9b3da437671f"'));
  assert.ok(source.includes('<span>Pagar via PIX</span>'));
  assert.ok(!source.includes('consultoria trimestral5204000053039865406600.00'));
  assert.equal((source.match(/Checkout seguro pelo Mercado Pago/g) || []).length, 2);
  assert.equal((source.match(/href="https:\/\/client\.mfitpersonal\.com\.br\/out\/signup-link\/Njk2NjE="/g) || []).length, 3);
  assert.equal((source.match(/Cadastrar no MFit/g) || []).length, 3);
  assert.equal((source.match(/Cadastre-se no MFit para enviar seus dados e WhatsApp à Bruna\./g) || []).length, 3);
  assert.ok(!source.includes('href="https://bruna-affonso-frontend.pages.dev/login"'));
  assert.ok(source.includes('Ficou com alguma dúvida sobre pagamento ou cadastro no MFit?'));
  assert.ok(source.includes('Fale com a Bruna pelo WhatsApp para receber ajuda.'));
  assert.ok(source.includes('Falar com a Bruna'));
  assert.ok(source.includes('.payment-card, .pix-plans, .card-plans { grid-template-columns: 1fr; }'));
});
