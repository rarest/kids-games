import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expr){for(let n=0;n<120;n++){if(await b.evaluate(expr))return;await sleep(75)}throw Error(expr)}
async function press(b,selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Missing enabled control');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});await sleep(80)}
test('homepage page learning resumes the selected page and unfinished question after closing and reloading',{timeout:45000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');await press(b,'#openPagePicker');await press(b,'[data-pick-page="17"]');await press(b,'.page-word-card [data-page-practice]');
  await b.evaluate(`[...document.querySelectorAll('[data-page-answer]')].find(e=>e.dataset.pageAnswer===englishPagePractice.question.answer).click()`);await press(b,'#pagePracticeNext');
  assert.equal(await b.evaluate('englishPagePractice.question.id'),'p17-word-0-meaning');
  await press(b,'#closeStudy');await press(b,'#courseTextbook');assert.equal(await b.evaluate('englishPagePractice.page.page'),17);assert.equal(await b.evaluate('document.querySelector("[data-page-view=practice]").getAttribute("aria-pressed")'),'true');assert.equal(await b.evaluate('englishPagePractice.question.id'),'p17-word-0-meaning');
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');assert.equal(await b.evaluate('englishPagePractice.page.page'),17);assert.equal(await b.evaluate('englishPagePractice.question.id'),'p17-word-0-meaning');
  await press(b,'[data-page-view=reading]');await press(b,'#closeStudy');await press(b,'#courseTextbook');assert.equal(await b.evaluate('englishPagePractice.page.page'),17);assert.equal(await b.evaluate('document.querySelector("[data-page-view=reading]").getAttribute("aria-pressed")'),'true');
  await press(b,'#closeStudy');await press(b,'#startCourse');await press(b,'#courseOpenPage');assert.equal(await b.evaluate('englishPagePractice.page.page'),3,'an explicit course source keeps its requested page');assert.equal(await b.evaluate('document.querySelector("[data-page-view=reading]").getAttribute("aria-pressed")'),'true');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
test('saved page locations stay scoped to the child and reject unavailable or malformed pages',{timeout:45000},async()=>{
 const b=await openBrowser();try{
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');
  await b.evaluate(`(async()=>{const {mountPageClassroom}=await import('/english/page-classroom.js');const {BOOKS}=await import('/english/curriculum.js');const {textbookSection}=await import('/english/textbook.js');window.__pages=BOOKS.find(b=>b.id==='g3-upper').textbookPages;window.__remount=(key,resume=true,pages=__pages)=>{englishPagePractice.destroy();document.getElementById('studyContent').innerHTML=textbookSection({textbookPages:pages},s=>String(s));mountPageClassroom({root:document.querySelector('.textbook-section'),pages,storageKey:key,resume,speak(){},stopAudio(){}})};__remount('resume-child-a');})()`);
  await press(b,'#openPagePicker');await press(b,'[data-pick-page="17"]');await press(b,'[data-page-view=practice]');
  await b.evaluate(`__remount('resume-child-b')`);assert.equal(await b.evaluate('englishPagePractice.page.page'),2);assert.equal(await b.evaluate('document.querySelector("[data-page-view=reading]").getAttribute("aria-pressed")'),'true');
  await b.evaluate(`__remount('resume-child-a')`);assert.equal(await b.evaluate('englishPagePractice.page.page'),17);assert.equal(await b.evaluate('document.querySelector("[data-page-view=practice]").getAttribute("aria-pressed")'),'true');
  await b.evaluate(`__remount('resume-child-a',true,__pages.filter(p=>p.page<10))`);assert.equal(await b.evaluate('englishPagePractice.page.page'),2);
  await b.evaluate(`localStorage.setItem('resume-malformed:location',JSON.stringify({page:17,view:'speaking'}));__remount('resume-malformed')`);assert.equal(await b.evaluate('englishPagePractice.page.page'),2);assert.equal(await b.evaluate('document.querySelector("[data-page-view=reading]").getAttribute("aria-pressed")'),'true');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
