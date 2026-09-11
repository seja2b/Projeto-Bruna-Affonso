const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const http=require('node:http');const vm=require('node:vm');const path=require('node:path');const {chromium}=require('playwright');
test('all steps: authenticated publication, upload, persistence, fallback, responsive layout',async()=>{
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 const {stepsContent}=await import('../src/steps-content.js');const kv=new Map();const env={CODES:{get:async k=>kv.get(k),put:async(k,v)=>kv.set(k,v)}};
 const request=(data,auth=true)=>stepsContent(new Request('http://localhost/api/admin/content/steps',{method:'POST',body:JSON.stringify(data)}),env,auth);
 assert.equal((await request({},false)).status,401);assert.equal((await request({revision:null,steps:[{title:'x'}]})).status,400);
 const server=http.createServer(async(q,r)=>{try{if(q.url.startsWith('/api/')){let body='';for await(const c of q)body+=c;const req=new Request('http://localhost'+q.url,{method:q.method,headers:q.headers,...(q.method==='POST'?{body}: {})});const res=await stepsContent(req,env,q.headers.authorization==='Bearer test');r.writeHead(res.status,Object.fromEntries(res.headers));r.end(await res.text());}else{r.setHeader('Content-Type','text/html');r.end(html);}}catch(e){r.statusCode=500;r.end(e.message);}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});
 try {const page=await browser.newPage();await page.route('https://**',r=>r.abort());await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>stepsLoaded);
 assert.equal(await page.locator('#steps .step-card').count(),6);assert.equal(await page.locator('#steps .check-item').count(),12);
 const other=await page.evaluate(()=>JSON.stringify({...state,steps:undefined}));
 await page.evaluate(()=>{adminSessionToken='test';document.getElementById('landing').style.display='none';document.getElementById('admin-panel').style.display='block';document.querySelectorAll('.admin-tab-content').forEach(e=>e.style.display='none');document.getElementById('admin-steps-tab').style.display='block';syncAdminInputs('steps');});
 assert.equal(await page.locator('.step-editor').count(),6);
 await page.locator('#step-title-0').fill('Aulas <personalizadas>');await page.locator('#step-desc-0').fill('Descrição atualizada');await page.locator('#step-items-0').fill('Destaque um\nDestaque dois\nDestaque três');await page.locator('#step-title-1').focus();
 assert.equal(await page.evaluate(()=>state.steps[0].items.length),3);
 const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=600;c.getContext('2d').fillRect(0,0,400,600);return c.toDataURL().split(',')[1];});
 for(let i=0;i<6;i++){await page.locator('#step-file-'+i).setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});await page.waitForFunction(i=>state.steps[i].image?.startsWith('data:image/'),i);}
 await page.locator('#publish-steps').click();await page.waitForFunction(()=>document.getElementById('steps-status').textContent.includes('Todas as etapas'));
 assert.equal(await page.evaluate(()=>JSON.stringify({...state,steps:undefined})),other);
 const visitor=await browser.newPage();await visitor.route('https://**',r=>r.abort());await visitor.goto('http://127.0.0.1:'+server.address().port);await visitor.waitForFunction(()=>stepsLoaded);assert.equal(await visitor.locator('#steps img').count(),6);assert.equal(await visitor.locator('#steps .step-title').first().innerText(),'Aulas <personalizadas>');assert.equal(await visitor.locator('#steps .check-item').count(),13);
 for(const width of [1440,390]){await visitor.setViewportSize({width,height:900});for(let i=0;i<6;i++){const c=visitor.locator('.step-card').nth(i);await c.scrollIntoViewIfNeeded();const v=await c.evaluate(e=>({columns:getComputedStyle(e).gridTemplateColumns.split(' ').length,fit:getComputedStyle(e.querySelector('img')).objectFit,overflow:document.documentElement.scrollWidth>innerWidth,direction:getComputedStyle(e).direction}));assert.equal(v.columns,width===1440?2:1);assert.equal(v.fit,'cover');assert.equal(v.overflow,false);assert.equal(v.direction,width===1440&&i%2?'rtl':'ltr');}await visitor.locator('#funciona').screenshot({path:path.join(__dirname,'steps-'+width+'.png')});await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('.step-editor').first().screenshot({path:path.join(__dirname,'steps-admin-'+width+'.png')});}
 await page.locator('#step-file-0').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});assert.match(await page.locator('#step-status-0').innerText(),/JPG/);
 await page.evaluate(()=>{editStep(0,'image','');syncAdminInputs('steps');});await page.locator('#publish-steps').click();await page.waitForFunction(()=>document.getElementById('steps-status').textContent.includes('Todas as etapas'));await visitor.reload();await visitor.waitForFunction(()=>stepsLoaded);assert.equal(await visitor.locator('#steps img').count(),5);
 assert.equal((await request({revision:null,steps:[]})).status,409);
 }finally{await browser.close();server.close();}
});

test('Worker routes reuse session authentication and reject unsafe images', async()=>{
 const worker=(await import('../src/index-v4.js')).default;
 const values=new Map();const env={CODES:{get:async k=>values.get(k),put:async(k,v)=>values.set(k,v)}};
 const url='https://example.test';
 assert.equal((await worker.fetch(new Request(url+'/api/admin/content/steps',{method:'POST',body:'{}'}),env)).status,401);
 const digest=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('valid'))).toString('hex');values.set('admin-session:'+digest,'{}');
 const post=data=>worker.fetch(new Request(url+'/api/admin/content/steps',{method:'POST',headers:{Authorization:'Bearer valid'},body:JSON.stringify(data)}),env);
 const step={num:1,title:'Existing',desc:'Original',items:['One'],image:'javascript:alert(1)',legacy:'preserved'};
 assert.equal((await post({revision:null,steps:[step]})).status,400);
 step.image='';const saved=await post({revision:null,steps:[step]});assert.equal(saved.status,200);
 const publicResponse=await worker.fetch(new Request(url+'/api/content/steps'),env);assert.equal(publicResponse.headers.get('Cache-Control'),'no-store');assert.deepEqual((await publicResponse.json()).steps,[step]);
});
