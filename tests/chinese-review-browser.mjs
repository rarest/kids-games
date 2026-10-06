import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser, sleep} from './game-browser-harness.mjs';
import {LESSONS} from '../chinese/curriculum.js';
import {createSession, loadProgress, recordAnswer} from '../chinese/engine.js';

async function tap(b, selector) {
  const point = await b.evaluate(`(() => {
    const button = document.querySelector(${JSON.stringify(selector)});
    if (!button || button.disabled) return null;
    button.scrollIntoView({block: 'center'});
    const rect = button.getBoundingClientRect();
    return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  assert.ok(point, `Enabled native input: ${selector}`);
  await b.call('Input.dispatchMouseEvent', {type: 'mousePressed', button: 'left', clickCount: 1, ...point});
  await b.call('Input.dispatchMouseEvent', {type: 'mouseReleased', button: 'left', clickCount: 1, ...point});
  await sleep(80);
}

async function firstWrong(b) {
  while (!await b.evaluate('!!chineseCourse.session.steps[chineseCourse.session.index].itemKey')) {
    await tap(b, '#cnNext');
  }
  const wrong = await b.evaluate(`(() => {
    const step = chineseCourse.session.steps[chineseCourse.session.index];
    return step.choices.findIndex(choice => choice !== step.answer);
  })()`);
  await tap(b, `[data-answer="${wrong}"]`);
}

async function finishNative(b) {
  for (let steps = 0; steps < 100 && await b.evaluate('!!chineseCourse.session'); steps++) {
    const correct = await b.evaluate(`(() => {
      const step = chineseCourse.session.steps[chineseCourse.session.index];
      return step?.choices?.indexOf(step.answer) ?? -1;
    })()`);
    if (correct >= 0 && !await b.evaluate('document.querySelector("[data-answer]").disabled')) {
      await tap(b, `[data-answer="${correct}"]`);
    }
    await tap(b, '#cnNext');
  }
  assert.equal(await b.evaluate('chineseCourse.session'), null);
}

async function checkpoint(b) {
  return b.evaluate(`({
    saved: chineseCourse.snapshot(),
    stored: localStorage.getItem(chineseCourse.storageKey)
  })`);
}

test('native review preserves first wrong answer and saved learning run until learning completes', {timeout: 60000}, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true);
    await b.navigate('games/chinese.html');
    await tap(b, '#startChinese');
    await firstWrong(b);
    await tap(b, '#cnHint');
    await tap(b, '#cnExit');
    const before = await checkpoint(b);
    const saved = before.saved.session;
    assert.equal(saved.lessonId, 'cn-1');
    assert.ok(saved.startedAt > 0);
    assert.equal(saved.index, 6);
    const stepId = saved.steps[saved.index].id;
    assert.equal(saved.answers[stepId].correct, false);

    await tap(b, '#cnReview');
    assert.deepEqual(await checkpoint(b), before, 'Review must preserve every saved field and exact persisted snapshot');
    assert.match(await b.evaluate('document.querySelector("#notice").textContent'), /先.*继续|先.*完成/);
    assert.ok(await b.evaluate('(() => { const r = document.querySelector("#notice").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })()'), 'The guidance must be visible after pressing review near the bottom of the home page');
    await b.navigate('games/chinese.html');
    await tap(b, '#startChinese');
    assert.deepEqual(await b.evaluate('chineseCourse.session'), saved);
    await finishNative(b);
    assert.equal(await b.evaluate('chineseCourse.progress.lessons["cn-1"].completed'), true);
    await tap(b, '#cnHome');
    await tap(b, '#cnReview');
    assert.equal(await b.evaluate('chineseCourse.session.review'), true);
    assert.equal(await b.evaluate('chineseCourse.session.lessonId'), 'cn-1');
    await finishNative(b);
    assert.equal(await b.evaluate('chineseCourse.progress.lessons["cn-1"].reviews'), 1);
    assert.match(await b.evaluate('document.querySelector("h1").textContent'), /复习，完成了/);
    assert.equal(JSON.parse((await checkpoint(b)).stored).session, null);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});

test('native review of another completed due lesson preserves unfinished current learning', {timeout: 60000}, async () => {
  const b = await openBrowser();
  try {
    await b.navigate('games/chinese.html');
    await tap(b, '#startChinese');
    await firstWrong(b);
    await finishNative(b);
    await tap(b, '#cnHome');
    await tap(b, '#startChinese');
    await firstWrong(b);
    await tap(b, '#cnExit');
    const before = await checkpoint(b);
    const saved = before.saved.session;
    assert.equal(saved.lessonId, 'cn-2');
    assert.ok(saved.startedAt > 0);
    assert.ok(saved.index > 0);
    assert.equal(saved.answers[saved.steps[saved.index].id].correct, false);
    assert.equal(before.saved.lessons['cn-1'].completed, true);

    await tap(b, '#cnReview');
    assert.deepEqual(await checkpoint(b), before);
    await tap(b, '#startChinese');
    assert.deepEqual(await b.evaluate('chineseCourse.session'), saved);
    // The public start method is also used by course integrations.
    await b.evaluate('chineseCourse.start("cn-1", {review:true})');
    assert.deepEqual(await checkpoint(b), before, 'Direct review entry must preserve the active run too');
    assert.deepEqual(await b.evaluate('chineseCourse.session'), saved);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});

async function seed(b, progress) {
  await b.call('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('pearl-chinese-course-v1', ${JSON.stringify(JSON.stringify(progress))});`,
  });
  await b.navigate('games/chinese.html');
}

test('due answers from uncompleted lessons do not create a review without a learning session', async () => {
  const progress = loadProgress(null);
  const session = createSession(LESSONS[0], {review: true});
  const step = session.steps[0];
  recordAnswer(progress, session, step, step.choices.find(choice => choice !== step.answer));
  const b = await openBrowser();
  try {
    await seed(b, progress);
    assert.equal(await b.evaluate('document.querySelector("#cnReview").disabled'), true);
    await b.evaluate('chineseCourse.start("cn-1", {review:true})');
    assert.equal(await b.evaluate('chineseCourse.progress.session'), null);
    assert.ok(await b.evaluate('!!document.querySelector("#startChinese")'));
  } finally {
    b.close();
  }
});

test('refused engine completion retains a legacy review snapshot and returns to a usable home', async () => {
  const progress = loadProgress(null);
  const lesson = LESSONS[0];
  const key = createSession(lesson, {review: true}).steps[0].itemKey;
  progress.session = createSession(lesson, {review: true, reviewKeys: [key]});
  const b = await openBrowser();
  try {
    await seed(b, progress);
    await b.evaluate(`window.__saveEvents = []; const original = chineseCourseCloud.onSave;
      chineseCourseCloud.onSave = function(payload) {
        window.__saveEvents.push(payload.event); return original.call(this, payload);
      };`);
    await tap(b, '#startChinese');
    const correct = await b.evaluate('chineseCourse.session.steps[0].choices.indexOf(chineseCourse.session.steps[0].answer)');
    await tap(b, `[data-answer="${correct}"]`);
    await tap(b, '#cnNext');
    const after = await checkpoint(b);
    assert.ok(after.saved.session, 'An engine refusal must not discard the run');
    assert.equal(after.saved.session.startedAt, progress.session.startedAt);
    assert.equal(after.saved.session.lessonId, 'cn-1');
    assert.equal(after.saved.session.index, 1);
    assert.deepEqual(await b.evaluate('chineseCourse.session'), after.saved.session);
    assert.deepEqual(JSON.parse(after.stored).session, after.saved.session);
    assert.equal(after.saved.lessons['cn-1'], undefined);
    assert.equal(await b.evaluate('!!document.querySelector(".cn-finish")'), false);
    assert.match(await b.evaluate('document.querySelector("#notice").textContent'), /未.*完成|没有.*完成/);
    assert.equal(await b.evaluate('__saveEvents.some(event => event?.kind === "completion")'), false);
    await tap(b, '#cnHome');
    assert.ok(await b.evaluate('!!document.querySelector("#startChinese")'));
    await tap(b, '#cnDirectory');
    assert.equal(await b.evaluate('document.querySelector("#directory").open'), true);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});
