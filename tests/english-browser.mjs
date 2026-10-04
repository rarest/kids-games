import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';
const out=process.env.ENGLISH_TEST_ARTIFACTS;
async function wait(b,expr){for(let i=0;i<100;i++){if(await b.evaluate(expr))return;await sleep(100);}throw new Error(`Timed out: ${expr}`);}
async function shot(b,name){if(!out)return;await mkdir(out,{recursive:true});const {data}=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(`${out}/${name}.png`,Buffer.from(data,'base64'));}
async function answer(b,wrong=false){
 const q=await b.evaluate('window.englishApp.questions[window.englishApp.run.card]');
 if(q.kind==='sentence'){
  const used=new Set();for(const token of q.answer.split(/\s+/)){const i=q.tokens.findIndex((t,i)=>t.toLowerCase()===token.replace(/[.,!?]/g,'').toLowerCase()&&!used.has(i));used.add(i);await b.evaluate(`document.querySelector('[data-token="${i}"]').click()`);}if(wrong)await b.evaluate(`document.querySelector('[data-remove="0"]').click()`);
  if(wrong)await b.evaluate(`document.querySelector('[data-token="${[...used][0]}"]').click()`);
  await b.evaluate('document.getElementById("checkSentence").click()');
 }else{const index=q.choices.findIndex(c=>wrong?c!==q.answer:c===q.answer);await b.evaluate(`document.querySelector('[data-choice="${index}"]').click()`);}
 await wait(b,'!document.getElementById("feedback").hidden');return q;
}
test('English hub, live four-mode 3D, ten paused cards, coins and saved skins', {timeout:180000}, async()=>{
 const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});try{
  await b.size(1280,800);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');await b.evaluate('localStorage.clear()');await b.navigate('games/english.html');await wait(b,'!!window.englishApp');
  assert.equal(await b.evaluate('document.querySelectorAll("[data-course-lesson]").length'),36);await shot(b,'home-desktop');await b.evaluate('document.getElementById("englishButton").click()');assert.equal(await b.evaluate('document.querySelectorAll("[data-level]").length'),36);await shot(b,'courses-desktop');
  await b.evaluate('document.getElementById("grade").value="6";document.getElementById("grade").dispatchEvent(new Event("change"));document.getElementById("term").value="下";document.getElementById("term").dispatchEvent(new Event("change"))');assert.equal(await b.evaluate('document.getElementById("unit").options.length'),4);assert.match(await b.evaluate('document.getElementById("edition").textContent'),/在用|复习/);
  await b.evaluate('document.getElementById("grade").value="3";document.getElementById("term").value="上";document.getElementById("grade").dispatchEvent(new Event("change"))');
  for(const mode of ['slide','parkour','bike','race']){
   await b.evaluate(`document.querySelector('[data-level="forest-${mode}"]').click()`);await wait(b,'window.englishApp.scene?.renderer?.info.render.calls>0');await sleep(300);assert.equal(await b.evaluate('window.englishApp.scene.player.isGroup'),true);assert.equal(await b.evaluate('window.englishApp.run.level.mode'),mode);
   assert.ok(await b.evaluate('window.englishApp.scene.renderer.info.render.triangles>500'));assert.ok(await b.evaluate('window.englishApp.scene.frame(window.englishApp.run.progress,-.5).position.project(window.englishApp.scene.camera).x < window.englishApp.scene.frame(window.englishApp.run.progress,.5).position.project(window.englishApp.scene.camera).x'),'left lane must appear on the left side of the actual camera');if(mode==='race')console.log('Race renderer',await b.evaluate('window.englishApp.scene.renderStats'));await shot(b,`${mode}-desktop`);
   if(mode!=='race'){await b.evaluate('document.getElementById("leaveButton").click();document.getElementById("quitButton").click()');}
  }
  const lane0=await b.evaluate('window.englishApp.run.lane');const screenX=await b.evaluate('window.englishApp.scene.player.position.clone().project(window.englishApp.scene.camera).x');await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await sleep(250);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});assert.ok(await b.evaluate('window.englishApp.run.lane')<lane0);assert.ok(await b.evaluate('window.englishApp.scene.player.position.clone().project(window.englishApp.scene.camera).x')<screenX);
  await b.evaluate('window.englishApp.run.step(20,{})');await wait(b,'document.getElementById("quiz").open');
  const frozen=await b.evaluate('JSON.stringify({p:window.englishApp.run.progress,t:window.englishApp.run.elapsed,r:window.englishApp.run.rivals,c:window.englishApp.scene.camera.position,b:window.englishApp.scene.player.quaternion})');await sleep(400);assert.equal(await b.evaluate('JSON.stringify({p:window.englishApp.run.progress,t:window.englishApp.run.elapsed,r:window.englishApp.run.rivals,c:window.englishApp.scene.camera.position,b:window.englishApp.scene.player.quaternion})'),frozen);
  for(let i=0;i<10;i++){
   assert.equal(await b.evaluate('window.englishApp.run.card'),i);const q=await answer(b,i===0);assert.ok((await b.evaluate('document.getElementById("feedback").textContent')).includes(q.explanation));if(i===0){assert.equal(await b.evaluate('window.englishApp.save.coins'),0);await shot(b,'quiz-feedback-desktop');}
   await b.evaluate('document.getElementById("continueButton").click();document.getElementById("continueButton").click()');assert.equal(await b.evaluate('window.englishApp.save.coins'),(i+1)*200);
   assert.equal(await b.evaluate('document.getElementById("quiz").open'),false);await b.evaluate('window.englishApp.run.step(120,{})');if(i<9)await wait(b,'document.getElementById("quiz").open');
  }
  await wait(b,'document.getElementById("result").open');assert.match(await b.evaluate('document.getElementById("resultStats").textContent'),/完成10张题卡.*2000金币/);await shot(b,'round-result');
  await b.evaluate('document.getElementById("resultShop").click()');assert.equal(await b.evaluate('document.querySelectorAll("[data-skin]").length'),33);await b.evaluate(`document.querySelector('[data-skin="skin-3-1"]').click();document.getElementById('buyPreview').click()`);assert.equal(await b.evaluate('window.englishApp.save.coins'),1700);assert.equal(await b.evaluate('window.englishApp.save.skin'),'skin-3-1');await shot(b,'shop-desktop');
  await b.navigate('games/english.html');await wait(b,'!!window.englishApp');assert.equal(await b.evaluate('window.englishApp.save.coins'),1700);assert.equal(await b.evaluate('window.englishApp.save.skin'),'skin-3-1');
  for(const [width,height,touch] of [[390,844,true],[844,390,true],[768,1024,true],[1366,768,false]]){
   await b.size(width,height,touch);await b.evaluate('document.getElementById("englishButton").click()');assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
   await b.evaluate(`document.querySelector('[data-level="neon-slide"]').click()`);await sleep(200);const sizes=await b.evaluate('({w:document.querySelector("#gameCanvas canvas").clientWidth,h:document.querySelector("#gameCanvas canvas").clientHeight,sw:innerWidth,sh:innerHeight})');assert.ok(sizes.w>width*.95);assert.ok(sizes.h>height*.65);await shot(b,`play-${width}x${height}`);
   await b.evaluate('window.englishApp.run.step(20,{})');await wait(b,'document.getElementById("quiz").open');assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await shot(b,`quiz-${width}x${height}`);
   await answer(b);await b.evaluate('document.getElementById("continueButton").click();document.getElementById("leaveButton").click();document.getElementById("quitButton").click()');
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
test('real touch controls, rotation, manual pause, audio playback and saved wrong-card review',{timeout:90000},async()=>{
 const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');
  await b.evaluate('window.__clips=[];const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__clips.push(this);return original.call(this)};document.getElementById("englishButton").click();document.getElementById("openStudy").click()');
  await b.evaluate('document.querySelector("[data-say-word]").click()');await wait(b,'window.__clips[0]?.readyState>=2');await sleep(160);assert.ok(await b.evaluate('window.__clips[0].currentTime>0'));assert.ok(await b.evaluate('window.__clips[0].duration>0'));
  await b.evaluate('document.querySelector("[data-say-sentence]").click()');await wait(b,'window.__clips.length>=2&&window.__clips[1].readyState>=2');await sleep(160);assert.ok(await b.evaluate('window.__clips[1].currentTime>0'));await b.evaluate('document.getElementById("closeStudy").click();document.querySelector("[data-level=forest-parkour]").click()');
  await wait(b,'window.englishApp.run?.status==="playing"');
  const touch=async(id,holdMs=160)=>{const point=await b.evaluate(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1,radiusX:2,radiusY:2,force:1}]});await sleep(holdMs);await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await touch('leftButton',250);assert.ok(await b.evaluate('window.englishApp.run.lane<0'));await touch('jumpButton',100);assert.ok(await b.evaluate('window.englishApp.run.jump>0'));
  const p=await b.evaluate('window.englishApp.run.progress');await b.size(844,390,true);assert.equal(await b.evaluate('window.englishApp.run.level.mode'),'parkour');assert.ok(await b.evaluate('window.englishApp.run.progress')>=p);
  await b.evaluate('document.getElementById("pauseButton").click()');const frozen=await b.evaluate('window.englishApp.run.elapsed');await sleep(250);assert.equal(await b.evaluate('window.englishApp.run.elapsed'),frozen);await b.evaluate('document.getElementById("resumeButton").click()');
  await b.evaluate('window.englishApp.run.step(20,{})');await wait(b,'document.getElementById("quiz").open');await answer(b,true);await b.evaluate('document.getElementById("continueButton").click();document.getElementById("leaveButton").click();document.getElementById("quitButton").click();document.getElementById("homeButton").click();document.getElementById("reviewButton").click()');await wait(b,'document.getElementById("quiz").open');assert.match(await b.evaluate('document.getElementById("quizCount").textContent'),/错题复习/);
  // Runtime diagnostics report actual render workload, not estimated device FPS.
  console.log('English renderer',await b.evaluate('({calls:window.englishApp.scene.renderer.info.render.calls,triangles:window.englishApp.scene.renderer.info.render.triangles})'));
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
