import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<80;i++){if(await b.evaluate(expression))return;await sleep(75);}throw new Error(expression);}
async function prepare(b,{enabled=true}={}){
 await b.navigate('games/english.html');
 await b.evaluate(`(async()=>{document.body.innerHTML='<main id="speakingRoot"></main>';const css=document.createElement('link');css.rel='stylesheet';css.href='/english/speaking.css';document.head.append(css);window.__streams=[];const nativeGetUserMedia=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>nativeGetUserMedia(...args).then(stream=>{window.__streams.push(stream);return stream;});window.__speechEnabled=${enabled};window.__uploads=[];window.__answer={score:82,accuracy:80,completeness:100,words:[{word:'Hello',score:80,errorType:'None'}],duration:1,engine:'local-phoneme'};const originalFetch=window.fetch;window.fetch=async(url,options)=>{if(url==='/api/english/speech-status')return new Response(JSON.stringify({enabled:window.__speechEnabled,provider:window.__speechEnabled?'local-phoneme':null}));if(String(url).startsWith('/api/english/pronunciation?')){window.__uploads.push({url,bytes:Array.from(new Uint8Array(await options.body.arrayBuffer()))});return new Response(JSON.stringify(window.__answer),{status:window.__answer.error?422:200});}return originalFetch(url,options)};window.__speakingModule=await import('/english/speaking.js');window.__speaking=window.__speakingModule.mountSpeaking({root:document.getElementById('speakingRoot'),target:{id:'p4-word-0',page:4,kind:'word',en:'Hello',zh:'你好'},speak:()=>true,onResult:r=>{window.__result=r;}});})()`);
 await wait(b,'document.querySelector("[data-speaking-action=record]")&&!document.querySelector("[data-speaking-status]").textContent.includes("查看")');
}

test('native microphone PCM is replayable and uploads only after explicit scoring',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 try{
  await b.size(390,844,true);await prepare(b);
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=stop]").hidden'),true);
  await b.evaluate('document.querySelector("[data-speaking-action=record]").click()');
  await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');await sleep(1400);
  await b.evaluate('document.querySelector("[data-speaking-action=stop]").click()');
  assert.equal(await b.evaluate('window.__uploads.length'),0);
  assert.equal(await b.evaluate('window.__streams.every(stream=>stream.getTracks().every(track=>track.readyState==="ended"))'),true);
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=submit]").disabled'),false);
  await b.evaluate('document.querySelector("[data-speaking-action=play]").click()');await wait(b,'document.querySelector("audio").currentTime>0');
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=stop]").hidden'),true);
  await b.evaluate('document.querySelector("[data-speaking-action=submit]").click();document.querySelector("[data-speaking-action=submit]").click()');
  await wait(b,'!!window.__result');assert.equal(await b.evaluate('window.__uploads.length'),1);
  const upload=await b.evaluate('window.__uploads[0]');assert.equal(upload.url,'/api/english/pronunciation?target=p4-word-0');
  const view=new DataView(Uint8Array.from(upload.bytes).buffer);assert.equal(view.getUint32(24,true),16000);assert.equal(view.getUint16(22,true),1);
  assert.ok(upload.bytes.length>16000);assert.match(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'),/发音贴合度.*80/);
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);
  assert.equal(await b.evaluate('Array.from(document.querySelectorAll("button")).filter(e=>!e.hidden).every(e=>e.getBoundingClientRect().height>=44)'),true);
  await b.evaluate('window.__answer={error:"no_speech"};document.querySelector("[data-speaking-action=submit]").click()');
  await wait(b,'document.querySelector("[data-speaking-status]").textContent.includes("声音")');
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'), '');
  await b.evaluate('window.__answer={score:100,accuracy:99,completeness:100,words:[],duration:1,engine:"local-phoneme"};document.querySelector("[data-speaking-action=submit]").click()');
  await wait(b,'document.querySelector("[data-speaking-status]").textContent.includes("有效反馈")');
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'),'');
  await b.evaluate(`window.__result=null;const priorFetch=window.fetch;window.fetch=(url,options)=>String(url).startsWith('/api/english/pronunciation?')?new Promise(resolve=>{window.__lateScore=resolve;}):priorFetch(url,options);document.querySelector('[data-speaking-action=submit]').click()`);
  await wait(b,'!!window.__lateScore');
  await b.evaluate(`window.__speaking.destroy();window.__speaking=window.__speakingModule.mountSpeaking({root:document.getElementById('speakingRoot'),target:{id:'p5-word-0',page:5,kind:'word',en:'World',zh:'世界'}});window.__lateScore(new Response(JSON.stringify({score:100,accuracy:100,completeness:100,words:[{word:'Hello',score:100}],duration:1,engine:'local-phoneme'})));`);
  await sleep(200);assert.equal(await b.evaluate('window.__result'),null);assert.equal(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'),'');assert.equal(await b.evaluate('document.querySelector(".speaking-target").textContent'),'World');
  await b.evaluate('window.__speaking.destroy()');assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});

test('unavailable scoring keeps a real recording playable and cancellation stops late permissions',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 try{
  await prepare(b,{enabled:false});await b.evaluate('document.querySelector("[data-speaking-action=record]").click()');
  await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');await sleep(900);
  await b.evaluate('document.querySelector("[data-speaking-action=stop]").click();document.querySelector("[data-speaking-action=play]").click()');
  await wait(b,'document.querySelector("audio").currentTime>0');assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=submit]").disabled'),true);
  const currentURL=await b.evaluate('document.querySelector("audio").src');
  await b.evaluate('window.__speechEnabled=true;document.querySelector("[data-speaking-action=refresh]").click()');
  await wait(b,'!document.querySelector("[data-speaking-action=submit]").disabled');assert.equal(await b.evaluate('document.querySelector("audio").src'),currentURL);
  await b.evaluate(`window.__speaking.destroy();window.__stops=0;Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:()=>new Promise(resolve=>{window.__grant=resolve;})});window.__speaking=window.__speakingModule.mountSpeaking({root:document.getElementById('speakingRoot'),target:{id:'p4-word-0',page:4,kind:'word',en:'Hello',zh:'你好'}});document.querySelector('[data-speaking-action=record]').click()`);
  await wait(b,'!!window.__grant');assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=stop]").hidden'),true);
  await b.evaluate(`document.querySelector('[data-speaking-action=cancel]').click();window.__grant({getTracks:()=>[{stop(){window.__stops++;}}]})`);
  await wait(b,'window.__stops===1');assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=record]").disabled'),false);
  await b.evaluate(`document.querySelector('[data-speaking-action=record]').click();window.__speaking.destroy();window.__grant({getTracks:()=>[{stop(){window.__stops++;}}]})`);
  await wait(b,'window.__stops===2');assert.equal(await b.evaluate('document.getElementById("speakingRoot").children.length'),0);
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
