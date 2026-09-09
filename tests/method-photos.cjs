const { test, expect } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const vm = require('node:vm');
const { chromium } = require('playwright');
const html = fs.readFileSync(require('node:path').join(__dirname, '../public/index.html'), 'utf8');
test('photo editor persistence, compatibility, validation and responsive layout', async () => {
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  const server = http.createServer((req, res) => {res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://www.youtube.com"); res.setHeader('Content-Type', 'text/html'); res.end(html);});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true, channel: 'msedge'});
  try {
    const page = await browser.newPage();
    await page.route('https://**', route => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(() => {state.metodImages[0].title = 'Aula 1 da Consultoria'; state.metodImages[1].title = 'Minha foto'; state.metodImages[0].legacy = 'preserved'; saveState(); renderPage();});
    assert.match(await page.locator('#metodo-images').innerText(), /Foto 1 da Consultoria/);
    await page.evaluate(() => {syncAdminInputs('metodo'); document.getElementById('admin-panel').style.display = 'block'; document.getElementById('admin-metodo-tab').style.display = 'block';});
    const photo = await page.evaluate(() => {const c=document.createElement('canvas');c.width=600;c.height=900;const x=c.getContext('2d');x.fillStyle='#db2777';x.fillRect(0,0,600,900);return c.toDataURL('image/png').split(',')[1];});
    await page.locator('#metodo-image-upload-0').setInputFiles({name:'portrait.png', mimeType:'image/png', buffer:Buffer.from(photo,'base64')});
    await page.waitForFunction(() => state.metodImages[0].url.startsWith('data:image/webp'));
    await page.reload();
    assert.equal(await page.evaluate(() => state.metodImages[0].legacy), 'preserved');
    assert.equal(await page.evaluate(() => state.metodImages[1].title), 'Minha foto');
    for (const [width, height] of [[1440,1000],[390,844]]) {
      await page.setViewportSize({width,height});
      const dimensions = await page.locator('#metodo-images').evaluate(el => ({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length, overflow:document.documentElement.scrollWidth > innerWidth, fit:getComputedStyle(el.querySelector('img')).objectFit, ratio:el.firstElementChild.clientWidth/el.firstElementChild.clientHeight}));
      assert.equal(dimensions.columns, width > 600 ? 2 : 1);
      assert.equal(dimensions.overflow, false);
      assert.equal(dimensions.fit, 'cover');
      assert.ok(Math.abs(dimensions.ratio-16/9)<0.03);
      await page.locator('#metodo-images').screenshot({path:require('node:path').join(__dirname, `photo-${width}.png`)});
    }
    await page.evaluate(() => {syncAdminInputs('metodo'); document.getElementById('admin-panel').style.display='block';document.getElementById('admin-metodo-tab').style.display='block';});
    await page.locator('#metodo-image-upload-0').setInputFiles({name:'video.mp4',mimeType:'video/mp4',buffer:Buffer.from('invalid')});
    assert.match(await page.locator('#method-status-0').innerText(), /JPG, PNG ou WebP/);
    assert.ok(await page.evaluate(() => state.metodImages[0].url));
    await page.evaluate(() => saveMethodPhoto(0,{url:''}));
    await page.reload();
    assert.equal(await page.locator('#metodo-images img').count(),0);
  } finally {await browser.close();server.close();}
});
