const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('the first Bruna video uses a responsive vertical player', () => {
  assert.match(html, /#video-container\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/);
  assert.match(html, /\.hero-media\s*\{[^}]*width:\s*min\(100%,\s*410px\)/);
  assert.match(html, /@media \(max-width:\s*900px\)[\s\S]*?\.hero-media\s*\{[^}]*390px/);
  assert.match(html, /#video-container iframe\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/);
});

test('the vertical frame keeps the existing autoplay and fullscreen player behavior', () => {
  assert.match(html, /iframe\.allowFullscreen\s*=\s*true/);
  assert.match(html, /url\.searchParams\.set\('playsinline',\s*'1'\)/);
  assert.match(html, /onAutoplayBlocked/);
});
