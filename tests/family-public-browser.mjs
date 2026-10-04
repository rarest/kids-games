import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {startFixture} from './platform-browser-fixture.mjs';
async function wait(b,expression,label){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error('Timed out: '+label)}
async function click(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(point,'Enabled native control '+selector);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(80)}
test('public account page states mail availability accurately and guest course remains playable',{timeout:70000},async()=>{
 assert.ok(process.env.GAMES_TEST_ORIGIN,'Set the actual public test origin');const b=await openBrowser();
 try{
  await b.size(390,844,true);await b.navigate('index.html');await wait(b,'document.querySelectorAll(".card").length===14','game hall');assert.ok(await b.evaluate(`!!document.querySelector(${JSON.stringify('a[href="account.html"]')})`),'parent centre entry');await click(b,'a[href="account.html"]');await wait(b,'!!document.querySelector("[data-tab=register]")','account page');
  const availability=await b.evaluate('fetch("/api/family/status").then(r=>r.json())');assert.equal(availability.enabled,true);assert.equal(availability.mailReady,false,'mail must remain gated until real sender is configured');await click(b,'[data-tab=register]');assert.equal(await b.evaluate('document.querySelector("form[data-form=register] button[type=submit]").disabled'),true);assert.match(await b.evaluate('document.body.innerText'),/邮件服务尚未配置/);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await b.evaluate('scrollTo(0,0)');await writeFile('/home/ubuntu/codex-work/output/family-cloud/public-account-mobile.png',Buffer.from((await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));await b.size(1366,900);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await writeFile('/home/ubuntu/codex-work/output/family-cloud/public-account-desktop.png',Buffer.from((await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  await b.size(390,844,true);await click(b,'a[href="/games/english.html"]');await wait(b,'!!window.englishCourseCloud&&!!document.getElementById("startCourse")','guest English course');assert.equal(await b.evaluate('window.englishCourseCloud.profile'),null);await click(b,'#startCourse');await click(b,'#courseNext');assert.equal(await b.evaluate('window.englishCourse.session.index'),1);await b.navigate('games/english.html');await wait(b,'!!window.englishCourseCloud&&!!document.getElementById("startCourse")','guest resume');await click(b,'#startCourse');assert.equal(await b.evaluate('window.englishCourse.session.index'),1);assert.deepEqual(b.errors,[]);
  const gate=await b.evaluate('fetch("/api/auth/sign-up/email",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}).then(async r=>({status:r.status,error:(await r.json()).error}))');assert.equal(gate.status,503);assert.equal(gate.error,'Email service unavailable');
  for(const file of ['platform/server.mjs','platform/auth.mjs','deploy/platform-offsite-backup.mjs','.env','racing/server.mjs'])assert.equal(await b.evaluate(`fetch(${JSON.stringify('/'+file)}).then(r=>r.status)`),404,'Private path remains unavailable: '+file);
 }finally{b.close()}
});
test('a delayed guest session check does not close a lesson started by native clicks',{timeout:45000},async()=>{
 const previous=process.env.GAMES_TEST_ORIGIN;
 const fixture=previous?null:await startFixture({family:true});
 if(fixture)process.env.GAMES_TEST_ORIGIN=fixture.origin;
 const b=await openBrowser();let paused;
 try{
  await b.size(390,844,true);
  await b.call('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/get-session',requestStage:'Request'}]});
  b.on('Fetch.requestPaused',event=>{paused=event.requestId});
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourseCloud','guest course');
  for(let n=0;n<100&&!paused;n++)await sleep(50);assert.ok(paused,'Session check is held before its response');
  await click(b,'#startCourse');await wait(b,'window.englishCourse.session?.index===0','native lesson start');
  await click(b,'#courseNext');await wait(b,'window.englishCourse.session?.index===1','native lesson advance');
  await b.call('Fetch.continueRequest',{requestId:paused});await sleep(1500);
  assert.equal(await b.evaluate('window.englishCourse.session?.index'),1,'Session check keeps the current lesson visible');
  assert.equal(await b.evaluate('!!document.getElementById("courseNext")'),true);
  assert.deepEqual(b.errors,[]);
 }finally{b.close();await fixture?.close();if(previous)process.env.GAMES_TEST_ORIGIN=previous;else delete process.env.GAMES_TEST_ORIGIN}
});
