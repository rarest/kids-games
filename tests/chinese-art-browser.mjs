import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<120;i++){if(await b.evaluate(expression))return;await sleep(75)}throw Error(expression)}
test('Chinese covers decode and keep the first learning action and subject cards stable across devices',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  if(!process.env.GAMES_TEST_ORIGIN)await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`const f=fetch;window.fetch=(u,...a)=>new URL(u,location.href).pathname==='/api/family/status'?Promise.resolve(new Response(JSON.stringify({enabled:false}))):f(u,...a)`});
  for(const [w,h] of [[320,568],[390,660],[430,740],[768,1024],[1024,768],[1366,900]]){
   await b.size(w,h,w<=1024);await b.navigate('games/chinese.html');await wait(b,'!!window.chineseCourse');
   const initial=await b.evaluate('document.querySelector("#startChinese").getBoundingClientRect().top');
   await wait(b,'document.querySelector(".cn-hero img")?.complete&&document.querySelector(".cn-hero img").naturalWidth===1200');
   await b.evaluate('document.querySelector(".cn-hero img").decode()');
   const after=await b.evaluate('document.querySelector("#startChinese").getBoundingClientRect().top');assert.ok(Math.abs(initial-after)<=1,'decoding a cover must not move the learning action');
   if(w<=600)assert.ok(await b.evaluate('document.querySelector("#startChinese").getBoundingClientRect().bottom<=innerHeight'),'learning stays on the first phone screen');
   assert.equal(await b.evaluate('document.querySelector(".cn-hero img").loading'),'eager');
   const sources=await b.evaluate('[...document.querySelectorAll(".cn-unit img")].map(i=>i.src)');assert.equal(sources.length,8);assert.equal(new Set(sources).size,8);
   for(let n=0;n<8;n++){
    await b.evaluate(`document.querySelectorAll('.cn-unit img')[${n}].scrollIntoView({block:'center'})`);await wait(b,`document.querySelectorAll('.cn-unit img')[${n}].complete&&document.querySelectorAll('.cn-unit img')[${n}].naturalWidth===1200`);
    assert.ok(await b.evaluate(`(()=>{const e=document.querySelectorAll('.cn-unit img')[${n}],r=e.getBoundingClientRect();return r.width>90&&r.height>50&&r.x>=0&&r.right<=innerWidth&&e.alt.length>5})()`),'unit cover remains visible and has meaningful alternative text');
   }
   assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
   await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   await wait(b,'[...document.querySelectorAll(".subject-card img")].every(i=>i.complete&&i.naturalWidth>1000)');
   assert.equal(await b.evaluate('document.querySelectorAll(".subject-card img").length'),2);
   assert.match(await b.evaluate('document.querySelector("#englishArt img").src'),/english\/illustrations\/u1.webp/,'English entry uses its friends illustration, not a Chinese prediction scene');
   assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
