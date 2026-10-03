import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, finishBonus } from '../rescue/core.js';
import { LEVELS } from '../rescue/levels.js';

const codec = await import('../rescue/net-codec.js').catch(() => ({}));
const metadata = {epoch:1,tick:9,acks:[5,7],inputs:[{},{}],room:{code:'ABC123',host:0,mode:'playing',members:[]}};
function roundtrip(state, previous) {
  assert.equal(typeof codec.encodeFrame, 'function', 'encodeFrame must exist');
  assert.equal(typeof codec.decodeFrame, 'function', 'decodeFrame must exist');
  const packet = JSON.parse(JSON.stringify(codec.encodeFrame(state,{...metadata,includeStage:!previous || previous.level.id!==state.level.id})));
  const decoded = codec.decodeFrame(packet,previous);
  assert.deepEqual(decoded,JSON.parse(JSON.stringify(state)));
  assert.equal(packet.areaId,state.areaLevel.id);
  assert.equal(packet.levelId,state.level.id);
  return decoded;
}

test('lossless state codec retains static references across independent full dynamic snapshots',()=>{
  const state=createGame(LEVELS[0],{players:2});
  let prior=roundtrip(state);
  for(let t=0;t<90;t++) {
    stepGame(state,[{move:1,jump:t===12,action:t===0},{move:-1}],1/60);
    if(t%3===0){const next=roundtrip(state,prior);assert.equal(next.level,prior.level);assert.equal(next.areaLevel,prior.areaLevel);prior=next;}
  }
  const late=codec.encodeFrame(state,{...metadata,includeStage:false});
  assert.throws(()=>codec.decodeFrame(late),/stage|关卡/i);
});

test('all eight Boss dynamic objects and moving platforms survive codec and subsequent real core step',()=>{
  let count=0;
  for(const level of LEVELS.filter(l=>l.boss)) {
    count++;
    const state=createGame(level,{players:2});
    state.players[0].x=level.boss.x-3;state.players[0].y=level.boss.y;
    for(let i=0;i<170;i++)stepGame(state,[{move:0},{move:0}],1/60);
    state.boss.contactRegions??=[{x:3,y:2,w:1,h:2}];
    state.boss.weakpoint??={x:4,y:2,w:.5,h:.6};
    const decoded=roundtrip(state);
    stepGame(state,[{},{}],1/60);stepGame(decoded,[{},{}],1/60);
    assert.deepEqual(decoded,state);
  }
  assert.equal(count,8);
});

test('held player, thrown links and area identity through bonus transition roundtrip',()=>{
  const level={...LEVELS[0],objects:[],enemies:[],hazards:[],pickups:[],boss:null};
  const state=createGame(level,{players:2});
  stepGame(state,[{action:true},{}],1/60);
  assert.deepEqual(state.players[0].carrying,{type:'player',id:'p2'});
  let prior=roundtrip(state);
  stepGame(state,[{},{}],1/60);stepGame(state,[{action:true,up:true},{}],1/60);
  assert.ok(state.players[1].vy>10);
  prior=roundtrip(state,prior);
  state.players[0].x=state.level.exit.x;state.players[0].y=state.level.exit.y;
  stepGame(state,[{},{}],1/60);assert.equal(state.status,'bonus');
  const bonus=roundtrip(state,prior);assert.equal(bonus.areaLevel,prior.areaLevel);
  finishBonus(state);roundtrip(state,bonus);
});

test('codec supports a real single-player state and preserves ongoing run identity for event deduplication',()=>{
  roundtrip(createGame(LEVELS[0]));
  const state=createGame(LEVELS[0],{players:2});
  const frame=(run,epoch)=>JSON.parse(JSON.stringify(codec.encodeFrame(state,{...metadata,epoch,room:{...metadata.room,run},includeStage:true})));
  let decoded=codec.decodeFrame(frame(1,1));
  const original=decoded,level=decoded.level;
  stepGame(state,[{jump:true},{}],1/60);
  decoded=codec.decodeFrame(frame(1,1),decoded);
  assert.equal(decoded,original);
  const id=decoded.events.find(e=>e.type==='jump').id;
  decoded=codec.decodeFrame(frame(1,2),decoded);
  assert.equal(decoded,original);assert.equal(decoded.level,level);
  assert.equal(decoded.events.filter(e=>e.id===id).length,1);
  decoded=codec.decodeFrame(frame(2,3),decoded);
  assert.notEqual(decoded,original);assert.equal(decoded.level,level);
});
