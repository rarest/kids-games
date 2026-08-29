import test from 'node:test';
import assert from 'node:assert/strict';
import { gameEventSounds } from '../maze/sound-events.js';

test('ordinary successful movement layers footstep before its action sound',()=>{
  assert.deepEqual(gameEventSounds({type:'step'}),['footstep']);
  assert.deepEqual(gameEventSounds({type:'key'}),['footstep','key']);
  assert.deepEqual(gameEventSounds({type:'coin'}),['footstep','coin']);
  assert.deepEqual(gameEventSounds({type:'complete'}),['footstep','door-open']);
});

test('hook movement never emits footstep but preserves collected and completion actions',()=>{
  assert.deepEqual(gameEventSounds({type:'hook'}),['hook']);
  assert.deepEqual(gameEventSounds({type:'hook',key:'1,2'}),['hook','key']);
  assert.deepEqual(gameEventSounds({type:'hook',coin:'reward-1:2,3'}),['hook','coin']);
  assert.deepEqual(gameEventSounds({type:'hook',complete:true}),['hook','door-open']);
  assert.equal(gameEventSounds({type:'hook',coin:'reward-1:2,3'}).includes('footstep'),false);
});

test('failed and tool actions retain their independent sounds',()=>{
  assert.deepEqual(gameEventSounds({type:'bump'}),['bump']);
  assert.deepEqual(gameEventSounds({type:'door-locked'}),['door-locked']);
  assert.deepEqual(gameEventSounds({type:'dynamite'}),['explosion']);
});
