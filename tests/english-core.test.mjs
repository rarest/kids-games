import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,SKINS,Run,makeQuestions,loadSave,completeCard,buySkin} from '../english/core.js';
test('36 independent courses cover all four games and nine themes',()=>{
 assert.equal(LEVELS.length,36);assert.equal(new Set(LEVELS.map(x=>x.seed)).size,36);
 for(const mode of ['slide','parkour','bike','race'])assert.equal(LEVELS.filter(x=>x.mode===mode).length,9);
});
test('ten cards stop all race clocks and opponents; continue gives spaced play',()=>{
 const run=new Run(LEVELS.find(x=>x.mode==='race'));assert.equal(run.rivals.length,9);
 run.step(30,{steer:1});assert.equal(run.status,'question');assert.equal(run.card,0);
 const before=JSON.stringify(run);run.step(20,{steer:-1,jump:true});assert.equal(JSON.stringify(run),before);
 for(let i=0;i<10;i++){assert.equal(run.card,i);run.resumeCard();assert.equal(run.status,'playing');run.step(0.1,{});assert.equal(run.status,'playing');run.step(100,{});}
 assert.equal(run.status,'finished');assert.equal(run.completed,10);assert.ok(run.elapsed<150);
});
test('background pause and steering direction are consistent',()=>{
 const r=new Run(LEVELS[0]);r.step(.1,{steer:-1});assert.ok(r.lane<0);r.pause();const before=JSON.stringify(r);r.step(4,{steer:1});assert.equal(JSON.stringify(r),before);r.resume();r.step(.1,{steer:1});assert.ok(r.lane>=0);
});
test('question mix includes word, US IPA, sentence construction and grammar',()=>{
 const words={friend:{en:'friend',zh:'朋友',ipa:'/frɛnd/'},ear:{en:'ear',zh:'耳朵',ipa:'/ɪr/'},hand:{en:'hand',zh:'手',ipa:'/hænd/'},arm:{en:'arm',zh:'手臂',ipa:'/ɑrm/'},eye:{en:'eye',zh:'眼睛',ipa:'/aɪ/'},mouth:{en:'mouth',zh:'嘴',ipa:'/maʊθ/'}};
 const unit={id:'3s-u1',words:Object.keys(words),sentences:[{en:'I am your friend.',zh:'我是你的朋友。',tip:'I搭配am。'}],grammar:[{prompt:'I ___ your friend.',options:['am','is','are'],answer:'am',explanation:'I搭配am。'}]};
 const q=makeQuestions(unit,words,7);assert.equal(q.length,10);assert.deepEqual(q.map(x=>x.kind).sort(),['word','word','word','ipa','ipa','sentence','sentence','sentence','grammar','grammar'].sort());
 for(const x of q){assert.equal(x.unitId,unit.id);if(x.choices)assert.equal(x.choices.filter(c=>c===x.answer).length,1);assert.ok(x.explanation);}
});
test('each completed card awards 200 once and validated saves survive round trips',()=>{
 const save=loadSave(null);assert.equal(save.coins,0);assert.equal(completeCard(save,'run1:0'),true);assert.equal(save.coins,200);assert.equal(completeCard(save,'run1:0'),false);assert.equal(save.coins,200);
 const skin=SKINS.find(x=>x.price===150);assert.equal(buySkin(save,skin.id),true);assert.equal(save.coins,50);assert.equal(buySkin(save,skin.id),false);assert.equal(save.coins,50);
 const restored=loadSave(JSON.stringify(save));assert.equal(restored.coins,50);assert.ok(restored.owned.includes(skin.id));assert.equal(restored.skin,skin.id);assert.equal(completeCard(restored,'run1:0'),false);
 const corrupt=loadSave('{"coins":-20,"owned":["evil"],"skin":"evil","claimed":["x"]}');assert.equal(corrupt.coins,0);assert.deepEqual(corrupt.owned,['pearl']);assert.equal(corrupt.skin,'pearl');
});
test('33 bead skins use exactly requested tiers and prices',()=>{
 assert.equal(SKINS.length,33);assert.equal(new Set(SKINS.map(x=>x.id)).size,33);
 for(const [tier,price] of [['普通',100],['独特',150],['隐藏',200],['神话',300]]){const skins=SKINS.filter(x=>x.tier===tier);assert.equal(skins.length,8);assert.ok(skins.every(x=>x.price===price));}
 assert.equal(SKINS.filter(x=>x.price===0).length,1);
});
test('sentence grading accepts declared valid alternate order and capitalization',async()=>{
 const {answerMatches}=await import('../english/core.js');
 assert.equal(answerMatches({answer:'Turn off the lights.',acceptedAnswers:['Turn the lights off.']},'Turn the lights off.'),true);
 assert.equal(answerMatches({answer:'I am your friend.'},'i am your friend.'),true);
 assert.equal(answerMatches({answer:'I am your friend.'},'I your am friend.'),false);
});
test('parkour collision gaps align with the 22 rendered platforms and affect every lane',()=>{
 const run=new Run(LEVELS.find(x=>x.mode==='parkour'));const gaps=run.obstacles.filter(x=>x.kind==='gap');assert.equal(gaps.length,21);assert.equal(gaps[0].progress,1/22-.00225);
 run.lane=-1;run.progress=gaps[0].progress-.0001;run.step(.1,{});assert.ok(run.slow>0);assert.ok(run.fallAge>=0);
});
test('race finish rank preserves opponents who finished first, without stacking start cars',()=>{
 const r=new Run(LEVELS.find(x=>x.mode==='race'));assert.equal(new Set(r.rivals.map(x=>`${x.lane}:${x.progress}`)).size,9);r.progress=1;r.elapsed=200;r.status='finished';assert.equal(r.rank,10);
});
test('fronted time words from actual token chips are accepted without stranded punctuation',async()=>{
 const {answerMatches}=await import('../english/core.js');assert.equal(answerMatches({answer:'I cleaned my room yesterday.',acceptedAnswers:['Yesterday I cleaned my room.']},'yesterday. I cleaned my room'),true);
});
test('malformed saved review cards cannot break the review screen',()=>{
 assert.equal(loadSave(JSON.stringify({wrong:[{id:'bad',prompt:'bad'}]})).wrong.length,0);
});
test('all 46 unit rounds avoid duplicate prompts and actual chips accept every declared alternate',async()=>{
 const {BOOKS,WORDS}=await import('../english/curriculum.js');const {answerMatches}=await import('../english/core.js');
 for(const book of BOOKS)for(const unit of book.units){
  const questions=makeQuestions(unit,WORDS,1);assert.equal(new Set(questions.map(q=>`${q.kind}:${q.prompt}`)).size,10,unit.id);
  for(const sentence of unit.sentences){
   const q={answer:sentence.en,acceptedAnswers:sentence.acceptedAnswers||[],tokens:sentence.en.replace(/[.,!?]/g,'').split(/\s+/)};
   for(const answer of [q.answer,...q.acceptedAnswers]){const available=[...q.tokens],chosen=[];for(const target of answer.replace(/[.,!?]/g,'').split(/\s+/)){const i=available.findIndex(t=>t.toLowerCase()===target.toLowerCase());assert.ok(i>=0,answer);chosen.push(available.splice(i,1)[0]);}assert.equal(available.length,0);assert.equal(answerMatches(q,chosen.join(' ')),true,answer);}
  }
 }
});
