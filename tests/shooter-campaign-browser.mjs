import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

test('campaign resumes, lasers consume charges, cards advance substages and every later stage has twenty bosses',{timeout:45000},async()=>{
 const b=await openBrowser();
 try{
  await b.size(390,844,true);await b.navigate('games/shooter.html');
  const saved={version:2,wave:1,hp:10,shield:1000,spread:99,power:100,laserPower:200,score:0};
  await b.evaluate(`localStorage.setItem('starPatrolRun',JSON.stringify(${JSON.stringify(saved)}))`);
  await b.navigate('games/shooter.html');assert.equal(await b.evaluate('continueRun.hidden'),false);
  await b.evaluate('continueRun.click()');assert.equal(await b.evaluate('wave.textContent'),'1 · 1');
  assert.equal(await b.evaluate('laserCount.textContent'),'10');await b.evaluate('document.getElementById("laser").click()');
  assert.equal(await b.evaluate('laserCount.textContent'),'9');
  for(let i=0;i<280&&await b.evaluate('document.body.dataset.mode')==='playing';i++)await sleep(100);
  assert.equal(await b.evaluate('document.body.dataset.mode'),'upgrade');
  assert.equal(await b.evaluate('nextWave.hidden'),true);
  await b.evaluate('document.querySelectorAll("[data-draw]")[1].click()');
  const card=await b.evaluate('cardResult.textContent');assert.match(card,/扩散|子弹|护盾|激光/);
  assert.equal(await b.evaluate('document.querySelectorAll("[data-draw]:disabled").length'),3);
  await b.evaluate('document.querySelectorAll("[data-draw]")[2].click()');assert.equal(await b.evaluate('cardResult.textContent'),card);
  await b.evaluate('nextWave.click()');assert.equal(await b.evaluate('wave.textContent'),'1 · 2');assert.equal(await b.evaluate('laserCount.textContent'),'10');
  await b.evaluate('document.getElementById("pause").click()');await b.navigate('games/shooter.html');
  assert.match(await b.evaluate('continueRun.textContent'),/第 1 大关 · 第 2 小关/);
  await b.evaluate(`localStorage.setItem('starPatrolRun',JSON.stringify({...${JSON.stringify(saved)},wave:51}))`);
  await b.navigate('games/shooter.html');await b.evaluate('continueRun.click()');
  assert.equal(await b.evaluate('wave.textContent'),'2 · 1');assert.match(await b.evaluate('waveLabel.textContent'),/20只随机大Boss/);
  assert.equal(await b.evaluate('remainingBoss.textContent'),'20');
  for(const laterWave of [52,101,10000]){
   await b.evaluate(`localStorage.setItem('starPatrolRun',JSON.stringify({...${JSON.stringify(saved)},wave:${laterWave}}))`);
   await b.navigate('games/shooter.html');await b.evaluate('continueRun.click()');
   assert.equal(await b.evaluate('wave.textContent'),`${Math.ceil(laterWave/50)} · ${(laterWave-1)%50+1}`);
   assert.match(await b.evaluate('waveLabel.textContent'),/20只随机大Boss/);
   assert.equal(await b.evaluate('remainingBoss.textContent'),'20');
  }
  await b.size(568,320,true);
  const controls=await b.evaluate('Array.from(document.querySelectorAll(".weapon-buttons button")).map(b=>{const r=b.getBoundingClientRect();return {bottom:r.bottom,width:r.width,top:r.top}})');
  assert.ok(controls.every(r=>r.bottom<=320&&r.width>=44&&r.top>=0));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
