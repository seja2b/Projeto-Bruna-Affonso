const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('public/index.html', 'utf8');

for (const selector of ['.method-media img', '.step-image img', '.bonus-image img']) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(html, new RegExp(escaped + '[^}]*object-fit:\\s*contain'));
}
assert.match(html, /\.creator-image\s*\{[\s\S]{0,160}object-fit:\s*cover\s*!important;[\s\S]{0,100}object-position:\s*center 42%\s*!important/);
assert.match(html, /\.bonus-card:first-child \.bonus-image img\s*\{\s*transform:\s*translateY\(10px\)/);
assert.match(html, /\.proof-card > img[\s\S]*object-fit:\s*contain\s*!important/);
assert.doesNotMatch(html, /proof-cards[\s\S]{0,600}object-fit:\s*cover/);
assert.match(html, /foto será otimizada e exibida inteira, sem recorte/i);
console.log('PASS: fotos públicas usam enquadramento integral sem recorte');
