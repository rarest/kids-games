import test from 'node:test';
import assert from 'node:assert/strict';
import {openOnlinePair,createRoom,key,sleep,wait,snapshot} from './rescue-online-harness.mjs';
import {instrumentedSite} from './rescue-render-observer-harness.mjs';

const level={id:'0',name:'motion regression',theme:'street',width:100,height:12,
 spawn:{x:20,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],
 objects:[],enemies:[],hazards:[],pickups:[],decor:[],checkpoints:[],boss:null,exit:{x:98,y:1}};

test('350ms RTT direction reversals remain continuous in both actual browser draws',{timeout:120000},async()=>{
 const site=await instrumentedSite(),previous=process.env.GAMES_TEST_ORIGIN;
 process.env.GAMES_TEST_ORIGIN=site.origin;
 let pair;
 try{
  pair=await openOnlinePair({latency:350,jitter:25,levelFor:()=>structuredClone(level),quality:'low'});
  const {host,guest}=pair;
  await createRoom(pair);await sleep(700);
  for(const b of [host,guest])await b.evaluate(`(()=>{
   window.__motion=[];window.__firstMotion=null;window.__motionKey=null;
   addEventListener('keydown',e=>{if(e.isTrusted&&!e.repeat&&e.code==='KeyD'&&!__motionKey){
    const slot=JSON.parse(view.dataset.network).slot;
    __motionKey={at:e.timeStamp,x:JSON.parse(view.dataset.renderPositions)[slot].x,slot};
   }},true);
   window.__rescueDraw=state=>{
    const at=performance.now();
    __motion.push({at,x:state.players.map(p=>p.x)});
    if(__motionKey&&__firstMotion===null&&state.players[__motionKey.slot].x>__motionKey.x+.01)__firstMotion=at-__motionKey.at;
   };
  })()`);
  for(let i=0;i<8;i++){
   const code=i%2?'KeyA':'KeyD';
   for(const b of [host,guest])await key(b,code);
   await sleep(350);
   for(const b of [host,guest])await key(b,code,false);
  }
  await sleep(900);
  const results=[];
  for(const b of [host,guest]){
   await wait(b,'window.__firstMotion!==null');
   const {rows,response}=await b.evaluate('({rows:__motion,response:__firstMotion})');
   assert.ok(rows.length>30,'actual scene draws were observed');
   assert.ok(response>=300&&response<750,`confirmed native input waited ${response}ms for its first draw`);
   let maxSpeed=0;
   for(let i=1;i<rows.length;i++){
    const seconds=(rows[i].at-rows[i-1].at)/1000;
    if(seconds<=0)continue;
    for(let slot=0;slot<2;slot++){
     const distance=Math.abs(rows[i].x[slot]-rows[i-1].x[slot]);
     maxSpeed=Math.max(maxSpeed,distance/seconds);
     assert.ok(distance<=Math.max(.4,45*seconds),`slot ${slot} jumped ${distance} units between adjacent draws (${seconds}s)`);
    }
   }
   const s=await snapshot(b);
   assert.equal(s.network.room.mode,'playing');assert.deepEqual(b.errors,[]);
   results.push({responseMs:response,draws:rows.length,maxSpeed,rtt:s.network.rtt,positions:s.renderPositions});
  }
  for(let slot=0;slot<2;slot++)assert.ok(Math.abs(results[0].positions[slot].x-results[1].positions[slot].x)<.12,'both views settle on the same position');
  console.log('native 350ms motion',JSON.stringify(results));
 }finally{
  await pair?.close();
  if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous;
  await site.close();
 }
});
