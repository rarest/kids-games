import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefaultSave,loadSave,saveGame,migrateSave,STORAGE_KEY} from '../merge4096/save.js';

const memoryStorage = initial => {
  const values=new Map(Object.entries(initial&&typeof initial==='object'?initial:{[STORAGE_KEY]:initial}));
  return {getItem:key=>values.get(key)??null,setItem:(key,next)=>values.set(key,next),value:key=>values.get(key)};
};

test('new player starts zeroed except starter gifts', () => {
  const save = createDefaultSave();
  assert.deepEqual(save.profile,{coins:500,bombs:0,candles:3,best:0,lastResult:0,wins:0,musicOn:true,selectedDifficulty:'joy',records:{easy:{best:0,wins:0},joy:{best:0,wins:0},challenge:{best:0,wins:0}}});
  assert.equal(save.version,2);
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

test('v1 save migrates valuables and records but closes its old round',()=>{
  const old={version:1,profile:{coins:720,bombs:2,candles:4,best:512,lastResult:256,wins:3,musicOn:false},currentGame:{deck:[],columns:[[],[],[],[],[]]}};
  const migrated=migrateSave(old);
  assert.equal(migrated.version,2);
  assert.equal(migrated.profile.coins,720);
  assert.deepEqual(migrated.profile.records.joy,{best:512,wins:3});
  assert.equal(migrated.profile.lastResult,256);
  assert.equal(migrated.currentGame,null);
});

test('load migrates the legacy key into v2 storage',()=>{
  const old={version:1,profile:{coins:600,bombs:1,candles:2,best:128,lastResult:64,wins:1,musicOn:true},currentGame:null};
  const storage=memoryStorage({'merge4096-save-v1':JSON.stringify(old)});
  assert.equal(loadSave(storage).profile.records.joy.best,128);
  assert.ok(storage.value(STORAGE_KEY));
});
