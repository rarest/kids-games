import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS} from '../english/curriculum.js';
import {makePractice,normalizePracticeAnswer} from '../english/page-practice.js';
test('all page choice questions have exactly one answer after UI normalization',()=>{
 for(const page of BOOKS.find(book=>book.id==='g3-upper').textbookPages){for(const q of makePractice(page)){
  if(!q.choices)continue;const accepted=q.choices.filter(choice=>normalizePracticeAnswer(choice)===normalizePracticeAnswer(q.answer));assert.equal(accepted.length,1,q.id);
  const unique=new Set(q.choices.map(normalizePracticeAnswer));assert.equal(unique.size,q.choices.length,q.id);
 }}
});
