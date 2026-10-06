import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {LESSONS} from '../chinese/curriculum.js';
import {createSession,recordAnswer,advance} from '../chinese/engine.js';
import {LESSONS as ENGLISH} from '../english/course-curriculum.js';
import {buildSteps as englishSteps} from '../english/course-engine.js';

const empty=()=>({version:1,lessons:{},items:{},session:null});
const day1=Date.parse('2026-01-01T16:05:00Z'),day2=Date.parse('2026-01-02T16:05:00Z');
const failure=status=>error=>error.status===status;
const pg={skip:!process.env.PLATFORM_TEST_DATABASE_URL};
const answer=(occurredAt=day1,extras={})=>({eventId:randomUUID(),contentVersion:'pep3-cn-2026-v1',contentId:'cn-1',kind:'answer',occurredAt,result:{itemKey:'cn-1:word:0',correct:true,hinted:false},...extras});
const englishAnswer=()=>({eventId:randomUUID(),contentVersion:'pep3-2024-v1',contentId:ENGLISH[0].id,kind:'answer',occurredAt:day1,result:{itemKey:englishSteps(ENGLISH[0]).find(step=>step.itemKey).itemKey,correct:true,hinted:false}});
function completed({now=day1,review=false}={}){
 const session=createSession(LESSONS[0],{now,review}),progress=empty();
 while(session.index<session.steps.length){const step=session.steps[session.index];const selected=step.itemKey?step.answer:['expression','recite'].includes(step.kind)?{selfReported:true}:{visited:true};assert.ok(recordAnswer(progress,session,step,selected,{now}));assert.equal(advance(session),true)}
 return session;
}
const completion=(session,occurredAt=day2)=>({...answer(occurredAt),kind:'completion',result:{session}});
async function codec(){let result;await assert.doesNotReject(async()=>{result=await import('../platform/chinese-progress.mjs')},'Chinese codec must exist');return result}

test('Chinese codec rebuilds sessions and replays first answers with shared China-day mastery',async()=>{
 const {sanitize,sanitizeSession,normalizeEvent,replay,CONTENT_VERSION}=await codec();
 assert.equal(CONTENT_VERSION,'pep3-cn-2026-v1');
 const raw=createSession(LESSONS[0],{now:day1});raw.steps=[{kind:'evil'}];raw.feedback={explanation:'evil'};
 const session=sanitizeSession(raw);assert.equal(session.steps[0].kind,'preview');assert.equal(session.feedback,null);
 assert.deepEqual(sanitize({...empty(),coins:999,items:{'word:english':{correct:99}}}),empty());
 const replayed=replay(empty(),[answer(day2),answer(day1)]);
 assert.deepEqual(replayed.items['cn-1:word:0'],{streak:2,lastDay:'2026-01-03',nextReview:Date.parse('2026-01-05T16:00:00Z'),correct:2,incorrect:0});
 const hinted=replay(empty(),[answer(day1),answer(day1+1,{result:{itemKey:'cn-1:word:0',correct:true,hinted:true}}),answer(day1+2)]);
 assert.equal(hinted.items['cn-1:word:0'].streak,0);assert.equal(hinted.items['cn-1:word:0'].correct,3);
 for(const event of [answer(day1,{contentVersion:'pep3-2024-v1'}),answer(day1,{result:{itemKey:'cn-1:word:99',correct:true,hinted:false}}),answer(day1,{result:{itemKey:'__proto__',correct:true,hinted:false}}),answer(day1+.5)])assert.throws(()=>normalizeEvent(event),failure(400));
 assert.throws(()=>sanitize({...empty(),padding:'x'.repeat(512*1024)}),failure(413));
});

test('Chinese completion validates explicit canonical answers and keeps reviews separate from learning',async()=>{
 const {normalizeEvent,replay}=await codec();
 const forged=createSession(LESSONS[0],{now:day1});forged.index=forged.steps.length;forged.completedAt=day2;forged.steps=[];
 assert.throws(()=>normalizeEvent(completion(forged)),failure(400));
 const valid=completed();valid.completedAt=day2;delete valid.steps;
 const learned=replay(empty(),[completion(valid),completion(valid)]);
 assert.equal(learned.lessons['cn-1'].attempts,1);assert.equal(learned.lessons['cn-1'].bestAccuracy,1);
 assert.equal(learned.lessons['cn-1'].completed,true);
 const review=completed({now:day2,review:true});
 assert.deepEqual(replay(empty(),[completion(review,day2)]).lessons,{});
 const reviewed=replay(empty(),[completion(valid),completion(review,day2+1)]);
 assert.equal(reviewed.lessons['cn-1'].attempts,1);assert.equal(reviewed.lessons['cn-1'].reviews,1);
 const wrong=completed();const scored=wrong.steps.find(step=>step.itemKey);wrong.answers[scored.id].selected=scored.choices.find(choice=>choice!==scored.answer);wrong.answers[scored.id].latest.selected=wrong.answers[scored.id].selected;
 assert.throws(()=>normalizeEvent(completion(wrong)),failure(400));
 assert.throws(()=>normalizeEvent(completion(completed(),day1-1)),failure(400),'completion time must not precede answers');
});

async function fixture(t,{old=false}={}){
 const {default:{Pool}}=await import('../platform/node_modules/pg/lib/index.js');
 const database=process.env.PLATFORM_TEST_DATABASE_URL;
 assert.ok(database,'real isolated PostgreSQL is required');
 const admin=new Pool({connectionString:database}),schema=`subject_test_${randomUUID().replaceAll('-','')}`;
 await admin.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`});
 t.after(async()=>{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end()});
 await pool.query('CREATE TABLE family_user(id text PRIMARY KEY)');await pool.query("INSERT INTO family_user(id) VALUES('parent-a'),('parent-b')");
 const {FamilyStore}=await import('../platform/family-store.mjs');const store=new FamilyStore({pool});
 if(old)await pool.query(await readFile(new URL('../platform/migrations/002-family.sql',import.meta.url),'utf8'));else await store.migrate();
 return {pool,store};
}

test('English and Chinese concurrent CAS updates never conflict or replay each other; event UUID remains global',pg,async t=>{
 const {store,pool}=await fixture(t);const child=await store.createProfile('parent-a',{nickname:'双科',avatar:'fox'});
 const en=englishAnswer(),cn=answer();
 const results=await Promise.all([store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[en]}),store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[cn]},'chinese')]);
 assert.equal(results[0].revision,1);assert.equal(results[1].revision,1);
 assert.deepEqual(Object.keys(results[0].data.items),[en.result.itemKey]);assert.deepEqual(Object.keys(results[1].data.items),['cn-1:word:0']);
 await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[cn,answer(day2)]},'chinese');
 assert.equal((await store.getProgress('parent-a',child.id)).data.items[en.result.itemKey].correct,1);
 assert.equal((await store.getProgress('parent-a',child.id,'chinese')).data.items['cn-1:word:0'].correct,2);
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:[answer(day2,{eventId:en.eventId})]},'chinese'),failure(409));
 assert.equal((await pool.query('SELECT count(*) FROM learning_events')).rows[0].count,'3');
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[]},'chinese'),error=>error.status===409&&error.current.revision===2);
 for(const subject of ['english','chinese'])await assert.rejects(store.getProgress('parent-b',child.id,subject),failure(404));
 for(const method of ['getProgress','syncProgress','importProgress']){
  const args=method==='getProgress'?['parent-a',child.id,'math']:['parent-a',child.id,{baseRevision:0,session:null,events:[],importId:randomUUID(),sourceId:randomUUID(),data:empty()},'math'];
  await assert.rejects(store[method](...args),failure(400));
 }
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:Array.from({length:257},()=>answer())},'chinese'),failure(400));
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:2,session:null,events:[],padding:'x'.repeat(512*1024)},'chinese'),failure(413));
});

test('subject imports use separate emptiness and sources; export has one profile and both subjects; deletion clears both',pg,async t=>{
 const {store,pool}=await fixture(t);const child=await store.createProfile('parent-a',{nickname:'导入',avatar:'cat'});
 const sourceId=randomUUID(),english={importId:randomUUID(),sourceId,data:empty()};
 await store.importProgress('parent-a',child.id,english);
 const chinese={importId:randomUUID(),sourceId,data:{...empty(),session:createSession(LESSONS[0],{now:day1})}};
 const imported=await store.importProgress('parent-a',child.id,chinese,'chinese');assert.equal(imported.revision,1);assert.ok(imported.data.session,'Chinese session survives import');assert.equal(imported.data.session.lessonId,'cn-1');
 assert.deepEqual(await store.importProgress('parent-a',child.id,{...chinese,importId:randomUUID()},'chinese'),imported);
 await assert.rejects(store.importProgress('parent-a',child.id,{...chinese,sourceId:randomUUID()},'chinese'),failure(409));
 await assert.rejects(store.importProgress('parent-a',child.id,{...chinese,importId:english.importId},'chinese'),failure(409));
 const exported=await store.exportAccount('parent-a');assert.equal(exported.profiles.length,1);assert.deepEqual(exported.progress.map(row=>row.gameId).sort(),['chinese','english']);
 assert.deepEqual(await store.exportAccount('parent-b'),{profiles:[],progress:[]});
 const second=await store.createProfile('parent-a',{nickname:'英语已有',avatar:'bird'});await store.syncProgress('parent-a',second.id,{baseRevision:0,session:null,events:[englishAnswer()]});
 assert.equal((await store.importProgress('parent-a',second.id,{...chinese,importId:randomUUID()},'chinese')).revision,1);
 await store.deleteProfile('parent-a',child.id);for(const table of ['game_progress','learning_events','save_imports'])assert.equal((await pool.query(`SELECT count(*) FROM ${table} WHERE profile_id=$1`,[child.id])).rows[0].count,'0');
});

test('additive subject migration preserves old English rows, permits only two values and is repeatable',pg,async t=>{
 const {store,pool}=await fixture(t,{old:true});const child=await store.createProfile('parent-a',{nickname:'旧数据',avatar:'panda'});
 const imported=await store.importProgress('parent-a',child.id,{importId:randomUUID(),sourceId:randomUUID(),data:empty()});
 const prior=await store.syncProgress('parent-a',child.id,{baseRevision:imported.revision,session:null,events:[englishAnswer()]});
 const snapshot=(await pool.query('SELECT * FROM save_imports')).rows;
 await store.migrate();await store.migrate();assert.deepEqual(await store.getProgress('parent-a',child.id),prior);assert.deepEqual((await pool.query('SELECT * FROM save_imports')).rows,snapshot);
 assert.equal((await store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[answer()]},'chinese')).revision,1);
 for(const sql of ["UPDATE game_progress SET game_id='math'","UPDATE save_imports SET game_id='math'","UPDATE learning_events SET content_version='unknown'"])await assert.rejects(pool.query(sql),error=>error.code==='23514');
});

test('family HTTP exposes Chinese while enforcing verified ownership, subject validation and body limit',pg,async t=>{
 const {store,pool}=await fixture(t);const child=await store.createProfile('parent-a',{nickname:'接口',avatar:'rabbit'});
 const {createApi}=await import('../platform/server.mjs');
 const auth={api:{getSession:async({headers})=>({user:{id:headers.get('x-test-owner')||'parent-a',emailVerified:headers.get('x-test-verified')!=='no'}})}};
 const server=createApi({store:{pool},familyStore:store,auth,secret:'isolated-subject-api-secret-at-least-32',publicOrigin:'http://games.test'});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`,path=`/api/family/profiles/${child.id}/progress/chinese`;
 const request=(target,body,extra={})=>fetch(base+target,{method:body?'POST':'GET',headers:{origin:'http://games.test','content-type':'application/json',...extra},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request(path)).status,200);assert.equal((await request(path,undefined,{'x-test-owner':'parent-b'})).status,404);assert.equal((await request(path,undefined,{'x-test-verified':'no'})).status,401);
 const response=await request(path,{baseRevision:0,session:null,events:[answer()]});assert.equal(response.status,200);assert.equal((await response.json()).data.items['cn-1:word:0'].correct,1);
 assert.equal((await request(path.replace('chinese','math'))).status,400);assert.equal((await request(path,{padding:'x'.repeat(512*1024)})).status,413);
 const fresh=await store.createProfile('parent-a',{nickname:'接口导入',avatar:'fox'});
 assert.equal((await request(`/api/family/profiles/${fresh.id}/progress/chinese/import`,{importId:randomUUID(),sourceId:randomUUID(),data:empty()})).status,200);
});

test('Chinese database replay persists canonical completion and targeted review and rejects forged batches atomically',pg,async t=>{
 const {store,pool}=await fixture(t);const child=await store.createProfile('parent-a',{nickname:'完成',avatar:'panda'});
 const session=completed(),event=completion(session);delete event.result.session.steps;
 const learned=await store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[event]},'chinese');assert.equal(learned.data.lessons['cn-1'].attempts,1);
 const duplicate=await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[event,{...event,eventId:randomUUID()}]},'chinese');assert.equal(duplicate.data.lessons['cn-1'].attempts,1);
 const review=createSession(LESSONS[0],{now:day2,review:true,reviewKeys:['cn-1:word:0']});assert.ok(recordAnswer(empty(),review,review.steps[0],review.steps[0].answer,{now:day2}));assert.equal(advance(review),true);
 const reviewed=await store.syncProgress('parent-a',child.id,{baseRevision:2,session:review,events:[completion(review,day2+1)]},'chinese');assert.equal(reviewed.data.lessons['cn-1'].reviews,1);assert.equal(reviewed.data.session.steps.length,1);
 const forged=createSession(LESSONS[0],{now:day1});forged.index=100;forged.completedAt=day2;
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:3,session:null,events:[answer(),completion(forged)]},'chinese'),failure(400));assert.deepEqual(await store.getProgress('parent-a',child.id,'chinese'),reviewed);
 assert.equal((await pool.query('SELECT count(*) FROM learning_events')).rows[0].count,'3');
 for(const operation of ['syncProgress','importProgress'])await assert.rejects(store[operation]('parent-b',child.id,operation==='syncProgress'?{baseRevision:3,session:null,events:[]}:{importId:randomUUID(),sourceId:randomUUID(),data:empty()},'chinese'),failure(404));
});
