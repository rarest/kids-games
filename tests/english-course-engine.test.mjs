import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSteps, createSession, loadProgress, recordAnswer, dueItems, completeLesson, recommendLesson } from '../english/course-engine.js';

const lesson = {
  id: 'sample-1', unitId: 'unit-1', title: 'Friends', type: 'words',
  words: [
    { id: 'cat', en: 'cat', zh: '猫', ipa: '/kæt/', visual: '🐈' },
    { id: 'dog', en: 'dog', zh: '狗', ipa: '/dɑɡ/', visual: '🐕' },
    { id: 'bird', en: 'bird', zh: '鸟', ipa: '/bɝd/', visual: '🐦' },
  ],
  phrases: [{ en: 'I have a cat.', zh: '我有一只猫。', page: 4 }],
  letters: [{ en: 'A a', say: 'A', ipa: '/eɪ/', example: 'apple', sound: '/æ/' }],
  reading: [{ en: 'The cat is my friend.', zh: '猫是我的朋友。', page: 5 }],
  checks: [
    { prompt: 'Who is my friend?', choices: ['猫', '狗', '鸟'], answer: '猫', why: '读到 cat 就知道朋友是猫。' },
    { prompt: 'Do I have a cat?', choices: ['有', '没有', '不知道'], answer: '有', why: 'have 表示有，句子说我有猫。' },
  ],
  activity: { title: '开口说', prompt: '说说自己的朋友。', example: 'I have a dog.' },
};
const lessons = [lesson, { ...lesson, id: 'sample-2' }];
const day = (n, hour = 12) => new Date(2026, 9, n, hour).getTime();
const fresh = () => loadProgress(null, lessons);
const scored = step => ['listen', 'meaning', 'sentence', 'check'].includes(step.kind);

// Expectations use this small, hand-checked lesson rather than a second builder.
test('each lesson word is taught and practised in both directions without exposing the listening answer', () => {
  const steps = buildSteps(lesson, { seed: 3 });
  assert.equal(steps.filter(s => s.kind === 'word').length, 3);
  assert.equal(steps.filter(s => s.kind === 'listen').length, 3);
  assert.equal(steps.filter(s => s.kind === 'meaning').length, 3);
  assert.equal(new Set(steps.map(s => s.id)).size, steps.length);
  for (const step of steps.filter(s => s.kind === 'listen')) {
    assert.equal(step.choices.filter(x => x === step.answer).length, 1);
    assert.equal(step.choices.length, new Set(step.choices).size);
    assert.ok(step.choices.every(x => ['cat', 'dog', 'bird'].includes(x)));
    assert.ok(!step.prompt.includes(step.answer));
    assert.equal(step.word, undefined);
    assert.equal(step.say, step.answer);
  }
  for (const step of steps.filter(s => s.kind === 'meaning')) {
    assert.ok(step.choices.every(x => ['猫', '狗', '鸟'].includes(x)));
    assert.equal(step.choices.filter(x => x === step.answer).length, 1);
  }
  assert.ok(steps.every((s, i) => i === 0 || s.stage >= steps[i - 1].stage));
});

test('sentence pieces retain every source word, are shuffled, and seeded builds are repeatable', () => {
  const first = buildSteps(lesson, { seed: 1 });
  assert.deepEqual(first, buildSteps(lesson, { seed: 1 }));
  const sentence = first.find(s => s.kind === 'sentence');
  assert.deepEqual([...sentence.tokens].sort(), ['I', 'a', 'cat', 'have']);
  assert.notDeepEqual(sentence.tokens, ['I', 'have', 'a', 'cat']);
  assert.equal(sentence.answer, 'I have a cat.');
  assert.equal(first.find(s => s.kind === 'letters').letters[0].sound, '/æ/');
  assert.ok(first.findIndex(s => s.kind === 'reading') < first.findIndex(s => s.kind === 'check'));
  assert.equal(first.filter(s => s.kind === 'check').length, 2);
  assert.equal(first.at(-1).kind, 'oral');
  assert.equal(first.at(-1).answer, undefined);
});

test('review removes introductory screens while retaining practice and oral self-assessment', () => {
  const steps = buildSteps(lesson, { review: true });
  assert.ok(!steps.some(s => ['word', 'phrase', 'letters'].includes(s.kind)));
  assert.equal(steps.filter(s => s.kind === 'listen').length, 3);
  assert.equal(steps.filter(s => s.kind === 'sentence').length, 1);
  assert.equal(steps.at(-1).kind, 'oral');
});

test('duplicate English or Chinese labels never make a multiple-choice answer ambiguous', () => {
  const duplicate = { ...lesson, words: [...lesson.words, { id: 'cat-2', en: 'cat', zh: '猫' }] };
  for (const step of buildSteps(duplicate).filter(s => ['listen', 'meaning'].includes(s.kind))) {
    assert.equal(step.choices.length, new Set(step.choices).size);
    assert.equal(step.choices.filter(x => x === step.answer).length, 1);
  }
});

test('save and restore retain the active step and answer history without trusting injected lesson content', () => {
  const progress = fresh();
  const session = createSession(lesson, { now: day(4), seed: 9 });
  session.index = 2;
  session.answers[session.steps.find(scored).id] = { correct: true, hinted: false };
  progress.session = session;
  recordAnswer(progress, 'sample-1:word:cat', true, { now: day(4) });
  const saved = JSON.stringify(progress);
  const restored = loadProgress(saved, lessons);
  assert.deepEqual(restored, progress);
  const tampered = JSON.parse(saved);
  tampered.session.steps[0].word.en = 'INJECTED';
  assert.equal(loadProgress(tampered, lessons).session.steps[0].word.en, 'cat');
  assert.equal(JSON.stringify(progress), saved);
});

test('corrupt, unknown, prototype, and out-of-range saved state is rejected safely', () => {
  assert.deepEqual(loadProgress('{broken', lessons), { version: 1, lessons: {}, items: {}, session: null });
  assert.deepEqual(loadProgress({ version: 90, wallet: 999 }, lessons), fresh());
  const malicious = JSON.parse('{"version":1,"lessons":{"unknown":{"completed":true},"__proto__":{"completed":true}},"items":{"unknown:word:cat":{"streak":99}},"session":{"lessonId":"unknown"}}');
  assert.deepEqual(loadProgress(malicious, lessons), fresh());
  const session = createSession(lesson);
  session.index = session.steps.length + 1;
  assert.equal(loadProgress({ version: 1, session }, lessons).session, null);
});

test('unhinted correct answers advance on distinct local dates at one, three, and seven day intervals', () => {
  const progress = fresh();
  const key = 'sample-1:word:cat';
  recordAnswer(progress, key, true, { now: day(4, 23) });
  assert.equal(progress.items[key].streak, 1);
  assert.equal(progress.items[key].nextReview, day(5, 0));
  recordAnswer(progress, key, true, { now: day(4, 23) + 1000 });
  assert.equal(progress.items[key].streak, 1);
  assert.equal(progress.items[key].nextReview, day(5, 0));
  assert.deepEqual(dueItems(progress, { now: day(4, 23) }), []);
  assert.deepEqual(dueItems(progress, { now: day(5, 0) }), [key]);
  recordAnswer(progress, key, true, { now: day(5, 0) });
  assert.equal(progress.items[key].streak, 2);
  assert.equal(progress.items[key].nextReview, day(8, 0));
  recordAnswer(progress, key, true, { now: day(8) });
  assert.equal(progress.items[key].streak, 3);
  assert.equal(progress.items[key].nextReview, day(15, 0));
});

test('wrong or hinted responses reset mastery and a same-day retry does not conceal the need to practise', () => {
  const progress = fresh();
  const key = 'sample-1:word:dog';
  recordAnswer(progress, key, true, { now: day(4) });
  recordAnswer(progress, key, false, { now: day(5) });
  recordAnswer(progress, key, true, { now: day(5) });
  assert.equal(progress.items[key].streak, 0);
  assert.deepEqual(dueItems(progress, { now: day(5) }), [key]);
  recordAnswer(progress, key, true, { now: day(6), hinted: true });
  assert.equal(progress.items[key].streak, 0);
  assert.equal(progress.items[key].correct, 3);
  assert.equal(progress.items[key].incorrect, 1);
  assert.equal(progress.items[key].nextReview, day(6, 0));
});

test('due items are ordered by their review time and honor zero and positive limits', () => {
  const progress = fresh();
  recordAnswer(progress, 'sample-1:word:dog', false, { now: day(5) });
  recordAnswer(progress, 'sample-1:word:cat', false, { now: day(4) });
  assert.deepEqual(dueItems(progress, { now: day(5), limit: 1 }), ['sample-1:word:cat']);
  assert.deepEqual(dueItems(progress, { now: day(5), limit: 0 }), []);
});

test('unfinished lessons cannot complete and repeated or restored completion cannot inflate attempts', () => {
  const progress = fresh();
  const session = createSession(lesson, { now: day(4) });
  assert.equal(completeLesson(progress, session, { now: day(4) }), false);
  assert.deepEqual(progress.lessons, {});
  session.index = session.steps.length;
  for (const step of session.steps.filter(scored)) session.answers[step.id] = true;
  session.answers[session.steps.at(-1).id] = false; // oral self-assessment is not a test score
  assert.equal(completeLesson(progress, session, { now: day(4) }), true);
  assert.equal(progress.lessons['sample-1'].bestAccuracy, 1);
  assert.equal(progress.lessons['sample-1'].attempts, 1);
  assert.equal(completeLesson(progress, session, { now: day(4) }), false);
  const restored = loadProgress(JSON.stringify({ ...progress, session }), lessons);
  assert.equal(completeLesson(restored, restored.session, { now: day(5) }), false);
  assert.equal(restored.lessons['sample-1'].attempts, 1);
  const retry = createSession(lesson, { now: day(5), review: true });
  retry.index = retry.steps.length;
  retry.answers = Object.fromEntries(retry.steps.filter(scored).map(s => [s.id, { correct: false }]));
  assert.equal(completeLesson(progress, retry, { now: day(5) }), false);
  assert.equal(progress.lessons['sample-1'].attempts, 1);
  assert.equal(progress.lessons['sample-1'].reviews, 1);
  assert.equal(progress.lessons['sample-1'].bestAccuracy, 1);
});

test('recommendation resumes a valid unfinished session before choosing the next incomplete lesson', () => {
  const progress = fresh();
  assert.equal(recommendLesson(lessons, progress).id, 'sample-1');
  progress.session = createSession(lessons[1]);
  assert.equal(recommendLesson(lessons, progress).id, 'sample-2');
  progress.session = null;
  progress.lessons['sample-1'] = { completed: true };
  assert.equal(recommendLesson(lessons, progress).id, 'sample-2');
  progress.lessons['sample-2'] = { completed: true };
  assert.equal(recommendLesson(lessons, progress), null);
});

test('family synonyms and overlapping definitions are not used as competing meaning choices', () => {
  const family = { ...lesson, words: [
    { id: 'father', en: 'father', zh: '父亲' }, { id: 'dad', en: 'dad', zh: '爸爸' },
    { id: 'mother', en: 'mother', zh: '母亲' }, { id: 'mom', en: 'mom', zh: '妈妈' },
    { id: 'grandmother', en: 'grandmother', zh: '祖母；外祖母' }, { id: 'grandma', en: 'grandma', zh: '奶奶；外婆' },
    { id: 'milk', en: 'milk', zh: '牛奶；挤奶' }, { id: 'milk-verb', en: 'milk a cow', zh: '挤奶' },
  ] };
  const steps = buildSteps(family);
  assert.ok(!steps.find(s => s.kind === 'meaning' && s.answer === '父亲').choices.includes('爸爸'));
  assert.ok(!steps.find(s => s.kind === 'meaning' && s.answer === '祖母；外祖母').choices.includes('奶奶；外婆'));
  assert.ok(!steps.find(s => s.kind === 'meaning' && s.answer === '牛奶；挤奶').choices.includes('挤奶'));
  const two = buildSteps({ ...lesson, words: family.words.slice(0, 2) });
  assert.deepEqual(two.filter(s => s.kind === 'meaning').map(s => s.choices.length), [1, 1]);
});

test('restoring a correct retry retains the latest feedback and the first wrong answer separately', () => {
  const session = createSession(lesson, { now: day(4), seed: 12 });
  session.index = session.steps.findIndex(s => s.kind === 'listen');
  const current = session.steps[session.index];
  session.answers[current.id] = { correct: false, hinted: true };
  session.feedback = { stepId: current.id, correct: true, selected: current.answer, why: current.why };
  const restored = loadProgress(JSON.stringify({ version: 1, session }), lessons).session;
  assert.deepEqual(restored.answers[current.id], { correct: false, hinted: true });
  assert.deepEqual(restored.feedback, session.feedback);
  session.feedback = null;
  const fallback = loadProgress({ version: 1, session }, lessons).session.feedback;
  assert.equal(fallback.correct, false);
  assert.equal(fallback.stepId, current.id);
});

test('sentence selections restore by unique token index or valid token multiset, and discard malformed selections', () => {
  const session = createSession(lesson, { now: day(4) });
  session.index = session.steps.findIndex(s => s.kind === 'sentence');
  session.picked = [0, 2];
  assert.deepEqual(loadProgress({ version: 1, session }, lessons).session.picked, [0, 2]);
  session.picked = [0, 0];
  assert.deepEqual(loadProgress({ version: 1, session }, lessons).session.picked, []);
  session.picked = ['have', 'cat'];
  assert.deepEqual(loadProgress({ version: 1, session }, lessons).session.picked, ['have', 'cat']);
  session.picked = ['have', 'have'];
  assert.deepEqual(loadProgress({ version: 1, session }, lessons).session.picked, []);
});

test('completed session replay is ignored even after a different review attempt has finished', () => {
  const progress = fresh();
  const original = createSession(lesson, { now: day(4) });
  original.index = original.steps.length;
  const unmarkedReplay = JSON.parse(JSON.stringify(original));
  completeLesson(progress, original, { now: day(4) });
  const review = createSession(lesson, { now: day(5), review: true });
  review.index = review.steps.length;
  completeLesson(progress, review, { now: day(5) });
  assert.equal(completeLesson(progress, unmarkedReplay, { now: day(6) }), false);
  assert.equal(progress.lessons[lesson.id].attempts, 1);
  assert.equal(progress.lessons[lesson.id].reviews, 1);
});

test('a damaged feedback flag cannot turn a wrong saved selection into a successful retry', () => {
  const session = createSession(lesson, { now: day(4) });
  session.index = session.steps.findIndex(s => s.kind === 'listen');
  const current = session.steps[session.index];
  session.feedback = { stepId: current.id, correct: true, selected: current.choices.find(x => x !== current.answer), why: 'injected explanation' };
  const restored = loadProgress({ version: 1, session }, lessons).session;
  assert.equal(restored.feedback.correct, false);
  assert.equal(restored.feedback.why, current.why);
});

test('focused review includes only due keys from this lesson and restores the same practice steps', () => {
  const keys = ['sample-1:word:dog', 'sample-1:phrase:0', 'sample-2:word:cat', 'sample-1:word:unknown'];
  const session = createSession(lesson, { review: true, reviewKeys: keys, seed: 18, now: day(4) });
  assert.deepEqual(session.reviewKeys, ['sample-1:word:dog', 'sample-1:phrase:0']);
  assert.deepEqual(session.steps.map(s => s.kind), ['listen', 'meaning', 'sentence']);
  assert.ok(session.steps.every(s => session.reviewKeys.includes(s.itemKey)));
  session.index = 1;
  session.answers[session.steps[0].id] = { correct: false, hinted: false };
  const restored = loadProgress(JSON.stringify({ version: 1, session }), lessons).session;
  assert.deepEqual(restored, session);
  const tampered = { ...session, reviewKeys: ['sample-2:word:cat'] };
  assert.equal(loadProgress({ version: 1, session: tampered }, lessons).session, null);
});

test('review completion records practice but cannot complete an unfinished lesson or award its first completion', () => {
  const progress = fresh();
  const review = createSession(lesson, { review: true, reviewKeys: ['sample-1:word:cat'], now: day(4) });
  review.index = review.steps.length;
  review.answers = Object.fromEntries(review.steps.map(s => [s.id, { correct: true, hinted: false }]));
  assert.equal(completeLesson(progress, review, { now: day(4) }), false);
  assert.equal(progress.lessons[lesson.id].completed, false);
  assert.equal(progress.lessons[lesson.id].attempts, 0);
  assert.equal(progress.lessons[lesson.id].reviews, 1);
  assert.equal(progress.lessons[lesson.id].bestReviewAccuracy, 1);
  assert.equal(recommendLesson(lessons, progress).id, lesson.id);
  const restored = loadProgress(JSON.stringify({ ...progress, session: review }), lessons);
  assert.equal(completeLesson(restored, restored.session, { now: day(5) }), false);
  assert.equal(restored.lessons[lesson.id].reviews, 1);
  const learning = createSession(lesson, { now: day(5) });
  learning.index = learning.steps.length;
  assert.equal(completeLesson(progress, learning, { now: day(5) }), true);
  assert.equal(progress.lessons[lesson.id].completed, true);
  assert.equal(progress.lessons[lesson.id].attempts, 1);
  assert.equal(progress.lessons[lesson.id].reviews, 1);
});

test('oral self-report survives saving without acquiring a correctness score', () => {
  const session = createSession(lesson, { now: day(4) });
  session.index = session.steps.findIndex(s => s.kind === 'oral');
  const key = session.steps[session.index].id;
  session.answers[key] = { selfReported: true };
  const restored = loadProgress({ version: 1, session }, lessons).session;
  assert.deepEqual(restored.answers[key], { selfReported: true });
  assert.equal(restored.answers[key].correct, undefined);
});

test('a comprehension check without English say does not fall back to reading the Chinese prompt', () => {
  const checks = buildSteps({ ...lesson, checks: [{ prompt: '朋友是哪只动物？', choices: ['猫', '狗', '鸟'], answer: '猫', why: 'cat 是猫。' }] }).filter(s => s.kind === 'check');
  assert.equal(checks[0].say, undefined);
});

test('first completion remains false when 10000 newer game claims evict the original course reward claim', async () => {
  const { completeCard, loadSave } = await import('../english/core.js');
  const progress = fresh();
  const wallet = loadSave(null);
  const original = createSession(lesson, { now: day(4) });
  original.index = original.steps.length;
  assert.equal(completeLesson(progress, original), true);
  assert.equal(completeCard(wallet, `course:${lesson.id}`), true);
  for (let index = 0; index < 10000; index++) completeCard(wallet, `later-game-card:${index}`);
  assert.equal(wallet.claimed.includes(`course:${lesson.id}`), false);
  const retry = createSession(lesson, { now: day(5) });
  retry.index = retry.steps.length;
  assert.equal(completeLesson(progress, retry), false);
  assert.equal(progress.lessons[lesson.id].completed, true);
  assert.equal(progress.lessons[lesson.id].attempts, 2);
});
