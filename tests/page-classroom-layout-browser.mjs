import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<120;i++){if(await b.evaluate(expression))return;await sleep(100)}throw new Error(expression)}
async function click(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}

// Catches controls pushing the lesson below the phone viewport, and inherited
// button margins separating play/stop controls during actual audio playback.
test('phone classroom shows its lesson on opening and aligns active audio controls',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,700,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');
  await click(b,'#courseTextbook');await wait(b,'document.getElementById("study").open');
  assert.ok(await b.evaluate('document.getElementById("stopTextbookReading").hidden'));
  const opening=await b.evaluate('(()=>{const d=document.getElementById("study").getBoundingClientRect(),line=document.querySelector(".textbook-line").getBoundingClientRect();return{lineBottom:line.bottom,dialogBottom:d.bottom,scroll:document.getElementById("study").scrollTop}})()');
  await b.evaluate('window.__layoutClips=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__layoutClips.push(this);return play.call(this)}');
  await click(b,'#readTextbookPage');await wait(b,'window.__layoutClips.some(e=>e.currentTime>0&&!e.paused)&&!document.getElementById("stopTextbookReading").hidden');
  await b.evaluate('document.getElementById("study").scrollTop=0');
  const active=await b.evaluate('(()=>{const a=document.getElementById("readTextbookPage").getBoundingClientRect(),s=document.getElementById("stopTextbookReading").getBoundingClientRect();return{read:{top:a.top,bottom:a.bottom,height:a.height,right:a.right},stop:{top:s.top,bottom:s.bottom,height:s.height,left:s.left},overflow:document.getElementById("studyContent").scrollWidth>document.getElementById("studyContent").clientWidth+1}})()');
  if(process.env.ENGLISH_LAYOUT_EVIDENCE){await writeFile(process.env.ENGLISH_LAYOUT_EVIDENCE+'.json',JSON.stringify({opening,active},null,2));const shot=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(process.env.ENGLISH_LAYOUT_EVIDENCE+'.png',Buffer.from(shot.data,'base64'))}
  await click(b,'#stopTextbookReading');await wait(b,'document.getElementById("stopTextbookReading").hidden');assert.ok(await b.evaluate('window.__layoutClips.every(e=>e.paused)'));
  assert.ok(Math.abs(active.read.top-active.stop.top)<=1,`active buttons must align: ${JSON.stringify(active)}`);
  assert.ok(active.read.height>=44&&active.stop.height>=44,'touch controls remain large enough');assert.ok(active.read.right<=active.stop.left,'audio controls do not overlap');assert.equal(active.overflow,false);
  assert.ok(opening.lineBottom<=opening.dialogBottom-12,`first lesson and its actions should be visible without scrolling: ${JSON.stringify(opening)}`);assert.equal(opening.scroll,0);
  for(const [width,height] of [[320,568],[844,390],[1366,900]]){await b.size(width,height,width<900);assert.ok(await b.evaluate('document.getElementById("studyContent").scrollWidth<=document.getElementById("studyContent").clientWidth+1'),`${width} px overflow`)}
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('guided word card keeps audio controls aligned and avoids excessive phone whitespace',{timeout:60000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,700,true);await b.navigate('games/english.html');await wait(b,'!!window.englishCourse');await click(b,'#startCourse');await wait(b,'!!document.querySelector(".course-word")');
  const height=await b.evaluate('document.querySelector(".course-card").getBoundingClientRect().height');
  assert.ok(await b.evaluate('document.getElementById("courseStop").hidden'));
  await b.evaluate('window.__layoutClips=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__layoutClips.push(this);return play.call(this)}');
  await click(b,'#courseListen');await wait(b,'window.__layoutClips.some(e=>e.currentTime>0&&!e.paused)&&!document.getElementById("courseStop").hidden');
  const active=await b.evaluate('(()=>{const a=document.getElementById("courseListen").getBoundingClientRect(),s=document.getElementById("courseStop").getBoundingClientRect(),n=document.getElementById("courseNext").getBoundingClientRect();return{readTop:a.top,stopTop:s.top,nextTop:n.top,readHeight:a.height,stopHeight:s.height}})()');
  if(process.env.ENGLISH_LAYOUT_EVIDENCE){await writeFile(process.env.ENGLISH_LAYOUT_EVIDENCE+'-guided.json',JSON.stringify({height,active},null,2));await b.evaluate('document.querySelector(".course-class-aside").scrollIntoView({block:"start"})');const shot=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(process.env.ENGLISH_LAYOUT_EVIDENCE+'-guided.png',Buffer.from(shot.data,'base64'))}
  await click(b,'#courseStop');await wait(b,'document.getElementById("courseStop").hidden');assert.ok(await b.evaluate('window.__layoutClips.every(e=>e.paused)'));
  assert.ok(Math.abs(active.readTop-active.stopTop)<=1&&Math.abs(active.readTop-active.nextTop)<=1,`guided audio controls align: ${JSON.stringify(active)}`);assert.ok(active.readHeight>=44&&active.stopHeight>=44);
  assert.ok(height<=500,`word card should fit a phone with less empty space: ${height}`);
  assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
