import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression,attempts=100){for(let i=0;i<attempts;i++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error(expression)}
async function press(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}
async function prepare(b){
 await b.navigate('games/english.html');await wait(b,'!!window.englishCourse&&!!window.englishCourseCloud&&!document.getElementById("courseRoot").inert');await sleep(300);
 await b.evaluate(`(async()=>{const {LESSONS}=await import('/english/course-curriculum.js');const {createSession}=await import('/english/course-engine.js');const lesson=LESSONS.find(l=>l.id==='g3-upper-u6-l4'),session=createSession(lesson);session.index=session.steps.findIndex(s=>s.kind==='reading');window.__guidedFixture={version:1,lessons:{},items:{},session};window.__guidedLines=lesson.reading.map(l=>l.en);window.__guidedPlays=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__guidedPlays.push({element:this,src:this.src});return original.call(this)};})()`);
}
async function start(b){await b.evaluate('window.englishCourse.replaceProgress(window.__guidedFixture);window.englishCourse.start()');await wait(b,'!!document.querySelector(".course-reading")')}

test('long guided reading keeps all original lines reachable without advancing the lesson early',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,700,true);await prepare(b);await start(b);
  const readingIndex=await b.evaluate('englishCourse.session.index');
  assert.equal(await b.evaluate('document.querySelectorAll(".course-reading>div").length'),4,'long reading should begin with a short group');
  const visited=[];
  for(let group=0;group<6;group++){
   const rows=await b.evaluate('Array.from(document.querySelectorAll(".course-reading>div")).map(row=>({en:row.querySelector("strong").textContent,index:Number(row.querySelector("[data-course-line]").dataset.courseLine)}))');visited.push(...rows);
   assert.equal(await b.evaluate('englishCourse.session.index'),readingIndex,'changing a reading group must not advance the lesson step');
   if(group===1){
    await b.evaluate('englishCourse.replaceProgress(englishCourse.snapshot(),{preserveView:true})');
    assert.equal(await b.evaluate('document.querySelector("[data-course-line]").dataset.courseLine'),'4','same-session cloud refresh keeps the current group');
    await press(b,'#courseReadingPrevious');assert.equal(await b.evaluate('document.querySelector("[data-course-line]").dataset.courseLine'),'0');
    await press(b,'#courseNext');
    await b.evaluate('window.__guidedPlays=[]');await press(b,'#courseListen');
    await wait(b,'window.__guidedPlays.length===4&&document.getElementById("courseStop").hidden',250);
    const groupFiles=await b.evaluate(`(async()=>{const m=await(await fetch('/english/audio-manifest.json')).json();return window.__guidedLines.slice(4,8).map(line=>m['sentence:'+line])})()`);
    assert.deepEqual(await b.evaluate('window.__guidedPlays.map(p=>p.src.split("/audio/")[1])'),groupFiles,'group listening stops after exactly the displayed four source lines');
    await b.evaluate('window.__guidedPlays=[]');await press(b,'#courseListenAll');await wait(b,'window.__guidedPlays.some(p=>p.element.currentTime>0&&!p.element.paused)');
    const firstFile=await b.evaluate(`(async()=>{const m=await(await fetch('/english/audio-manifest.json')).json();return m['sentence:'+window.__guidedLines[0]]})()`);
    assert.ok((await b.evaluate('window.__guidedPlays[0].src')).endsWith('/audio/'+firstFile),'whole-text listening begins at the original first sentence');await press(b,'#courseStop');
    await press(b,'[data-course-line="4"]');await wait(b,'window.__guidedPlays.some(p=>p.element.currentTime>0&&!p.element.paused)');
    const expected=await b.evaluate(`(async()=>{const m=await(await fetch('/english/audio-manifest.json')).json();return m['sentence:'+window.__guidedLines[4]]})()`);
    assert.ok((await b.evaluate('window.__guidedPlays.at(-1).src')).endsWith('/audio/'+expected),'line audio uses the global source index');
    await press(b,'.course-reading [data-course-speaking]');await wait(b,'document.getElementById("study").open&&!!document.querySelector(".speaking-target")');
    assert.equal(await b.evaluate('document.querySelector(".speaking-target").textContent'),await b.evaluate('window.__guidedLines[4]'));
    assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".course-class-actions")).visibility'),'hidden','guided dock yields to the textbook dialog');
    await press(b,'#closeStudy');assert.equal(await b.evaluate('document.querySelector("[data-course-line]").dataset.courseLine'),'4','closing speaking returns to the same reading group');
   }
   await press(b,'#courseNext');
  }
  assert.deepEqual(visited.map(row=>row.index),Array.from({length:21},(_,i)=>i));
  assert.deepEqual(visited.map(row=>row.en),await b.evaluate('window.__guidedLines'));
  assert.equal(await b.evaluate('englishCourse.session.index'),readingIndex+1);
  await start(b);await press(b,'#courseNext');await press(b,'#courseExit');await press(b,'#startCourse');
  assert.equal(await b.evaluate('document.querySelector("[data-course-line]").dataset.courseLine'),'0','leaving guided learning resets the reading group');
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('guided content and navigation fit phone, tablet and desktop without covering the final line',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  await prepare(b);
  for(const [width,height] of [[320,568],[390,700],[768,1024],[1024,768],[1366,900]]){
   await b.size(width,height,width<=1100);await start(b);
   assert.equal(await b.evaluate('document.querySelectorAll(".course-reading>div").length'),4);
   assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),`${width}: horizontal overflow`);
   const layout=await b.evaluate(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return{top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height}};return{card:r(document.querySelector('.course-card')),aside:r(document.querySelector('.course-class-aside')),footer:r(document.querySelector('.course-class-actions')),buttons:Array.from(document.querySelectorAll('.course-class-actions>button')).filter(e=>!e.hidden).map(r),sticky:getComputedStyle(document.querySelector('.course-class-aside')).position}})()`);
   if(width<=1100){assert.ok(layout.aside.bottom<=layout.card.top+1,`${width}: tablet and phone use the content-first column`);assert.ok(layout.footer.bottom<=height&&layout.footer.top>=height-120,`${width}: actions remain within reach`);const firstActionBottom=await b.evaluate('document.querySelector(".course-reading>div .course-reading-actions").getBoundingClientRect().bottom');assert.ok(firstActionBottom<=layout.footer.top,`${width}: the first sentence and its actions are visible when entering reading`)}
   else{assert.ok(layout.aside.right<layout.card.left,`${width}: desktop shows target beside content`);assert.equal(layout.sticky,'sticky')}
   for(const button of layout.buttons){assert.ok(button.width>=44&&button.height>=44,`${width}: action touch target`);assert.ok(button.left>=0&&button.right<=width,`${width}: footer button overflow`)}
   for(let group=0;group<5;group++)await press(b,'#courseNext');
   await b.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
   const last=await b.evaluate(`(()=>{const line=document.querySelector('.course-reading>div:last-child').getBoundingClientRect(),footer=document.querySelector('.course-class-actions').getBoundingClientRect();return{lineBottom:line.bottom,footerTop:footer.top}})()`);
   assert.ok(last.lineBottom<=last.footerTop,`${width}: actions must not cover the final sentence`);
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('oral recording has one demonstration control and keeps lesson navigation reachable',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});try{
  await b.size(390,700,true);await prepare(b);
  await b.evaluate(`(async()=>{const {LESSONS}=await import('/english/course-curriculum.js');const {createSession}=await import('/english/course-engine.js');const session=createSession(LESSONS[0]);session.index=session.steps.findIndex(s=>s.kind==='oral');englishCourse.replaceProgress({version:1,lessons:{},items:{},session});englishCourse.start()})()`);
  await press(b,'[data-speaking-action="record"]');await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');
  assert.ok(await b.evaluate('document.getElementById("courseListen").hidden'),'the duplicate guided demonstration cannot play into an active recording');
  assert.ok(await b.evaluate('document.querySelector("[data-speaking-action=listen]").disabled'),'the speaking panel keeps its own recording guard');
  const next=await b.evaluate('(()=>{const r=document.getElementById("courseNext").getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}})()');
  assert.ok(next.left>=0&&next.right<=390&&next.top>=0&&next.bottom<=700&&next.width>=44&&next.height>=44,'navigation keeps its position when the duplicate listener is hidden');
  await sleep(400);await press(b,'[data-speaking-action="stop"]');
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=listen]").disabled'),false,'the child can still hear the demonstration after stopping');
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
