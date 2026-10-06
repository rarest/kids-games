import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function setup(b){
 await b.navigate('games/english.html');
 for(let i=0;i<120;i++){if(await b.evaluate('!!window.englishCourse'))break;await sleep(80);}
 await b.evaluate(`(async()=>{document.getElementById('courseTextbook').click();window.englishPagePractice.destroy();const {BOOKS}=await import('/english/curriculum.js');const {mountPageClassroom}=await import('/english/page-classroom.js');window.__small=mountPageClassroom({root:document.querySelector('.textbook-section'),pages:BOOKS.find(b=>b.id==='g3-upper').textbookPages,storageKey:'small-screen-regression',speak(){},stopAudio(){}});})()`);
}
async function tap(b,selector){
 const point=await b.evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)}),r=button.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,radiusX:3,radiusY:3,id:1}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(90);
}
async function answerGeometry(b){return b.evaluate(`(()=>{const footer=document.querySelector('.page-question-footer').getBoundingClientRect(),content=document.getElementById('studyContent').getBoundingClientRect();return Array.from(document.querySelectorAll('[data-page-answer]')).map(button=>{const r=button.getBoundingClientRect();return {answer:button.dataset.pageAnswer,top:r.top,bottom:r.bottom,height:r.height,width:r.width,clear:r.top>=content.top&&r.bottom<=footer.top+1&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-page-answer]')===button}})})()`)}
test('320px short answer rows remain fully above the sticky actions before and after a real wrong tap',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(320,568,true);await setup(b);
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1366,900]]){
   await b.size(width,height,true);await b.evaluate('window.__small.goPage(67);document.querySelector("[data-page-view=practice]").click()');
   const before=await answerGeometry(b);assert.ok(before.every(option=>option.clear),`${width} initial: ${JSON.stringify(before)}`);assert.ok(before.every(option=>option.height>=44&&option.width>=44));
   const wrong=await b.evaluate('window.__small.question.choices.find(answer=>answer!==window.__small.question.answer)');await tap(b,`[data-page-answer=${JSON.stringify(wrong)}]`);
   assert.ok(await b.evaluate('!!document.querySelector(".selected-wrong")'),'native tap registers an incorrect choice');
   const after=await answerGeometry(b);assert.ok(after.every(option=>option.clear),`${width} after error: ${JSON.stringify(after)}`);
   const correct=await b.evaluate('window.__small.question.answer');await tap(b,`[data-page-answer=${JSON.stringify(correct)}]`);
   assert.ok(await b.evaluate('!document.getElementById("pagePracticeNext").disabled'),'last-row answer remains touchable after feedback');
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
test('320px first reading sentence and its listening control are visible before any scroll',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(320,568,true);await setup(b);await b.evaluate('window.__small.goPage(2);document.querySelector("[data-page-view=reading]").click();document.getElementById("studyContent").scrollTop=0');
  const reading=await b.evaluate(`(()=>{const d=document.getElementById('study').getBoundingClientRect(),c=document.getElementById('studyContent').getBoundingClientRect(),line=document.querySelector('.textbook-line').getBoundingClientRect(),button=document.querySelector('[data-textbook-line]').getBoundingClientRect();return {dialogWidth:d.width,contentBottom:c.bottom,lineTop:line.top,lineBottom:line.bottom,listenBottom:button.bottom}})()`);
  assert.ok(reading.dialogWidth>=308,JSON.stringify(reading));assert.ok(reading.lineBottom<=reading.contentBottom+1,JSON.stringify(reading));assert.ok(reading.listenBottom<=reading.contentBottom+1);
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
