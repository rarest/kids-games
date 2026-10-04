import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {LESSONS} from '../english/course-curriculum.js';
import {createSession} from '../english/course-engine.js';

const empty = {version:1,lessons:{},items:{},session:null};
const lesson = LESSONS[0];
const itemKey = `${lesson.id}:word:${lesson.words[0].id}`;
const day1 = Date.parse('2026-01-01T16:05:00Z');
const day2 = Date.parse('2026-01-02T16:05:00Z');
const answer = (occurredAt=day1, correct=true, extras={}) => ({eventId:randomUUID(),contentVersion:'pep3-2024-v1',contentId:lesson.id,kind:'answer',occurredAt,result:{itemKey,correct,hinted:false},...extras});
const failure = status => error => error.status === status;

async function fixture(t) {
  const {default:{Pool}} = await import('../platform/node_modules/pg/lib/index.js');
  const admin = new Pool({connectionString:process.env.PLATFORM_TEST_DATABASE_URL});
  const schema = `family_test_${randomUUID().replaceAll('-','')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString:process.env.PLATFORM_TEST_DATABASE_URL, options:`-c search_path=${schema}`});
  t.after(async () => {await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();});
  await pool.query('CREATE TABLE family_user(id text PRIMARY KEY)');
  await pool.query("INSERT INTO family_user(id) VALUES('parent-a'),('parent-b')");
  let FamilyStore;
  await assert.doesNotReject(async () => {({FamilyStore}=await import('../platform/family-store.mjs'));}, 'family store implementation must exist');
  const store = new FamilyStore({pool});
  await store.migrate();
  await store.migrate();
  return {pool,store};
}
const pg = {skip:!process.env.PLATFORM_TEST_DATABASE_URL};

test('English sanitizer replays in time order with Shanghai review days and strips unrelated saves', async () => {
  let replayEnglish;
  await assert.doesNotReject(async () => {({replayEnglish}=await import('../platform/english-progress.mjs'));}, 'server English sanitizer must exist');
  const events = [answer(day2), answer(day1)];
  const data = replayEnglish({...empty,coins:999,reconnectToken:'do-not-store'}, events);
  assert.deepEqual(data.items[itemKey], {streak:2,lastDay:'2026-01-03',nextReview:Date.parse('2026-01-05T16:00:00Z'),correct:2,incorrect:0});
  assert.equal(data.coins,undefined);
  assert.equal(data.reconnectToken,undefined);
});

test('profiles enforce ownership, printable names, preset avatars, concurrent limit and tombstones', pg, async t => {
  const {store,pool} = await fixture(t);
  const child = await store.createProfile('parent-a',{nickname:' 小狐狸 ',avatar:'fox'});
  assert.equal(child.nickname,'小狐狸');
  assert.deepEqual(await store.profiles('parent-b'),[]);
  await assert.rejects(store.updateProfile('parent-b',child.id,{nickname:'steal'}),failure(404));
  await assert.rejects(store.getProgress('parent-b',child.id),failure(404));
  await assert.rejects(store.deleteProfile('parent-b',child.id),failure(404));
  await assert.rejects(store.createProfile('parent-a',{nickname:'bad\nname',avatar:'fox'}),failure(400));
  await assert.rejects(store.createProfile('parent-a',{nickname:'x',avatar:'custom'}),failure(400));
  assert.equal((await store.updateProfile('parent-a',child.id,{avatar:'panda'})).avatar,'panda');
  const results = await Promise.allSettled(Array.from({length:9},(_,i)=>store.createProfile('parent-a',{nickname:`孩子${i}`,avatar:'cat'})));
  assert.equal(results.filter(result=>result.status==='fulfilled').length,7);
  assert.equal(results.filter(result=>result.status==='rejected' && result.reason.status===409).length,2);
  await store.deleteProfile('parent-a',child.id);
  assert.equal((await store.profiles('parent-a')).length,7);
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[]}),failure(404));
  assert.equal((await pool.query('SELECT deleted_at IS NOT NULL AS deleted FROM player_profiles WHERE id=$1',[child.id])).rows[0].deleted,true);
  for (const operation of ['getProgress','updateProfile','deleteProfile']) await assert.rejects(store[operation]('parent-a','invalid',{nickname:'x'}),failure(400));
});

test('CAS applies a batch atomically, persists across store instances, and duplicate UUIDs bind content and profile', pg, async t => {
  const {store,pool} = await fixture(t);
  const child = await store.createProfile('parent-a',{nickname:'弟弟',avatar:'dog'});
  const sibling = await store.createProfile('parent-a',{nickname:'姐姐',avatar:'rabbit'});
  assert.deepEqual(await store.getProgress('parent-a',child.id),{revision:0,data:empty});
  const first=answer(day1), second=answer(day2);
  const writes=await Promise.allSettled([
    store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[first]}),
    store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[second]})
  ]);
  assert.equal(writes.filter(write=>write.status==='fulfilled').length,1);
  const conflict=writes.find(write=>write.status==='rejected').reason;
  assert.equal(conflict.status,409); assert.equal(conflict.message,'Progress conflict'); assert.equal(conflict.current.revision,1);
  const synced=await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[first,second]});
  assert.equal(synced.revision,2); assert.equal(synced.data.items[itemKey].correct,2);
  const retry=await store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:[first,second]});
  assert.equal(retry.data.items[itemKey].correct,2);
  await assert.rejects(store.syncProgress('parent-a',sibling.id,{baseRevision:0,session:null,events:[first]}),failure(409));
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:3,session:null,events:[{...first,result:{...first.result,correct:false}}]}),failure(409));
  assert.equal((await store.getProgress('parent-a',child.id)).revision,3);
  const {FamilyStore}=await import('../platform/family-store.mjs');
  assert.deepEqual(await new FamilyStore({pool}).getProgress('parent-a',child.id),retry);
  assert.deepEqual(await store.getProgress('parent-a',sibling.id),{revision:0,data:empty});
  const future=answer(Date.now()+3600000);
  const before=Date.now();
  const futureWrite=await store.syncProgress('parent-a',sibling.id,{baseRevision:0,session:null,events:[future]});
  const again=await store.syncProgress('parent-a',sibling.id,{baseRevision:1,session:null,events:[future]});
  assert.deepEqual(again.data,futureWrite.data,'future timestamp retry retains its first accepted timestamp');
  assert.ok((await pool.query('SELECT occurred_at FROM learning_events WHERE event_id=$1',[future.eventId])).rows[0].occurred_at.getTime()>=before);
  const invalid=answer(day1,true,{contentId:'unknown'});
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:3,session:null,events:[answer(),invalid]}),failure(400));
  assert.equal((await store.getProgress('parent-a',child.id)).revision,3);
});

test('completion sessions are rebuilt from known curriculum, and shared step state resumes without injected fields', pg, async t => {
  const {store}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'学习',avatar:'bird'});
  const session=createSession(lesson,{now:day1,seed:4});
  session.index=1;
  session.steps=[{kind:'evil',coins:100}];
  const saved=await store.syncProgress('parent-a',child.id,{baseRevision:0,session:{...session,coins:100},events:[]});
  assert.equal(saved.data.session.index,1);
  assert.equal(saved.data.session.steps[0].kind,'word');
  assert.equal(saved.data.session.coins,undefined);
  const completed=createSession(lesson,{now:day1,seed:4});
  completed.index=completed.steps.length;
  for(const step of completed.steps) if(step.itemKey) completed.answers[step.id]={correct:true,hinted:false};
  completed.completedAt=day2;
  const event={eventId:randomUUID(),contentVersion:'pep3-2024-v1',contentId:lesson.id,kind:'completion',occurredAt:day2,result:{session:completed}};
  const result=await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[event]});
  assert.equal(result.data.lessons[lesson.id].completed,true);
  assert.equal(result.data.lessons[lesson.id].attempts,1);
  assert.equal(result.data.lessons[lesson.id].bestAccuracy,1);
  const duplicate={...event,eventId:randomUUID()};
  const repeated=await store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:[duplicate]});
  assert.equal(repeated.data.lessons[lesson.id].attempts,1);
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:3,session:{lessonId:'unknown'},events:[]}),failure(400));
});

test('imports retain original English snapshot, deduplicate by source/profile, reject occupied profiles, and export only owned course data', pg, async t => {
  const {store,pool}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'导入',avatar:'fox'});
  const other=await store.createProfile('parent-b',{nickname:'私有',avatar:'fox'});
  const data={...empty,session:createSession(lesson,{now:day1})};
  data.session.index=2;
  const request={importId:randomUUID(),sourceId:randomUUID(),data};
  const imported=await store.importProgress('parent-a',child.id,request);
  assert.equal(imported.revision,1); assert.equal(imported.data.session.index,2);
  const repeated=await store.importProgress('parent-a',child.id,{...request,importId:randomUUID()});
  assert.deepEqual(repeated,imported);
  const original=(await pool.query('SELECT original_snapshot FROM save_imports WHERE profile_id=$1',[child.id])).rows[0].original_snapshot;
  assert.deepEqual(original,data);
  await assert.rejects(store.importProgress('parent-a',child.id,{...request,sourceId:randomUUID()}),failure(409));
  await assert.rejects(store.importProgress('parent-b',other.id,request),failure(409),'same import UUID cannot acquire a second profile');
  const occupied=await store.createProfile('parent-a',{nickname:'已有',avatar:'panda'});
  await store.syncProgress('parent-a',occupied.id,{baseRevision:0,session:null,events:[answer()]});
  await assert.rejects(store.importProgress('parent-a',occupied.id,{...request,importId:randomUUID()}),failure(409));
  const exported=await store.exportAccount('parent-a');
  assert.equal(exported.profiles.length,2); assert.equal(exported.progress.length,2);
  assert.ok(exported.progress.every(item=>item.gameId==='english' && item.profileId!==other.id));
  assert.ok(!JSON.stringify(exported).includes('password'));
  await pool.query("DELETE FROM family_user WHERE id='parent-a'");
  for(const table of ['player_profiles','game_progress','learning_events','save_imports']) assert.equal(Number((await pool.query(`SELECT count(*) FROM ${table}`)).rows[0].count),table==='player_profiles'?1:0);
});

test('request validation bounds JSON and batches, prevents unsafe import objects, and normalizes UUID case', pg, async t => {
  const {store}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'检验',avatar:'fox'});
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:-1,session:null,events:[]}),failure(400));
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:Array.from({length:257},()=>answer())}),failure(400));
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[answer(NaN)]}),failure(400));
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[answer(day1,true,{result:{itemKey:'__proto__',correct:true,hinted:false}})]}),failure(400));
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[answer(day1,true,{padding:'x'.repeat(512*1024)})]}),failure(413));
  await assert.rejects(store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:'invalid',data:empty}),failure(400));
  const imported=await store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:randomUUID(),data:{...empty,lessons:{constructor:{completed:true}},items:{unknown:{correct:9}},coins:100,session:null}});
  assert.deepEqual(imported.data,empty);
  assert.deepEqual(await store.getProgress('parent-a',child.id.toUpperCase()),imported);
});

test('empty session synchronization still permits a first import, while a prior empty import retains its source', pg, async t => {
  const {store}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'新建',avatar:'fox'});
  await store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[]});
  const result=await store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:randomUUID(),data:{...empty,session:createSession(lesson,{now:day1})}});
  assert.equal(result.data.session.lessonId,lesson.id);
  assert.equal(result.revision,2,'import does not reuse a revision already seen by another device');
  const blank=await store.createProfile('parent-a',{nickname:'空白',avatar:'cat'});
  await store.importProgress('parent-a',blank.id,{importId:randomUUID(),sourceId:randomUUID(),data:empty});
  await assert.rejects(store.importProgress('parent-a',blank.id,{importId:randomUUID(),sourceId:randomUUID(),data:empty}),failure(409));
});

test('backdated batches deterministically replay all events, and duplicate failures roll back other batch events', pg, async t => {
  const {store,pool}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'重放',avatar:'dog'});
  const late=answer(day2), early=answer(day1), extra=answer(day2+1000);
  await store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[late]});
  const replayed=await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[early]});
  assert.deepEqual(replayed.data.items[itemKey],{streak:2,lastDay:'2026-01-03',nextReview:Date.parse('2026-01-05T16:00:00Z'),correct:2,incorrect:0});
  await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:[extra,{...early,result:{itemKey,correct:false,hinted:false}}]}),failure(409));
  assert.equal((await pool.query('SELECT count(*) FROM learning_events WHERE profile_id=$1',[child.id])).rows[0].count,'2');
  assert.deepEqual(await store.getProgress('parent-a',child.id),replayed);
});

test('a valid import near the JSON limit survives PostgreSQL JSONB formatting overhead', pg, async t => {
  const {store}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'大存档',avatar:'panda'});
  const data={...empty,lessons:{[lesson.id]:{completed:true,attempts:23500,bestAccuracy:1,completedSessions:Array.from({length:23500},(_,i)=>`${1700000000000+i}:learn`)}}};
  const request={importId:randomUUID(),sourceId:randomUUID(),data};
  assert.ok(Buffer.byteLength(JSON.stringify(request))<512*1024);
  const imported=await store.importProgress('parent-a',child.id,request);
  assert.equal(imported.data.lessons[lesson.id].completedSessions.length,23500);
});

test('deleting a child erases learning records and retained imports while keeping its tombstone', pg, async t => {
  const {store,pool}=await fixture(t);
  const child=await store.createProfile('parent-a',{nickname:'删除',avatar:'bird'});
  await store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:randomUUID(),data:{...empty,session:createSession(lesson,{now:day1})}});
  await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[answer()]});
  await store.deleteProfile('parent-a',child.id);
  for(const table of ['game_progress','learning_events','save_imports']) assert.equal((await pool.query(`SELECT count(*) FROM ${table} WHERE profile_id=$1`,[child.id])).rows[0].count,'0');
  assert.equal((await pool.query('SELECT deleted_at IS NOT NULL AS deleted FROM player_profiles WHERE id=$1',[child.id])).rows[0].deleted,true);
  assert.deepEqual(await store.exportAccount('parent-a'),{profiles:[],progress:[]});
  await assert.rejects(store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:randomUUID(),data:empty}),failure(404));
});

test('overlapping UUID batches in opposite order across profiles produce a semantic conflict without deadlock', pg, async t => {
  const {store}=await fixture(t);
  const first=await store.createProfile('parent-a',{nickname:'第一',avatar:'fox'});
  const second=await store.createProfile('parent-a',{nickname:'第二',avatar:'cat'});
  const events=Array.from({length:32},()=>answer());
  const results=await Promise.allSettled([
    store.syncProgress('parent-a',first.id,{baseRevision:0,session:null,events}),
    store.syncProgress('parent-a',second.id,{baseRevision:0,session:null,events:[...events].reverse()})
  ]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(results.find(result=>result.status==='rejected').reason.status,409);
});
