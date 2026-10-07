import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {startFixture} from './platform-browser-fixture.mjs';

async function wait(browser,expression,label=expression){
 for(let i=0;i<180;i++){if(await browser.evaluate(expression))return;await sleep(90)}
 throw new Error(`Timed out: ${label}; notice=${await browser.evaluate('document.querySelector("#notice")?.textContent||document.querySelector("#mathNotice")?.textContent||""')}`);
}
async function tap(browser,selector,touch=true){
 const point=await browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert]'))return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(point,selector);
 if(touch){await browser.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await browser.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await browser.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await browser.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}
 await sleep(80);
}
async function fill(browser,selector,value,touch=true){await tap(browser,selector,touch);await browser.call('Input.insertText',{text:value})}
async function pickMath(browser,child,touch=true){
 await tap(browser,`[data-select="${child}"]`,touch);await wait(browser,'!!window.pearlClassroom','family classroom');
 await tap(browser,'.subject-card[data-subject="math"]',touch);await wait(browser,`window.mathCourseCloud?.profile?.id===${JSON.stringify(child)}&&window.mathCourseCloud.status==="已同步"`,'selected math family profile');
}
async function synced(browser){await wait(browser,'window.mathCourseCloud?.status==="已同步"&&window.mathCourseCloud.pending.length===0','math cloud acknowledgement')}
async function login(browser,username,password,touch=false){
 await browser.navigate('account.html');await wait(browser,'!!document.querySelector("form[data-form=login]")');
 await fill(browser,'input[name=identifier]',username,touch);await fill(browser,'input[name=password]',password,touch);
 await tap(browser,'form[data-form=login] button[type=submit]',touch);await wait(browser,'!!document.querySelector("[data-select]")','native login');
}

test('native two-browser math family resumes canonical first answer and position, isolates children and saves subject switches',{timeout:180000},async t=>{
 const fixture=await startFixture({family:true,mail:false}),previous=process.env.GAMES_TEST_ORIGIN;process.env.GAMES_TEST_ORIGIN=fixture.origin;
 const username=`MathParent${Date.now()}`,password='isolated-math-native-pass-42';let a,b;
 try{
  a=await openBrowser();await a.call('Page.addScriptToEvaluateOnNewDocument',{source:`window.__praises=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.src.includes('/encouragement/'))__praises.push(this);return play.call(this)};`});await a.size(390,844,true);await a.navigate('games/math.html');await wait(a,'!!window.mathCourse&&!!window.mathCourseCloud');
  assert.equal(await a.evaluate('window.mathCourseCloud.profile'),null);
  await tap(a,'.classroom-parent');await wait(a,'!!document.querySelector("[data-tab=register]")');await tap(a,'[data-tab=register]');
  await fill(a,'input[name=username]',username);await fill(a,'input[name=password]',password);await tap(a,'form[data-form=register] button[type=submit]');
  await wait(a,'!!document.querySelector("form[data-form=profile]")','native registration');assert.equal(fixture.mailbox.length,0);
  await fill(a,'input[name=nickname]','小数');await tap(a,'form[data-form=profile] button[type=submit]');await wait(a,'!!document.querySelector("[data-select]")','first child creation');
  const child=await a.evaluate('document.querySelector("[data-select]").dataset.select');await pickMath(a,child);
  assert.equal(await a.evaluate('mathCourse.progress.session'),null);
  await tap(a,'#startMath');
  for(let i=0;i<12;i++){if(await a.evaluate('mathCourse.session.steps[mathCourse.session.index].kind==="question"'))break;await tap(a,'#mathNext')}
  const question=await a.evaluate('mathCourse.session.steps[mathCourse.session.index]');assert.equal(question.kind,'question');assert.ok(question.choices);
  const wrong=question.choices.findIndex(c=>c!==question.answer),right=question.choices.indexOf(question.answer);
  await tap(a,`[data-answer="${wrong}"]`);assert.equal(await a.evaluate('document.querySelector("#mathNext").disabled'),true);
  await synced(a);await tap(a,'#mathHint');await tap(a,'#mathHint');await tap(a,`[data-answer="${right}"]`);
  await wait(a,'__praises.at(-1)?.currentTime>0.1','real encouragement started');await a.evaluate('mathCourseCloud.flush()');assert.equal(await a.evaluate('__praises.at(-1).paused&&!__praises.at(-1).ended'),false,'real immediate family receipt must preserve encouragement');await tap(a,'#mathNext');await synced(a);assert.equal(await a.evaluate('__praises.at(-1).paused&&!__praises.at(-1).ended'),false,'family acknowledgement must not truncate encouragement');await wait(a,'__praises.at(-1).ended','real encouragement reaches its natural end');
  const checkpoint=await a.evaluate('mathCourse.session.index');assert.equal(checkpoint,4);
  const first=await a.evaluate(`mathCourse.session.answers[${JSON.stringify(question.id)}]`);
  assert.equal(first.correct,false);assert.equal(first.latest.correct,true);assert.equal(first.latest.hinted,true);
  assert.deepEqual(await a.evaluate(`(()=>{const i=mathCourse.progress.items[${JSON.stringify(question.itemKey)}];return [i.correct,i.incorrect]})()`),[0,1]);
  const receipts=await fixture.pool.query('SELECT content_version,kind,result FROM learning_events WHERE profile_id=$1 AND content_id=$2',[child,question.id.split(':')[0]]);
  assert.equal(receipts.rows.length,1,'wrong first answer creates one real server event; retry creates no mastery event');
  assert.equal(receipts.rows[0].content_version,'pep3-math-2025-v1');assert.equal(receipts.rows[0].kind,'answer');assert.equal(receipts.rows[0].result.correct,false);assert.equal(receipts.rows[0].result.selected,question.choices[wrong]);
  await tap(a,'.classroom-parent');await wait(a,'!!document.querySelector("[data-action=logout]")');await tap(a,'[data-action=logout]');await wait(a,'!!document.querySelector("form[data-form=login]")','native logout');
  b=await openBrowser();await b.size(1366,900);await login(b,username,password);await pickMath(b,child,false);await tap(b,'#startMath',false);
  assert.equal(await b.evaluate('mathCourse.session.index'),checkpoint,'separate browser reads real saved position');
  assert.deepEqual(await b.evaluate(`(()=>{const a=mathCourse.session.answers[${JSON.stringify(question.id)}];return [a.correct,a.latest.correct,a.latest.hinted,a.attempts]})()`),[false,true,true,2]);
  assert.deepEqual(await b.evaluate(`(()=>{const i=mathCourse.progress.items[${JSON.stringify(question.itemKey)}];return [i.correct,i.incorrect]})()`),[0,1]);
  await tap(b,'[data-subject="english"]',false);await wait(b,`window.englishCourseCloud?.profile?.id===${JSON.stringify(child)}&&window.englishCourseCloud.status==="已同步"`);
  assert.equal(await b.evaluate('englishCourse.progress.session'),null,'English has independent state');await tap(b,'#startCourse',false);await tap(b,'#courseNext',false);await wait(b,'window.englishCourseCloud.status==="已同步"');
  await tap(b,'[data-subject="math"]',false);await synced(b);await tap(b,'#startMath',false);assert.equal(await b.evaluate('mathCourse.session.index'),checkpoint);
  await tap(b,'.classroom-parent',false);await wait(b,'!!document.querySelector("form[data-form=profile]")');await fill(b,'input[name=nickname]','小角',false);await tap(b,'form[data-form=profile] button[type=submit]',false);await wait(b,'document.querySelectorAll("[data-select]").length===2','second child creation');
  const sibling=await b.evaluate(`Array.from(document.querySelectorAll('[data-select]')).find(e=>e.dataset.select!==${JSON.stringify(child)}).dataset.select`);await pickMath(b,sibling,false);
  assert.equal(await b.evaluate('mathCourse.progress.session'),null,'second child does not inherit math position');assert.equal(await b.evaluate('Object.keys(mathCourse.progress.items).length'),0);
  const exported=await b.evaluate('fetch("/api/family/export").then(r=>r.json())');
  const childMath=exported.progress.find(r=>r.profileId===child&&r.gameId==='math'),childEnglish=exported.progress.find(r=>r.profileId===child&&r.gameId==='english'),siblingMath=exported.progress.find(r=>r.profileId===sibling&&r.gameId==='math');
  assert.equal(childMath.data.session.index,checkpoint);assert.equal(childMath.data.session.answers[question.id].correct,false);assert.equal(childEnglish.data.session.index,1);assert.equal(siblingMath.data.session,null);
  assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
  t.diagnostic(JSON.stringify({nativeRegistration:true,independentBrowserReadback:true,mathStep:checkpoint,firstCorrect:false,retryCorrect:true,hintRetained:true,serverAnswerEvents:receipts.rows.length,mathItemCounts:[0,1],englishStep:1,secondChildEmpty:true}));
 }finally{a?.close();b?.close();await fixture.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous}
});
