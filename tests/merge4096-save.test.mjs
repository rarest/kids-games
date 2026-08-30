import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefaultSave,loadSave,saveGame} from '../merge4096/save.js';

const memoryStorage = initial => {
  let value = initial;
  return {getItem:()=>value,setItem:(_key,next)=>{value=next},value:()=>value};
};

test('new player starts zeroed except starter gifts', () => {
  const save = createDefaultSave();
  assert.deepEqual(save.profile,{coins:500,bombs:0,candles:3,best:0,lastResult:0,wins:0,musicOn:true});
  assert.equal(save.currentGame,null);
});

test('invalid and inaccessible storage safely returns defaults', () => {
  assert.deepEqual(loadSave(memoryStorage('{bad json')),createDefaultSave());
  assert.deepEqual(loadSave({getItem(){throw new Error('blocked')}}),createDefaultSave());
});

test('save round trips a partial game', () => {
  const storage = memoryStorage(null);
  const save = createDefaultSave();
  save.profile.coins = 440;
  save.currentGame = {deck:[{kind:'lucky'}],drawIndex:1,pendingCard:{kind:'lucky'},columns:[[2,4],[],[],[],[]],roundMax:4,status:'playing',rewardClaimed:false,lastCombo:0};
  assert.equal(saveGame(storage,save),true);
  assert.deepEqual(loadSave(storage),save);
});

test('write failures return false', () => {
  assert.equal(saveGame({setItem(){throw new Error('blocked')}},createDefaultSave()),false);
});
