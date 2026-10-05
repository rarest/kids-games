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
