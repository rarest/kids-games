import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let n=0;n<200;n++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error(expression+' '+await b.evaluate('document.querySelector("[data-speaking-status]")?.textContent'));}
async function click(b,selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(p,selector);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});await sleep(100);}
test('public classroom records actual standard speech, replays and receives real acoustic word feedback',{skip:!process.env.ENGLISH_PUBLIC_SPEECH_FIXTURE,timeout:60000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',`--use-file-for-fake-audio-capture=${process.env.ENGLISH_PUBLIC_SPEECH_FIXTURE}`,'--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');
  assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".course-game-links")).display'),'none');
  await click(b,'#courseTextbook');await b.evaluate('const s=document.getElementById("textbookPage");s.value="25";s.dispatchEvent(new Event("change",{bubbles:true}))');await click(b,'[data-page-speak="p25-line-0-0"]');
  await wait(b,'!document.querySelector("[data-speaking-action=refresh]")||document.querySelector("[data-speaking-action=refresh]").hidden');
  assert.equal(await b.evaluate('document.querySelector(".speaking-target").textContent'),'This is my family.');
  await b.evaluate('window.__liveStreams=[];const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>get(...args).then(s=>{window.__liveStreams.push(s);return s})');
  await click(b,'[data-speaking-action=record]');await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');await sleep(2250);await click(b,'[data-speaking-action=stop]');
  assert.ok(await b.evaluate('window.__liveStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))'));
  await click(b,'[data-speaking-action=play]');await wait(b,'document.querySelector(".speaking-panel audio").currentTime>0');
  await click(b,'[data-speaking-action=submit]');await wait(b,'document.querySelectorAll(".speaking-word-feedback li").length===4');
  const result=await b.evaluate('({summary:document.querySelector("[data-speaking-result]").textContent,words:Array.from(document.querySelectorAll(".speaking-word-feedback strong")).map(e=>e.textContent),score:Number(document.querySelector(".speaking-scores strong").textContent.match(/\d+/)[0])})');
  assert.deepEqual(result.words,['This','is','my','family']);assert.ok(result.score>=60,JSON.stringify(result));
  if(process.env.ENGLISH_PUBLIC_EVIDENCE){writeFileSync(process.env.ENGLISH_PUBLIC_EVIDENCE+'.json',JSON.stringify(result,null,2));writeFileSync(process.env.ENGLISH_PUBLIC_EVIDENCE+'.png',Buffer.from((await b.call('Page.captureScreenshot',{format:'png'})).data,'base64'));}
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await click(b,'#closeStudy');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
