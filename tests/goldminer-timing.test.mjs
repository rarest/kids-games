import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../goldminer/game-core.js';
test('slow frames retain elapsed movement with collision-safe substeps', () => {
  assert.equal(typeof core.advanceSimulation, 'function');
  let elapsed=0, largest=0;
  for(let frame=0;frame<15;frame++) core.advanceSimulation(1/15, dt=>{elapsed+=dt;largest=Math.max(largest,dt)});
  assert.ok(Math.abs(elapsed-1)<1e-9);
  assert.ok(largest<=1/60);
});
test('collision keeps inclusive edges and prevents duplicate claims', () => {
  const a={x:10,y:20,radius:5,caught:false},b={...a};
  assert.equal(core.claimTreasure([a,b],{x:24,y:20},9),a);
  assert.equal(core.claimTreasure([a,b],{x:24,y:20},9),b);
  assert.equal(core.claimTreasure([a,b],{x:24,y:20},9),null);
});
test('long main-thread stalls cannot trigger unbounded catch-up work', () => {
  let steps=0,elapsed=0;
  core.advanceSimulation(60, dt=>{steps++;elapsed+=dt});
  assert.ok(steps<=60);
  assert.ok(Math.abs(elapsed-1)<1e-9);
});
