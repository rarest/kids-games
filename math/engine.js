import { LESSONS } from './curriculum.js';

const knownLessons = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const time = value => Number.isSafeInteger(value) && value >= 0 && value <= 8640000000000000 - 8 * 3600000;
const clone = value => JSON.parse(JSON.stringify(value));
const scored = step => step.kind === 'question';
const kinds = new Set(['preview', 'explore', 'learn', 'question', 'expression', 'recap']);

/** Rebuilds only published curriculum content; IDs use original source indices. */
export function buildSteps(lesson, { review = false, reviewKeys = [] } = {}) {
  lesson = knownLessons.get(lesson?.id);
  if (!lesson || typeof review !== 'boolean' || !Array.isArray(reviewKeys) || (!review && reviewKeys.length)) return [];
  const steps = lesson.steps.map((source, index) => ({
    ...clone(source), id: `${lesson.id}:${source.kind}:${index}`,
    ...(source.kind === 'question' ? { itemKey: `${lesson.id}:question:${index}` } : {}),
    stage: ['preview', 'explore', 'learn', 'question', 'expression', 'recap'].indexOf(source.kind),
  }));
  if (steps.some(step => !kinds.has(step.kind))) return [];
  return review ? steps.filter(step => scored(step) && (!reviewKeys.length || reviewKeys.includes(step.itemKey))) : steps;
}

function selection(step, selected) {
  if (typeof selected !== 'string' || selected.length > 128) return null;
  if (Array.isArray(step.choices)) return step.choices.includes(selected) ? selected : null;
  const value = selected.normalize('NFKC').trim();
  if (/^\d+$/.test(step.answer)) return /^\d+$/.test(value) ? BigInt(value).toString() : null;
  if (/^\d+\/\d+$/.test(step.answer)) {
    const match = value.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) return null;
    let numerator = BigInt(match[1]), denominator = BigInt(match[2]);
    if (denominator === 0n) return null;
    let a = numerator, b = denominator;
    while (b) [a, b] = [b, a % b];
    return `${numerator / a}/${denominator / a}`;
  }
  return value || null;
}

/** Correctness always uses the published step, including its choices allowlist. */
export function checkAnswer(step, selected) {
  const canonical = knownSteps.get(step?.id);
  if (!canonical || !scored(canonical)) return false;
  const value = selection(canonical, selected);
  return value !== null && value === selection(canonical, canonical.answer);
}

export function createSession(lesson, { now = Date.now(), review = false, reviewKeys = [] } = {}) {
  const steps = buildSteps(lesson, { review, reviewKeys });
  if (!time(now) || !steps.length) return null;
  const keys = reviewKeys.length ? [...new Set(steps.map(step => step.itemKey))] : [];
  return { lessonId: lesson.id, startedAt: now, index: 0, review, reviewKeys: keys, steps, answers: {}, feedback: null };
}

const count = value => Number.isSafeInteger(value) && value >= 0;
const accuracy = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const DAY_MS = 86400000, CHINA_OFFSET = 8 * 3600000;
const chinaDay = now => new Date(now + CHINA_OFFSET).toISOString().slice(0, 10);
const midnightAfter = (now, days) => Math.floor((now + CHINA_OFFSET) / DAY_MS) * DAY_MS - CHINA_OFFSET + days * DAY_MS;
const interval = streak => streak === 1 ? 1 : streak === 2 ? 3 : 7;
const knownSteps = new Map(LESSONS.flatMap(lesson => buildSteps(lesson)).map(step => [step.id, step]));
const knownItems = new Set([...knownSteps.values()].filter(scored).map(step => step.itemKey));
const validDay = day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
const validItem = item => object(item) && count(item.streak) && count(item.correct) && count(item.incorrect)
  && item.streak <= item.correct && validDay(item.lastDay) && time(item.nextReview)
  && item.nextReview === Date.parse(`${item.lastDay}T00:00:00+08:00`) + (item.streak ? interval(item.streak) * DAY_MS : 0);
const emptyLesson = () => ({ completed: false, attempts: 0, bestAccuracy: 0, completedSessions: [], reviews: 0, bestReviewAccuracy: 0, completedReviewSessions: [] });
const runId = session => `${session.startedAt}:${session.review ? 'review' : 'learn'}`;
const validRuns = (values, kind) => Array.isArray(values) ? [...new Set(values.filter(value => {
  if (typeof value !== 'string' || !new RegExp(`^\\d+:${kind}$`).test(value)) return false;
  return time(Number(value.split(':')[0]));
}))] : [];

function lessonState(raw) {
  if (!object(raw) || typeof raw.completed !== 'boolean' || !count(raw.attempts) || !accuracy(raw.bestAccuracy)
    || (raw.completed && raw.attempts === 0)) return null;
  return {
    completed: raw.completed, attempts: raw.attempts, bestAccuracy: raw.bestAccuracy,
    completedSessions: validRuns(raw.completedSessions, 'learn'),
    reviews: count(raw.reviews) ? raw.reviews : 0,
    bestReviewAccuracy: accuracy(raw.bestReviewAccuracy) ? raw.bestReviewAccuracy : 0,
    completedReviewSessions: validRuns(raw.completedReviewSessions, 'review'),
    ...(time(raw.lastCompletedAt) ? { lastCompletedAt: raw.lastCompletedAt } : {}),
    ...(time(raw.lastReviewedAt) ? { lastReviewedAt: raw.lastReviewedAt } : {}),
  };
}

function canonicalSession(raw) {
  if (!object(raw) || !knownLessons.has(raw.lessonId) || !time(raw.startedAt) || !count(raw.index)
    || typeof raw.review !== 'boolean' || (raw.reviewKeys !== undefined && !Array.isArray(raw.reviewKeys))
    || (!raw.review && raw.reviewKeys?.length)) return null;
  const session = createSession(knownLessons.get(raw.lessonId), {
    now: raw.startedAt, review: raw.review, reviewKeys: raw.reviewKeys ?? [],
  });
  return session && raw.index <= session.steps.length ? session : null;
}

function savedAnswer(step, raw, startedAt) {
  if (!object(raw)) return null;
  if (!scored(step)) {
    if (step.kind === 'expression') return raw.selfReported === true && raw.attempted === true ? { attempted: true, selfReported: true } : null;
    return raw.visited === true ? { visited: true } : null;
  }
  const attempt = value => object(value) && selection(step, value.selected) !== null && typeof value.hinted === 'boolean'
    && typeof value.correct === 'boolean' && time(value.answeredAt) && value.answeredAt >= startedAt;
  if (!attempt(raw) || !attempt(raw.latest) || !count(raw.attempts) || raw.attempts < 1 || raw.latest.answeredAt < raw.answeredAt) return null;
  if (raw.attempts === 1 && (raw.selected !== raw.latest.selected || raw.hinted !== raw.latest.hinted || raw.answeredAt !== raw.latest.answeredAt)) return null;
  const normalize = value => ({ selected: selection(step, value.selected), correct: checkAnswer(step, value.selected), hinted: value.hinted, answeredAt: value.answeredAt });
  return { ...normalize(raw), latest: normalize(raw.latest), attempts: raw.attempts };
}

const finished = (step, answer) => Boolean(answer && (!scored(step) || answer.latest.correct));
const feedbackFor = (step, answer) => ({
  stepId: step.id, selected: answer.latest.selected, correct: answer.latest.correct,
  hinted: answer.latest.hinted, explanation: step.explanation || '',
});

/** Pure allowlist loader. Rebuilds steps, recomputes correctness and restores only a sequential answer prefix. */
export function loadProgress(raw, lessons = LESSONS) {
  const progress = { version: 1, lessons: {}, items: {}, session: null };
  try { if (typeof raw === 'string') raw = JSON.parse(raw); } catch { return progress; }
  if (!object(raw) || raw.version !== 1 || !Array.isArray(lessons)) return progress;
  const allowed = new Set(lessons.map(lesson => lesson?.id).filter(id => knownLessons.has(id)));
  const items = new Set([...knownItems].filter(key => allowed.has(key.split(':')[0])));
  for (const id of allowed) {
    const state = object(raw.lessons) && own(raw.lessons, id) ? lessonState(raw.lessons[id]) : null;
    if (state) progress.lessons[id] = state;
  }
  if (object(raw.items)) for (const [key, item] of Object.entries(raw.items)) {
    if (items.has(key) && validItem(item)) progress.items[key] = {
      streak: item.streak, lastDay: item.lastDay, nextReview: item.nextReview, correct: item.correct, incorrect: item.incorrect,
    };
  }
  const saved = raw.session;
  const session = canonicalSession(saved);
  if (!session || !allowed.has(session.lessonId)) return progress;
  let firstUnfinished = session.steps.length;
  for (const [index, step] of session.steps.entries()) {
    const answer = object(saved.answers) && own(saved.answers, step.id) ? savedAnswer(step, saved.answers[step.id], session.startedAt) : null;
    if (answer) session.answers[step.id] = answer;
    if (!finished(step, answer)) { firstUnfinished = index; break; }
  }
  session.index = Math.min(saved.index, firstUnfinished);
  const current = session.steps[session.index];
  if (current && scored(current) && own(session.answers, current.id)) session.feedback = feedbackFor(current, session.answers[current.id]);
  if (session.index === session.steps.length && time(saved.completedAt) && saved.completedAt >= session.startedAt) session.completedAt = saved.completedAt;
  progress.session = session;
  return progress;
}

/** Shared by first UI answers and validated server events. Returns the mutated item, or null on invalid input. */
export function recordItemAnswer(progress, itemKey, correct, { hinted = false, now = Date.now() } = {}) {
  if (!object(progress) || !knownItems.has(itemKey) || typeof correct !== 'boolean' || typeof hinted !== 'boolean' || !time(now)) return null;
  const previous = object(progress.items) && own(progress.items, itemKey) && validItem(progress.items[itemKey])
    ? progress.items[itemKey] : { streak: 0, lastDay: '', nextReview: midnightAfter(now, 0), correct: 0, incorrect: 0 };
  let { streak, nextReview } = previous;
  if (!correct || hinted) { streak = 0; nextReview = midnightAfter(now, 0); }
  else if (chinaDay(now) !== previous.lastDay) { streak++; nextReview = midnightAfter(now, interval(streak)); }
  const item = { streak, lastDay: chinaDay(now), nextReview, correct: previous.correct + (correct ? 1 : 0), incorrect: previous.incorrect + (correct ? 0 : 1) };
  if (!object(progress.items)) progress.items = {};
  progress.items[itemKey] = item;
  return item;
}

/** Mutates session answers/feedback; only a first scored answer mutates progress.items. */
export function recordAnswer(progress, session, step, selected, { hinted = false, now = Date.now() } = {}) {
  const canonical = canonicalSession(session);
  if (!object(progress) || !canonical || !time(now) || now < session.startedAt || typeof hinted !== 'boolean' || !object(session.answers)) return null;
  const current = canonical.steps[session.index];
  if (!current || step?.id !== current.id) return null;
  for (let i = 0; i < session.index; i++) {
    const prior = canonical.steps[i];
    if (!finished(prior, own(session.answers, prior.id) ? savedAnswer(prior, session.answers[prior.id], session.startedAt) : null)) return null;
  }
  const previous = own(session.answers, current.id) ? savedAnswer(current, session.answers[current.id], session.startedAt) : null;
  if (own(session.answers, current.id) && !previous) return null;
  const firstAttempt = previous === null;
  if (!scored(current)) {
    const selfReported = current.kind === 'expression';
    if (!object(selected) || (selfReported ? selected.selfReported !== true : selected.visited !== true)) return null;
    session.answers[current.id] = selfReported ? { attempted: true, selfReported: true } : { visited: true };
    session.feedback = null;
    return { scored: false, firstAttempt, feedback: null };
  }
  selected = selection(current, selected);
  if (selected === null || (previous && (previous.latest.correct || now < previous.latest.answeredAt))) return null;
  const answer = { selected, correct: checkAnswer(current, selected), hinted: hinted || previous?.latest.hinted === true, answeredAt: now };
  session.answers[current.id] = previous ? { ...previous, latest: answer, attempts: previous.attempts + 1 } : { ...answer, latest: { ...answer }, attempts: 1 };
  session.feedback = feedbackFor(current, session.answers[current.id]);
  const item = firstAttempt ? recordItemAnswer(progress, current.itemKey, answer.correct, { hinted, now }) : null;
  return { scored: true, firstAttempt, selected, correct: answer.correct, hinted: answer.hinted, itemKey: current.itemKey, feedback: session.feedback, item };
}

export function advance(session) {
  const canonical = canonicalSession(session);
  if (!canonical || !object(session.answers) || session.index >= canonical.steps.length) return false;
  for (let i = 0; i <= session.index; i++) {
    const step = canonical.steps[i];
    if (!finished(step, own(session.answers, step.id) ? savedAnswer(step, session.answers[step.id], session.startedAt) : null)) return false;
  }
  session.index++;
  session.feedback = null;
  return true;
}

/** Returns true for each new valid learn/review run. Reviews never mark unlearned lessons completed. */
export function completeLesson(progress, session, { now = Date.now() } = {}) {
  const canonical = canonicalSession(session);
  if (!object(progress) || !canonical || !time(now) || now < session.startedAt || session.index !== canonical.steps.length || !object(session.answers)) return false;
  const answers = canonical.steps.map(step => own(session.answers, step.id) ? savedAnswer(step, session.answers[step.id], session.startedAt) : null);
  if (answers.some((answer, i) => !finished(canonical.steps[i], answer) || (scored(canonical.steps[i]) && answer.latest.answeredAt > now))) return false;
  const previous = object(progress.lessons) && own(progress.lessons, session.lessonId) ? lessonState(progress.lessons[session.lessonId]) : null;
  if (session.review && !previous?.completed) return false;
  const state = previous || emptyLesson();
  const runs = session.review ? state.completedReviewSessions : state.completedSessions;
  const run = runId(session);
  if (runs.includes(run)) return false;
  const tests = answers.filter((_, i) => scored(canonical.steps[i]));
  const result = tests.filter(answer => answer.correct && !answer.hinted).length / tests.length;
  if (session.review) {
    state.reviews++;
    state.bestReviewAccuracy = Math.max(state.bestReviewAccuracy, result);
    state.lastReviewedAt = now;
    state.completedReviewSessions.push(run);
  } else {
    state.completed = true;
    state.attempts++;
    state.bestAccuracy = Math.max(state.bestAccuracy, result);
    state.lastCompletedAt = now;
    state.completedSessions.push(run);
  }
  if (!object(progress.lessons)) progress.lessons = {};
  progress.lessons[session.lessonId] = state;
  session.completedAt = now;
  return true;
}

export function dueItems(progress, now = Date.now()) {
  if (!time(now) || !object(progress?.items)) return [];
  return Object.entries(progress.items).filter(([key, item]) => knownItems.has(key) && validItem(item) && item.nextReview <= now)
    .sort(([a, first], [b, second]) => first.nextReview - second.nextReview || a.localeCompare(b)).map(([key]) => key);
}

export function recommendLesson(lessons, progress) {
  if (!Array.isArray(lessons)) return null;
  const active = canonicalSession(progress?.session);
  if (active && progress.session.index < active.steps.length && !time(progress.session.completedAt)) {
    const lesson = lessons.find(lesson => lesson.id === active.lessonId);
    if (lesson) return knownLessons.get(lesson.id);
  }
  const next = lessons.find(lesson => knownLessons.has(lesson?.id) && !(object(progress?.lessons) && own(progress.lessons, lesson.id) && progress.lessons[lesson.id]?.completed === true));
  return next ? knownLessons.get(next.id) : null;
}
