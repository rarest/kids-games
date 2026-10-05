import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,WORDS} from '../english/curriculum.js';
import {makeQuestions} from '../english/core.js';
import {wordArt} from '../english/course-art.js';
const book=BOOKS.find(book=>book.id==='g3-upper');
test('g3 game pools use photographed vocabulary meanings and verbatim sentences with provenance',()=>{
 for(const unit of book.units){const sourceWords=unit.textbookPages.flatMap(page=>page.words);const sourceLines=unit.textbookPages.flatMap(page=>page.blocks.flatMap(block=>block.lines));
  assert.equal(unit.coverage.source,'user-photos');
  for(const word of sourceWords)assert.ok(unit.words.some(id=>WORDS[id].en===word.en&&WORDS[id].zh===word.zh&&WORDS[id].ipa===word.ipa),`${unit.id} missing source sense ${word.en}: ${word.zh}`);
  for(const id of unit.words){const word=WORDS[id];assert.ok(sourceWords.some(source=>source.en===word.en&&source.zh===word.zh&&source.ipa===word.ipa),`legacy word ${unit.id}:${id}`);assert.match(unit.wordSources[id].targetId,/^p\d+-word-\d+$/);}
  for(const sentence of unit.sentences){assert.ok(sourceLines.some(line=>line.en===sentence.en&&line.zh===sentence.zh),`legacy sentence ${sentence.en}`);assert.match(sentence.targetId,/^p\d+-line-\d+-\d+$/);assert.ok(unit.textbookPages.some(page=>page.page===sentence.sourcePage));}
  for(const grammar of unit.grammar){assert.ok(sourceLines.some(line=>line.en===grammar.prompt.replace('___',grammar.answer)),`invented grammar ${grammar.prompt}`);assert.ok(grammar.context);assert.match(grammar.targetId,/^p\d+-line-\d+-\d+$/);}
  for(let seed=1;seed<=30;seed++)for(const question of makeQuestions(unit,WORDS,seed)){
   if(['word','ipa'].includes(question.kind))assert.ok(unit.words.includes(question.wordId));
   else assert.ok(sourceLines.some(line=>line.en===question.solution),`question outside photo source ${question.solution}`);
  }
 }
});
test('source plural fruit and animals receive matching objects, orange follows the page meaning',()=>{
 for(const [id,en,zh,label] of [['photo-apples','apples','苹果（复数）','苹果'],['photo-bananas','bananas','香蕉（复数）','香蕉'],['photo-grapes','grapes','葡萄（复数）','葡萄'],['photo-oranges','oranges','橙子（复数）','橙子'],['photo-cats','cats','猫（复数）','猫'],['photo-red-panda','red panda','小熊猫','小熊猫']])assert.match(wordArt({id,en,zh}),new RegExp(`aria-label="[^"]*${label}`),id);
 assert.match(wordArt({id:'orange',en:'orange',zh:'橙色的'}),/aria-label="[^"]*橙色/);
 assert.match(wordArt({id:'photo-game-orange',en:'orange',zh:'橙子'}),/aria-label="[^"]*橙子/);
 for(const [en,n] of [['one',1],['five',5],['ten',10]])assert.match(wordArt({id:`photo-${en}`,en,zh:'数字'}),new RegExp(`>${n}</text>`));
 assert.equal(wordArt({id:'photo-our',en:'our',zh:'我们的'}),'');
});
