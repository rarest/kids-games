import test from 'node:test';
import assert from 'node:assert/strict';
import {SKINS,createProfile,buySkin,equipSkin,settleRun,collectReward} from '../territory/profile.js';
import {createGame,finishRun} from '../territory/core.js';

test('sixty skins have twenty per tier and distinct visible patterns or effects',()=>{
  assert.equal(SKINS.length,60);assert.equal(new Set(SKINS.map(s=>s.id)).size,60);
  for(const tier of ['normal','fine','hidden'])assert.equal(SKINS.filter(s=>s.tier===tier).length,20);
  assert.equal(new Set(SKINS.filter(s=>s.tier==='normal').map(s=>s.color)).size,20);
  assert.equal(new Set(SKINS.filter(s=>s.tier==='fine').map(s=>s.pattern)).size,20);
  assert.equal(new Set(SKINS.filter(s=>s.tier==='hidden').map(s=>s.effect)).size,20);
  assert.deepEqual(SKINS.filter(s=>s.tier==='hidden').map(s=>s.winsRequired),Array.from({length:20},(_,i)=>i+1));
});
test('a new player owns and wears the free red skin with zero coins',()=>{
  const p=createProfile();assert.equal(p.coins,0);assert.equal(p.wins,0);
  assert.deepEqual(p.owned,['red']);assert.equal(p.selected,'red');
  assert.equal(SKINS.find(s=>s.id==='red').price,0);
});
test('locked hidden skins cannot be bought even with sufficient money',()=>{
  const p=createProfile({coins:1000}),s=SKINS.find(s=>s.tier==='hidden');
  assert.equal(buySkin(p,s.id),false);assert.equal(p.coins,1000);
  p.wins=100;assert.equal(buySkin(p,s.id),false);assert.equal(p.coins,1000);
});
test('purchases deduct once and equipping requires ownership',()=>{
  const p=createProfile({coins:80}),normal=SKINS.find(s=>s.tier==='normal'&&s.price),fine=SKINS.find(s=>s.tier==='fine');
  assert.equal(equipSkin(p,fine.id),false);assert.equal(buySkin(p,normal.id),true);
  assert.equal(p.coins,60);assert.equal(buySkin(p,normal.id),false);assert.equal(p.coins,60);
  assert.equal(equipSkin(p,normal.id),true);assert.equal(p.selected,normal.id);
  assert.equal(buySkin(p,fine.id),true);assert.equal(p.coins,0);
  assert.equal(buySkin(p,SKINS[2].id),false);assert.equal(buySkin(p,'invalid'),false);
});
test('damaged storage is normalized without inventing ownership or currency',()=>{
  for(const raw of [null,'bad',[],42])assert.deepEqual(createProfile(raw),createProfile());
  const p=createProfile({coins:-8,wins:NaN,owned:['bad','red','red'],selected:'bad',settled:[3,'ok','ok']});
  assert.equal(p.coins,0);assert.equal(p.wins,0);assert.deepEqual(p.owned,['red']);
  assert.equal(p.selected,'red');assert.deepEqual(p.settled,['ok']);
  const q=createProfile({coins:Infinity,wins:2.9,owned:['red',SKINS[1].id],selected:SKINS[1].id});
  assert.equal(q.coins,0);assert.equal(q.wins,2);assert.equal(q.selected,SKINS[1].id);
});
test('only ended runs settle peak coverage once, including after a storage round trip',()=>{
  const g=createGame({seed:1,bots:0}),p=createProfile();g.peak=.428;
  assert.equal(settleRun(p,g),0);assert.equal(p.coins,0);finishRun(g);
  const land=JSON.stringify(g.territories);assert.equal(settleRun(p,g),42);assert.equal(p.coins,42);
  assert.equal(JSON.stringify(g.territories),land);assert.equal(settleRun(p,g),0);
  const restored=createProfile(JSON.parse(JSON.stringify(p)));
  assert.equal(settleRun(restored,JSON.parse(JSON.stringify(g))),0);assert.equal(restored.coins,42);
});
test('a victory awards 150 coins and one win; computer victories do not award a player win',()=>{
  const p=createProfile(),g=createGame();g.mode='over';g.winner=0;g.peak=1;
  assert.equal(settleRun(p,g),150);assert.equal(p.wins,1);assert.equal(settleRun(p,g),0);
  const h=createGame();assert.notEqual(g.runId,h.runId);h.mode='over';h.winner=1;h.peak=.2;
  assert.equal(settleRun(p,h),20);assert.equal(p.wins,1);assert.equal(p.coins,170);
  assert.equal(settleRun(p,{mode:'over',runId:'',peak:1,winner:0}),0);
  assert.equal(settleRun(p,{mode:'over',runId:'broken',peak:NaN,winner:0}),0);
});
