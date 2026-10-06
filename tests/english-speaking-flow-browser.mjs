import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(75)}throw new Error(expression)}
async function controlsDoNotOverlap(b,label){
 for(const [width,height,touch] of [[320,568,true],[390,700,true],[768,1024,true],[1024,768,true],[1366,900,false]]){
  await b.size(width,height,touch);
  const boxes=await b.evaluate(`Array.from(document.querySelectorAll('.speaking-controls button')).filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return{action:e.dataset.speakingAction,left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height}})`);
  for(let i=0;i<boxes.length;i++){assert.ok(boxes[i].height>=44,`${label} ${width}: small target`);for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];assert.ok(!(Math.min(a.right,c.right)>Math.max(a.left,c.left)+1&&Math.min(a.bottom,c.bottom)>Math.max(a.top,c.top)+1),`${label} ${width}: overlapping ${a.action}/${c.action}`)}}
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
 }
}
test('speaking presents the current action with nearby status and waits for explicit feedback submission',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,700,true);await b.navigate('games/english.html');
  await b.evaluate(`(async()=>{document.body.innerHTML='<main id="flowRoot"></main>';window.__uploads=0;const original=fetch;window.fetch=async(url,options)=>url==='/api/english/speech-status'?new Response(JSON.stringify({enabled:true,provider:'local-phoneme'})):String(url).startsWith('/api/english/pronunciation?')?(window.__uploads++,new Promise(resolve=>{window.__finishScore=()=>resolve(new Response(JSON.stringify({score:68,accuracy:65,completeness:100,words:[{word:'Hello',score:65}],duration:1,engine:'local-phoneme'})))})):original(url,options);const {mountSpeaking}=await import('/english/speaking.js');mountSpeaking({root:document.getElementById('flowRoot'),target:{id:'p4-word-0',en:'Hello',zh:'你好',page:4,kind:'word'}})})()`);
  await wait(b,'!!document.querySelector("[data-speaking-action=record]")&&!document.querySelector("[data-speaking-status]").textContent.includes("查看")');
  assert.ok(await b.evaluate('document.querySelector("[data-speaking-action=submit]").hidden'),'do not show scoring before a recording exists');
  const state=()=>b.evaluate(`(()=>{const r=document.querySelector('[data-speaking-status]').getBoundingClientRect(),c=document.querySelector('.speaking-controls').getBoundingClientRect();return{statusBottom:r.bottom,controlsTop:c.top}})()`);
  let layout=await state();assert.ok(layout.statusBottom<=layout.controlsTop,'the child should see the state before choosing the next action');
  await controlsDoNotOverlap(b,'idle');
  await b.evaluate('document.querySelector("[data-speaking-action=record]").click()');await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');
  assert.ok(await b.evaluate('document.querySelector("[data-speaking-action=submit]").hidden'));
  await controlsDoNotOverlap(b,'recording');
  await sleep(900);await b.evaluate('document.querySelector("[data-speaking-action=stop]").click()');
  assert.equal(await b.evaluate('window.__uploads'),0);assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=submit]").hidden'),false);
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=submit]").disabled'),false);
  assert.ok(await b.evaluate('document.querySelector(".speaking-parent-details")&&!document.querySelector(".speaking-parent-details").open'),'keep the full parent explanation available without crowding the child action');
  await controlsDoNotOverlap(b,'recorded');
  await b.evaluate('document.querySelector("[data-speaking-action=submit]").click()');await wait(b,'!!window.__finishScore');await controlsDoNotOverlap(b,'assessing');await b.evaluate('window.__finishScore()');await wait(b,'document.querySelector("[data-speaking-result]").textContent.includes("68")');
  assert.equal(await b.evaluate('window.__uploads'),1);
  assert.match(await b.evaluate('document.querySelector(".speaking-next-practice").textContent'),/Hello/);
  assert.ok(await b.evaluate('!!document.querySelector(".speaking-score-details")&&!document.querySelector(".speaking-score-details").open'));
  for(const [width,height,touch] of [[320,568,true],[768,1024,true],[1024,768,true],[1366,900,false]]){await b.size(width,height,touch);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));layout=await state();assert.ok(layout.statusBottom<=layout.controlsTop)}
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
