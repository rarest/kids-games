import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression,label){for(let n=0;n<120;n++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error('Timed out: '+label)}
async function click(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(point,selector);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(100)}
test('photo page words and sentences have real practice, retry, readable layout and speaking entries',{timeout:60000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse','course');await click(b,'#courseTextbook');
  await wait(b,'!!document.querySelector("[data-page-view=practice]")','page practice tabs');
  await b.evaluate('const s=document.getElementById("textbookPage");s.value="28";s.dispatchEvent(new Event("change",{bubbles:true}))');
  await wait(b,'window.englishPagePractice?.page.page===28','printed pets page');
  const expected=await b.evaluate('window.englishPagePractice.targets.length');assert.ok(expected>10);
  assert.equal(await b.evaluate('document.querySelectorAll("[data-page-speak]").length'),expected,'every source target has a speaking entry');
  assert.equal(await b.evaluate('document.getElementById("stopTextbookReading").hidden'),true,'no idle stop button');
  await click(b,'[data-page-view=practice]');await wait(b,'!!document.querySelector("[data-page-answer]")','first practice');
  const question=await b.evaluate('window.englishPagePractice.question');assert.ok(question);
  const choices=await b.evaluate('Array.from(document.querySelectorAll("[data-page-answer]")).map(e=>e.dataset.pageAnswer)');
  const wrong=choices.find(x=>x!==question.answer);assert.ok(wrong,'meaning options are distinct');
  await click(b,`[data-page-answer=${JSON.stringify(wrong)}]`);assert.equal(await b.evaluate('document.getElementById("pagePracticeNext").disabled'),true);assert.match(await b.evaluate('document.querySelector(".page-practice-feedback").textContent'),/再|听|重/);
  await click(b,`[data-page-answer=${JSON.stringify(question.answer)}]`);assert.equal(await b.evaluate('document.getElementById("pagePracticeNext").disabled'),false);
  const index=await b.evaluate('window.englishPagePractice.index');await click(b,'#pagePracticeNext');assert.equal(await b.evaluate('window.englishPagePractice.index'),index+1);
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await click(b,'[data-page-view=speaking]');await wait(b,'!!document.querySelector("[data-speaking-action=record]")','recording component');
  assert.equal(await b.evaluate('!!document.querySelector("[data-speaking-action=stop]:not([hidden])")'),false,'stop only during actual recording');
  await click(b,'#nextTextbookPage');assert.equal(await b.evaluate('window.englishPagePractice.page.page'),29);
  await b.size(1366,900);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await click(b,'#closeStudy');assert.equal(await b.evaluate('document.getElementById("study").open'),false);await b.evaluate('document.getElementById("courseTextbook").click();document.getElementById("closeStudy").click();document.getElementById("courseTextbook").click()');await sleep(200);assert.ok(await b.evaluate('!!window.englishPagePractice'));await click(b,'#nextTextbookPage');assert.equal(await b.evaluate('window.englishPagePractice.page.page'),3);await click(b,'[data-page-view=speaking]');await b.evaluate('window.__pageStreams=[];const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>get(...args).then(s=>{window.__pageStreams.push(s);return s})');await click(b,'[data-speaking-action=record]');await wait(b,'!!document.querySelector("[data-speaking-action=stop]:not([hidden])")','live microphone');await b.evaluate('dispatchEvent(new Event("family-logout"))');assert.equal(await b.evaluate('document.getElementById("study").open'),false);assert.ok(await b.evaluate('window.__pageStreams.length&&window.__pageStreams.every(s=>s.getTracks().every(t=>t.readyState==="ended"))'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
