import {LESSONS} from '../english/course-curriculum.js';
import {buildSteps, loadProgress, completeLesson} from '../english/course-engine.js';
import {problem} from './store.mjs';

export const CONTENT_VERSION = 'pep3-2024-v1';
export const MAX_JSON_BYTES = 512 * 1024;
const knownLessons = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
const knownItems = new Map(LESSONS.map(lesson => [lesson.id, new Set(buildSteps(lesson).filter(step => step.itemKey).map(step => step.itemKey))]));
const finiteTime = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 8640000000000000;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clone = value => JSON.parse(JSON.stringify(value));
export function uuid(value, label = 'ID') {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) throw problem(400, `Invalid ${label}`);
  return value.toLowerCase();
}
export function boundJson(value) {
  let encoded;
  try { encoded = JSON.stringify(value); } catch { throw problem(400, 'Invalid JSON'); }
  if (encoded === undefined) throw problem(400, 'Invalid JSON');
  if (Buffer.byteLength(encoded) > MAX_JSON_BYTES) throw problem(413, 'Progress is too large');
}
export function sanitizeEnglish(raw) {
  boundJson(raw);
  // Curriculum IDs, answers, counters and session steps are all allowlisted by the course loader.
  return loadProgress(raw, LESSONS);
}
export function sanitizeSession(raw) {
  if (raw === null) return null;
  if (!object(raw) || !finiteTime(raw.startedAt)) throw problem(400, 'Invalid English session');
  const session = sanitizeEnglish({version:1,lessons:{},items:{},session:raw}).session;
  if (!session) throw problem(400, 'Invalid English session');
  return session;
}
export function normalizeEvent(raw) {
  if (!object(raw) || raw.contentVersion !== CONTENT_VERSION || !knownLessons.has(raw.contentId) || !finiteTime(raw.occurredAt)) throw problem(400, 'Invalid learning event');
  const event = {eventId:uuid(raw.eventId, 'event ID'),contentVersion:CONTENT_VERSION,contentId:raw.contentId,kind:raw.kind,occurredAt:raw.occurredAt};
  if (raw.kind === 'answer') {
    if (!object(raw.result) || !knownItems.get(raw.contentId).has(raw.result.itemKey) || typeof raw.result.correct !== 'boolean' || typeof raw.result.hinted !== 'boolean') throw problem(400, 'Invalid answer event');
    event.result = {itemKey:raw.result.itemKey,correct:raw.result.correct,hinted:raw.result.hinted};
  } else if (raw.kind === 'completion') {
    const session = sanitizeSession(raw.result?.session);
    if (!session || session.lessonId !== raw.contentId || session.steps.length === 0 || session.index !== session.steps.length) throw problem(400, 'Invalid completion event');
    // The local UI can mark completedAt before emitting. Replay determines its own completion time.
    delete session.completedAt;
    event.result = {session};
  } else throw problem(400, 'Invalid learning event kind');
  return event;
}

const DAY_MS = 86400000, SHANGHAI_OFFSET = 8 * 3600000;
const shanghaiDay = now => new Date(now + SHANGHAI_OFFSET).toISOString().slice(0, 10);
const midnightAfter = (now, days) => Math.floor((now + SHANGHAI_OFFSET) / DAY_MS) * DAY_MS - SHANGHAI_OFFSET + days * DAY_MS;
function recordAnswer(progress, event) {
  const {itemKey, correct, hinted} = event.result;
  const previous = progress.items[itemKey] || {streak:0,lastDay:'',nextReview:midnightAfter(event.occurredAt,0),correct:0,incorrect:0};
  const today = shanghaiDay(event.occurredAt);
  let streak = previous.streak, nextReview = previous.nextReview;
  if (!correct || hinted) { streak = 0; nextReview = midnightAfter(event.occurredAt,0); }
  else if (today !== previous.lastDay) {
    streak++;
    nextReview = midnightAfter(event.occurredAt,streak === 1 ? 1 : streak === 2 ? 3 : 7);
  }
  progress.items[itemKey] = {streak,lastDay:today,nextReview,correct:previous.correct+(correct?1:0),incorrect:previous.incorrect+(correct?0:1)};
}

/** Rebuilds derived course state; timestamps supplied here are already clamped by the store. */
export function replayEnglish(baseline, events) {
  const progress = sanitizeEnglish(baseline);
  const ordered = [...events].sort((a,b) => a.occurredAt-b.occurredAt || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0));
  for (const raw of ordered) {
    const event = normalizeEvent(raw);
    if (event.kind === 'answer') recordAnswer(progress,event);
    else completeLesson(progress,clone(event.result.session),{now:event.occurredAt});
  }
  return progress;
}
