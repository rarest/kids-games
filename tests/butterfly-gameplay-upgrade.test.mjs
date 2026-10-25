import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),R=require('../butterfly/rules.js'),C=require('../butterfly/checkpoint.js');
function tick(s,seconds,input){for(let remaining=seconds;remaining>1e-8;remaining-=.02)R.tick(s,Math.min(.02,remaining),input);}
test('multiple collected flowers stay in one bag and one second banks the full batch',()=>{
 const s=R.create(1,{}, {target:9});s.grace=100;for(const f of s.flowers.slice(0,3)){Object.assign(s.player,{x:f.x,z:f.z});tick(s,1,{collect:true});}assert.equal(s.player.bag,3);assert.equal(s.nectar,0);assert.ok(s.player.surge>0,'three nearby-time flower harvests award a wind surge');Object.assign(s.player,{x:0,z:6});tick(s,.98,{deposit:true});assert.equal(s.nectar,0);tick(s,.02,{deposit:true});assert.equal(s.nectar,3);assert.equal(s.player.bag,0);
});
test('golden flowers exist away from houses and yield triple ordinary honey',()=>{
 const s=R.create(1,{}, {target:9});s.grace=100;const gold=s.flowers.find(f=>f.kind==='golden');assert.ok(gold);assert.ok(Math.hypot(gold.x,gold.z-6)>=14);Object.assign(s.player,{x:gold.x,z:gold.z});tick(s,1,{collect:true});assert.equal(s.player.bag,3);
});
test('simultaneous cooperative final batches credit only the received honey and preserve excess',()=>{
 const s=R.create(1,{}, {target:5,players:2});s.grace=100;for(const p of s.players)Object.assign(p,{x:p.home.x,z:p.home.z,bag:4});tick(s,1,{inputs:[{deposit:true},{deposit:true}]});assert.equal(s.mode,'won');assert.equal(s.nectar,5);assert.equal(s.players.reduce((sum,p)=>sum+p.nectar,0),5);assert.equal(s.players.reduce((sum,p)=>sum+p.bag,0),3);
});
test('old one-drop checkpoints restore and new multi-drop checkpoints survive round-trip',()=>{
 const old=C.capture(R.create(4));old.state.players[0].bag=1;delete old.state.players[0].lastCollectAt;delete old.state.players[0].streak;for(const f of old.state.flowers){delete f.kind;delete f.value;}const restored=C.restore(old,R);assert.equal(restored.player.bag,1);assert.equal(restored.player.streak,0);restored.player.bag=45;assert.equal(C.restore(C.capture(restored),R).player.bag,45);
});
