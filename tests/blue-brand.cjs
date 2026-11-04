const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public page and injected layouts use the blue and white brand palette', () => {
  const files = ['../public/index.html', '../src/index.js', '../src/index-v4.js'];
  const source = files.map(file => fs.readFileSync(path.join(__dirname, file), 'utf8')).join('\n');

  for (const required of ['#071F66', '#075EFF', '#2F8DFF']) {
    assert.ok(source.includes(required), `missing brand color ${required}`);
  }

  for (const gradientColor of ['#06174F', '#075EFF', '#2F8DFF']) {
    assert.ok(source.includes(gradientColor), `missing gradient color ${gradientColor}`);
  }
  assert.ok(source.includes('linear-gradient(100deg, #06174F 0%, #075EFF 56%, #2F8DFF 100%)'));

  for (const removed of ['#7c3aed', '#ec4899', '#f97316', '#6d28d9', '#db2777']) {
    assert.ok(!source.toLowerCase().includes(removed), `legacy color still present: ${removed}`);
  }
});

test('header uses the Bruna Affonso brand mark instead of the BA placeholder', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const logoPath = path.join(__dirname, '../public/assets/bruna-affonso-mark.png');

  assert.ok(html.includes('src="/assets/bruna-affonso-mark.png"'));
  assert.ok(!html.includes('<span class="brand-mark">BA</span>'));
  assert.ok(fs.existsSync(logoPath), 'missing header logo asset');
  assert.ok(fs.statSync(logoPath).size > 1000, 'header logo asset is unexpectedly small');
});
