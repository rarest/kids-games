import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../racing/core.js';
const members=[{id:0,name:'甲',car:'apex',skin:'aurora'},{id:3,name:'乙',car:'rally',skin:'silver'}];
function online(list=members){assert.equal(typeof core.newOnlineRace,'function');return core.newOnlineRace('tour',list);}
test('online starts with stable player slots and fills eleven cars with AI',()=>{
 const race=online();assert.equal(race.online,true);assert.equal(race.cars.length,11);assert.equal(new Set(race.cars.map(c=>c.id)).size,11);
 assert.deepEqual(race.cars.filter(c=>c.human).map(c=>[c.id,c.name,c.model.id,c.skin]),[[0,'甲','apex','aurora'],[3,'乙','rally','silver']]);
 assert.equal(race.laps,2);assert.equal(race.countdown,3);
});
test('each human reads only its own slot input while the legacy input still drives the single player',()=>{
 const race=online();race.countdown=0;race.hazards=[];race.traffic=[];
 for(let i=0;i<20;i++)core.stepRace(race,{0:{throttle:true,steer:-1,boost:true},3:{throttle:false,steer:1}},1/60);
 assert.ok(race.cars[0].speed>0);assert.equal(race.cars[3].speed,0);assert.ok(race.cars[0].nitro<100);assert.equal(race.cars[3].nitro,100);
 assert.ok(race.cars[3].offset>0);assert.equal(race.cars[3].steer,1);
 const solo=core.newRace('tour','apex');solo.countdown=0;core.stepRace(solo,{throttle:true,steer:1},1/60);assert.ok(solo.cars[0].speed>0);assert.equal(solo.cars[0].steer,1);
});
test('online cannot finish while any human is still racing even if slot zero and the podium have finished',()=>{
 const race=online();race.countdown=0;race.hazards=[];race.traffic=[];
 for(const [id,place]of [[0,1],[1,2],[2,3]]){race.cars[id].finished=place;race.cars[id].finishTime=place;}
 core.stepRace(race,{},1/60);assert.equal(race.status,'racing');
 race.cars[3].s=race.track.length*2-.01;race.cars[3].speed=40;core.stepRace(race,{3:{throttle:true}},1/60);
 assert.equal(race.status,'finished');assert.equal(race.cars[3].finished,4);
});
test('human same-frame crossings retain exact order and a disconnected AI conversion keeps its identity',()=>{
 const race=online();race.countdown=0;race.hazards=[];race.traffic=[];const finish=race.track.length*2;
 race.cars.forEach((c,i)=>{c.s=finish-300-i*10;c.offset=(i%3-1)*5;});
 race.cars[0].s=finish-.5;race.cars[0].speed=40;race.cars[3].s=finish-.05;race.cars[3].speed=40;race.cars[3].offset=6;
 core.stepRace(race,{0:{throttle:true},3:{throttle:true}},.05);assert.equal(race.cars[3].finished,1);assert.equal(race.cars[0].finished,2);assert.equal(race.status,'finished');
 const next=online();next.countdown=0;next.hazards=[];next.cars[3].human=false;core.stepRace(next,{},1/60);assert.ok(next.cars[3].speed>0);assert.equal(next.cars[3].id,3);assert.equal(next.cars[3].name,'乙');
});
test('invalid membership is rejected and online podium helper cannot advance an unfinished human',()=>{
 assert.throws(()=>online([members[0]]));assert.throws(()=>online([members[0],members[0]]));assert.throws(()=>online([{...members[0],id:8},members[1]]));
 const race=online();race.cars[0].finished=1;const before=race.time;core.completePodium(race);assert.equal(race.time,before);
});
