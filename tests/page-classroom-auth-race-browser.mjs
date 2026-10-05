import test from 'node:test';import assert from 'node:assert/strict';import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(80)}throw new Error(expression)}
test('a delayed initial guest session check preserves an already opened page classroom',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`const originalFetch=fetch;window.fetch=(url,options)=>url==='/api/family/status'?Promise.resolve(Response.json({enabled:true,mailReady:false})):url==='/api/auth/get-session'?new Promise(resolve=>{window.__guestSessionResolve=()=>resolve(Response.json(null))}):originalFetch(url,options);`});
  await b.navigate('games/english.html');await wait(b,'!!window.__guestSessionResolve&&!!window.englishCourse');await b.evaluate('document.getElementById("courseTextbook").click();document.querySelector("[data-page-view=practice]").click()');assert.equal(await b.evaluate('document.getElementById("study").open'),true);
  await b.evaluate('window.__guestSessionResolve()');await sleep(250);assert.equal(await b.evaluate('document.getElementById("study").open'),true);assert.ok(await b.evaluate('!!document.querySelector("[data-page-answer]")'));assert.ok(await b.evaluate('!!window.englishPagePractice'));
  await b.evaluate('dispatchEvent(new Event("family-logout"))');assert.equal(await b.evaluate('document.getElementById("study").open'),false);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('delayed guest identity confirmation does not interrupt actual classroom audio',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`const originalFetch=fetch;window.fetch=(url,options)=>url==='/api/family/status'?Promise.resolve(Response.json({enabled:true,mailReady:false})):url==='/api/auth/get-session'?new Promise(resolve=>{window.__guestSessionResolve=()=>resolve(Response.json(null))}):originalFetch(url,options);window.__identityClips=[];const originalPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__identityClips.push(this);return originalPlay.call(this)};`});
  await b.size(390,700,true);await b.navigate('games/english.html');await wait(b,'!!window.__guestSessionResolve&&!!window.englishCourse');await b.evaluate('document.getElementById("courseTextbook").click();document.getElementById("textbookPage").value="33";document.getElementById("textbookPage").dispatchEvent(new Event("change",{bubbles:true}))');
  const point=await b.evaluate('(()=>{const e=document.querySelector("[data-textbook-line=\\"5:0\\"]");e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await wait(b,'window.__identityClips.some(e=>e.currentTime>0&&!e.paused)');
  await b.evaluate('window.__guestSessionResolve()');await sleep(120);assert.ok(await b.evaluate('window.__identityClips.some(e=>e.currentTime>0&&!e.paused)'),'same guest identity must preserve ongoing audio');assert.equal(await b.evaluate('document.getElementById("stopTextbookReading").hidden'),false);await b.evaluate('dispatchEvent(new Event("family-logout"))');assert.ok(await b.evaluate('window.__identityClips.every(e=>e.paused)'),'explicit logout still cancels audio');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
