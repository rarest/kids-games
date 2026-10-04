import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {instrumentedSite} from './rescue-render-observer-harness.mjs';
import {openOnlinePair,createRoom,key,click,wait,sleep} from './rescue-online-harness.mjs';

const level={id:'0',name:'shared-world native regression',theme:'street',width:40,height:12,spawn:{x:5,y:1},platforms:[{id:'floor',x:0,y:1,w:40,h:.65},{id:'lift',kind:'moving',x:2,y:4,w:6,h:.5,axis:'x',range:2,speed:1}],objects:[],enemies:[{id:'target',kind:'mouse',x:15,y:1,min:12,max:20,speed:2}],hazards:[],pickups:[],decor:[],boss:null,checkpoints:[],exit:{x:38,y:1}};
test('two actual WebGL scenes share moving bodies at unequal measured RTT',{timeout:120000},async()=>{
 const site=await instrumentedSite(),previous=process.env.GAMES_TEST_ORIGIN;process.env.GAMES_TEST_ORIGIN=site.origin;let pair;
 try{
  pair=await openOnlinePair({peerLatencies:[100,300],levelFor:()=>structuredClone(level),quality:'low'});
  for(const b of [pair.host,pair.guest])await b.evaluate(`(()=>{window.__draws=[];window.__rescueDraw=(s,g)=>{const enemy=g.getObjectByName('enemy:target'),lift=g.getObjectByName('platform:lift');if(enemy&&lift&&view.dataset.phase==='playing')__draws.push({at:Date.now(),time:s.time,enemy:enemy.position.x,lift:lift.position.x});if(__draws.length>1000)__draws.shift();};})()`);
  await createRoom(pair);await sleep(600);
  await key(pair.host,'KeyD');await key(pair.guest,'KeyD');await key(pair.guest,'Space');
  await sleep(350);await key(pair.host,'KeyD',false);await key(pair.guest,'KeyD',false);await key(pair.guest,'Space',false);
  await sleep(1500);
  const draws=await Promise.all([pair.host,pair.guest].map(b=>b.evaluate('__draws'))),matches=[];
  // Unequal transport delays show different confirmed historical times. Compare
  // the same simulation time, rather than requiring speculative wall-time parity.
  for(const a of draws[0].slice(5)){const b=draws[1].reduce((best,row)=>!best||Math.abs(row.time-a.time)<Math.abs(best.time-a.time)?row:best,null);if(b&&Math.abs(b.time-a.time)<.005)matches.push({at:a.at,dt:Math.abs(b.at-a.at),time:Math.abs(a.time-b.time),enemy:Math.abs(a.enemy-b.enemy),lift:Math.abs(a.lift-b.lift)});}
  const evidence={draws,matches,trace:pair.networkTrace(),inputTiming:pair.inputTiming(),network:await Promise.all([pair.host,pair.guest].map(b=>b.evaluate('JSON.parse(view.dataset.network)')))};
  await mkdir('/tmp/rescue-world-sync',{recursive:true});await writeFile('/tmp/rescue-world-sync/native-shared-world.json',JSON.stringify(evidence,null,2));
  assert.ok(matches.length>=15,'both completed renders must have matching confirmed simulation samples');
  const max={time:Math.max(...matches.map(m=>m.time)),enemy:Math.max(...matches.map(m=>m.enemy)),lift:Math.max(...matches.map(m=>m.lift))};
  console.log(JSON.stringify({matches:matches.length,max,rtt:evidence.network.map(n=>n.rtt)}));
  assert.ok(max.time<.005,`different rendered world times ${max.time}`);assert.ok(max.enemy<.06,`different enemy meshes ${max.enemy}`);assert.ok(max.lift<.06,`different moving platform meshes ${max.lift}`);
  assert.ok(evidence.network[1].rtt-evidence.network[0].rtt>100,'actual sockets have unequal latency');
  for(const b of [pair.host,pair.guest])assert.deepEqual(b.errors,[]);
  await click(pair.host,'#pause');for(const b of [pair.host,pair.guest])await wait(b,'view.dataset.phase==="paused"');await click(pair.host,'#online-leave');for(const b of [pair.host,pair.guest])await wait(b,'view.dataset.phase==="home"');
 }finally{await pair?.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous;await site.close();}
});
