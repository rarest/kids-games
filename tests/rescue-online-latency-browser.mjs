import test from 'node:test';
import assert from 'node:assert/strict';
import {openOnlinePair,createRoom,key,wait,snapshot,sleep,click,shot} from './rescue-online-harness.mjs';

// The trusted event and post-scene-draw dataset use the same browser performance clock.
// CDP round-trip duration is separate: it is not the player's response measurement.
async function measureResponse(browser,slot,code) {
 await browser.evaluate(`(()=>{
  window.__response=null;
  const listener=e=>{
   if(e.code!==${JSON.stringify(code)}||!e.isTrusted||e.repeat)return;
   removeEventListener('keydown',listener,true);
   const arrival=performance.now(),before=JSON.parse(view.dataset.renderPositions)[${slot}],frame=JSON.parse(view.dataset.graphics).frames;
   const sample={trusted:e.isTrusted,event:e.timeStamp,arrival,timeOrigin:performance.timeOrigin,before,frame};
   window.__response=sample;
   const observer=new MutationObserver(()=>{
    const p=JSON.parse(view.dataset.renderPositions)[${slot}],graphics=JSON.parse(view.dataset.graphics);
    if(graphics.frames>frame&&Math.abs(p.x-before.x)>0.01){Object.assign(sample,{draw:performance.now(),after:p,graphics,eventToDraw:performance.now()-e.timeStamp,arrivalToDraw:performance.now()-arrival});observer.disconnect();}
   });observer.observe(view,{attributes:true,attributeFilter:['data-render-positions']});
  };addEventListener('keydown',listener,true);
 })()`);
 const dispatch=performance.now();await key(browser,code);
 try {await wait(browser,'window.__response?.draw',6000);}finally{await key(browser,code,false);}
 const result=await browser.evaluate('__response');result.dispatchToPoll=performance.now()-dispatch;
 assert.ok(result.event>=0&&result.arrival>=result.event&&result.arrival-result.event<5000,'trusted timestamp shares performance time origin');
 console.log('native response',JSON.stringify({slot,...result}));
 return result;
}

async function graphics(browser) {
 return browser.evaluate(`(()=>{const gl=view.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {antialias:gl.getContextAttributes().antialias,samples:gl.getParameter(gl.SAMPLES),graphics:JSON.parse(view.dataset.graphics),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,rtt:JSON.parse(view.dataset.network).rtt,viewport:{width:innerWidth,height:innerHeight},connectionMessage:document.querySelector('#online-message').textContent,notice:document.querySelector('#notice').textContent}})()`);
}

async function observePlayingFrames(browser) {
 await browser.evaluate(`(()=>{
  window.__playingFrames=[];let last=null;
  const tick=raf=>{
   const at=performance.now(),playing=view.dataset.phase==='playing'&&JSON.parse(view.dataset.network||'null')?.room?.mode==='playing';
   if(playing){const graphics=JSON.parse(view.dataset.graphics);if(last)__playingFrames.push({at,raf,interval:raf-last.raf,arrivalGap:at-last.at,draw:graphics.frames,dpr:graphics.dpr});last={at,raf};}else last=null;
   if(__playingFrames.length>5000)__playingFrames.shift();requestAnimationFrame(tick);
  };requestAnimationFrame(tick);
 })()`);
}
async function frameTiming(browser) {
 return browser.evaluate(`(()=>{const rows=window.__playingFrames||[],intervals=rows.map(r=>r.interval).sort((a,b)=>a-b),gaps=rows.map(r=>r.arrivalGap).sort((a,b)=>a-b);return {count:rows.length,median:intervals[Math.floor(intervals.length/2)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),maxArrivalGap:gaps.at(-1),longest:[...rows].sort((a,b)=>b.arrivalGap-a.arrivalGap).slice(0,8)}})()`);
}

test('native default street at 200ms RTT has confirmed drawing and an uninterrupted active wall minute',{timeout:180000},async()=>{
 const pair=await openOnlinePair({latency:200,jitter:10});const {host,guest}=pair;
 try {
  // Observe default adaptive quality on the actual GPU. Healthy hardware need
  // not reduce DPR to the software-renderer's minimum to finish warming up.
  const adaptiveWarmup=await Promise.all([host,guest].map(async(b,slot)=>{
   const start=performance.now(),before=await b.evaluate('JSON.parse(view.dataset.graphics).dpr');
   await wait(b,'JSON.parse(view.dataset.graphics).frames>=30',60000);
   return {slot,fromDpr:before,additionalAdaptationMs:performance.now()-start,graphics:await b.evaluate('JSON.parse(view.dataset.graphics)')};
  }));console.log('native adaptive warmup after initial preparation',JSON.stringify(adaptiveWarmup));
  for(const b of [host,guest])await observePlayingFrames(b);
  await createRoom(pair);
  for(const b of [host,guest])await b.evaluate(`window.__delayedNotices=[];new MutationObserver(()=>{const text=document.querySelector('#notice').textContent;if(text)__delayedNotices.push({at:performance.now(),text});}).observe(document.querySelector('#notice'),{childList:true,subtree:true,characterData:true});void 0`);
  await sleep(600);
  const startupPaused=(await snapshot(host)).network.room.mode==='paused';
  if(startupPaused&&process.env.RESCUE_STARTUP_RESUME==='1'){
   console.log('diagnostic startup stale: one native manual resume BEFORE timing and continuous minute');
   await wait(host,'!document.querySelector("#resume").disabled');await click(host,'#resume');
   for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  }
  console.log('native delayed conditions',JSON.stringify({rttBase:200,jitterPerDirection:10,devices:await Promise.all([host,guest].map(graphics))}));
  const samples=[];
  for(const [browser,slot,code] of [[host,0,'KeyA'],[guest,1,'KeyD']])samples.push(await measureResponse(browser,slot,code));
  // Report every first sample; never retry a failing sample until it happens to pass.
  const responseFailures=samples.filter(sample=>sample.eventToDraw<180||sample.eventToDraw>=600);
  assert.deepEqual(responseFailures,[],'first confirmed draws must follow authority within the 200ms RTT plus buffer budget');
  await sleep(700);
  const settled=await Promise.all([host,guest].map(snapshot));
  for(let slot=0;slot<2;slot++)assert.ok(Math.abs(settled[0].positions[slot].x-settled[1].positions[slot].x)<0.12,'settled authoritative positions agree');
  const peers=pair.traffic.filter(p=>p.socket.readyState===1),start=performance.now();
  const baseline=peers.map(p=>({bytes:p.dynamicBytes,frames:p.dynamicFrames,tick:p.tick,modes:p.modes.length,static:p.staticFrames}));
  const drawn=settled.map(s=>JSON.parse(s.graphics).frames);
  let pulses=0;
  while(performance.now()-start<60000) {
   // Native short taps stay near the safe street entrance; no state/score/position injection.
   for(const browser of [host,guest])await key(browser,pulses%2?'KeyD':'KeyA');
   await sleep(75);
   for(const browser of [host,guest])await key(browser,pulses%2?'KeyD':'KeyA',false);
   pulses++;
   await sleep(1500);
   for(const [i,peer] of peers.entries())assert.equal(peer.modes.length,baseline[i].modes,`continuous room changed mode: ${JSON.stringify(peer.modes)}`);
   for(const browser of [host,guest])assert.equal((await snapshot(browser)).network.room.mode,'playing');
  }
  const seconds=(performance.now()-start)/1000,end=await Promise.all([host,guest].map(snapshot));
  const minute=peers.map((p,i)=>({slot:p.slot,seconds,KiBps:(p.dynamicBytes-baseline[i].bytes)/seconds/1024,dynamicFrames:p.dynamicFrames-baseline[i].frames,ticks:p.tick-baseline[i].tick,drawnFrames:JSON.parse(end[i].graphics).frames-drawn[i],fps:(JSON.parse(end[i].graphics).frames-drawn[i])/seconds,staticFrames:p.staticFrames-baseline[i].static}));
  console.log('native continuous minute',JSON.stringify({pulses,minute,devices:await Promise.all([host,guest].map(graphics))}));
  for(const row of minute){assert.ok(row.KiBps<=80);assert.ok(row.ticks>3000,'real simulation advances through wall minute');assert.ok(row.drawnFrames>0);assert.equal(row.staticFrames,0);}
  for(const s of end){assert.ok(s.network.pending<=120);assert.ok(s.network.history<=32);assert.equal(s.network.mode,'confirmed');}
  assert.equal(startupPaused,false,'startup stale remains a failure even when a diagnostic manual resume completes the minute');
  // Deliberate pause/reclaim are outside the uninterrupted minute.
  await click(host,'#pause');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');
  await click(host,'#retry');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  const count=type=>peers.map(p=>[...p.events.values()].filter(e=>e.type===type&&e.player==='p1').length);
  const jumps=count('jump'),throws=count('throw');
  await key(host,'Space');await sleep(500);await key(host,'Space',false);
  await wait(host,'JSON.parse(view.dataset.positions)[0].grounded');await sleep(400);
  assert.deepEqual(count('jump'),jumps.map(n=>n+1),'held jump produces one authoritative event per peer');
  await key(host,'KeyE');await sleep(500);await key(host,'KeyE',false);
  for(const b of [host,guest])await wait(b,'JSON.parse(view.dataset.positions)[0].carrying?.type==="player"');
  await key(host,'KeyE');await sleep(500);await key(host,'KeyE',false);
  for(const b of [host,guest])await wait(b,'!JSON.parse(view.dataset.positions)[0].carrying');
  assert.deepEqual(count('throw'),throws.map(n=>n+1),'held action produces one authoritative throw per peer');
  await click(host,'#pause');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');
  await wait(host,'!document.querySelector("#resume").disabled');await click(host,'#resume');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  await guest.evaluate('__rescueSockets.at(-1).close()');await wait(host,'view.dataset.phase==="paused"');await wait(guest,'JSON.parse(view.dataset.network).slot===1&&JSON.parse(view.dataset.network).connection==="connected"');await wait(host,'!document.querySelector("#resume").disabled');assert.equal((await snapshot(guest)).phase,'paused');await shot(host,'delayed-ready-paused');
  assert.deepEqual(host.errors,[]);assert.deepEqual(guest.errors,[]);
 }finally{
  console.log('native delayed final',JSON.stringify({devices:await Promise.all([host,guest].map(b=>graphics(b).catch(e=>({error:e.message})))),modes:pair.traffic.map(p=>({slot:p.slot,modes:p.modes})),playingFrames:await Promise.all([host,guest].map(b=>frameTiming(b).catch(()=>null))),inputTiming:pair.inputTiming(),trace:pair.networkTrace(),samples:await Promise.all([host,guest].map(b=>b.evaluate('({response:window.__response,notices:window.__delayedNotices})').catch(()=>null)))}));
  for(const [i,b] of [host,guest].entries()){
   await shot(b,`delayed-final-${i}`).catch(()=>{});
   // Screenshot only, after the timing gate has ended: reveal the complete rendered scene.
   // The room remains paused; no simulation/position/quality value is changed.
   const visibility=await b.evaluate("document.querySelector('#overlay').style.visibility").catch(()=>null);
   if(visibility!==null)try{await b.evaluate("document.querySelector('#overlay').style.visibility='hidden'");await shot(b,`delayed-scene-${i}`);}finally{await b.evaluate(`document.querySelector('#overlay').style.visibility=${JSON.stringify(visibility)}`).catch(()=>{});}
  }
  await pair.close();
 }
});
