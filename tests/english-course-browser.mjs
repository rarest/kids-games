import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expr){for(let i=0;i<120;i++){if(await b.evaluate(expr))return;await sleep(100);}throw new Error(expr);}
test('guided English course has a picture and audio lesson that resumes without changing the old wallet',{timeout:90000},async()=>{
 const b=await openBrowser({chromeFlags:['--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');
  assert.ok(await b.evaluate('!!document.getElementById("startCourse")'),'missing the course entrance');
  assert.equal(await b.evaluate('document.querySelectorAll("[data-course-lesson]").length'),36);
  await b.evaluate(`localStorage.setItem('pearl-english-v1',JSON.stringify({version:1,coins:4321,owned:['pearl','skin-3-1'],skin:'skin-3-1',claimed:['old-card'],records:{},wrong:[]}))`);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');
  await b.evaluate(`document.getElementById('startCourse').click()`);await wait(b,'!!document.querySelector(".course-word")');assert.ok(await b.evaluate('!!document.querySelector(".course-word [role=img]")'));
  await b.evaluate(`window.__clips=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__clips.push(this);return original.call(this)};document.getElementById('courseListen').click()`);await wait(b,'window.__clips[0]?.currentTime>0');assert.equal(await b.evaluate('window.__clips[0].playbackRate'),1);
  await b.evaluate(`document.getElementById('courseNext').click()`);const index=await b.evaluate('window.englishCourse.progress.session.index');assert.ok(index>0);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');await b.evaluate(`document.getElementById('startCourse').click()`);assert.equal(await b.evaluate('window.englishCourse.progress.session.index'),index);assert.equal(await b.evaluate('window.englishApp.save.coins'),4321);assert.equal(await b.evaluate('window.englishApp.save.skin'),'skin-3-1');
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await b.size(1366,768,false);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});

async function completeInUI(b,{wrongFirst=false}={}){
 let wrong=false;
 for(let n=0;n<160;n++){
  const step=await b.evaluate('window.englishCourse.session?.steps[window.englishCourse.session.index]');
  if(!step)return;
  if(['listen','meaning','check'].includes(step.kind)){
   if(wrongFirst&&!wrong&&step.choices.some(c=>c!==step.answer)){
    const value=step.choices.find(c=>c!==step.answer);await b.evaluate(`Array.from(document.querySelectorAll('[data-course-answer]')).find(b=>b.dataset.courseAnswer===${JSON.stringify(value)}).click()`);
    assert.equal(await b.evaluate('document.getElementById("courseNext").disabled'),true);wrong=true;
   }
   await b.evaluate(`Array.from(document.querySelectorAll('[data-course-answer]')).find(b=>b.dataset.courseAnswer===${JSON.stringify(step.answer)}).click()`);
  }else if(step.kind==='sentence'){
   const used=new Set();
   for(const token of step.answer.replace(/[.,!?]/g,'').trim().split(/\s+/)){
    const index=step.tokens.findIndex((t,i)=>t===token&&!used.has(i));assert.ok(index>=0);used.add(index);
    await b.evaluate(`document.querySelector('[data-course-token="${index}"]').click()`);
   }
   await b.evaluate('document.getElementById("courseCheckSentence").click()');
  }else if(step.kind==='oral')await b.evaluate('document.getElementById("courseOral").click()');
  assert.equal(await b.evaluate('document.getElementById("courseNext").disabled'),false,step.kind);
  await b.evaluate('document.getElementById("courseNext").click()');
 }
 throw new Error('course did not finish');
}
test('real lesson completion, retry, reward once, focused review and all 36 lesson routes',{timeout:120000},async()=>{
 const b=await openBrowser({chromeFlags:['--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');
  writeFileSync('/home/ubuntu/codex-work/output/english-course/home-mobile.png',Buffer.from((await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  const ids=await b.evaluate('Array.from(document.querySelectorAll("[data-course-lesson]")).map(b=>b.dataset.courseLesson)');assert.equal(ids.length,36);
  const pictures=await b.evaluate('Array.from(document.querySelectorAll(".course-unit>.course-illustration")).map(i=>i.src)');assert.equal(new Set(pictures).size,6);
  for(const src of pictures){const picture=await b.evaluate(`new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({w:image.naturalWidth,h:image.naturalHeight});image.onerror=()=>resolve(null);image.src=${JSON.stringify(src)}})`);assert.ok(picture&&picture.w>=1000&&picture.h>=600,src);}
  await b.evaluate('document.getElementById("startCourse").click()');const id=await b.evaluate('window.englishCourse.lesson.id');
  await completeInUI(b,{wrongFirst:true});assert.equal(await b.evaluate('window.englishApp.save.coins'),200);
  assert.equal(await b.evaluate(`window.englishCourse.progress.lessons[${JSON.stringify(id)}].completed`),true);
  await b.evaluate('document.getElementById("courseFinishHome").click()');assert.match(await b.evaluate('document.querySelector(".course-summary").textContent'),/1\s*\/\s*36/);
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');
  await b.evaluate(`document.querySelector('[data-course-lesson="${id}"]').click()`);await completeInUI(b);assert.equal(await b.evaluate('window.englishApp.save.coins'),200);
  await b.evaluate('document.getElementById("courseFinishHome").click();document.getElementById("reviewCourse").click()');
  assert.equal(await b.evaluate('window.englishCourse.session.review'),true);const reviewKeys=await b.evaluate('window.englishCourse.session.reviewKeys');assert.ok(reviewKeys.length>0);
  assert.ok(await b.evaluate('window.englishCourse.session.steps.every(s=>window.englishCourse.session.reviewKeys.includes(s.itemKey))'));
  await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await b.evaluate('document.getElementById("startCourse").click()');assert.deepEqual(await b.evaluate('window.englishCourse.session.reviewKeys'),reviewKeys);
  await completeInUI(b);assert.equal(await b.evaluate('window.englishApp.save.coins'),200);
  for(const id of ids){await b.evaluate('window.englishCourse.home()');await b.evaluate(`document.querySelector('[data-course-lesson="${id}"]').click()`);assert.ok(await b.evaluate('document.querySelector(".course-card").textContent.length>20'));assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));}
  await b.evaluate('document.getElementById("courseOpenPage").click()');assert.equal(await b.evaluate('document.getElementById("study").open'),true);assert.equal(await b.evaluate('document.getElementById("textbookPage").options.length'),90);await b.evaluate('document.getElementById("closeStudy").click();window.englishCourse.home()');
  await b.size(1366,900,false);writeFileSync('/home/ubuntu/codex-work/output/english-course/home-desktop.png',Buffer.from((await b.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
