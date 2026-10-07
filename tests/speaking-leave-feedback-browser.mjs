import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expr){for(let n=0;n<120;n++){if(await b.evaluate(expr))return;await sleep(75)}throw Error(expr)}
async function press(b,selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p})}
test('leaving during recording keeps the explanation visible through later microphone progress',{timeout:30000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');await press(b,'[data-page-view=speaking]');await press(b,'[data-speaking-action=record]');await wait(b,'document.querySelector(".speaking-panel").dataset.speakingState==="recording"');
  await sleep(1700);await press(b,'#openPagePicker');await sleep(350);assert.equal(await b.evaluate('document.querySelector("#pagePicker").open'),false);assert.match(await b.evaluate('document.querySelector("[data-speaking-status]").textContent'),/先完成.*取消/);
  await press(b,'[data-speaking-action=stop]');assert.ok(!/先完成/.test(await b.evaluate('document.querySelector("[data-speaking-status]").textContent')),'stop supplies the next recording action');await press(b,'[data-speaking-action=cancel]');await press(b,'#openPagePicker');assert.equal(await b.evaluate('document.querySelector("#pagePicker").open'),true);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
test('late microphone permission keeps a blocked navigation explanation until an explicit stop',{timeout:30000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');await press(b,'[data-page-view=speaking]');
  await b.evaluate(`window.__streams=[];const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>get(...args).then(stream=>{__streams.push(stream);return new Promise(resolve=>window.__grant=()=>resolve(stream))})`);
  await press(b,'[data-speaking-action=record]');await wait(b,'!!window.__grant');assert.equal(await b.evaluate('document.querySelector(".speaking-panel").dataset.speakingState'),'requesting');await press(b,'#nextTextbookPage');assert.match(await b.evaluate('document.querySelector("[data-speaking-status]").textContent'),/先完成.*取消/);
  await b.evaluate('__grant()');await wait(b,'document.querySelector(".speaking-panel").dataset.speakingState==="recording"');await sleep(350);assert.match(await b.evaluate('document.querySelector("[data-speaking-status]").textContent'),/先完成.*取消/);assert.equal(await b.evaluate('englishPagePractice.page.page'),2);
  await press(b,'[data-speaking-action=stop]');await press(b,'[data-speaking-action=cancel]');assert.ok(await b.evaluate('__streams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
