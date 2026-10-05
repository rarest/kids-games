import test from 'node:test';
import assert from 'node:assert/strict';
const progress=await import('../english/page-practice-progress.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const id='p2-word-0-meaning';
test('ever-correct state survives an incorrect retry while attempts keep accumulating',()=>{
 assert.equal(typeof progress.recordPractice,'function','practice progress module missing');
 const state=progress.loadPractice(null);
 assert.deepEqual(state,{version:1,answers:{}});
 assert.equal(progress.recordPractice(state,id,true),state);
 assert.deepEqual(state.answers[id],{attempts:1,correct:true,lastCorrect:true});
 progress.recordPractice(state,id,false);
 assert.deepEqual(state.answers[id],{attempts:2,correct:true,lastCorrect:false});
 progress.recordPractice(state,id,true);
 assert.deepEqual(state.answers[id],{attempts:3,correct:true,lastCorrect:true});
 progress.recordPractice(state,'__proto__',true);progress.recordPractice(state,'p2-word-999-meaning',true);progress.recordPractice(state,id,'true');
 assert.equal(Object.keys(state.answers).length,1);assert.equal(state.answers[id].attempts,3);
});
test('load rejects malformed counts, unknown source IDs, impossible latest results and unsupported versions',()=>{
 assert.equal(typeof progress.loadPractice,'function');
 const valid={version:1,answers:{[id]:{attempts:3,correct:true,lastCorrect:false},'p2-line-0-0-listening':{attempts:2,correct:true,lastCorrect:true}}};
 assert.deepEqual(progress.loadPractice(JSON.stringify(valid)),valid);
 for(const raw of [undefined,'{',[],{version:2,answers:valid.answers},null])assert.deepEqual(progress.loadPractice(raw),{version:1,answers:{}});
 for(const entry of [{attempts:-1,correct:false,lastCorrect:false},{attempts:1.5,correct:true,lastCorrect:true},{attempts:1,correct:2,lastCorrect:true},{attempts:1,correct:false,lastCorrect:true},{attempts:1,correct:true,lastCorrect:false},{attempts:1,correct:false,lastCorrect:'false'},{attempts:Infinity,correct:false,lastCorrect:false}])assert.deepEqual(progress.loadPractice({version:1,answers:{[id]:entry}}).answers,{});
 const source=JSON.stringify({version:1,answers:{...valid.answers,'p1-word-0-meaning':{attempts:1,correct:true,lastCorrect:true},'p2-word-0-order':{attempts:1,correct:true,lastCorrect:true},'__proto__':{attempts:1,correct:true,lastCorrect:true}}});
 assert.deepEqual(progress.loadPractice(source),valid);
 const loaded=progress.loadPractice(valid);loaded.answers[id].attempts=10;assert.equal(valid.answers[id].attempts,3);
});
test('save round-trips only practice state and storage failures leave session usable',()=>{
 assert.equal(progress.PRACTICE_KEY,'english-page-practice-v1');
 const stored=new Map(),storage={setItem(key,value){stored.set(key,value);}};
 const state=progress.loadPractice(null);progress.recordPractice(state,id,false);
 assert.equal(progress.savePractice(storage,state),true);
 assert.deepEqual(progress.loadPractice(stored.get(progress.PRACTICE_KEY)),state);
 assert.equal(progress.savePractice({setItem(){throw new Error('quota');}},state),false);
 assert.equal(progress.savePractice(null,state),false);
 progress.recordPractice(state,id,true);assert.deepEqual(state.answers[id],{attempts:2,correct:true,lastCorrect:true});
 assert.equal(stored.size,1);
});
