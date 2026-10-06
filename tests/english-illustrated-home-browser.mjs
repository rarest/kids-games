import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(browser,expression){
 for(let i=0;i<120;i++){if(await browser.evaluate(expression))return;await sleep(100)}
 throw new Error(expression);
}
async function click(browser,selector){
 const point=await browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await browser.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
 await browser.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
}

test('illustrated unit cards expose lessons on demand and open a real course with touch-sized controls',{timeout:90000},async()=>{
 const browser=await openBrowser();
 try{
  await browser.navigate('games/english.html');
  await wait(browser,'!!window.englishCourse&&!document.getElementById("courseRoot").inert');
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1366,900]]){
   await browser.size(width,height,width<=768);
   await browser.evaluate('englishCourse.home()');
   assert.equal(await browser.evaluate('document.querySelectorAll(".course-unit details").length'),6);
   assert.equal(await browser.evaluate('document.querySelectorAll("[data-course-lesson]").length'),36);
   assert.ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`${width}: page fits viewport`);
   const summaries=await browser.evaluate('Array.from(document.querySelectorAll(".course-unit summary")).map(e=>{const r=e.getBoundingClientRect();return{width:r.width,height:r.height}})');
   assert.ok(summaries.every(r=>r.width>=44&&r.height>=44),`${width}: unit chooser is reachable`);
   await click(browser,'.course-unit:last-child .course-unit-picture');
   assert.ok(await browser.evaluate('document.querySelector(".course-unit:last-child details").open'));
   await wait(browser,'document.querySelector(".course-unit:last-child .course-unit-picture").getAttribute("aria-expanded")==="true"');
   const lesson=await browser.evaluate('document.querySelector(".course-unit:last-child [data-course-lesson]").dataset.courseLesson');
   await click(browser,'.course-unit:last-child [data-course-lesson]');
   await wait(browser,'!!document.querySelector(".course-card")');
   assert.equal(await browser.evaluate('englishCourse.lesson.id'),lesson);
   assert.ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`${width}: lesson fits viewport`);
  }
  assert.deepEqual(browser.errors,[]);
 }finally{browser.close()}
});
