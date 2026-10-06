import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<120;i++){if(await b.evaluate(expression))return;await sleep(75);}throw new Error(expression);}
async function setup(b){
 await b.navigate('games/english.html');
 await b.evaluate(`(async()=>{const {BOOKS}=await import('/english/curriculum.js');const {textbookSection}=await import('/english/textbook.js');const {mountPageClassroom}=await import('/english/page-classroom.js');window.__pages=BOOKS.find(b=>b.id==='g3-upper').textbookPages;window.__mount=mountPageClassroom;window.__section=textbookSection;window.__key='round-test-child-a';window.__esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));document.body.innerHTML='<dialog id="study" class="study-dialog"><div class="section-heading"><h2>课本逐页课堂</h2><button id="closeStudy">关闭</button></div><div id="studyContent"></div></dialog>';document.getElementById('studyContent').innerHTML=textbookSection({textbookPages:window.__pages},window.__esc);document.getElementById('study').showModal();document.getElementById('closeStudy').onclick=()=>document.getElementById('study').close();window.__api=mountPageClassroom({root:document.querySelector('.textbook-section'),pages:window.__pages,storageKey:window.__key,speak(){},stopAudio(){}});window.__api.goPage(3);document.querySelector('[data-page-view=practice]').click();})()`);
 await wait(b,'!!window.__api&&!!document.querySelector(".page-question-card")');
}
test('six source questions end at a real result and preserve the next child resume position',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await setup(b);
  for(let i=0;i<6;i++){
   await b.evaluate(`(()=>{const q=window.__api.question;document.querySelectorAll('[data-page-answer]').forEach(button=>{if(button.dataset.pageAnswer===q.answer)button.click()})})()`);
   await b.evaluate('document.getElementById("pagePracticeNext").click()');
  }
  assert.match(await b.evaluate('document.querySelector(".page-round-result")?.textContent||""'),/这组完成了/);
  assert.equal(await b.evaluate('window.__api.index'),5);
  await b.evaluate('window.__api.destroy();window.__api=window.__mount({root:document.querySelector(".textbook-section"),pages:window.__pages,storageKey:window.__key,speak(){},stopAudio(){}});window.__api.goPage(3);document.querySelector("[data-page-view=practice]").click()');
  assert.ok(await b.evaluate('!!document.querySelector(".page-round-result")'));
  await b.evaluate('document.getElementById("pageRoundNext").click()');assert.equal(await b.evaluate('window.__api.index'),6);
  await b.evaluate('document.getElementById("pagePracticePause").click()');
  assert.ok(await b.evaluate('!!document.querySelector(".page-round-paused")'));
  await b.evaluate('document.getElementById("pagePracticeResume").click()');assert.equal(await b.evaluate('window.__api.index'),6);
  assert.equal(await b.evaluate('Object.keys(JSON.parse(localStorage.getItem(window.__key)).answers).length'),6);
 }finally{b.close();}
});
test('reading has one scroll region and a visible close control at phone tablet and desktop widths',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await setup(b);await b.evaluate('document.querySelector("[data-page-view=reading]").click();window.__api.goPage(79)');
  for(const [width,height,touch] of [[320,568,true],[390,844,true],[768,1024,true],[1024,768,true],[1366,768,false]]){
   await b.size(width,height,touch);
   await b.evaluate('document.getElementById("studyContent").scrollTop=350');
   const layout=await b.evaluate(`(()=>{const d=document.getElementById('study'),s=document.getElementById('studyContent'),c=document.getElementById('closeStudy'),t=document.querySelector('.page-view-tabs'),r=c.getBoundingClientRect(),tr=t.getBoundingClientRect();return {dialogScroll:d.scrollHeight-d.clientHeight,contentScroll:s.scrollHeight-s.clientHeight,closeTop:r.top,closeBottom:r.bottom,tabsVisible:tr.top>=r.bottom&&tr.bottom<=s.getBoundingClientRect().top,tabPosition:getComputedStyle(t).position,outerLocked:getComputedStyle(document.body).overflow,wide:document.documentElement.scrollWidth>innerWidth+1}})()`);
   assert.ok(layout.dialogScroll<=2,JSON.stringify(layout));assert.ok(layout.contentScroll>0);assert.ok(layout.closeTop>=0&&layout.closeBottom<=height);assert.equal(layout.tabsVisible,true,'learning modes stay visible above the scrolling content');assert.equal(layout.tabPosition,'static');assert.equal(layout.outerLocked,'hidden');assert.equal(layout.wide,false);
  }
 }finally{b.close();}
});
test('selected errors are visible, sentence words can be withdrawn, and child cursors stay isolated',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await setup(b);
  await b.evaluate(`(()=>{const q=window.__api.question;const wrong=q.choices.find(a=>a!==q.answer);Array.from(document.querySelectorAll('[data-page-answer]')).find(button=>button.dataset.pageAnswer===wrong).click()})()`);
  assert.equal(await b.evaluate('document.querySelectorAll(".selected-wrong[aria-pressed=true]").length'),1);
  await b.evaluate(`(()=>{const q=window.__api.question;Array.from(document.querySelectorAll('[data-page-answer]')).find(button=>button.dataset.pageAnswer===q.answer).click()})()`);
  assert.equal(await b.evaluate('document.querySelectorAll(".selected-correct[aria-pressed=true]").length'),1);
  await b.evaluate(`document.querySelector('[data-page-practice="p3-line-1-0"]').click()`);
  while(await b.evaluate('window.__api.question.kind!=="order"')){
   await b.evaluate(`(()=>{const q=window.__api.question;Array.from(document.querySelectorAll('[data-page-answer]')).find(button=>button.dataset.pageAnswer===q.answer).click();document.getElementById('pagePracticeNext').click()})()`);
  }
  await b.evaluate('document.querySelector("[data-page-token]").click()');
  assert.equal(await b.evaluate('document.querySelectorAll("[data-page-remove]").length'),1);
  await b.evaluate('document.querySelector("[data-page-remove]").click()');
  assert.equal(await b.evaluate('document.querySelectorAll("[data-page-remove]").length'),0);
  assert.equal(await b.evaluate('document.querySelectorAll("[data-page-token]:disabled").length'),0);
  const childA=await b.evaluate('localStorage.getItem(window.__key)');
  await b.evaluate('window.__api.destroy();window.__api=window.__mount({root:document.querySelector(".textbook-section"),pages:window.__pages,storageKey:"round-test-child-b",speak(){},stopAudio(){}});window.__api.goPage(3);document.querySelector("[data-page-view=practice]").click()');
  assert.equal(await b.evaluate('window.__api.index'),0);
  assert.equal(await b.evaluate('localStorage.getItem(window.__key)'),childA);
  assert.equal(await b.evaluate('document.querySelectorAll(".page-view-tabs").length'),1);
  await b.evaluate('document.querySelector("[data-page-view=reading]").click()');
  assert.equal(await b.evaluate('document.querySelector("[data-page-view=reading]").getAttribute("aria-pressed")'),'true');
  assert.ok(await b.evaluate('!!document.querySelector(".page-reading-grid")'));
 }finally{b.close();}
});
test('a final partial round ends the page without cycling to the first question',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await setup(b);
  await b.evaluate(`(async()=>{const {makePractice}=await import('/english/page-practice.js');const {loadPractice,recordPracticeCursor}=await import('/english/page-practice-progress.js');const qs=makePractice(window.__api.page);window.__lastId=qs.at(-1).id;window.__lastIndex=qs.length-1;const state=loadPractice(null);recordPracticeCursor(state,3,{questionId:window.__lastId,start:window.__lastIndex,completed:false});window.__api.destroy();localStorage.setItem('last-round-child',JSON.stringify(state));window.__api=window.__mount({root:document.querySelector('.textbook-section'),pages:window.__pages,storageKey:'last-round-child',speak(){},stopAudio(){}});window.__api.goPage(3);document.querySelector('[data-page-view=practice]').click();const q=window.__api.question;if(q.kind==='order'){for(const word of q.answer.split(' ')){Array.from(document.querySelectorAll('[data-page-token]')).find(button=>!button.disabled&&button.textContent===word).click()}document.getElementById('pageOrderCheck').click()}else{Array.from(document.querySelectorAll('[data-page-answer]')).find(button=>button.dataset.pageAnswer===q.answer).click()}document.getElementById('pagePracticeNext').click()})()`);
  assert.match(await b.evaluate('document.querySelector(".page-round-result").textContent'),/最后一题/);
  assert.equal(await b.evaluate('window.__api.index'),await b.evaluate('window.__lastIndex'));
  assert.equal(await b.evaluate('document.getElementById("pageRoundNext")'),null);
  assert.equal(await b.evaluate('window.__api.question.id'),await b.evaluate('window.__lastId'));
 }finally{b.close();}
});
