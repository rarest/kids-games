import { answerMatches, random } from './core.js';

const scoredKinds = new Set(['listen', 'meaning', 'sentence', 'check']);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const safeKey = key => typeof key === 'string' && key.length > 0 && !['__proto__', 'constructor', 'prototype'].includes(key);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
const clone = value => JSON.parse(JSON.stringify(value));
const textKey = value => String(value).trim().toLowerCase();
const tokensFor = value => String(value).replace(/[.,!?]/g, '').trim().split(/\s+/).filter(Boolean);
const shuffled = (values, rng) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const familyMeaning = new Map([
  ['father', 'father'], ['dad', 'father'], ['daddy', 'father'],
  ['mother', 'mother'], ['mum', 'mother'], ['mom', 'mother'], ['mummy', 'mother'], ['mommy', 'mother'],
  ['grandfather', 'grandfather'], ['grandpa', 'grandfather'],
  ['grandmother', 'grandmother'], ['grandma', 'grandmother'],
]);
const sameMeaning = (a, b) => {
  const aFamily = familyMeaning.get(textKey(a.en));
  if (aFamily && aFamily === familyMeaning.get(textKey(b.en))) return true;
  const senses = word => String(word.zh).replace(/（[^）]*）|\([^)]*\)/g, '').split(/[；;，,、\/]/).map(textKey).filter(Boolean);
  const first = senses(a);
  return senses(b).some(sense => first.includes(sense));
};
const choicesFor = (word, words, field, rng) => {
  const answer = word[field];
  const seen = new Set([textKey(answer)]);
  const candidates = shuffled(words, rng).filter(other => {
    const label = textKey(other[field]);
    if (seen.has(label) || (field === 'zh' && sameMeaning(word, other))) return false;
    seen.add(label);
    return true;
  });
  return shuffled([answer, ...candidates.slice(0, 2).map(other => other[field])], rng);
};

/** Builds lesson-owned teaching and practice steps; never reads or changes browser state. */
export function buildSteps(lesson, { review = false, seed = 1, reviewKeys } = {}) {
  const rng = random(seed);
  const steps = [];
  const words = lesson.words || [];
  const phrases = lesson.phrases || [];
  const add = (kind, stage, data) => steps.push({ id: `${lesson.id}:${kind}:${steps.length}`, kind, stage, ...data });
  if (!review) {
    for (const word of words) add('word', 0, { word: clone(word), say: word.say || word.en });
    if (lesson.letters?.length) add('letters', 0, { letters: clone(lesson.letters) });
  }
  for (const word of words) {
    const itemKey = `${lesson.id}:word:${word.id}`;
    add('listen', 1, { itemKey, prompt: '听一听，选择听到的单词。', choices: choicesFor(word, words, 'en', rng), answer: word.en, say: word.say || word.en, why: `听到的是 ${word.en}，意思是${word.zh}。` });
    add('meaning', 1, { itemKey, prompt: `${word.en} 的意思是什么？`, choices: choicesFor(word, words, 'zh', rng), answer: word.zh, say: word.say || word.en, why: `${word.en} 的意思是${word.zh}。` });
  }
  for (const [index, phrase] of phrases.entries()) {
    if (!review) add('phrase', 2, { phrase: clone(phrase), say: phrase.say || phrase.en });
    const original = tokensFor(phrase.en);
    let tokens = shuffled(original, rng);
    // A seed can produce the original order. Rotate distinct tokens so this remains a building exercise.
    if (tokens.length > 1 && tokens.join(' ') === original.join(' ') && new Set(tokens).size > 1) tokens = [...tokens.slice(1), tokens[0]];
    add('sentence', 2, { itemKey: `${lesson.id}:phrase:${index}`, prompt: phrase.zh, tokens, answer: phrase.en, say: phrase.say || phrase.en, why: phrase.zh, ...(phrase.acceptedAnswers ? { acceptedAnswers: [...phrase.acceptedAnswers] } : {}) });
  }
  if (lesson.reading?.length) add('reading', 3, { lines: clone(lesson.reading) });
  for (const [index, check] of (lesson.checks || []).entries()) {
    add('check', 3, { itemKey: `${lesson.id}:check:${index}`, prompt: check.prompt, choices: shuffled([...new Set(check.choices)], rng), answer: check.answer, why: check.why, ...(check.say ? { say: check.say } : {}) });
  }
  if (lesson.activity) add('oral', 3, { prompt: lesson.activity.prompt, title: lesson.activity.title, ...(lesson.activity.example ? { example: lesson.activity.example, say: lesson.activity.example } : {}) });
  return review && Array.isArray(reviewKeys) ? steps.filter(step => step.itemKey && reviewKeys.includes(step.itemKey)) : steps;
}

export function createSession(lesson, { now = Date.now(), review = false, seed = 1, reviewKeys } = {}) {
  const steps = buildSteps(lesson, { review, seed, reviewKeys });
  const keys = review && Array.isArray(reviewKeys) ? [...new Set(reviewKeys.filter(key => steps.some(step => step.itemKey === key)))] : null;
  return { lessonId: lesson.id, review: Boolean(review), seed: seed >>> 0, ...(keys ? { reviewKeys: keys } : {}), steps, index: 0, answers: {}, picked: [], feedback: null, startedAt: now };
}

const localDay = now => {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const midnightAfter = (now, days) => {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).getTime();
};
const validDay = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
};
const validItem = item => item && count(item.streak) && validDay(item.lastDay) && finite(item.nextReview) && count(item.correct) && count(item.incorrect);
const validAnswer = value => typeof value === 'boolean' || (value && typeof value === 'object' && typeof value.correct === 'boolean' && (value.hinted === undefined || typeof value.hinted === 'boolean'));
const answerCorrect = value => typeof value === 'boolean' ? value : value?.correct === true;
const completionId = session => `${session.startedAt}:${session.review ? 'review' : 'learn'}`;

/** Returns a new versioned save. Legacy saves and unknown curriculum IDs are ignored. */
export function loadProgress(raw, lessons) {
  const progress = { version: 1, lessons: {}, items: {}, session: null };
  try { if (typeof raw === 'string') raw = JSON.parse(raw); } catch { return progress; }
  if (!raw || raw.version !== 1) return progress;
  const known = new Map(lessons.filter(lesson => safeKey(lesson.id)).map(lesson => [lesson.id, lesson]));
  const itemKeys = new Set();
  for (const lesson of known.values()) {
    for (const step of buildSteps(lesson)) if (step.itemKey) itemKeys.add(step.itemKey);
    const saved = own(raw.lessons || {}, lesson.id) ? raw.lessons[lesson.id] : null;
    if (saved && typeof saved.completed === 'boolean' && count(saved.attempts) && finite(saved.bestAccuracy) && saved.bestAccuracy >= 0 && saved.bestAccuracy <= 1) {
      progress.lessons[lesson.id] = {
        completed: saved.completed, attempts: saved.attempts, bestAccuracy: saved.bestAccuracy,
        ...(finite(saved.lastCompletedAt) ? { lastCompletedAt: saved.lastCompletedAt } : {}),
        completedSessions: Array.isArray(saved.completedSessions) ? [...new Set(saved.completedSessions.filter(value => typeof value === 'string' && /^\d+(?:\.\d+)?:[a-z]+$/.test(value)))] : [],
        ...(count(saved.reviews) ? { reviews: saved.reviews } : {}),
        ...(finite(saved.bestReviewAccuracy) && saved.bestReviewAccuracy >= 0 && saved.bestReviewAccuracy <= 1 ? { bestReviewAccuracy: saved.bestReviewAccuracy } : {}),
        ...(finite(saved.lastReviewedAt) ? { lastReviewedAt: saved.lastReviewedAt } : {}),
        ...(Array.isArray(saved.completedReviewSessions) ? { completedReviewSessions: [...new Set(saved.completedReviewSessions.filter(value => typeof value === 'string' && /^\d+(?:\.\d+)?:review$/.test(value)))] } : {}),
      };
    }
  }
  for (const [key, item] of Object.entries(raw.items || {})) {
    if (itemKeys.has(key) && validItem(item)) progress.items[key] = { streak: item.streak, lastDay: item.lastDay, nextReview: item.nextReview, correct: item.correct, incorrect: item.incorrect };
  }
  const saved = raw.session;
  const lesson = saved && known.get(saved.lessonId);
  if (!lesson || typeof saved.review !== 'boolean' || !finite(saved.startedAt) || !count(saved.index) || (saved.seed !== undefined && !count(saved.seed))) return progress;
  if (saved.reviewKeys !== undefined && (!saved.review || !Array.isArray(saved.reviewKeys))) return progress;
  const session = createSession(lesson, { now: saved.startedAt, review: saved.review, seed: saved.seed ?? 1, reviewKeys: saved.reviewKeys });
  if (saved.reviewKeys !== undefined && session.reviewKeys.length === 0) return progress;
  if (saved.index > session.steps.length) return progress;
  session.index = saved.index;
  for (const step of session.steps) {
    const answer = own(saved.answers || {}, step.id) ? saved.answers[step.id] : undefined;
    if (step.kind === 'oral' && answer?.selfReported === true) session.answers[step.id] = { selfReported: true };
    else if (validAnswer(answer)) session.answers[step.id] = typeof answer === 'boolean' ? answer : { correct: answer.correct, ...(typeof answer.hinted === 'boolean' ? { hinted: answer.hinted } : {}) };
  }
  const current = session.steps[session.index];
  // The sentence UI stores selected token indices. Strings are supported for older callers.
  if (current?.kind === 'sentence' && Array.isArray(saved.picked)) {
    const remaining = [...current.tokens];
    const seen = new Set();
    const indices = saved.picked.every(value => Number.isInteger(value) && value >= 0 && value < current.tokens.length && !seen.has(value) && seen.add(value));
    const strings = saved.picked.every(value => typeof value === 'string' && remaining.includes(value) && remaining.splice(remaining.indexOf(value), 1));
    if (indices || strings) session.picked = [...saved.picked];
  }
  const feedback = saved.feedback;
  if (current && scoredKinds.has(current.kind) && feedback?.stepId === current.id && typeof feedback.correct === 'boolean' && typeof feedback.selected === 'string' && typeof feedback.why === 'string') {
    const validSelection = current.kind === 'sentence' || current.choices.includes(feedback.selected);
    if (validSelection) session.feedback = { stepId: current.id, correct: answerMatches(current, feedback.selected), selected: feedback.selected, why: current.why || '' };
  } else if (current && own(session.answers, current.id) && scoredKinds.has(current.kind)) {
    session.feedback = { stepId: current.id, correct: answerCorrect(session.answers[current.id]), selected: '', why: current.why || '' };
  }
  if (finite(saved.completedAt) && saved.index === session.steps.length) session.completedAt = saved.completedAt;
  progress.session = session;
  return progress;
}

/** Mutates only progress.items; repeated answers on one local date do not advance the streak. */
export function recordAnswer(progress, itemKey, correct, { now = Date.now(), hinted = false } = {}) {
  if (!safeKey(itemKey) || !finite(now) || typeof correct !== 'boolean') return null;
  progress.items ||= {};
  const previous = own(progress.items, itemKey) && validItem(progress.items[itemKey]) ? progress.items[itemKey] : { streak: 0, lastDay: '', nextReview: midnightAfter(now, 0), correct: 0, incorrect: 0 };
  const today = localDay(now);
  let streak = previous.streak;
  let nextReview = previous.nextReview;
  if (!correct || hinted) {
    streak = 0;
    nextReview = midnightAfter(now, 0);
  } else if (today !== previous.lastDay) {
    streak++;
    nextReview = midnightAfter(now, streak === 1 ? 1 : streak === 2 ? 3 : 7);
  }
  const item = { streak, lastDay: today, nextReview, correct: previous.correct + (correct ? 1 : 0), incorrect: previous.incorrect + (correct ? 0 : 1) };
  progress.items[itemKey] = item;
  return item;
}

export function dueItems(progress, { now = Date.now(), limit = 8 } = {}) {
  if (!finite(now)) return [];
  const size = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 8;
  return Object.entries(progress.items || {}).filter(([key, item]) => safeKey(key) && validItem(item) && item.nextReview <= now)
    .sort(([a, first], [b, second]) => first.nextReview - second.nextReview || a.localeCompare(b)).slice(0, size).map(([key]) => key);
}

/** Mutates progress.lessons and marks the session; returns true only for the lesson's first completion. */
export function completeLesson(progress, session, { now = Date.now() } = {}) {
  if (!session || !safeKey(session.lessonId) || !Array.isArray(session.steps) || session.steps.length === 0 || session.index !== session.steps.length || !finite(session.startedAt) || !finite(now)) return false;
  progress.lessons ||= {};
  const previous = own(progress.lessons, session.lessonId) ? progress.lessons[session.lessonId] : null;
  const completedSessions = (session.review ? previous?.completedReviewSessions : previous?.completedSessions) || [];
  const run = completionId(session);
  if (finite(session.completedAt) || completedSessions.includes(run)) return false;
  const scored = session.steps.filter(step => scoredKinds.has(step.kind));
  const accuracy = scored.length ? scored.filter(step => answerCorrect(session.answers?.[step.id]) && session.answers[step.id]?.hinted !== true).length / scored.length : 0;
  if (session.review) {
    progress.lessons[session.lessonId] = { completed: false, bestAccuracy: 0, attempts: 0, completedSessions: [], ...previous, reviews: (previous?.reviews || 0) + 1, bestReviewAccuracy: Math.max(previous?.bestReviewAccuracy || 0, accuracy), lastReviewedAt: now, completedReviewSessions: [...completedSessions, run] };
    session.completedAt = now;
    return false;
  }
  progress.lessons[session.lessonId] = { ...previous, completed: true, bestAccuracy: Math.max(previous?.bestAccuracy || 0, accuracy), attempts: (previous?.attempts || 0) + 1, lastCompletedAt: now, completedSessions: [...completedSessions, run] };
  session.completedAt = now;
  return !previous?.completed;
}

export function recommendLesson(lessons, progress) {
  const active = progress.session;
  if (active && active.index < active.steps?.length && !finite(active.completedAt)) {
    const resumed = lessons.find(lesson => lesson.id === active.lessonId);
    if (resumed) return resumed;
  }
  return lessons.find(lesson => !progress.lessons?.[lesson.id]?.completed) || null;
}
