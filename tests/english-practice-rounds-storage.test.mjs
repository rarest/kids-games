import test from 'node:test';
import assert from 'node:assert/strict';
import * as store from '../english/page-practice-progress.js';

test('a child resume cursor survives save and rejects another page or out-of-range round',()=>{
 assert.equal(typeof store.recordPracticeCursor,'function');
 const state=store.loadPractice(null);
 store.recordPractice(state,'p3-word-0-listening',true);
 store.recordPracticeCursor(state,3,{questionId:'p3-word-0-meaning',start:0,completed:false});
 const entries=new Map();store.savePractice({setItem:(key,value)=>entries.set(key,value)},state);
 const restored=store.loadPractice(entries.get(store.PRACTICE_KEY));
 assert.deepEqual(restored.cursors['3'],{questionId:'p3-word-0-meaning',start:0,completed:false});
 assert.deepEqual(restored.answers,state.answers);
 for(const cursor of [{questionId:'p4-word-0-listening',start:0,completed:false},{questionId:'p3-word-0-meaning',start:10000,completed:false},{questionId:'p3-word-4-listening',start:0,completed:false},{questionId:'p3-word-0-meaning',start:-1,completed:false},{questionId:'p3-word-0-meaning',start:0,completed:'true'},{questionId:'p3-word-0-meaning',start:0,completed:true}]){
  assert.equal(store.loadPractice({version:1,answers:{},cursors:{3:cursor}}).cursors,undefined);
 }
 assert.equal(store.recordPracticeCursor(null,3,{}),null);
});
