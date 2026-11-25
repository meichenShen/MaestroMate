import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const p=await browser.newPage({reducedMotion:'reduce'});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{sessionStorage.setItem('maestromate-guide-v2','seen');sessionStorage.setItem('maestromate-entry-v2','seen');localStorage.setItem('maestromate-language','zh')});
try{
 for(const [width,height]of[[1440,900],[1366,600],[390,844]]){
  await p.setViewportSize({width,height});
  await p.goto((process.env.QA_BASE_URL||'http://localhost:4173')+'/#chat');
  await p.locator('.artist-profile h1').waitFor();
  await p.evaluate(()=>document.fonts.ready);
  assert.ok(await p.evaluate(()=>document.fonts.check('18px "Maestro Chinese"','音乐聆听')));
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const story=await p.locator('.composer-story').boundingBox();
  assert.ok(story.width>240,'Composer prose needs a usable Chinese reading width');
  if(width<951){const title=await p.locator('.artist-profile h1').boundingBox();assert.ok(title.height<90,'Name should not become a vertical text strip')}
  else {const prompts=await p.locator('.chat-prompts').boundingBox();assert.ok(prompts.y+prompts.height<=height,'Question controls must stay in the viewport')}
 }
 assert.deepEqual(errors,[]);
 console.log('Chinese fonts, normal reading width and desktop question controls passed at 1440×900, 1366×600 and 390×844.');
}finally{await browser.close()}
