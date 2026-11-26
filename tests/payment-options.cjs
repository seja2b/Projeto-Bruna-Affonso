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
  assert.equal((source.match(/Checkout seguro pelo Mercado Pago/g) || []).length, 2);
  assert.ok(source.includes('href="https://bruna-affonso-frontend.pages.dev/login"'));
  assert.ok(source.includes('A liberação será feita após a confirmação e aprovação da Bruna.'));
  assert.ok(source.includes('Acessar plataforma'));
  assert.ok(source.includes('Já realizou o pagamento? Fale com a Bruna para confirmar e liberar seu acesso.'));
  assert.ok(source.includes('Se tiver alguma dúvida sobre pagamento ou cadastro, ela também poderá ajudar.'));
  assert.ok(source.includes('Falar com a Bruna'));
  assert.ok(source.includes('.payment-card, .pix-plans, .card-plans { grid-template-columns: 1fr; }'));
});
