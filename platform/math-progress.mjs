import {LESSONS} from '../math/curriculum.js';
import {buildSteps,loadProgress,completeLesson,recordItemAnswer,createSession,recordAnswer} from '../math/engine.js';
import {boundJson,uuid} from './english-progress.mjs';
import {problem} from './store.mjs';

export const CONTENT_VERSION = 'pep3-math-2025-v1';
const knownItems = new Map(LESSONS.map(lesson => [lesson.id,new Set(buildSteps(lesson).filter(step => step.itemKey).map(step => step.itemKey))]));
const time = value => Number.isSafeInteger(value) && value >= 0 && value <= 8640000000000000 - 8 * 3600000;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clone = value => JSON.parse(JSON.stringify(value));

export function sanitize(raw) {
  boundJson(raw);
  return loadProgress(raw,LESSONS);
}
export function sanitizeSession(raw) {
  if (raw === null) return null;
  if (!object(raw) || !time(raw.startedAt)) throw problem(400,'Invalid Math session');
  const session = sanitize({version:1,lessons:{},items:{},session:raw}).session;
  if (!session) throw problem(400,'Invalid Math session');
  return session;
}
export function normalizeEvent(raw) {
  if (!object(raw) || raw.contentVersion !== CONTENT_VERSION || !knownItems.has(raw.contentId) || !time(raw.occurredAt)) throw problem(400,'Invalid learning event');
  const event = {eventId:uuid(raw.eventId,'event ID'),contentVersion:CONTENT_VERSION,contentId:raw.contentId,kind:raw.kind,occurredAt:raw.occurredAt};
  if (raw.kind === 'answer') {
    if (!object(raw.result) || !knownItems.get(raw.contentId).has(raw.result.itemKey) || typeof raw.result.correct !== 'boolean' || typeof raw.result.hinted !== 'boolean') throw problem(400,'Invalid answer event');
    const lesson = LESSONS.find(lesson => lesson.id === raw.contentId);
    const session = createSession(lesson,{now:raw.occurredAt,review:true,reviewKeys:[raw.result.itemKey]});
    const result = recordAnswer({version:1,lessons:{},items:{},session:null},session,session.steps[0],raw.result.selected,{hinted:raw.result.hinted,now:raw.occurredAt});
    if (!result) throw problem(400,'Invalid answer selection');
    event.result = {itemKey:result.itemKey,selected:result.selected,correct:result.correct,hinted:result.hinted};
  } else if (raw.kind === 'completion') {
    const session = sanitizeSession(raw.result?.session);
    if (!session || session.lessonId !== raw.contentId || !session.steps.length || session.index !== session.steps.length
      || raw.occurredAt < session.startedAt || Object.values(session.answers).some(answer => answer.latest?.answeredAt > raw.occurredAt)) throw problem(400,'Invalid completion event');
    delete session.completedAt;
    event.result = {session};
  } else throw problem(400,'Invalid learning event kind');
  return event;
}

/** Replays only this content version; the store owns event UUID deduplication. */
export function replay(baseline,events) {
  const progress = sanitize(baseline);
  const ordered = [...events].sort((a,b) => a.occurredAt-b.occurredAt || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0));
  for (const raw of ordered) {
    const event = normalizeEvent(raw);
    if (event.kind === 'answer') recordItemAnswer(progress,event.result.itemKey,event.result.correct,{hinted:event.result.hinted,now:event.occurredAt});
    else completeLesson(progress,clone(event.result.session),{now:event.occurredAt});
  }
  return progress;
}
