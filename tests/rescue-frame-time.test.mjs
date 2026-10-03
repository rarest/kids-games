import test from 'node:test';
import assert from 'node:assert/strict';
import {frameDurations} from '../rescue/frame-time.js';
import {createPrediction} from '../rescue/net-prediction.js';
import {createGame} from '../rescue/core.js';
import {LEVELS} from '../rescue/levels.js';

for (const {name,now,last,seconds,commands} of [
  {name:'first frame',now:100,last:0,seconds:1/60,commands:1},
  {name:'normal 60Hz frame',now:1000+1000/60,last:1000,seconds:1/60,commands:1},
  {name:'50ms frame',now:1050,last:1000,seconds:.05,commands:3},
  {name:'500ms frame',now:1500,last:1000,seconds:.5,commands:5},
]) {
  test(`${name} retains local cap, passes elapsed online and obeys prediction budget`,()=>{
    const duration=frameDurations(now,last);
    const prediction=createPrediction({slot:0,clock:{now:()=>0}});
    prediction.receive(createGame(LEVELS[0],{players:2}),{epoch:1,ack:0,inputs:[{},{}]});
    const batch=prediction.advance({move:1,jump:true},duration.online).commands;
    assert.equal(batch.length,commands);
    assert.ok(Math.abs(duration.online-seconds)<1e-9);
    assert.ok(Math.abs(duration.local-Math.min(1/30,seconds))<1e-9);
    assert.equal(batch.filter(command=>command.input.jump).length,1);
  });
}
