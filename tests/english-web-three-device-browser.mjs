import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<120;i++){if(await b.evaluate(expression))return;await sleep(75)}throw new Error(expression)}
async function press(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing control');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}
async function openClassroom(b){await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'#courseTextbook');await wait(b,'!!window.englishPagePractice')}

test('expanded phone lessons use the available width and legible titles',{timeout:45000},async()=>{
 const b=await openBrowser();try{
  for(const width of [320,390,540]){
   await b.size(width,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await press(b,'.course-unit-contents summary');
   const result=await b.evaluate(`(()=>{const map=document.querySelector('.course-map').getBoundingClientRect(),unit=document.querySelector('.course-unit:has(details[open])').getBoundingClientRect(),title=document.querySelector('.course-lesson strong');return{map:map.width,unit:unit.width,font:parseFloat(getComputedStyle(title).fontSize),text:document.querySelector('.course-lesson-copy').textContent}})()`);
   assert.ok(result.unit>=result.map-2,`${width}: expanded lessons should not be squeezed into half a card`);
   assert.ok(result.font>=16,`${width}: child-facing lesson titles must be readable`);
   assert.match(result.text,/介绍名字/);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('page directory shows complete titles, selects source pages, and returns focus on Escape',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1366,900]]){
   await b.size(width,height,width<=1100);await openClassroom(b);await press(b,'#openPagePicker');await wait(b,'document.querySelector(".page-picker-dialog")?.open');
   assert.equal(await b.evaluate('document.querySelectorAll("[data-pick-page]").length'),90,'all source pages remain available');
   assert.match(await b.evaluate(`document.querySelector('[data-pick-page="2"]').textContent`),/Making friends/);
   assert.ok(await b.evaluate('document.querySelector(".page-picker-dialog").scrollWidth<=document.querySelector(".page-picker-dialog").clientWidth+1'),'directory must not clip horizontally');
   await press(b,'[data-pick-page="17"]');assert.equal(await b.evaluate('englishPagePractice.page.page'),17);
   assert.equal(await b.evaluate('document.querySelector(".page-picker-dialog").open'),false);
   assert.match(await b.evaluate('document.querySelector("#openPagePicker").textContent'),/认识家庭成员/);
   assert.equal(await b.evaluate('!!document.querySelector(".page-scene")'),true,'source page must resolve its unit illustration');
   await press(b,'#openPagePicker');await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   await wait(b,'!document.querySelector(".page-picker-dialog").open');assert.equal(await b.evaluate('document.activeElement.id'),'openPagePicker');assert.equal(await b.evaluate('englishPagePractice.page.page'),17);
   await press(b,'#closeStudy');assert.equal(await b.evaluate('document.querySelector(".page-picker-dialog")'),null,'closing classroom removes its directory');
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('each source word and sentence opens its matching practice with the correct active tab',{timeout:45000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await openClassroom(b);
  await b.evaluate('englishPagePractice.goPage(17)');
  const word=await b.evaluate('document.querySelector(".page-word-card [data-page-practice]")?.dataset.pagePractice');assert.ok(word);
  await press(b,'.page-word-card [data-page-practice]');assert.equal(await b.evaluate('englishPagePractice.question.targetId'),word);
  assert.ok(await b.evaluate('document.activeElement===document.querySelector(".page-question-card h3")'),'keyboard focus follows the question');
  assert.ok(await b.evaluate('Math.abs(document.querySelector(".page-question-card").getBoundingClientRect().top-document.getElementById("studyContent").getBoundingClientRect().top)<=1'),'question begins below the tabs without clipped page controls above it');
  assert.equal(await b.evaluate('document.querySelector("[data-page-view=practice]").getAttribute("aria-pressed")'),'true');assert.ok(await b.evaluate('document.getElementById("readTextbookPage").hidden'));
  await press(b,'[data-page-view=reading]');const line=await b.evaluate('document.querySelector(".textbook-line [data-page-practice]")?.dataset.pagePractice');assert.ok(line);
  await press(b,'.textbook-line [data-page-practice]');assert.equal(await b.evaluate('englishPagePractice.question.targetId'),line);
  assert.equal(await b.evaluate('document.querySelector("[data-page-view=practice]").getAttribute("aria-pressed")'),'true');
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('opening the directory during a recording keeps its leave warning visible and never uploads',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
  await b.size(390,844,true);await openClassroom(b);await b.evaluate('englishPagePractice.goPage(17)');
  await press(b,'.textbook-line [data-page-speak]');
  await b.evaluate(`window.__uploads=0;const original=fetch;window.fetch=(url,...args)=>{if(String(url).includes('/pronunciation'))window.__uploads++;return original(url,...args)}`);
  await press(b,'[data-speaking-action=record]');await wait(b,'document.querySelector(".speaking-panel").dataset.speakingState==="recording"');
  await press(b,'#openPagePicker');
  assert.equal(await b.evaluate('document.getElementById("pagePicker").open'),false,'leave guard must run before a covering modal opens');
  assert.match(await b.evaluate('document.querySelector("[data-speaking-status]").textContent'),/先完成/);
  assert.equal(await b.evaluate('englishPagePractice.page.page'),17);
  assert.ok(await b.evaluate(`(()=>{const e=document.querySelector('[data-speaking-status]'),r=e.getBoundingClientRect(),c=document.getElementById('studyContent').getBoundingClientRect();return document.activeElement===e&&r.top>=c.top&&r.bottom<=c.bottom})()`),'leave warning must be visible and focused');
  await press(b,'[data-speaking-action=stop]');await press(b,'#openPagePicker');assert.equal(await b.evaluate('document.getElementById("pagePicker").open'),false,'unsubmitted recording still protected');
  await press(b,'[data-speaking-action=cancel]');await press(b,'#openPagePicker');assert.equal(await b.evaluate('document.getElementById("pagePicker").open'),true);
  await press(b,'[data-pick-page="18"]');assert.equal(await b.evaluate('englishPagePractice.page.page'),18);assert.equal(await b.evaluate('window.__uploads'),0);
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
