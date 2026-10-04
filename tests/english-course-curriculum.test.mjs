import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,WORDS} from '../english/curriculum.js';
import {courseArt,wordArt} from '../english/course-art.js';
const module=await import('../english/course-curriculum.js').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const {COURSE,LESSONS=[]}=module;
const book=BOOKS.find(book=>book.id==='g3-upper');
const page=number=>book.textbookPages.find(page=>page.page===number);
test('guided course offers six ordered units with six manageable lessons each',()=>{
 assert.ok(COURSE,'course data is not implemented');
 assert.equal(COURSE.bookId,'g3-upper');assert.equal(COURSE.id,'g3-upper-2026');
 assert.equal(COURSE.units.length,6);assert.equal(LESSONS.length,36);
 for(const [index,unit]of COURSE.units.entries()){
  assert.equal(unit.id,book.units[index].id);assert.equal(unit.lessons.length,6);
  assert.deepEqual(unit.lessons.map(lesson=>lesson.number),[1,2,3,4,5,6]);
  assert.deepEqual(unit.lessons.map(lesson=>lesson.type),['words','words','phonics','words','words','story']);
  for(const lesson of unit.lessons){assert.equal(lesson.unitId,unit.id);assert.ok(lesson.minutes>=15&&lesson.minutes<=20);assert.ok(lesson.words.length>0&&lesson.words.length<=5);assert.ok(lesson.phrases.length<=2);assert.ok(lesson.goal);assert.ok(lesson.activity.prompt.length>=15);assert.equal(lesson.checks.length,2);}
 }
 assert.equal(new Set(LESSONS.map(lesson=>lesson.id)).size,36);
});
test('lessons teach every core vocabulary ID using an original page meaning',()=>{
 assert.equal(LESSONS.length,36,'course is not implemented');
 for(const unit of COURSE.units){const source=book.units.find(source=>source.id===unit.id);const taught=new Set(unit.lessons.flatMap(lesson=>lesson.words.map(word=>word.id)));for(const id of source.textbookWords)assert.ok(taught.has(id),`${unit.id} omits ${id}`);}
 for(const lesson of LESSONS)for(const word of lesson.words){assert.equal(WORDS[word.id].en,word.en);assert.ok(word.visual);assert.ok(book.textbookPages.some(page=>page.words.some(original=>original.id===word.id&&original.en===word.en&&original.zh===word.zh&&original.ipa===word.ipa)),`${lesson.id}: ${word.en} lost its page meaning`);}
});
test('English phrases, readings and spoken examples stay grounded in printed textbook lines',()=>{
 assert.equal(LESSONS.length,36,'course is not implemented');
 for(const lesson of LESSONS){for(const number of lesson.pages)assert.ok(page(number));for(const line of [...lesson.phrases,...lesson.reading]){assert.ok(lesson.pages.includes(line.page));const original=page(line.page).blocks.flatMap(block=>block.lines).find(original=>original.en===line.en&&original.zh===line.zh&&original.say===line.say);assert.ok(original,`${lesson.id}: invented or changed ${line.en}`);}
  for(const phrase of lesson.phrases)assert.doesNotMatch(phrase.en,/^(?:Let's (?:talk|learn)|Listen|Read aloud|Start to read|Reading time|Self-check|Project:|Write and say|Can you read the words)/);
  for(const check of lesson.checks){assert.match(check.prompt,/[\u4e00-\u9fff]/);assert.equal(check.choices.length,3);assert.equal(new Set(check.choices).size,3);assert.ok(check.choices.includes(check.answer));assert.match(check.why,/[\u4e00-\u9fff]/);if(check.say)assert.ok(lesson.reading.some(line=>line.en===check.say)||lesson.phrases.some(line=>line.en===check.say));}
  if(lesson.activity.example)assert.ok(lesson.reading.some(line=>line.en===lesson.activity.example)||lesson.phrases.some(line=>line.en===lesson.activity.example));
 }
});
test('phonics follows the printed alphabet sequence and uses textbook example words',()=>{
 assert.equal(LESSONS.length,36,'course is not implemented');
 const phonics=LESSONS.filter(lesson=>lesson.type==='phonics');assert.deepEqual(phonics.map(lesson=>lesson.letters.length),[4,4,4,4,5,5]);
 assert.equal(phonics.flatMap(lesson=>lesson.letters.map(letter=>letter.en[0])).join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
 for(const lesson of phonics)for(const letter of lesson.letters){assert.ok(page(lesson.pages[0]).blocks.flatMap(block=>block.lines).some(line=>line.en===letter.en));assert.ok(lesson.words.some(word=>word.en===letter.example));assert.match(letter.ipa,/^\/[^/]+\/$/);assert.match(letter.sound,/^\/[^/]+\/$/);}
});
test('each final lesson contains the entire two-page story, excluding page labels',()=>{
 assert.equal(LESSONS.length,36,'course is not implemented');
 for(const [index,lesson] of LESSONS.filter(lesson=>lesson.type==='story').entries()){
  const storyPages=[12+12*index,13+12*index];const original=storyPages.flatMap(number=>page(number).blocks.filter(block=>block.kind==='reading').flatMap(block=>block.lines.filter(line=>!['Reading time','SCHOOL'].includes(line.en)).map(line=>({...line,page:number}))));
  assert.deepEqual(lesson.reading.map(line=>[line.en,line.zh,line.page]),original.map(line=>[line.en,line.zh,line.page]));
 }
});
test('age, watering and pet lessons teach the word sense used in their examples',()=>{
 assert.equal(LESSONS.length,36,'course is not implemented');
 const lesson=id=>LESSONS.find(lesson=>lesson.id===id);
 assert.match(lesson('g3-upper-u6-l1').words.find(word=>word.id==='old').zh,/岁|年纪/,'old must teach age before practising years old');
 assert.match(lesson('g3-upper-u4-l4').words.find(word=>word.id==='water').zh,/浇水/,'water must include the verb used in the watering phrase');
 assert.doesNotMatch(lesson('g3-upper-u3-l2').words.find(word=>word.id==='fish').zh,/钓鱼/,'pet pictures teach the animal rather than an unrelated verb');
});
test('each phonics sound actually occurs in the example pronunciation',()=>{
 for(const lesson of LESSONS.filter(lesson=>lesson.type==='phonics'))for(const letter of lesson.letters){
  const example=lesson.words.find(word=>word.en===letter.example);
  assert.ok(example.ipa.includes(letter.sound.slice(1,-1)),`${letter.en}: ${letter.sound} is absent from ${example.en} ${example.ipa}`);
 }
});
test('picture vocabulary distinguishes concrete animals and context-specific orange meanings',()=>{
 for(const [id,label]of [['rabbit','兔'],['bird','鸟'],['fish','鱼'],['panda','大熊猫'],['red-panda','小熊猫'],['elephant','大象'],['lion','狮子'],['tiger','老虎'],['bear','熊'],['duck','鸭'],['apple','苹果'],['banana','香蕉'],['grape','葡萄'],['flower','花'],['tree','树']])assert.match(wordArt({id}),new RegExp(`aria-label="[^"]*${label}`),id);
 assert.match(wordArt({id:'orange',visual:'🍊'}),/aria-label="[^"]*橙子/);
 assert.match(wordArt({id:'orange',visual:'🟠'}),/aria-label="[^"]*橙色/);
 assert.equal(wordArt({id:'and'}),'','abstract conjunctions must retain their symbolic fallback');
 assert.match(courseArt('g3-upper-u1',{story:true}),/aria-label="[^"]*松鼠[^"]*熊/);
});
