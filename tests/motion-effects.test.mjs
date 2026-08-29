import test from 'node:test';
import assert from 'node:assert/strict';
import { activeTrails, createMotionState, grassSwayAt, recordStep, skinTrailStyle } from '../maze/motion-effects.js';

test('step wind affects only nearby recent grass and trails expire at three seconds',()=>{
  const state=createMotionState();
  recordStep(state,{from:{x:2,y:2},to:{x:3,y:2},skinId:'red',now:1000});
  assert.ok(grassSwayAt({x:3,y:3},state,1100).amount>.2);
  assert.ok(grassSwayAt({x:10,y:10},state,1100).amount<.08);
  assert.equal(activeTrails(state,3999).length,1);
  assert.equal(activeTrails(state,4001).length,0);
});

test('motion state caps history and trail particles while pruning expired records',()=>{
  const state=createMotionState();
  for(let index=0;index<30;index++)recordStep(state,{from:{x:index,y:0},to:{x:index+1,y:0},skinId:'red',now:index});
  assert.equal(state.steps.length,20);
  assert.ok(state.trails.length<=72);
  activeTrails(state,4001);
  assert.equal(state.steps.length,0);
  assert.equal(state.trails.length,0);
});

test('hidden skins receive moonlit effects while ordinary skins keep colored grains',()=>{
  assert.deepEqual(skinTrailStyle('blue').stars,false);
  assert.equal(skinTrailStyle('silver').moons,true);
  assert.equal(skinTrailStyle('gold').stars,true);
  assert.equal(skinTrailStyle('iridescent').rainbow,true);
  assert.deepEqual(skinTrailStyle('red').particles,'grains');
});
