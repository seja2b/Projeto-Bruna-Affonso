const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('page endpoint requires authentication, filters fields and uses revisions',async()=>{
  const {pageContent}=await import('../src/page-content.js');
  const kv=new Map();const env={CODES:{get:async key=>kv.get(key),put:async(key,value)=>kv.set(key,value)}};
  const post=(body,authorized=true)=>pageContent(new Request('https://example.test/api/admin/content/page',{method:'POST',body:JSON.stringify(body)}),env,authorized);
  assert.equal((await post({},false)).status,401);
  const saved=await post({revision:null,page:{heroTitle:'Atualizado',heroDesc:'Bruna no desktop',steps:[{title:'não duplicar'}]}});
  assert.equal(saved.status,200);
  const data=await saved.json();assert.deepEqual(data.page,{heroTitle:'Atualizado',heroDesc:'Bruna no desktop'});
  const publicData=await pageContent(new Request('https://example.test/api/content/page'),env,false);
  assert.deepEqual((await publicData.json()).page,data.page);
  assert.equal((await post({revision:null,page:{heroTitle:'Conflito'}})).status,409);
  assert.equal((await post({revision:data.revision,page:{heroTitle:'Versão nova'}})).status,200);
});

test('landing loads published content and automatically syncs authenticated edits',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  for(const required of [
    "fetch('/api/content/page'",
    "fetch('/api/admin/content/page'",
    'pageLoadPromise=loadPublishedPage()',
    'schedulePagePublish()',
    'Conteúdo salvo e sincronizado em todos os dispositivos.'
  ]) assert.ok(html.includes(required),required);
});
