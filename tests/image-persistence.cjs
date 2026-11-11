const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('editorial photos are optimized before automatic persistence', () => {
  assert.match(html, /async function optimizeEditorialImage/);
  assert.match(html, /maxLength: 520000/);
  assert.match(html, /maxLength: 420000/);
  assert.match(html, /state\.creatorImage = base64/);
  assert.match(html, /state\.proof\[index\]\.image = await optimizeEditorialImage/);
  assert.match(html, /saveMethodPhoto\(i, \{url: optimized\}\)/);
});

test('image fields expose preparation and synchronization feedback', () => {
  assert.match(html, /id="creator-image-status"/);
  assert.match(html, /proof-image-status-/);
  assert.match(html, /Aguarde a confirmação de sincronização no topo do painel/);
});
