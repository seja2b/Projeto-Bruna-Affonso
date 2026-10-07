const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');

test('all bonus cards support image upload, publication, removal and responsive display',async()=>{
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
 for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
 const {bonusContent}=await import('../src/bonus-content.js');const kv=new Map();const env={CODES:{get:async key=>kv.get(key),put:async(key,value)=>kv.set(key,value)}};
 const server=http.createServer(async(req,res)=>{try{if(req.url.startsWith('/api/content/bonus')||req.url.startsWith('/api/admin/content/bonus')){let body='';for await(const chunk of req)body+=chunk;const request=new Request('http://localhost'+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})});const response=await bonusContent(request,env,req.headers.authorization==='Bearer test');res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());}else if(req.url.startsWith('/api/content/steps')){res.setHeader('Content-Type','application/json');res.end('{"steps":null,"revision":null}');}else{res.setHeader('Content-Type','text/html');res.end(html);}}catch(error){res.statusCode=500;res.end(error.message);}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({channel:'msedge',headless:true});
 try {const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>bonusLoaded);await page.evaluate(()=>{adminSessionToken='test';document.getElementById('admin-panel').style.display='block';document.getElementById('admin-bonus-tab').style.display='block';syncAdminInputs('bonus');});
 assert.equal(await page.locator('.bonus-editor-card').count(),3);
 const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=400;canvas.getContext('2d').fillRect(0,0,800,400);return canvas.toDataURL().split(',')[1];});
 for(let i=0;i<3;i++){await page.locator('#bonus-file-'+i).setInputFiles({name:'bonus.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.waitForFunction(index=>state.bonus[index].image.startsWith('data:image/webp'),i);}
 await page.locator('#publish-bonus').click();await page.waitForFunction(()=>document.getElementById('bonus-status').textContent.includes('Todos os bônus'));
 const visitor=await browser.newPage();await visitor.goto('http://127.0.0.1:'+server.address().port);await visitor.waitForFunction(()=>bonusLoaded);assert.equal(await visitor.locator('#bonus-cards img').count(),3);
 for(const width of [1440,390]){await visitor.setViewportSize({width,height:900});const result=await visitor.locator('#bonus-cards').evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth,fit:getComputedStyle(el.querySelector('img')).objectFit}));assert.equal(result.overflow,false);assert.equal(result.fit,'cover');}
 await page.evaluate(()=>{editBonus(0,'image','');syncAdminInputs('bonus');});await page.locator('#publish-bonus').click();await page.waitForFunction(()=>document.getElementById('bonus-status').textContent.includes('Todos os bônus'));await visitor.reload();await visitor.waitForFunction(()=>bonusLoaded);assert.equal(await visitor.locator('#bonus-cards img').count(),2);
 await page.locator('#bonus-file-0').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});assert.match(await page.locator('#bonus-image-status-0').innerText(),/JPG/);
 }finally{await browser.close();server.close();}
});

test('bonus endpoint requires authentication and rejects unsafe image links',async()=>{
 const {bonusContent}=await import('../src/bonus-content.js');const values=new Map();const env={CODES:{get:async key=>values.get(key),put:async(key,value)=>values.set(key,value)}};
 const post=(body,authorized=true)=>bonusContent(new Request('https://example.test/api/admin/content/bonus',{method:'POST',body:JSON.stringify(body)}),env,authorized);
 assert.equal((await post({},false)).status,401);
 const item={title:'Ebooks',desc:'Materiais',value:'',image:'javascript:alert(1)'};assert.equal((await post({revision:null,bonus:[item]})).status,400);
 item.image='';const saved=await post({revision:null,bonus:[item]});assert.equal(saved.status,200);assert.deepEqual((await saved.json()).bonus,[item]);
});
