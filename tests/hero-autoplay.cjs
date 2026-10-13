const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const vm=require('node:vm');
const {chromium}=require('playwright');
const html=fs.readFileSync(require('node:path').join(__dirname,'../public/index.html'),'utf8');
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
const mockApi=`
window.YT={PlayerState:{PLAYING:1,PAUSED:2},Player:class {
 constructor(iframe,options){this.iframe=iframe;this.events=options.events;this.muted=false;this.calls=[];this.state=-1;window.testPlayer=this;queueMicrotask(()=>this.events.onReady({target:this}));}
 unMute(){this.muted=false;this.calls.push('unMute');}
 mute(){this.muted=true;this.calls.push('mute');}
 isMuted(){return this.muted;}
 playVideo(){this.calls.push('play');if(window.testPolicy==='all-blocked'||(window.testPolicy==='sound-blocked'&&!this.muted&&!window.testGesture)){this.events.onAutoplayBlocked({target:this});return;}this.state=1;this.events.onStateChange({target:this,data:1});}
 pauseVideo(){this.calls.push('pause');this.state=2;this.events.onStateChange({target:this,data:2});}
 destroy(){this.calls.push('destroy');this.iframe.remove();}
}};window.onYouTubeIframeAPIReady();`;
test('hero autoplay policies, sound activation, scrolling, persistence and original pause',async()=>{
 const worker=(await import('../src/index-v4.js')).default;
 const originalFetch=global.fetch;
 global.fetch=async()=>new Response(html,{headers:{'Content-Type':'text/html'}});
 const env={CODES:{get:async()=>null}};
 const server=http.createServer(async(q,r)=>{const res=await worker.fetch(new Request('http://127.0.0.1'+q.url),env);r.writeHead(res.status,Object.fromEntries(res.headers));r.end(await res.text());});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const policy of ['allowed','sound-blocked','all-blocked']){
   const page=await browser.newPage({viewport:{width:1440,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(policy=>{window.testPolicy=policy;document.addEventListener('click',()=>window.testGesture=true,true);},policy);
   await page.route('**/*',route=>{
    const url=route.request().url();
    if(url.includes('youtube.com/iframe_api')) return route.fulfill({contentType:'application/javascript',body:mockApi});
    if(url.startsWith('https://')) return route.abort();
    return route.continue();
   });
   await page.goto('http://127.0.0.1:'+server.address().port);
   await page.waitForFunction(()=>window.testPlayer);
   assert.deepEqual(errors,[]);
   assert.equal(await page.locator('#hero-video-player').count(),1);
   assert.equal(await page.evaluate(()=>testPlayer.muted),policy!=='allowed');
   assert.equal(await page.locator('#hero-sound-button').isVisible(),policy!=='allowed');
   if(policy==='all-blocked') assert.equal(await page.locator('#hero-sound-button').innerText(),'Reproduzir vídeo com som');
   if(policy!=='allowed'){
    await page.evaluate(()=>window.testPolicy='sound-blocked');
    await page.locator('#hero-sound-button').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>testPlayer.muted),false);
    assert.equal(await page.locator('#hero-sound-button').isVisible(),false);
   }
   await page.evaluate(()=>{window.originalIframe=document.getElementById('hero-video-player');window.originalPlayer=testPlayer;window.originalCalls=testPlayer.calls.length;window.scrollTo(0,document.body.scrollHeight);renderPage();});
   assert.equal(await page.evaluate(()=>originalIframe===document.getElementById('hero-video-player')&&originalPlayer===testPlayer&&testPlayer.calls.length===originalCalls&&testPlayer.state===1),true);
   await page.evaluate(()=>{testPlayer.pauseVideo();window.scrollTo(0,0);renderPage();});
   assert.equal(await page.evaluate(()=>testPlayer.state),2);
   assert.equal(await page.evaluate(()=>testPlayer.calls.at(-1)),'pause');
   for(const width of [1440,390]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
   await page.evaluate(()=>{state.videoUrlHero='https://www.youtube.com/embed/anotherVideo';renderPage();});
   await page.waitForFunction(()=>testPlayer!==originalPlayer);
   assert.equal(await page.evaluate(()=>originalPlayer.calls.at(-1)),'destroy');
   assert.equal(await page.locator('#hero-video-player').count(),1);
   await page.close();
  }
 }finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));global.fetch=originalFetch;}
});


