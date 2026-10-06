import test from 'node:test';
import assert from 'node:assert/strict';

let curriculum;
let appendices;
test('课程和三份教材附录可以实际加载', async () => {
  await assert.doesNotReject(async () => {
    curriculum = await import('../chinese/curriculum.js');
    appendices = await import('../chinese/appendices.js');
  });
});

test('当前教材26课具有完整学习接口与唯一答案', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const {COURSE, LESSONS} = curriculum;
  assert.equal(COURSE.id, 'pep3-cn-2026-v1');
  assert.equal(COURSE.units.length, 8);
  assert.equal(LESSONS.length, 26);
  const expected = ['大青树下的小学','花的学校','不懂就要问','古诗三首','铺满金色巴掌的水泥道','秋天的雨','听听，秋的声音','总也倒不了的老屋','犟龟','小狗学叫','宝葫芦的秘密（节选）','在牛肚子里旅行','一块奶酪','搭船的鸟','金色的草地','富饶的西沙群岛','海滨小城','美丽的小兴安岭','香港，璀璨的明珠','古诗三首','大自然的声音','父亲、树林和鸟','司马光','一定要争气','手术台就是阵地','一个粗瓷大碗'];
  assert.deepEqual(LESSONS.map(l=>l.title), expected);
  for (const lesson of LESSONS) {
    assert.equal(lesson.id, `cn-${lesson.number}`);
    assert.ok(COURSE.units.some(u=>u.id===lesson.unitId));
    assert.ok(lesson.goal && lesson.genre && lesson.preview.prompt && lesson.preview.hint);
    assert.ok(lesson.paragraphs.length > 0);
    for (const p of lesson.paragraphs) { assert.ok(p.text.trim()); assert.ok(lesson.pages.includes(p.page)); }
    assert.ok(lesson.words.length >= 3);
    for (const w of lesson.words) assert.ok(w.text && w.pinyin && w.meaning && w.example && lesson.pages.includes(w.page));
    assert.ok(lesson.questions.length >= 3);
    for (const q of lesson.questions) {
      assert.ok(q.id.startsWith(`${lesson.id}:`));
      assert.equal(new Set(q.choices).size, q.choices.length);
      assert.equal(q.choices.filter(c=>c===q.answer).length, 1);
      assert.ok(q.prompt && q.hint && q.explanation && lesson.pages.includes(q.page));
    }
    assert.ok(lesson.expression.prompt && lesson.expression.hints.length);
    assert.equal(typeof lesson.recite.required, 'boolean');
    assert.ok(Array.isArray(lesson.recognize) && Array.isArray(lesson.write));
  }
});

test('长课文结尾与新教材特别篇目不会被旧版或摘录替代', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const lesson = n=>curriculum.LESSONS.find(l=>l.number===n);
  assert.match(lesson(9).paragraphs.map(p=>p.text).join(''), /婚礼暂时取消了/);
  assert.match(lesson(11).paragraphs.map(p=>p.text).join(''), /宝葫芦/);
  assert.ok(lesson(11).paragraphs.map(p=>p.text).join('').length > 800);
  assert.ok(lesson(24).paragraphs.map(p=>p.text).join('').length > 500);
});

test('三份附录按课号分组且覆盖教材各250项', async () => {
  await assert.doesNotReject(async () => { appendices ??= await import('../chinese/appendices.js'); });
  for (const key of ['RECOGNIZE','WRITE','WORDS']) {
    const groups = appendices[key];
    assert.ok(Array.isArray(groups));
    assert.equal(groups.flatMap(g=>g.items).length, 250, key);
    for (const group of groups) { assert.ok(Number.isInteger(group.lesson)); assert.ok(group.items.length); }
  }
});
