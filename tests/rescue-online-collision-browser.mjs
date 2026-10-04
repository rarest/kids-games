import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openOnlinePair,createRoom,key,wait,snapshot,sleep,click,shot} from './rescue-online-harness.mjs';

import {instrumentedSite} from './rescue-render-observer-harness.mjs';
const level={id:'0',name:'collision regression',theme:'street',width:40,height:12,spawn:{x:5,y:1},platforms:[{id:'floor',x:0,y:1,w:40,h:.65}],objects:[{id:'box',kind:'crate',x:5.4,y:1}],enemies:[{id:'target',kind:'mouse',x:9,y:1,min:8,max:10,speed:0}],hazards:[],pickups:[],decor:[],boss:null,checkpoints:[],exit:{x:38,y:1}};


test('native 200ms RTT throw stays single and its visible impact agrees with real monster collision',{timeout:120000},async()=>{
 const site=await instrumentedSite(),previous=process.env.GAMES_TEST_ORIGIN;process.env.GAMES_TEST_ORIGIN=site.origin;
 let pair;
 try{
  pair=await openOnlinePair({latency:200,jitter:10,levelFor:()=>structuredClone(level),quality:'low'});
  const {host,guest}=pair;
  for(const b of [host,guest])await b.evaluate(`(()=>{
   window.__draws=[];window.__trustedActions=[];
   addEventListener('keydown',e=>{if(e.code==='KeyE'&&e.isTrusted&&!e.repeat)__trustedActions.push(performance.now())},true);
   window.__rescueDraw=(state,group,size)=>{
    const box=state.objects.find(o=>o.id==='box'),enemy=state.enemies.find(e=>e.id==='target');if(!box||!enemy)return;
    const mesh=group.getObjectByName('object:box');
    __draws.push({at:performance.now(),phase:view.dataset.phase,time:state.time,box:{x:box.x,y:box.y,active:box.active,heldBy:box.heldBy,thrown:box.thrown},enemy:{x:enemy.x,alive:enemy.alive},mesh:mesh?{x:mesh.position.x,y:mesh.position.y,visible:mesh.visible}:null,size:{x:size.x,y:size.y}});
    if(__draws.length>1500)__draws.shift();
   };
  })()`);
  await createRoom(pair);
  await key(host,'KeyE');await key(host,'KeyE',false);
  await wait(host,'window.__draws.at(-1)?.box.heldBy==="p1"');
  for(const b of [host,guest])await wait(b,'JSON.parse(view.dataset.positions)[0].carrying?.id==="box"');
  await sleep(250);await host.evaluate('__draws=[];void 0');
  await key(host,'KeyE');await key(host,'KeyE',false);
  await wait(host,'window.__draws.some(d=>d.box.thrown&&!d.box.heldBy)');
  await wait(host,'JSON.parse(view.dataset.physics).enemies.find(e=>e.id==="target").alive===false');
  await sleep(250);
  const rows=await host.evaluate('__draws'),flying=rows.filter(r=>r.box.active&&r.box.thrown&&!r.box.heldBy);
  assert.ok(flying.length>=2,'real flying draw samples');
  let maxBackwards=0;for(let i=1;i<flying.length;i++)maxBackwards=Math.max(maxBackwards,flying[i-1].box.x-flying[i].box.x);
  const evidence={maxBackwards,draws:rows,actions:await host.evaluate('__trustedActions'),states:await Promise.all([host,guest].map(snapshot)),events:pair.traffic.map(p=>({slot:p.slot,events:[...p.events.values()].filter(e=>['pickup','throw','hit'].includes(e.type))}))};
  await mkdir('/tmp/rescue-online-collision',{recursive:true});await writeFile('/tmp/rescue-online-collision/native-collision.json',JSON.stringify(evidence,null,2));
  console.log(JSON.stringify({maxBackwards,flyingDraws:flying.length,actions:evidence.actions.length,events:evidence.events}));
  assert.ok(maxBackwards<.2,`acknowledgement visibly rewound flying crate ${maxBackwards} units`);
  assert.ok(!rows.slice(rows.findIndex(r=>r.box.thrown)).some(r=>r.box.heldBy),'one throw must not return to an overhead carry');
  assert.ok(!rows.some(r=>!r.enemy.alive&&r.box.active),'impact consumes the real crate when the visible monster dies');
  assert.ok(rows.some(r=>!r.enemy.alive&&!r.mesh),'actual draw removes the spent crate mesh');
  for(const peer of pair.traffic.filter(p=>p.socket.readyState===1))assert.equal([...peer.events.values()].filter(e=>e.type==='throw').length,1);
  assert.equal(evidence.actions.length,2,'exactly two trusted presses: pickup and throw');
  for(const b of [host,guest]){
   await wait(b,'Number.isFinite(JSON.parse(view.dataset.network).rtt)');
   const badge=await b.evaluate(`(()=>{const e=document.querySelector('#online-latency');if(!e)return null;const r=e.getBoundingClientRect();return{text:e.textContent,width:r.width,height:r.height,font:Number.parseFloat(getComputedStyle(e).fontSize),rtt:JSON.parse(view.dataset.network).rtt}})()`);
   assert.ok(badge&&badge.width>0&&badge.height>0&&badge.font>=12,'latency remains readable while playing');
   assert.match(badge.text,new RegExp(Math.round(badge.rtt)+'\\s*ms'));
   assert.ok(badge.rtt>=150,'badge shows actual delayed WS measurement');assert.deepEqual(b.errors,[]);
  }
  await shot(host,'collision-and-latency-host');await shot(guest,'collision-and-latency-guest');
  await click(host,'#pause');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');await click(host,'#online-leave');for(const b of [host,guest])await wait(b,'view.dataset.phase==="home"');
 }finally{await pair?.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous;await site.close();}
});
