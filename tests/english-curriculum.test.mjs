import test from 'node:test';
import assert from 'node:assert/strict';

import { WORDS, BOOKS } from '../english/curriculum.js';
const expectedTitles = [
  ['g3-upper', 'Making friends', 'Different families', 'Amazing animals', 'Plants around us', 'The colourful world', 'Useful numbers'],
  ['g3-lower', 'Meeting new people', 'Expressing yourself', 'Learning better', 'Healthy food', 'Old toys', 'Numbers in life'],
  ['g4-upper', 'Helping at home', 'My friends', 'Places we live in', 'Helping in the community', 'The weather and us', 'Changing for the seasons'],
  ['g4-lower', 'Class rules', 'Family rules', 'Time for school', 'Going shopping', 'Farms and us', 'From farm to table'],
  ['g5-upper', 'Different friends', 'My feelings', 'Work and play', 'Healthy habits', 'Food we eat', 'Nature and us'],
  ['g5-lower', 'Following the rules', 'Our community', 'Life in different seasons', 'My hometown', 'Travelling around', 'Making a travel plan'],
  ['g6-upper', 'Amazing places', 'Getting together', 'Healthy life', 'Managing money well', 'Exploring space', 'Energy, nature and us'],
  ['g6-lower', 'How tall are you?', 'Last weekend', 'Where did you go?', 'Then and now'],
];

test('covers the seven current official books and the four-unit review book', () => {
  assert.equal(BOOKS.length, 8);
  assert.equal(BOOKS.flatMap(b => b.units).length, 46);
  for (const [id, ...titles] of expectedTitles) {
    const book = BOOKS.find(b => b.id === id);
    assert.ok(book, id);
    assert.deepEqual(book.units.map(u => u.title), titles);
    assert.deepEqual(book.units.map(u => u.number), titles.map((_, i) => i + 1));
    assert.ok([3, 4, 5, 6].includes(book.grade));
    assert.ok(['upper', 'lower'].includes(book.term));
    assert.ok(book.title && book.edition);
    assert.match(book.source, /^https:\/\/www\.pep\.com\.cn\//);
  }
  assert.match(BOOKS.find(b => b.id === 'g6-lower').edition, /在用版复习/);
});

test('every unit has six distinct resolvable thematic core-word references', () => {
  assert.ok(Object.keys(WORDS).length >= 160);
  const used = new Set();
  const unitIds = new Set();
  for (const book of BOOKS) for (const unit of book.units) {
    assert.ok(!unitIds.has(unit.id), `duplicate ${unit.id}`);
    unitIds.add(unit.id);
    assert.ok(unit.zh);
    assert.ok(unit.words.length >= 6, unit.id);
    assert.equal(new Set(unit.words).size, unit.words.length, unit.id);
    for (const id of unit.words) {
      assert.ok(WORDS[id], `${unit.id} -> ${id}`);
      used.add(id);
    }
  }
  for(const id of used)assert.ok(WORDS[id],id);
  // Historical words remain available to saved rounds, not in corrected unit pools.
  assert.ok(BOOKS[0].units[0].words.includes('friend'));
  assert.ok(!BOOKS[0].units[0].words.includes('eraser'));
});

test('each word has a readable Chinese meaning and consistent American IPA', () => {
  assert.ok(Object.keys(WORDS).length >= 160);
  for (const [id, word] of Object.entries(WORDS)) {
    assert.match(id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(word.en.length>0, id); // Distinct senses and contractions use stable safe IDs.
    assert.match(word.zh, /[\u4e00-\u9fff]/, id);
    assert.match(word.ipa, /^\/[^/]+\/$/, id);
    assert.doesNotMatch(word.ipa, /ɒ|əʊ/, `British IPA in ${id}`);
    assert.doesNotMatch(word.ipa, /\?|undefined/, id);
  }
  assert.equal(WORDS.name.ipa, '/neɪm/');
  assert.equal(WORDS.bird.ipa, '/bɝd/');
  assert.equal(WORDS.water.ipa, '/ˈwɔtɚ/');
  assert.equal(WORDS.home.ipa, '/hoʊm/');
  assert.equal(WORDS.use.ipa, '/juz/');
  assert.equal(WORDS.read.ipa, '/rid/');
  assert.equal(WORDS.washed.ipa, '/wɑʃt/');
  assert.equal(WORDS.cleaned.ipa, '/klind/');
  assert.equal(WORDS.tomato.ipa, '/təˈmeɪtoʊ/');
});

test('every unit teaches three original complete sentences with Chinese guidance', () => {
  assert.equal(BOOKS.length, 8);
  for (const book of BOOKS) for (const unit of book.units) {
    assert.ok(unit.sentences.length >= 3, unit.id);
    assert.equal(new Set(unit.sentences.map(s => s.en)).size, unit.sentences.length);
    for (const sentence of unit.sentences) {
      assert.match(sentence.en, /^[A-Z].*[.!?]$/, unit.id);
      assert.match(sentence.zh, /[\u4e00-\u9fff]/);
      assert.match(sentence.tip, /[\u4e00-\u9fff]/);
      assert.ok(sentence.tip.length >= 8);
    }
  }
});

test('grammar choices have exactly one declared answer and child-readable reasons', () => {
  assert.equal(BOOKS.length, 8);
  for (const book of BOOKS) for (const unit of book.units) {
    assert.ok(unit.grammar.length >= 2, unit.id);
    for (const question of unit.grammar) {
      assert.ok(question.prompt.includes('___'), question.prompt);
      assert.doesNotMatch(question.prompt, /[\u4e00-\u9fff]/, 'spoken grammar must not contain Chinese instructions');
      assert.ok(question.options.length >= 3);
      assert.equal(new Set(question.options).size, question.options.length);
      assert.equal(question.options.filter(o => o === question.answer).length, 1);
      assert.match(question.explanation, /[\u4e00-\u9fff]/);
      assert.ok(question.explanation.length >= 12);
    }
  }
});

test('representative grammar answers follow agreement, articles and tense rules', () => {
  const correct = new Map([
    ['I ___ your new friend.', 'am'],
    ['This is ___ apple.', 'an'],
    ['She ___ the dishes every evening.', 'washes'],
    ['There ___ two parks in my town.', 'are'],
    ['We ___ going to visit the museum tomorrow.', 'are'],
    ['I ___ my room yesterday.', 'cleaned'],
    ['Did you ___ a bike last Sunday?', 'ride'],
    ['There ___ no gym in our school ten years ago.', 'was'],
  ]);
  const questions = BOOKS.flatMap(b => b.units.flatMap(u => u.grammar));
  for (const [prompt, answer] of correct) {
    const question = questions.find(q => q.prompt === prompt);
    assert.ok(question, prompt);
    assert.equal(question.answer, answer, prompt);
  }
});

test('source notes distinguish current catalog, review edition and original practice', async () => {
  const { readFile } = await import('node:fs/promises');
  const notes = await readFile(new URL('../english/SOURCES.md', import.meta.url), 'utf8').catch(() => '');
  assert.ok(notes.includes('2026-10-03'), 'date of directory verification');
  assert.ok(notes.includes('自编练习'), 'practice provenance');
  assert.ok(notes.includes('在用版复习'), 'grade-six-lower scope');
  assert.ok(notes.includes('404'), 'missing new-book portal is disclosed');
  assert.ok(notes.includes(`${Object.keys(WORDS).length} 个不同词条`), 'documented vocabulary count matches data');
  for (const book of BOOKS) assert.ok(notes.includes(book.source), book.source);
});

test('Making friends includes body words for greeting gestures in the new unit', () => {
  const unit = BOOKS.find(b => b.id === 'g3-upper').units[0];
  for (const word of ['friend', 'ear', 'hand', 'eye', 'mouth', 'arm']) {
    assert.ok(unit.words.includes(word), `Making friends needs ${word}`);
  }
  assert.ok(!unit.words.includes('teacher'));
  assert.ok(!unit.words.includes('class'));
  assert.ok(unit.sentences.some(sentence => /hand|ear|eye|mouth|arm/.test(sentence.en)));
});

test('lower-grade introductions and self-expression include origin and appearance', () => {
  const units = BOOKS.find(b => b.id === 'g3-lower').units;
  for (const word of ['from', 'where', 'student']) assert.ok(units[0].words.includes(word), word);
  for (const word of ['long', 'short', 'body', 'love']) assert.ok(units[1].words.includes(word), word);
  assert.ok(units[0].sentences.some(sentence => /from/.test(sentence.en)));
  assert.ok(units[1].sentences.some(sentence => /has|have/.test(sentence.en)));
});

test('sentence-building accepts natural alternate positions using the same tokens', () => {
  const sentences = BOOKS.flatMap(b => b.units.flatMap(u => u.sentences));
  const variants = new Map([
    ['We should buy only what we need.', 'We should only buy what we need.'],
    ['Turn off the lights when you leave.', 'Turn the lights off when you leave.'],
  ]);
  for (const [canonical, alternative] of variants) {
    const sentence = sentences.find(sentence => sentence.en === canonical);
    assert.ok(sentence?.acceptedAnswers?.includes(alternative), alternative);
  }
  const tokens = text => text.replace(/[.!?]+$/, '').toLowerCase().split(/\s+/).sort();
  for (const sentence of sentences) {
    for (const alternative of sentence.acceptedAnswers ?? []) {
      assert.deepEqual(tokens(alternative), tokens(sentence.en), alternative);
    }
  }
});

test('every official unit vocabulary entry is available in study and question pools',async()=>{
 const {readFile}=await import('node:fs/promises');
 const inventories=await Promise.all(['g34','g56'].map(async group=>JSON.parse(await readFile(new URL(`../english/content-${group}.json`,import.meta.url),'utf8'))));
 const entries=inventories.flatMap(i=>i.books).flatMap(b=>b.units);assert.equal(entries.length,46);
 for(const entry of entries){const unit=BOOKS.flatMap(b=>b.units).find(u=>u.id===entry.id);assert.ok(unit,entry.id);assert.ok(entry.words.length>0,entry.id);assert.equal(unit.coverage.status,entry.coverage.status);assert.match(entry.coverage.source,/^https:\/\//);assert.ok(entry.coverage.basis);assert.deepEqual(unit.textbookWords,entry.words.map(w=>w.id));for(const w of entry.words){assert.ok(unit.words.includes(w.id),`${unit.id}: ${w.en} missing from quiz pool`);assert.equal(WORDS[w.id].en,w.en);assert.ok(WORDS[w.id].zh);assert.ok(WORDS[w.id].ipa);}assert.ok(unit.sentences.length>3,`${unit.id}: original three sentences are insufficient`);assert.ok(unit.grammar.length>2,`${unit.id}: multiple sentence patterns need grammar practice`);}
});


test('corrected Work and play uses weekdays while historical words remain loadable',()=>{
 const unit=BOOKS.find(b=>b.id==='g5-upper').units[2];
 for(const id of ['monday','tuesday','wednesday','usually'])assert.ok(unit.words.includes(id),id);
 assert.ok(!unit.words.includes('doctor'));assert.ok(WORDS.doctor);
 assert.ok(!unit.sentences.some(s=>/doctor|farmer|nurse/.test(s.en)));
 assert.equal(WORDS['read-past'].ipa,'/rɛd/');assert.equal(WORDS.read.ipa,'/rid/');
 assert.match(WORDS.dress.zh,/连衣裙/);assert.match(WORDS.dress.zh,/穿衣服/);
 assert.match(WORDS.then.zh,/那时/);assert.match(WORDS.then.zh,/然后/);
});
