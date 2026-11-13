const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('public/index.html', 'utf8');

assert.match(html, /STEP_ORDER\s*=\s*\['Avaliação e Progresso', 'Acompanhamento Personalizado', 'Correção de Exercícios', 'Aulas Gravadas'\]/);
assert.match(html, /state\.steps=normalizeStepOrder\(data\.steps\)/);
assert.ok(html.indexOf("num: 1, title: 'Avaliação e Progresso'") < html.indexOf("num: 4, title: 'Aulas Gravadas'"));
console.log('PASS: etapas publicadas na ordem solicitada');
