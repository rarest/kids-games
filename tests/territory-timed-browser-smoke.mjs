import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
// Read the private live session through Chromium's debugger. The shipped game
// exposes no mutation hook; tests perform real moves, never assign ownership.
async function liveSession(b){
 const scripts=[];const parsed=b.on('Debugger.scriptParsed',s=>scripts.push(s));await b.call('Debugger.enable');parsed();
 const script=scripts.find(s=>/\/territory\/game.js/.test(s.url));
 const {scriptSource}=await b.call('Debugger.getScriptSource',{scriptId:script.scriptId});
 const line=scriptSource.split('\n').findIndex(l=>l.includes('const p = game.players[0]'));
 const bp=await b.call('Debugger.setBreakpointByUrl',{url:script.url,lineNumber:line});
 let off;const paused=new Promise(resolve=>{off=b.on('Debugger.paused',resolve)});
 const click=b.evaluate('document.querySelector("#start").click()');
 const pause=await paused;off();
 const frame=pause.callFrames.find(f=>f.functionName==='updateHud');
 const ref=await b.call('Debugger.evaluateOnCallFrame',{callFrameId:frame.callFrameId,expression:'game'});
 await b.call('Debugger.removeBreakpoint',{breakpointId:bp.breakpointId});await b.call('Debugger.resume');await click;
 await b.evaluate('(async()=>{globalThis.testCore=await import("../territory/core.js"+new URL(document.querySelector("script[type=module]").src).search)})()');
 return async function(body){const r=await b.call('Runtime.callFunctionOn',{objectId:ref.result.objectId,functionDeclaration:`function(){const g=this;${body}}`,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description);return r.result.value};
}
test('actual page enters full-island prizes, clocks extend time, pause freezes and timeout pays persistable coins and score',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await b.navigate('games/territory.html');
  // Only freeze the seed's external clock, not game state or opponents.
  await b.evaluate('Date.now=()=>7;globalThis.realRAF=requestAnimationFrame;requestAnimationFrame=cb=>{globalThis.testFrame=cb;return 0}');await sleep(80);const session=await liveSession(b);
  const win=await session(`const p=g.players[0],home={x:p.x,y:p.y},c=g.boundary;let rejected=0;for(const [x,y] of g.world[0][0]){const d=Math.hypot(x-c.x,y-c.y);if(!testCore.movePlayer(g,0,c.x+(x-c.x)*(1-.2/d),c.y+(y-c.y)*(1-.2/d)))rejected++;}testCore.movePlayer(g,0,home.x,home.y);return{mode:g.mode,rejected,coins:g.rewards?.coins.length,chests:g.rewards?.chests.length,clocks:g.rewards?.clocks.length};`);
  assert.deepEqual(win,{mode:'reward',rejected:0,coins:60,chests:3,clocks:9});await b.evaluate('testFrame(performance.now()+100)');
  assert.equal(await b.evaluate('document.body.dataset.mode'),'reward');assert.equal(await b.evaluate('document.getElementById("coverage").textContent'),'100.0%');
  assert.equal(await b.evaluate('document.getElementById("reward-clock").hidden'),false);assert.equal(await b.evaluate('document.getElementById("reward-finish").hidden'),false);assert.ok(Number(await b.evaluate('document.getElementById("run-score").textContent'))>=150);
  const pickups=await session(`let before=g.rewards.remaining;const clock=g.rewards.clocks.find(c=>c.seconds===10);testCore.movePlayer(g,0,clock.x,clock.y);testCore.movePlayer(g,0,clock.x,clock.y);for(const box of g.rewards.chests)testCore.movePlayer(g,0,box.x,box.y);return{before,after:g.rewards.remaining,clocks:g.events.filter(e=>e.type==='clock').length};`);
  assert.ok(pickups.after>=pickups.before+10);await b.evaluate('testFrame(performance.now()+300)');assert.ok(Number(await b.evaluate('document.getElementById("wallet").textContent'))>0);
  await b.evaluate('document.getElementById("pause").click()');const remaining=await session('return g.rewards.remaining');await sleep(250);assert.equal(await session('return g.rewards.remaining'),remaining);
  await b.evaluate('document.getElementById("resume").click()');
  // Advance actual engine time to expiry, allowing normal page settlement.
  await session('while(g.mode==="reward"&&g.rewards.remaining>.08)testCore.stepGame(g,Math.min(5,g.rewards.remaining-.06));return g.mode');await b.evaluate('requestAnimationFrame=realRAF;requestAnimationFrame(testFrame)');await sleep(250);
  assert.equal(await b.evaluate('document.body.dataset.screen'),'result');
  const result=await b.evaluate('({score:Number(document.getElementById("result-score").textContent),coins:Number(document.getElementById("result-coins").textContent),profile:JSON.parse(localStorage.getItem("paper-territory.profile.v1"))})');
  assert.ok(result.coins>=155);assert.equal(result.score,result.coins);assert.equal(result.profile.wins,1);assert.equal(result.profile.score,result.score);assert.equal(result.profile.owned.length,4);
  await b.size(320,720,true);assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'winning score columns fit the narrowest supported phone');
  await b.evaluate('document.getElementById("return-home").click()');await b.navigate('games/territory.html');assert.equal(Number(await b.evaluate('document.getElementById("total-score").textContent')),result.score);
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
test('actual movement rolls the token and pausing stops the rolling pixels',{timeout:15000},async()=>{
 const b=await openBrowser();try{
  await b.size(1440,900);await b.navigate('games/territory.html');await b.evaluate('document.getElementById("start").click()');
  await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD'});await sleep(300);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD'});await sleep(80);
  const roll=Number(await b.evaluate('document.getElementById("map").dataset.rollAngle'));assert.ok(roll>1);
  await b.evaluate('document.getElementById("pause").click()');await sleep(150);assert.equal(Number(await b.evaluate('document.getElementById("map").dataset.rollAngle')),roll);
  const pixel=await b.evaluate(`(async()=>{const {drawPaper}=await import('../territory/render.js'+new URL(document.querySelector('script[type=module]').src).search);const c=document.createElement('canvas');c.width=c.height=100;const ctx=c.getContext('2d'),skin={tier:'normal',color:'#ed4949'};drawPaper(ctx,50,50,70,skin,0,{roll:0});const before=c.toDataURL();ctx.clearRect(0,0,100,100);drawPaper(ctx,50,50,70,skin,0,{roll:1});return before!==c.toDataURL()})()`);assert.equal(pixel,true);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
