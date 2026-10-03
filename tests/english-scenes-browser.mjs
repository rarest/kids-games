import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
test('all 36 themed 3D course entries render and release prior GPU resources',{timeout:180000},async()=>{
 const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader']});try{
  await b.size(960,600);await b.navigate('games/english.html');for(let i=0;i<100&&!await b.evaluate('!!window.englishApp');i++)await sleep(100);
  await b.evaluate('document.getElementById("englishButton").click()');const ids=await b.evaluate('[...document.querySelectorAll("[data-level]")].map(b=>b.dataset.level)');assert.equal(ids.length,36);const reports=[];
  for(const id of ids){await b.evaluate(`document.querySelector('[data-level="${id}"]').click()`);await sleep(130);
   const data=await b.evaluate('({id:window.englishApp.run.level.id,mode:window.englishApp.run.level.mode,length:window.englishApp.scene.pathLength,calls:window.englishApp.scene.renderStats.calls,geometry:window.englishApp.scene.renderer.info.memory.geometries,obstacles:window.englishApp.scene.obstacleBatches.length,rivals:window.englishApp.scene.rivals.length})');assert.equal(data.id,id);assert.ok(data.calls>0&&data.length>180,id);assert.ok(data.geometry<200,`${id} GPU resources accumulated: ${data.geometry}`);if(data.mode==='race')assert.equal(data.rivals,9,id);assert.ok(data.obstacles<=5,id);reports.push(data);
   await b.evaluate('document.getElementById("leaveButton").click();document.getElementById("quitButton").click()');
  }
  console.log('36-course renderer range', {minCalls:Math.min(...reports.map(r=>r.calls)),maxCalls:Math.max(...reports.map(r=>r.calls)),maxGeometry:Math.max(...reports.map(r=>r.geometry))});assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
