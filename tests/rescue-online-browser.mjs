import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser} from './game-browser-harness.mjs';
import {openOnlinePair,createRoom,click,key,point,touch,wait,snapshot,shot,sleep} from './rescue-online-harness.mjs';

test('native online room uses each device 1P keys and touch, carry/throw, pause, reload reclaim and isolated local save',{timeout:180000},async()=>{
 const pair=await openOnlinePair();const {host,guest}=pair;
 try{
  // A real local entrance save precedes online play; online must leave its bytes and options intact.
  await click(host,'#players-two');await click(host,'#dale');await click(host,'#start');await click(host,'#pause');await click(host,'#home');
  const saved=await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")');
  await click(guest,'#online-open');await click(guest,'#online-input');await guest.call('Input.insertText',{text:'123'});await click(guest,'#online-join');await wait(guest,'document.querySelector("#online-message").textContent==="请输入6位房间号"');await click(guest,'#online-lobby-leave');
  const code=await createRoom(pair);assert.match(await host.evaluate('document.querySelector("#online-hud").textContent'),new RegExp(code));assert.match(await guest.evaluate('document.querySelector("#online-hud").textContent'),/蒂蒂/);
  const before=await snapshot(host);await key(host,'ArrowRight');await key(guest,'ArrowLeft');await sleep(300);await key(host,'ArrowRight',false);await key(guest,'ArrowLeft',false);
  const forbidden=await snapshot(host);assert.ok(Math.abs(forbidden.positions[0].x-before.positions[0].x)<0.15);assert.ok(Math.abs(forbidden.positions[1].x-before.positions[1].x)<0.15);
  await key(host,'KeyA');await key(guest,'KeyD');await wait(host,`JSON.parse(view.dataset.positions)[0].x<${before.positions[0].x-0.25}&&JSON.parse(view.dataset.positions)[1].x>${before.positions[1].x+0.25}`);await key(host,'KeyA',false);await key(guest,'KeyD',false);
  console.log('native online drawing and first-input evidence',JSON.stringify({devices:await Promise.all([host,guest].map(b=>b.evaluate('(()=>{const gl=view.getContext("webgl2"),ext=gl.getExtension("WEBGL_debug_renderer_info");return {graphics:JSON.parse(view.dataset.graphics),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null}})()'))),startup:pair.networkTrace().map(p=>{const start=p.trace.find(e=>e.type==='room'&&e.mode==='playing'&&e.run===1),input=p.trace.find(e=>e.type==='input'&&e.at>=start?.at);return {slot:p.slot,startToInputMs:input&&start?input.at-start.at:null};})}));
  await click(host,'#pause');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');assert.equal(await guest.evaluate('document.querySelector("#resume").disabled'),true);await click(host,'#resume');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  // Retry is a real host command, then native actor pickup/throw from the region entrance.
  await click(host,'#pause');await wait(host,'JSON.parse(view.dataset.network).room.mode==="paused"&&!document.querySelector("#pause-panel").hidden');await click(host,'#retry');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  await key(host,'KeyE');await key(host,'KeyE',false);for(const b of [host,guest])await wait(b,'JSON.parse(view.dataset.positions)[0].carrying?.type==="player"&&JSON.parse(view.dataset.positions)[0].carrying?.id===JSON.parse(view.dataset.positions)[1].id');await key(host,'KeyE');await key(host,'KeyE',false);for(const b of [host,guest])await wait(b,'!JSON.parse(view.dataset.positions)[0].carrying');
  await key(host,'KeyD');await wait(host,'Number(view.dataset.x)>4.2');await key(host,'KeyD',false);await key(host,'KeyE');await key(host,'KeyE',false);await wait(host,'Number(view.dataset.carrying)===1');await wait(guest,'Number(view.dataset.carrying)===1');
  const picked=await snapshot(host),carrying=picked.positions[0].carrying;assert.ok(carrying);await key(host,'KeyE');await key(host,'KeyE',false);for(const b of [host,guest])await wait(b,'Number(view.dataset.carrying)===0');
  await guest.size(390,844,true);const gx=(await snapshot(guest)).positions[1].x,stick=await point(guest,'#joystick');await touch(guest,'touchStart',{x:stick.x+35,y:stick.y});await wait(host,`JSON.parse(view.dataset.positions)[1].x>${gx+0.3}`);await touch(guest,'touchEnd',stick);await shot(guest,'online-touch-guest');
  await host.call('Page.reload');await wait(host,'document.querySelector("#view")?.dataset.network&&JSON.parse(view.dataset.network).slot===0&&JSON.parse(view.dataset.network).connection==="connected"');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');await wait(host,'JSON.parse(view.dataset.graphics).dpr<=0.75&&!JSON.parse(view.dataset.graphics).shadows',60000);await wait(host,'!document.querySelector("#resume").disabled');await click(host,'#resume');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  await click(host,'#pause');await wait(host,'JSON.parse(view.dataset.network).room.mode==="paused"&&!document.querySelector("#pause-panel").hidden');await click(host,'#online-leave');await wait(host,'view.dataset.phase==="home"');await wait(guest,'view.dataset.phase==="home"');assert.equal(await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")'),saved);assert.equal(await host.evaluate('document.querySelector("#players-two").getAttribute("aria-pressed")'),'true');assert.equal(await host.evaluate('document.querySelector("#dale").getAttribute("aria-pressed")'),'true');assert.equal(await host.evaluate('sessionStorage.getItem("rescue.online.session.v1")'),null);assert.deepEqual(host.errors,[]);assert.deepEqual(guest.errors,[]);
 }finally{await pair.close();}
});

test('native touch doubletap and trusted contextmenu are blocked across home, saved continue and narrow controls',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  await b.size(320,568,true);await b.navigate('games/rescue.html');await wait(b,'view.dataset.phase==="home"');
  await b.evaluate('window.__menu=[];document.addEventListener("contextmenu",e=>window.__menu.push({trusted:e.isTrusted,blocked:e.defaultPrevented}))');
  const p=await point(b,'#view'),scale=await b.evaluate('visualViewport.scale');for(let i=0;i<2;i++){await touch(b,'touchStart',p);await touch(b,'touchEnd',p);await sleep(60);}await sleep(200);assert.equal(await b.evaluate('visualViewport.scale'),scale);
  for(const type of ['mousePressed','mouseReleased'])await b.call('Input.dispatchMouseEvent',{type,...p,button:'right',clickCount:1});assert.deepEqual(await b.evaluate('window.__menu'),[{trusted:true,blocked:true}]);
  for(const saved of [false,true]){if(saved){await click(b,'#start');await click(b,'#pause');await click(b,'#home');}for(const selector of ['#start','#online-open',...(saved?['#continue']:[])]){const r=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e}})()`);assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=320&&r.y+r.h<=568&&r.hit,JSON.stringify({selector,...r}));}}
  await click(b,'#online-open');await wait(b,'!document.querySelector("#online-panel").hidden');await shot(b,'online-home-320');assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});

// Recovery correctness is checked independently from software-WebGL stale protection.
// Keep actual UI transitions so a valid resume is observable even if a later slow frame pauses it.
async function observeOnlinePhases(browser) {
 await browser.evaluate('window.__onlinePhases=[];new MutationObserver(()=>{__onlinePhases.push({phase:view.dataset.phase,mode:JSON.parse(view.dataset.network||"null")?.room?.mode,positions:JSON.parse(view.dataset.positions)});if(__onlinePhases.length>100)__onlinePhases.shift()}).observe(view,{attributes:true,attributeFilter:["data-phase"]});void 0');
}
async function resumeRecovery(pair) {
 const {host,guest}=pair;await wait(host,'!document.querySelector("#resume").disabled');
 for(const b of [host,guest])await b.evaluate('__onlinePhases.length=0');
 await click(host,'#resume');
 for(const b of [host,guest])await wait(b,'__onlinePhases.some(p=>p.phase==="playing"&&p.mode==="playing")');
 const phase=await Promise.all([host,guest].map(b=>b.evaluate('view.dataset.phase')));
 if(phase.includes('paused'))console.log('native recovery resumed; subsequent stale protection',JSON.stringify(phase));
}

test('native online GPU loss, frozen page, reconnect and BFCache require both ready and manual host resume',{timeout:180000},async()=>{
 const pair=await openOnlinePair();const {host,guest}=pair;try{
  for(const b of [host,guest])await observeOnlinePhases(b);
  const code=await createRoom(pair);
  await key(guest,'KeyD');await wait(host,'JSON.parse(view.dataset.positions)[1].x>4.1');
  await guest.evaluate('window.__loss=view.getContext("webgl2").getExtension("WEBGL_lose_context");__loss.loseContext()');
  await wait(host,'view.dataset.phase==="paused"&&document.querySelector("#resume").disabled');await wait(guest,'JSON.parse(view.dataset.graphics).contextLost');
  assert.equal(await guest.evaluate('JSON.parse(view.dataset.audio).active'),false);
  await key(host,'Escape');await key(host,'Escape',false);assert.equal(await host.evaluate('view.dataset.phase'),'paused');
  await guest.call('Emulation.setFocusEmulationEnabled',{enabled:false});await guest.call('Page.setWebLifecycleState',{state:'frozen'});assert.equal(await guest.evaluate('document.hidden'),true);assert.equal(await guest.evaluate('__rescueLifecycle.some(e=>e.type==="freeze")'),true);await guest.call('Page.setWebLifecycleState',{state:'active'});await guest.call('Emulation.setFocusEmulationEnabled',{enabled:true});await sleep(200);
  assert.equal(await host.evaluate('document.querySelector("#resume").disabled'),true,'visible tab does not make a still-lost GPU ready');
  await guest.evaluate('__loss.restoreContext()');await wait(guest,'!JSON.parse(view.dataset.graphics).contextLost');await wait(host,'!document.querySelector("#resume").disabled');assert.equal(await host.evaluate('view.dataset.phase'),'paused');
  await resumeRecovery(pair);
  const played=await guest.evaluate('__onlinePhases.find(p=>p.phase==="playing"&&p.mode==="playing").positions[1]');await sleep(150);assert.ok(Math.abs((await snapshot(host)).positions[1].x-played.x)<0.2,'old held input cleared');await key(guest,'KeyD',false);
  await guest.call('Emulation.setFocusEmulationEnabled',{enabled:false});await guest.call('Page.setWebLifecycleState',{state:'frozen'});assert.equal(await guest.evaluate('document.hidden'),true);assert.equal(await guest.evaluate('__rescueLifecycle.some(e=>e.type==="freeze")'),true);await wait(host,'view.dataset.phase==="paused"&&document.querySelector("#resume").disabled');await guest.call('Page.setWebLifecycleState',{state:'active'});await guest.call('Emulation.setFocusEmulationEnabled',{enabled:true});await wait(host,'!document.querySelector("#resume").disabled');assert.equal(await host.evaluate('view.dataset.phase'),'paused');await resumeRecovery(pair);
  await guest.evaluate('__rescueSockets.at(-1).close()');await wait(host,'view.dataset.phase==="paused"');await wait(guest,'JSON.parse(view.dataset.network).connection==="connected"&&JSON.parse(view.dataset.network).slot===1');await wait(host,'!document.querySelector("#resume").disabled');assert.equal(await guest.evaluate('JSON.parse(view.dataset.network).code'),code);assert.equal(await guest.evaluate('view.dataset.phase'),'paused');
  await resumeRecovery(pair);
  await guest.evaluate('window.__onlineCacheMarker=42;window.addEventListener("pageshow",e=>window.__onlineFromCache=e.persisted);const a=document.createElement("a");a.id="cache-navigation";a.href="../index.html";a.textContent="大厅";a.style="position:fixed;top:0;right:0;z-index:99;padding:8px;background:white";document.body.append(a)');await click(guest,'#cache-navigation');await wait(guest,'location.pathname.endsWith("/index.html")');await wait(host,'view.dataset.phase==="paused"');await guest.evaluate('history.back()');await wait(guest,'location.pathname.endsWith("/games/rescue.html")&&document.querySelector("#view")?.dataset.network&&JSON.parse(view.dataset.network).connection==="connected"');assert.equal(await guest.evaluate('__onlineCacheMarker'),42);assert.equal(await guest.evaluate('__onlineFromCache'),true);assert.equal(await guest.evaluate('JSON.parse(view.dataset.network).slot'),1);await wait(host,'!document.querySelector("#resume").disabled');assert.equal(await guest.evaluate('view.dataset.phase'),'paused');await shot(host,'online-lifecycle-ready-paused');await resumeRecovery(pair);assert.deepEqual(host.errors,[]);assert.deepEqual(guest.errors,[]);
 }finally{await pair.close();}
});

test('native scene preserves unchanged drawing buffers and reallocates true size changes once',{timeout:90000},async()=>{
 const b=await openBrowser();try{await b.size(320,568);await b.navigate('games/rescue.html');await wait(b,'view.dataset.phase==="home"');await click(b,'#options-open');await click(b,'[data-quality=low]');await sleep(150);await b.evaluate('window.__bufferWrites=[];for(const key of ["width","height"]){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,key);Object.defineProperty(HTMLCanvasElement.prototype,key,{...d,set(value){d.set.call(this,value);if(this.id==="view")__bufferWrites.push({key,value});}})};void 0');await click(b,'[data-quality=low]');await sleep(100);assert.deepEqual(await b.evaluate('__bufferWrites'),[],'same quality, dimensions and DPR preserve the native WebGL buffer');
 await b.evaluate('__bufferWrites.length=0');await b.size(321,568);await sleep(120);const writes=await b.evaluate('__bufferWrites');assert.equal(writes.filter(w=>w.key==='width').length,1);assert.equal(writes.filter(w=>w.key==='height').length,1);assert.equal(await b.evaluate('view.width'),321);assert.equal(await b.evaluate('view.height'),196);assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});

test('native online settings stay temporary and leaving restores local options and saved bytes',{timeout:120000},async()=>{
 const pair=await openOnlinePair();const {host,guest}=pair;try{
  await click(host,'#players-two');await click(host,'#dale');
  const saved=await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")');assert.equal(typeof saved,'string');
  await createRoom(pair);await click(host,'#pause');await wait(host,'JSON.parse(view.dataset.network).room.mode==="paused"&&!document.querySelector("#pause-panel").hidden');await click(host,'#paused-options');await click(host,'#music');
  assert.equal(await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")'),saved,'online music must not write local profile');
  await click(host,'#sound');await click(host,'[data-quality=low]');assert.equal(await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")'),saved,'all online settings stay temporary');
  await wait(host,'!JSON.parse(view.dataset.audio).music&&!JSON.parse(view.dataset.audio).sound&&JSON.parse(view.dataset.graphics).quality==="low"');
  await click(host,'#options-panel .close-panel');await click(host,'#online-leave');for(const b of [host,guest])await wait(b,'view.dataset.phase==="home"');
  assert.equal(await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")'),saved);
  await wait(host,'JSON.parse(view.dataset.audio).music&&JSON.parse(view.dataset.audio).sound&&JSON.parse(view.dataset.graphics).quality==="auto"');
  assert.equal(await host.evaluate('document.querySelector("#players-two").getAttribute("aria-pressed")'),'true');assert.equal(await host.evaluate('document.querySelector("#dale").getAttribute("aria-pressed")'),'true');assert.deepEqual(host.errors,[]);assert.deepEqual(guest.errors,[]);
 }finally{await pair.close();}
});
