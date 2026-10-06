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
  await b.evaluate('document.querySelector("[data-textbook-word]").click()');await wait(b,'window.__clips[0]?.readyState>=2');await sleep(160);assert.ok(await b.evaluate('window.__clips[0].currentTime>0'));assert.ok(await b.evaluate('window.__clips[0].duration>0'));
  await b.evaluate('document.querySelector("[data-textbook-line]").click()');await wait(b,'window.__clips.length>=2&&window.__clips[1].readyState>=2');await sleep(160);assert.ok(await b.evaluate('window.__clips[1].currentTime>0'));await b.evaluate('document.getElementById("closeStudy").click();document.querySelector("[data-level=forest-parkour]").click()');
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

// An in-flow subject nav must not move the legacy game's controls below the viewport.
for(const [width,height] of [[390,844],[320,844],[844,390],[1024,768]]){
 test(`legacy English play preserves native controls and restores subject navigation at ${width}x${height}`,{timeout:45000},async()=>{
  const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader']});
  const until=async expression=>{for(let i=0;i<200;i++){if(await b.evaluate(expression))return;await sleep(25)}throw new Error(`Timed out: ${expression}`)};
  const geometry=async id=>b.evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{id:e.id,x,y,left:r.left,top:r.top,right:r.right,bottom:r.bottom,hit:document.elementFromPoint(x,y)?.closest('button')?.id??null}})()`);
  const touch=async(id,response)=>{
   const p=await geometry(id);
   assert.ok(p.left>=0&&p.top>=0&&p.right<=width&&p.bottom<=height,`${width}x${height}: ${id} must be inside the viewport: ${JSON.stringify(p)}`);
   assert.equal(p.hit,id,`${width}x${height}: ${id} must be the actual hit target`);
   await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1,radiusX:2,radiusY:2,force:1}]});
   try{if(response)await until(response)}finally{await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
  };
  const navigation=async()=>{
   assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".classroom-nav")).display'), 'flex');
   assert.ok(await b.evaluate('(()=>{const r=document.querySelector(".classroom-nav").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'));
   assert.deepEqual(await b.evaluate('Array.from(document.querySelectorAll(".classroom-nav [data-subject]")).map(a=>({subject:a.dataset.subject,href:a.getAttribute("href"),current:a.getAttribute("aria-current")}))'),[
    {subject:'chinese',href:'/games/chinese.html',current:null},{subject:'english',href:'/games/english.html',current:'page'}
   ]);
   assert.equal(await b.evaluate('document.querySelector(".classroom-nav button").disabled'),true);
  };
  try{
   await b.size(width,height,true);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');await navigation();
   await b.evaluate('window.__nativePlayEvents=[];document.addEventListener("pointerdown",e=>{if(["leftButton","rightButton","jumpButton","pauseButton","resumeButton","quitButton"].includes(e.target.id))window.__nativePlayEvents.push({id:e.target.id,trusted:e.isTrusted,type:e.pointerType})},true);document.getElementById("englishButton").click();document.querySelector("[data-level=forest-parkour]").click()');
   await until('window.englishApp.run?.progress>0&&window.englishApp.scene?.renderer?.info.render.calls>0');
   const controls=await Promise.all(['leftButton','rightButton','jumpButton'].map(geometry));
   console.log('Legacy English layout',JSON.stringify({width,height,controls,nav:await b.evaluate('document.querySelector(".classroom-nav").getBoundingClientRect().height')}));
   for(const p of controls){
    assert.ok(p.left>=0&&p.top>=0&&p.right<=width&&p.bottom<=height,`${width}x${height}: ${p.id} must be inside the viewport: ${JSON.stringify(p)}`);
    assert.equal(p.hit,p.id);
   }
   assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".classroom-nav")).display'),'none');
   await touch('leftButton','window.englishApp.run.lane<-.02');
   const leftLane=await b.evaluate('window.englishApp.run.lane');
   await touch('rightButton',`window.englishApp.run.lane>${leftLane+.02}`);
   await touch('jumpButton','window.englishApp.run.jump>0');
   const nativeResponse=await b.evaluate('({lane:englishApp.run.lane,jump:englishApp.run.jump,progress:englishApp.run.progress,drawCalls:englishApp.scene.renderer.info.render.calls})');
   await touch('pauseButton');await until('document.getElementById("pauseDialog").open&&englishApp.run.status==="paused"');
   const frozen=await b.evaluate('englishApp.run.elapsed');
   await b.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
   assert.equal(await b.evaluate('englishApp.run.elapsed'),frozen);
   await touch('resumeButton');await until('!document.getElementById("pauseDialog").open&&englishApp.run.status==="playing"');
   await touch('pauseButton');await until('document.getElementById("pauseDialog").open');
   await touch('quitButton');await until('englishApp.view==="english"');await navigation();
   assert.equal(await b.evaluate('document.getElementById("continueEnglish").hidden'),false,'manual quit preserves the saved round');
   await b.evaluate('document.getElementById("continueEnglish").click()');
   await until('englishApp.view==="play"&&englishApp.run.status==="playing"');
   assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".classroom-nav")).display'),'none');
   await touch('pauseButton');await until('document.getElementById("pauseDialog").open');await touch('quitButton');
   await until('englishApp.view==="english"');await navigation();
   await touch('homeButton');await until('englishApp.view==="home"');await navigation();
   assert.equal(await b.evaluate('document.body.style.overflow'),'');
   const events=await b.evaluate('window.__nativePlayEvents');
   for(const id of ['leftButton','rightButton','jumpButton','pauseButton','resumeButton','quitButton'])assert.ok(events.some(e=>e.id===id&&e.trusted&&e.type==='touch'),`${id} receives a trusted native touch`);
   console.log('Legacy English native response',JSON.stringify({width,height,...nativeResponse,events}));
   assert.deepEqual(b.errors,[]);
  }finally{b.close()}
 });
}
