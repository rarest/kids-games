import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expr){for(let n=0;n<100;n++){if(await b.evaluate(expr))return;await sleep(50)}assert.fail(expr)}
async function tap(b,selector){const p=await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
test('pinyin onscreen keyboard scores and fishing touch fires after rotation',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  await b.size(820,1180,true);await b.navigate('games/pinyin.html');await tap(b,'#startBtn');
  await wait(b,'!!document.querySelector(".word .pinyin")');
  const char=await b.evaluate('document.querySelector(".word .pinyin").textContent.trim().toLowerCase()');
  for(const c of char){const index=await b.evaluate(`Array.from(document.querySelectorAll('.key')).findIndex(e=>e.textContent.toLowerCase()===${JSON.stringify(c)})`);assert.ok(index>=0);await b.evaluate(`document.querySelectorAll('.key')[${index}].id='test-key'`);await tap(b,'#test-key');await b.evaluate('document.getElementById("test-key").removeAttribute("id")');}
  await wait(b,'Number(document.getElementById("score").textContent)>0');assert.deepEqual(b.errors,[]);
  await b.navigate('games/fishing.html');await b.size(1180,820,true);
  const before=await b.evaluate('Number(document.getElementById("coin").textContent)');await tap(b,'#game');
  await wait(b,`Number(document.getElementById("coin").textContent)!==${before}`);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
