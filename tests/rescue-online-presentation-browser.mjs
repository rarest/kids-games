import test from 'node:test';
import assert from 'node:assert/strict';
import {openOnlinePair,createRoom,key,wait,sleep,snapshot,shot} from './rescue-online-harness.mjs';

const level={id:'0',name:'online camera regression',theme:'street',width:100,height:12,spawn:{x:30,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],decor:[],boss:null,checkpoints:[],exit:{x:98,y:1}};
test('native online cameras retain character scale when partners separate at 310ms RTT',{timeout:90000},async()=>{
 const pair=await openOnlinePair({latency:310,jitter:20,quality:'low',levelFor:()=>structuredClone(level)});
 try{
  await createRoom(pair);await sleep(700);
  await key(pair.host,'KeyD');await key(pair.guest,'KeyA');
  await sleep(2300);await key(pair.host,'KeyD',false);await key(pair.guest,'KeyA',false);
  await sleep(900);
  const states=await Promise.all([pair.host,pair.guest].map(snapshot));
  assert.ok(Math.abs(states[0].positions[0].x-states[0].positions[1].x)>20,'native independent controls separate the players');
  for(const [slot,b] of [pair.host,pair.guest].entries()){
   const graphics=JSON.parse(states[slot].graphics),own=states[slot].renderPositions[slot];
   assert.ok(graphics.camera.width<16,`own camera stays readable: ${graphics.camera.width}`);
   assert.ok(Math.abs(graphics.camera.x-own.x)<2,'camera follows its own player');
   assert.equal(await b.evaluate('document.querySelector("#teammate-direction").hidden'),false);
   assert.equal(await b.evaluate('document.querySelector("#teammate-direction").textContent'),slot===0?'← 搭档':'搭档 →');
   assert.equal(await b.evaluate('document.querySelector("#teammate-direction").getAttribute("aria-label")'),slot===0?'搭档在左边':'搭档在右边');
   assert.deepEqual(b.errors,[]);
   await shot(b,`own-camera-${slot}`);
  }
  console.log(JSON.stringify({separation:Math.abs(states[0].positions[0].x-states[0].positions[1].x),cameraWidths:states.map(s=>JSON.parse(s.graphics).camera.width),rtt:states.map(s=>s.network.rtt)}));
 }finally{await pair.close();}
});
