import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function press(b,selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});await sleep(75)}
test('narrow phone answer choices show grandmother as one complete word',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  await b.size(320,568,true);await b.navigate('games/english.html');for(let i=0;i<120&&!await b.evaluate('!!window.englishCourse');i++)await sleep(75);await press(b,'#courseTextbook');await press(b,'#openPagePicker');await press(b,'[data-pick-page="17"]');await press(b,'.page-word-card [data-page-practice]');
  for(const width of [320,390,430]){await b.size(width,844,true);const result=await b.evaluate(`(()=>{const e=document.querySelector('[data-page-answer="grandmother"]');const r=document.createRange();r.selectNodeContents(e.firstChild);return{lines:r.getClientRects().length,height:e.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth+1}})()`);assert.equal(result.lines,1,`${width}: a single English word must not break across lines`);assert.ok(result.height>=44);assert.equal(result.overflow,false)}assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
