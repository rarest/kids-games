import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error(expression)}
async function press(b,selector,touch){
 const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 if(touch){await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else {await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}
}

// The previous absolute rule put both buttons in the same right-hand position.
test('guided reading keeps every listen and speaking control separate and clickable across screen sizes',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourse&&!!window.englishCourseCloud');
  await wait(b,'!document.getElementById("courseRoot").inert');await sleep(400);
  await b.evaluate(`(async()=>{const {LESSONS}=await import('/english/course-curriculum.js');const {createSession}=await import('/english/course-engine.js');const lesson=LESSONS.find(l=>l.id==='g3-upper-u2-l1'),session=createSession(lesson);session.index=session.steps.findIndex(s=>s.kind==='reading');window.__readingProgress={version:1,lessons:{},items:{},session};window.__layoutClips=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__layoutClips.push(this);return play.call(this)};})()`);
  for(const [width,height,touch] of [[2048,1054,false],[1024,768,true],[768,1024,true],[390,700,true],[320,568,true]]){
   await b.size(width,height,touch);
   await b.evaluate('window.englishCourse.replaceProgress(window.__readingProgress);window.englishCourse.start()');
   await wait(b,'document.querySelectorAll(".course-reading>div").length===5');
   const rows=await b.evaluate(`Array.from(document.querySelectorAll('.course-reading>div')).map(row=>{const box=e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}},listen=row.querySelector('[data-course-line]'),read=row.querySelector('[data-course-speaking]');return{listen:box(listen),read:box(read),text:box(row.querySelector('strong')),zh:box(row.querySelector('p'))}})`);
   const overlaps=(a,c)=>Math.min(a.right,c.right)>Math.max(a.left,c.left)+1&&Math.min(a.bottom,c.bottom)>Math.max(a.top,c.top)+1;
   for(const row of rows){
    assert.ok(!overlaps(row.listen,row.read),`${width}px: listening and speaking buttons overlap: ${JSON.stringify(row)}`);
    for(const button of [row.listen,row.read]){assert.ok(button.height>=44&&button.width>=44,`${width}px: touch target too small`);assert.ok(!overlaps(button,row.text)&&!overlaps(button,row.zh),`${width}px: action covers the sentence`)}
   }
   assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`${width}px horizontal overflow`);
   await press(b,'.course-reading [data-course-line="0"]',touch);await wait(b,'window.__layoutClips.some(e=>e.currentTime>0&&!e.paused)');
   await press(b,'.course-reading [data-course-speaking]',touch);await wait(b,'document.getElementById("study").open&&!!document.querySelector(".speaking-target")');
   assert.equal(await b.evaluate('document.querySelector(".speaking-target").textContent'),'Mum! Dad! This is my friend, Sarah Miller.');
   assert.ok(await b.evaluate('window.__layoutClips.every(e=>e.paused)'));
   await b.evaluate('document.getElementById("study").close()');
   if(process.env.ENGLISH_READING_EVIDENCE){await mkdir(process.env.ENGLISH_READING_EVIDENCE,{recursive:true});await b.evaluate('document.querySelector(".course-reading").scrollIntoView({block:"center"})');const shot=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(`${process.env.ENGLISH_READING_EVIDENCE}/${width}.png`,Buffer.from(shot.data,'base64'))}
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
