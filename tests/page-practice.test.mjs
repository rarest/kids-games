import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS} from '../english/curriculum.js';
const engine=await import('../english/page-practice.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const pages=BOOKS.find(book=>book.id==='g3-upper').textbookPages;

test('all 90 photographed pages expose every word and line, including instructions and phonics',()=>{
 assert.equal(typeof engine.pageTargets,'function','page target engine missing');
 let words=0,lines=0;const ids=new Set();
 for(const page of pages){
  const expected=[...page.words.map((word,i)=>({id:`p${page.page}-word-${i}`,page:page.page,kind:'word',en:word.en,zh:word.zh,ipa:word.ipa,...(word.say?{say:word.say}:{}),wordId:word.id})),...page.blocks.flatMap((block,b)=>block.lines.map((line,i)=>({id:`p${page.page}-line-${b}-${i}`,page:page.page,kind:'sentence',en:line.en,zh:line.zh,...(line.say?{say:line.say}:{})})))];
  assert.deepEqual(engine.pageTargets(page),expected,`page ${page.page}`);
  for(const target of expected){assert.ok(!ids.has(target.id));ids.add(target.id);assert.deepEqual(engine.getTarget(target.id),target);}
  words+=page.words.length;lines+=page.blocks.flatMap(block=>block.lines).length;
 }
 assert.equal(words,3208);assert.equal(lines,1681);assert.equal(ids.size,4889);
 assert.equal(engine.getTarget('p1-line-0-0'),null);assert.equal(engine.getTarget('p2-word-999'),null);assert.equal(engine.getTarget('__proto__'),null);
});

test('every target gets unique listening and meaning answers with deterministic varied placement',()=>{
 assert.equal(typeof engine.makePractice,'function','page practice engine missing');
 const placements=new Set();
 for(const page of pages){const questions=engine.makePractice(page);assert.deepEqual(engine.makePractice(page),questions);const targets=engine.pageTargets(page);const ids=new Set();
  for(const target of targets)for(const kind of ['listening','meaning'])assert.ok(questions.some(q=>q.targetId===target.id&&q.kind===kind),`${target.id} missing ${kind}`);
  for(const q of questions){assert.ok(!ids.has(q.id));ids.add(q.id);const target=engine.getTarget(q.targetId);assert.ok(target);assert.ok(q.prompt);
   if(q.kind==='order'){assert.deepEqual([...q.tokens].sort(),q.answer.split(/\s+/).sort());assert.ok(q.tokens.length>=2);assert.doesNotMatch(q.answer,/\.{3}|___|\//);}
   else{assert.equal(q.answer,q.kind==='listening'?target.en:target.zh);assert.ok(q.choices.length>=2);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.filter(answer=>answer===q.answer).length,1);placements.add(q.choices.indexOf(q.answer));}
  }
 }
 assert.ok(placements.size>=3,'answers must not always occupy the first choice');
 const alphabet=pages.find(page=>page.page===91);assert.ok(!engine.makePractice(alphabet).some(q=>q.kind==='order'&&/^[A-Z] [a-z]$/.test(q.answer)));
});

test('meaning distractors exclude family synonyms and listening distractors exclude homophones',()=>{
 assert.equal(typeof engine.makePractice,'function');
 const page={page:100,blocks:[],words:[{id:'dad',en:'dad',zh:'爸爸（口语）',ipa:'/dæd/'},{id:'father',en:'father',zh:'父亲；爸爸',ipa:'/ˈfɑðɚ/'},{id:'two',en:'two',zh:'二',ipa:'/tu/'},{id:'too',en:'too',zh:'也',ipa:'/tu/'},{id:'cat',en:'cat',zh:'猫',ipa:'/kæt/'}]};
 const questions=engine.makePractice(page);
 assert.ok(!questions.find(q=>q.id==='p100-word-0-meaning').choices.includes('父亲；爸爸'));
 assert.ok(!questions.find(q=>q.id==='p100-word-2-listening').choices.includes('too'));
});
