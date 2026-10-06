import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../chinese/curriculum.js';

const fresh = () => ({ version: 1, lessons: {}, items: {}, session: null });
const day = n => Date.parse(`2026-10-${String(n).padStart(2, '0')}T00:00:00+08:00`);
const engine = () => import('../chinese/engine.js');
const requireApi = (module, name) => assert.equal(typeof module[name], 'function', `${name} must implement the learning contract`);

function finish(module, progress, session, now = session.startedAt) {
  while (session.index < session.steps.length) {
    const step = session.steps[session.index];
    const selected = ['meaning', 'check'].includes(step.kind) ? step.answer
      : ['expression', 'recite'].includes(step.kind) ? { selfReported: true } : { visited: true };
    assert.ok(module.recordAnswer(progress, session, step, selected, { now }));
    assert.equal(module.advance(session), true);
  }
}

function reach(module, progress, session, kind) {
  while (session.steps[session.index].kind !== kind) {
    const step = session.steps[session.index];
    module.recordAnswer(progress, session, step, { visited: true }, { now: session.startedAt });
    assert.equal(module.advance(session), true);
  }
  return session.steps[session.index];
}

test('canonical steps present every original paragraph separately and preserve stable choices', async () => {
  let engine;
  await assert.doesNotReject(async () => { engine = await import('../chinese/engine.js'); });
  const lesson = LESSONS[0];
  const steps = engine.buildSteps(lesson);
  assert.deepEqual(steps.filter(step => step.kind === 'reading').map(step => [step.page, step.text]), lesson.paragraphs.map(p => [p.page, p.text]));
  assert.equal(steps[0].kind, 'preview');
  assert.equal(steps.at(-1).kind, 'expression');
  assert.deepEqual(steps, engine.buildSteps(lesson));
  assert.equal(new Set(steps.map(step => step.id)).size, steps.length);
});

test('meaning and comprehension choices disperse correct positions without equivalent distractors', async () => {
  const { buildSteps } = await import('../chinese/engine.js');
  for (const kind of ['meaning', 'check']) {
    const positions = new Set();
    for (const lesson of LESSONS) {
      for (const step of buildSteps(lesson).filter(step => step.kind === kind)) {
        assert.equal(step.choices.length, 3);
        assert.equal(new Set(step.choices).size, 3);
        assert.equal(step.choices.filter(choice => choice === step.answer).length, 1);
        positions.add(step.choices.indexOf(step.answer));
      }
    }
    assert.deepEqual([...positions].sort(), [0, 1, 2]);
  }
  const words = buildSteps(LESSONS[0]).filter(step => step.kind === 'meaning');
  assert.equal(words[0].answer, '平坦的场地。');
  assert.ok(words[0].choices.includes('一种枝叶细密，像凤尾的竹子。'));
  assert.ok(words[0].choices.includes('把人或动物吸引过来。'));
});

test('sessions use canonical content and review filters retain original step identity', async () => {
  const { buildSteps, createSession } = await import('../chinese/engine.js');
  const lesson = LESSONS[0], now = Date.parse('2026-10-07T08:00:00Z');
  const session = createSession({ ...lesson, paragraphs: [{ text: 'INJECTED', page: 1 }] }, { now });
  assert.equal(session.lessonId, 'cn-1');
  assert.equal(session.startedAt, now);
  assert.equal(session.index, 0);
  assert.deepEqual(session.answers, {});
  assert.equal(session.feedback, null);
  assert.deepEqual(session.steps, buildSteps(lesson));
  const target = session.steps.find(step => step.kind === 'meaning');
  assert.equal(target.itemKey, 'cn-1:word:0');
  const review = createSession(lesson, { now, review: true, reviewKeys: [target.itemKey, target.itemKey, '__proto__', 'unknown'] });
  assert.deepEqual(review.reviewKeys, ['cn-1:word:0']);
  assert.deepEqual(review.steps, [target]);
  assert.ok(buildSteps(lesson, { review: true }).every(step => ['meaning', 'check'].includes(step.kind)));
  assert.equal(createSession(lesson, { now, review: true, reviewKeys: ['unknown'] }), null);
  assert.equal(createSession({ id: 'unknown' }, { now }), null);
  assert.equal(createSession(lesson, { now: NaN }), null);
});

test('advance requires explicit visits and expression or recitation stores only attempted self-report', async () => {
  const module = await engine();
  requireApi(module, 'advance'); requireApi(module, 'recordAnswer');
  const progress = fresh(), session = module.createSession(LESSONS.find(l => l.recite.required), { now: day(7) });
  assert.equal(module.advance(session), false);
  const step = session.steps[0];
  assert.equal(module.recordAnswer(progress, session, step, true, { now: day(7) }), null);
  assert.equal(module.recordAnswer(progress, session, step, { correct: true }, { now: day(7) }), null);
  const result = module.recordAnswer(progress, session, step, { visited: true }, { now: day(7) });
  assert.equal(result.scored, false);
  assert.deepEqual(session.answers[step.id], { visited: true });
  assert.equal(module.advance(session), true);
  finish(module, progress, session);
  for (const action of session.steps.filter(s => ['expression', 'recite'].includes(s.kind))) {
    assert.deepEqual(session.answers[action.id], { attempted: true, selfReported: true });
    assert.equal(session.answers[action.id].correct, undefined);
  }
  assert.equal(module.advance(session), false);
});

test('wrong retry saves latest feedback while first error alone changes accuracy and mastery', async () => {
  const module = await engine();
  requireApi(module, 'recordAnswer'); requireApi(module, 'completeLesson');
  const progress = fresh(), session = module.createSession(LESSONS[0], { now: day(7) });
  const step = reach(module, progress, session, 'meaning');
  const wrong = step.choices.find(choice => choice !== step.answer);
  const first = module.recordAnswer(progress, session, { ...step, answer: wrong }, wrong, { now: day(7) });
  assert.equal(first.correct, false);
  assert.equal(first.firstAttempt, true);
  assert.equal(first.item.incorrect, 1);
  assert.equal(module.advance(session), false);
  const retry = module.recordAnswer(progress, session, step, step.answer, { hinted: true, now: day(7) + 10 });
  assert.equal(retry.firstAttempt, false);
  assert.equal(retry.correct, true);
  assert.equal(retry.item, null);
  assert.equal(session.answers[step.id].selected, wrong);
  assert.equal(session.answers[step.id].correct, false);
  assert.equal(session.answers[step.id].latest.selected, step.answer);
  assert.equal(session.answers[step.id].latest.hinted, true);
  assert.equal(session.feedback.selected, step.answer);
  assert.equal(progress.items[step.itemKey].correct, 0);
  assert.equal(progress.items[step.itemKey].incorrect, 1);
  assert.equal(progress.items[step.itemKey].streak, 0);
  assert.equal(module.advance(session), true);
  finish(module, progress, session, day(7) + 20);
  assert.equal(module.completeLesson(progress, session, { now: day(7) + 30 }), true);
  assert.equal(progress.lessons['cn-1'].bestAccuracy, 5 / 6);
});

test('invalid selections, future steps, injected IDs and invalid timestamps never mutate state', async () => {
  const module = await engine(); requireApi(module, 'recordAnswer');
  const progress = fresh(), session = module.createSession(LESSONS[0], { now: day(7) });
  const original = JSON.stringify({ progress, session });
  assert.equal(module.recordAnswer(progress, session, session.steps[1], { visited: true }, { now: day(7) }), null);
  assert.equal(module.recordAnswer(progress, session, { ...session.steps[0], id: '__proto__' }, { visited: true }, { now: day(7) }), null);
  assert.equal(module.recordAnswer(progress, session, session.steps[0], { visited: true }, { now: NaN }), null);
  assert.equal(module.recordAnswer(progress, session, session.steps[0], { visited: true }, { now: day(6) }), null);
  assert.equal(JSON.stringify({ progress, session }), original);
  const step = reach(module, progress, session, 'meaning');
  assert.equal(module.recordAnswer(progress, session, step, 'unknown', { now: day(7) }), null);
  assert.equal(module.recordAnswer(progress, session, step, 0, { now: day(7) }), null);
  assert.equal(module.recordAnswer(progress, session, step, step.answer, { hinted: 'yes', now: day(7) }), null);
  assert.equal(session.answers[step.id], undefined);
});

test('China dates advance mastery on distinct days with literal 1, 3, and 7 day due dates', async () => {
  const module = await engine(); requireApi(module, 'recordItemAnswer'); requireApi(module, 'dueItems');
  const progress = fresh(), key = 'cn-1:word:0';
  const item = module.recordItemAnswer(progress, key, true, { now: Date.parse('2026-10-06T16:00:00Z') });
  assert.equal(item, progress.items[key]);
  assert.equal(item.lastDay, '2026-10-07');
  assert.equal(item.nextReview, Date.parse('2026-10-07T16:00:00Z'));
  module.recordItemAnswer(progress, key, true, { now: Date.parse('2026-10-07T15:59:59Z') });
  assert.equal(progress.items[key].streak, 1);
  module.recordItemAnswer(progress, key, true, { now: Date.parse('2026-10-07T16:00:00Z') });
  assert.equal(progress.items[key].streak, 2);
  assert.equal(progress.items[key].nextReview, Date.parse('2026-10-10T16:00:00Z'));
  module.recordItemAnswer(progress, key, true, { now: day(11) });
  assert.equal(progress.items[key].streak, 3);
  assert.equal(progress.items[key].nextReview, Date.parse('2026-10-17T16:00:00Z'));
  assert.deepEqual(module.dueItems(progress, day(17)), []);
  assert.deepEqual(module.dueItems(progress, day(18)), [key]);
});

test('hints and wrong first answers stay due after same-day success and replay shares item counters', async () => {
  const module = await engine(); requireApi(module, 'recordItemAnswer'); requireApi(module, 'recordAnswer');
  const progress = fresh(), replay = fresh(), key = 'cn-1:word:0';
  for (const [correct, hinted, now] of [[true, false, day(6)], [false, false, day(7)], [true, false, day(7) + 1], [true, true, day(8)]]) {
    const session = module.createSession(LESSONS[0], { now, review: true, reviewKeys: [key] });
    const step = session.steps[0], selected = correct ? step.answer : step.choices.find(c => c !== step.answer);
    const result = module.recordAnswer(progress, session, step, selected, { hinted, now });
    module.recordItemAnswer(replay, result.itemKey, result.correct, { hinted: result.hinted, now });
    assert.deepEqual(progress.items, replay.items);
    if (!correct) module.recordAnswer(progress, session, step, step.answer, { now: now + 1 });
    assert.deepEqual(progress.items, replay.items);
  }
  assert.deepEqual(progress.items[key], { streak: 0, lastDay: '2026-10-08', nextReview: day(8), correct: 3, incorrect: 1 });
  assert.deepEqual(module.dueItems(progress, day(8)), [key]);
  const before = JSON.stringify(progress);
  for (const invalid of ['__proto__', 'constructor', 'unknown', 'cn-99:word:0']) assert.equal(module.recordItemAnswer(progress, invalid, true, { now: day(8) }), null);
  assert.equal(module.recordItemAnswer(progress, key, 'yes', { now: day(8) }), null);
  assert.equal(JSON.stringify(progress), before);
});

test('unfinished or forged completion is rejected and complete runs are idempotent after restore', async () => {
  const module = await engine(); requireApi(module, 'completeLesson'); requireApi(module, 'loadProgress');
  const progress = fresh(), session = module.createSession(LESSONS[0], { now: day(7) });
  assert.equal(module.completeLesson(progress, session, { now: day(7) }), false);
  const forged = structuredClone(session);
  forged.index = forged.steps.length;
  forged.answers = Object.fromEntries(forged.steps.map(step => [step.id, { correct: true }]));
  assert.equal(module.completeLesson(progress, forged, { now: day(7) }), false);
  assert.deepEqual(progress.lessons, {});
  finish(module, progress, session);
  assert.equal(module.completeLesson(progress, session, { now: day(7) + 1 }), true);
  assert.equal(progress.lessons['cn-1'].attempts, 1);
  assert.equal(progress.lessons['cn-1'].bestAccuracy, 1);
  assert.equal(module.completeLesson(progress, session, { now: day(8) }), false);
  progress.session = session;
  const restored = module.loadProgress(JSON.stringify(progress));
  assert.equal(module.completeLesson(restored, restored.session, { now: day(8) }), false);
  assert.equal(restored.lessons['cn-1'].attempts, 1);
});

test('reviews never complete unlearned lessons and count new valid reviews separately', async () => {
  const module = await engine(); requireApi(module, 'completeLesson');
  const progress = fresh(), review = module.createSession(LESSONS[0], { now: day(7), review: true, reviewKeys: ['cn-1:word:0'] });
  finish(module, progress, review);
  assert.equal(module.completeLesson(progress, review, { now: day(7) + 1 }), false);
  assert.deepEqual(progress.lessons, {});
  const learn = module.createSession(LESSONS[0], { now: day(7) });
  finish(module, progress, learn);
  assert.equal(module.completeLesson(progress, learn, { now: day(7) + 2 }), true);
  assert.equal(module.completeLesson(progress, review, { now: day(7) + 3 }), true);
  assert.equal(progress.lessons['cn-1'].attempts, 1);
  assert.equal(progress.lessons['cn-1'].reviews, 1);
  assert.equal(progress.lessons['cn-1'].bestReviewAccuracy, 1);
  assert.equal(module.completeLesson(progress, review, { now: day(8) }), false);
  assert.equal(progress.lessons['cn-1'].reviews, 1);
});

test('load restores wrong selection and canonical feedback then permits retry without another mastery event', async () => {
  const module = await engine(); requireApi(module, 'loadProgress'); requireApi(module, 'recordAnswer');
  const progress = fresh(), session = module.createSession(LESSONS[0], { now: day(7) });
  const step = reach(module, progress, session, 'meaning');
  const wrong = step.choices.find(choice => choice !== step.answer);
  module.recordAnswer(progress, session, step, wrong, { hinted: true, now: day(7) });
  progress.session = session;
  const saved = JSON.stringify(progress);
  const injected = JSON.parse(saved);
  injected.session.steps = [{ id: 'injected', text: '伪造全文', kind: 'reading' }];
  injected.session.answers.injected = { visited: true };
  injected.session.feedback = { correct: true, selected: step.answer, explanation: '伪造反馈' };
  const restored = module.loadProgress(injected);
  assert.deepEqual(restored.session.steps, module.buildSteps(LESSONS[0]));
  assert.equal(restored.session.index, session.index);
  assert.equal(restored.session.feedback.selected, wrong);
  assert.equal(restored.session.feedback.correct, false);
  assert.equal(restored.session.feedback.explanation, step.explanation);
  assert.equal(restored.session.answers.injected, undefined);
  const retried = module.recordAnswer(restored, restored.session, restored.session.steps[restored.session.index], step.answer, { now: day(7) + 1 });
  assert.equal(retried.firstAttempt, false);
  assert.equal(restored.items[step.itemKey].incorrect, 1);
  assert.equal(module.advance(restored.session), true);
  const onceMore = module.loadProgress(JSON.stringify(restored));
  assert.equal(onceMore.session.answers[step.id].correct, false);
  assert.equal(onceMore.session.answers[step.id].latest.correct, true);
  assert.equal(JSON.stringify(progress), saved);
});

test('load discards unknown, prototype, invalid counters and forged answers, and rewinds skipped steps', async () => {
  const module = await engine(); requireApi(module, 'loadProgress');
  assert.deepEqual(module.loadProgress('{broken'), fresh());
  assert.deepEqual(module.loadProgress({ version: 2 }), fresh());
  const malicious = JSON.parse('{"version":1,"lessons":{"__proto__":{"completed":true},"unknown":{"completed":true}},"items":{"constructor":{"streak":10},"unknown":{"streak":1}}}');
  assert.deepEqual(module.loadProgress(malicious), fresh());
  assert.equal({}.completed, undefined);
  const session = module.createSession(LESSONS[0], { now: day(7) });
  session.index = session.steps.length;
  session.answers[session.steps[0].id] = { correct: true };
  session.answers[session.steps[1].id] = { visited: true };
  const restored = module.loadProgress({ version: 1, session, items: { 'cn-1:word:0': { streak: -1, correct: 2, incorrect: 0, lastDay: '2026-02-30', nextReview: day(7) } } });
  assert.equal(restored.session.index, 0);
  assert.deepEqual(restored.session.answers, {});
  assert.deepEqual(restored.items, {});
  session.index = session.steps.length + 1;
  assert.equal(module.loadProgress({ version: 1, session }).session, null);
  assert.equal(module.loadProgress({ version: 1, session: { ...session, index: 0, lessonId: '__proto__' } }).session, null);
});

test('recommendation resumes active canonical sessions then returns the next uncompleted lesson', async () => {
  const module = await engine(); requireApi(module, 'recommendLesson');
  const progress = fresh();
  assert.equal(module.recommendLesson(LESSONS, progress).id, 'cn-1');
  progress.session = module.createSession(LESSONS[1], { now: day(7) });
  assert.equal(module.recommendLesson(LESSONS, progress).id, 'cn-2');
  progress.session = null;
  progress.lessons['cn-1'] = { completed: true };
  assert.equal(module.recommendLesson(LESSONS, progress).id, 'cn-2');
  assert.equal(module.recommendLesson([LESSONS[0]], progress), null);
  const allDone = fresh();
  for (const lesson of LESSONS) allDone.lessons[lesson.id] = { completed: true };
  assert.equal(module.recommendLesson(LESSONS, allDone), null);
});

test('non-review sessions reject review keys instead of creating unusable sessions', async () => {
  const module = await engine();
  assert.equal(module.createSession(LESSONS[0], { now: day(7), reviewKeys: ['cn-1:word:0'] }), null);
  assert.deepEqual(module.buildSteps(LESSONS[0], { reviewKeys: ['cn-1:word:0'] }), []);
});

test('hinted first success cannot increase independent accuracy and missing visits prevent completion', async () => {
  const module = await engine(), progress = fresh(), session = module.createSession(LESSONS[0], { now: day(7) });
  const step = reach(module, progress, session, 'meaning');
  const result = module.recordAnswer(progress, session, step, step.answer, { now: day(7), hinted: true });
  assert.equal(result.item.streak, 0);
  assert.equal(result.item.nextReview, day(7));
  assert.equal(module.advance(session), true);
  finish(module, progress, session);
  const invalid = structuredClone(session);
  delete invalid.answers[invalid.steps[1].id];
  assert.equal(module.completeLesson(progress, invalid, { now: day(7) + 1 }), false);
  assert.equal(module.completeLesson(progress, session, { now: day(7) + 1 }), true);
  assert.equal(progress.lessons['cn-1'].bestAccuracy, 5 / 6);
});

test('all 26 source lessons finish and roundtrip without changing original curriculum', async () => {
  const module = await engine(), original = JSON.stringify(LESSONS), progress = fresh();
  for (const [i, lesson] of LESSONS.entries()) {
    const session = module.createSession(lesson, { now: day(7) + i });
    finish(module, progress, session);
    assert.equal(module.completeLesson(progress, session, { now: day(7) + i + 1 }), true);
    assert.equal(progress.lessons[lesson.id].bestAccuracy, 1);
    assert.equal(progress.lessons[lesson.id].attempts, 1);
    progress.session = session;
    assert.deepEqual(module.loadProgress(JSON.stringify(progress)), progress);
  }
  assert.equal(Object.keys(progress.lessons).length, 26);
  assert.equal(module.recommendLesson(LESSONS, progress), null);
  assert.equal(JSON.stringify(LESSONS), original);
});

test('due items sort by China midnight then stable key while invalid states stay out', async () => {
  const module = await engine(), progress = fresh();
  module.recordItemAnswer(progress, 'cn-2:word:0', false, { now: day(8) });
  module.recordItemAnswer(progress, 'cn-1:word:0', false, { now: day(7) });
  module.recordItemAnswer(progress, 'cn-1:check:cn-1:q1', false, { now: day(7) });
  progress.items.unknown = { streak: 0, lastDay: '2026-10-01', nextReview: day(1), correct: 0, incorrect: 1 };
  assert.deepEqual(module.dueItems(progress, day(8)), ['cn-1:check:cn-1:q1', 'cn-1:word:0', 'cn-2:word:0']);
  assert.deepEqual(module.dueItems(progress, NaN), []);
});

test('restoring a score recomputes correctness from canonical selections instead of cached flags', async () => {
  const module = await engine(), progress = fresh();
  const session = module.createSession(LESSONS[0], { now: day(7), review: true, reviewKeys: ['cn-1:word:0'] });
  const step = session.steps[0], wrong = step.choices.find(choice => choice !== step.answer);
  module.recordAnswer(progress, session, step, wrong, { now: day(7) });
  session.answers[step.id].correct = true;
  session.answers[step.id].latest.correct = true;
  session.index = 1;
  const restored = module.loadProgress({ ...progress, session });
  assert.equal(restored.session.index, 0);
  assert.equal(restored.session.answers[step.id].correct, false);
  assert.equal(restored.session.answers[step.id].latest.correct, false);
  assert.equal(module.advance(restored.session), false);
  assert.equal(module.completeLesson(restored, restored.session, { now: day(7) }), false);
});
