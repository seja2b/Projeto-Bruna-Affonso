const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public page and injected layouts use the blue and white brand palette', () => {
  const files = ['../public/index.html', '../src/index.js', '../src/index-v4.js'];
  const source = files.map(file => fs.readFileSync(path.join(__dirname, file), 'utf8')).join('\n');

  for (const required of ['#0A3DB8', '#145CFF', '#8DB8FF']) {
    assert.ok(source.includes(required), `missing brand color ${required}`);
  }

  for (const removed of ['#7c3aed', '#ec4899', '#f97316', '#6d28d9', '#db2777']) {
    assert.ok(!source.toLowerCase().includes(removed), `legacy color still present: ${removed}`);
  }
});
