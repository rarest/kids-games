import test from 'node:test';
import assert from 'node:assert/strict';
import {DIFFICULTIES,getDifficulty,ordinaryValueCap} from '../merge4096/difficulty.js';

test('three modes have distinct pacing and rewards',()=>{
  assert.deepEqual(Object.keys(DIFFICULTIES),['easy','joy','challenge']);
  assert.deepEqual(getDifficulty('joy'),{id:'joy',name:'欢乐',luckyEvery:25,winReward:300,lossReward:100,pairBias:.45});
  assert.equal(getDifficulty('missing').id,'joy');
  assert.ok(DIFFICULTIES.easy.luckyEvery<DIFFICULTIES.joy.luckyEvery);
  assert.ok(DIFFICULTIES.challenge.winReward>DIFFICULTIES.joy.winReward);
});

test('ordinary cards stay at least four times below the round maximum',()=>{
  assert.equal(ordinaryValueCap(0),8);
  assert.equal(ordinaryValueCap(128),32);
  assert.equal(ordinaryValueCap(4096),512);
});
