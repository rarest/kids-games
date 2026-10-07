import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const empty=()=>({version:1,lessons:{},items:{},session:null});
const now=Date.parse('2026-10-01T08:00:00Z'),tomorrow=now+86400000;
const failure=status=>error=>error.status===status;
const pg={skip:!process.env.PLATFORM_TEST_DATABASE_URL};
async function modules(){let engine,lessons,codec;await assert.doesNotReject(async()=>{engine=await import('../math/engine.js');lessons=(await import('../math/curriculum.js')).LESSONS;codec=await import('../platform/math-progress.mjs')},'math progress codec must exist');return {engine,lessons,codec}}
function event(lesson,step,time=now,selected=step.answer){return {eventId:randomUUID(),contentVersion:'pep3-math-2025-v1',contentId:lesson.id,kind:'answer',occurredAt:time,result:{itemKey:step.itemKey,selected,correct:true,hinted:false}}}
function completed(engine,lesson,{review=false,time=now}={}){const progress=empty(),session=engine.createSession(lesson,{now:time,review});while(session.index<session.steps.length){const step=session.steps[session.index];assert.ok(engine.recordAnswer(progress,session,step,step.kind==='question'?step.answer:step.kind==='expression'?{selfReported:true}:{visited:true},{now:time}));assert.equal(engine.advance(session),true)}return session}
const completion=(lesson,session,time=tomorrow)=>({eventId:randomUUID(),contentVersion:'pep3-math-2025-v1',contentId:lesson.id,kind:'completion',occurredAt:time,result:{session}});

test('math codec recomputes correctness from published answer and selected value, enforcing content allowlists',async()=>{
 const {engine,lessons,codec}=await modules(),lesson=lessons[0],step=engine.buildSteps(lesson).find(s=>s.itemKey);
 assert.equal(codec.CONTENT_VERSION,'pep3-math-2025-v1');
 const wrong=step.choices?step.choices.find(c=>c!==step.answer):'999999999999999';
 const normalized=codec.normalizeEvent(event(lesson,step,now,wrong));assert.equal(normalized.result.correct,false);assert.equal(normalized.result.selected,wrong);
 const replayed=codec.replay(empty(),[event(lesson,step,tomorrow),event(lesson,step,now)]);
 assert.equal(replayed.items[step.itemKey].correct,2);assert.equal(replayed.items[step.itemKey].streak,2);
 for(const raw of [event(lesson,{...step,itemKey:'__proto__'}),{...event(lesson,step),contentVersion:'pep3-cn-2026-v1'},{...event(lesson,step),contentId:'cn-1'},event(lesson,step,now+.5),event(lesson,step,now,12)])assert.throws(()=>codec.normalizeEvent(raw),failure(400));
 const invalid=event(lesson,step);delete invalid.result.selected;assert.throws(()=>codec.normalizeEvent(invalid),failure(400));
 assert.throws(()=>codec.sanitize({...empty(),padding:'x'.repeat(512*1024)}),failure(413));
 const session=engine.createSession(lesson,{now});session.steps=[{kind:'evil'}];assert.deepEqual(codec.sanitizeSession(session).steps,engine.buildSteps(lesson));
});

test('math completion requires every visit and canonical latest answer; review does not create learned completion',async()=>{
 const {engine,lessons,codec}=await modules(),lesson=lessons[0],session=completed(engine,lesson);
 const forged=structuredClone(session);delete forged.answers[forged.steps[1].id];assert.throws(()=>codec.normalizeEvent(completion(lesson,forged)),failure(400));
 const wrong=structuredClone(session),step=wrong.steps.find(s=>s.itemKey);wrong.answers[step.id].latest.selected=step.choices?step.choices.find(c=>c!==step.answer):'999999999999999';assert.throws(()=>codec.normalizeEvent(completion(lesson,wrong)),failure(400));
 const learned=codec.replay(empty(),[completion(lesson,session),completion(lesson,session)]);assert.equal(learned.lessons[lesson.id].attempts,1);
 const review=completed(engine,lesson,{review:true,time:tomorrow});assert.deepEqual(codec.replay(empty(),[completion(lesson,review,tomorrow)]).lessons,{});
 assert.equal(codec.replay(empty(),[completion(lesson,session),completion(lesson,review,tomorrow+1)]).lessons[lesson.id].reviews,1);
 assert.throws(()=>codec.normalizeEvent(completion(lesson,session,now-1)),failure(400));
});

async function fixture(t){const {default:{Pool}}=await import('../platform/node_modules/pg/lib/index.js');const connectionString=process.env.PLATFORM_TEST_DATABASE_URL;const admin=new Pool({connectionString}),schema=`math_test_${randomUUID().replaceAll('-','')}`;await admin.query(`CREATE SCHEMA ${schema}`);const pool=new Pool({connectionString,options:`-c search_path=${schema}`});t.after(async()=>{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end()});await pool.query('CREATE TABLE family_user(id text PRIMARY KEY)');await pool.query("INSERT INTO family_user(id) VALUES('parent-a'),('parent-b')");const {FamilyStore}=await import('../platform/family-store.mjs');const store=new FamilyStore({pool});await store.migrate();return {pool,store}}

test('math real database preserves subject/profile isolation, CAS, UUID deduplication, imports and three-subject exports',pg,async t=>{
 const {engine,lessons}=await modules(),{pool,store}=await fixture(t),lesson=lessons[0],step=engine.buildSteps(lesson).find(s=>s.itemKey);
 const child=await store.createProfile('parent-a',{nickname:'数学',avatar:'fox'}),sibling=await store.createProfile('parent-a',{nickname:'独立',avatar:'cat'}),answer=event(lesson,step);
 const first=await store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[answer]},'math');assert.equal(first.revision,1);
 const repeat=await store.syncProgress('parent-a',child.id,{baseRevision:1,session:null,events:[answer]},'math');assert.equal(repeat.data.items[step.itemKey].correct,1);
 assert.equal((await store.getProgress('parent-a',child.id,'english')).revision,0);assert.equal((await store.getProgress('parent-a',child.id,'chinese')).revision,0);assert.equal((await store.getProgress('parent-a',sibling.id,'math')).revision,0);
 await assert.rejects(store.syncProgress('parent-a',child.id,{baseRevision:0,session:null,events:[]},'math'),error=>error.status===409&&error.current.revision===2);
 await assert.rejects(store.syncProgress('parent-a',sibling.id,{baseRevision:0,session:null,events:[answer]},'math'),failure(409));
 await assert.rejects(store.getProgress('parent-b',child.id,'math'),failure(404));
 const session=completed(engine,lesson),completedEvent=completion(lesson,session);const learned=await store.syncProgress('parent-a',child.id,{baseRevision:2,session,events:[completedEvent]},'math');assert.equal(learned.data.lessons[lesson.id].completed,true);
 const importBody={sourceId:randomUUID(),importId:randomUUID(),data:{...empty(),session:engine.createSession(lesson,{now})}};
 const imported=await store.importProgress('parent-a',sibling.id,importBody,'math');assert.equal(imported.data.session.lessonId,lesson.id);
 assert.deepEqual(await store.importProgress('parent-a',sibling.id,{...importBody,importId:randomUUID()},'math'),imported);
 await assert.rejects(store.importProgress('parent-a',sibling.id,{...importBody,importId:randomUUID(),sourceId:randomUUID()},'math'),failure(409));
 await assert.rejects(store.importProgress('parent-a',child.id,{...importBody,importId:randomUUID()},'math'),failure(409));
 const exported=await store.exportAccount('parent-a');assert.equal(exported.progress.length,6);assert.deepEqual([...new Set(exported.progress.map(r=>r.gameId))].sort(),['chinese','english','math']);
 await store.migrate();assert.deepEqual(await store.getProgress('parent-a',child.id,'math'),learned,'restart migration must not narrow allowlists or alter math');
 for(const sql of ["UPDATE game_progress SET game_id='unknown'","UPDATE save_imports SET game_id='unknown'","UPDATE learning_events SET content_version='unknown'"])await assert.rejects(pool.query(sql),error=>error.code==='23514');
 await store.deleteProfile('parent-a',child.id);assert.equal((await pool.query('SELECT count(*) FROM learning_events WHERE profile_id=$1',[child.id])).rows[0].count,'0');
});

test('math HTTP route enforces verified ownership and canonical event validation',pg,async t=>{
 const {engine,lessons}=await modules(),{pool,store}=await fixture(t),lesson=lessons[0],step=engine.buildSteps(lesson).find(s=>s.itemKey),child=await store.createProfile('parent-a',{nickname:'接口',avatar:'rabbit'});
 const {createApi}=await import('../platform/server.mjs');const auth={api:{getSession:async({headers})=>({user:{id:headers.get('x-owner')||'parent-a',emailVerified:headers.get('x-verified')!=='no'}})}};
 const server=createApi({store:{pool},familyStore:store,auth,secret:'isolated-math-api-secret-at-least-32',publicOrigin:'http://games.test'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`,path=`/api/family/profiles/${child.id}/progress/math`;
 const request=(body,headers={})=>fetch(base+path,{method:body?'POST':'GET',headers:{origin:'http://games.test','content-type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request()).status,200);assert.equal((await request(null,{'x-owner':'parent-b'})).status,404);assert.equal((await request(null,{'x-verified':'no'})).status,401);
 assert.equal((await request({baseRevision:0,session:null,events:[event(lesson,step)]})).status,200);
 const forged=event(lesson,step);delete forged.result.selected;assert.equal((await request({baseRevision:1,session:null,events:[forged]})).status,400);
});

test('math family sync uses its own version and encoded profile storage; auth loss restores guest without reset recursion',async t=>{
 const {mountFamily}=await import('../math/family.js');
 const previous={fetch:globalThis.fetch,localStorage:globalThis.localStorage,addEventListener:globalThis.addEventListener,dispatchEvent:globalThis.dispatchEvent};
 t.after(()=>Object.assign(globalThis,previous));
 const rows=new Map(),listeners=new Map(),requests=[],owner='parent:家长',profile={id:'child:孩子',nickname:'珠珠',avatar:'fox'};
 const storage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key),get length(){return rows.size},key:index=>[...rows.keys()][index]??null};
 const guest=JSON.stringify(empty());storage.setItem('pearl-math-course-v1',guest);
 let expired=false,logouts=0;
 globalThis.localStorage=storage;
 globalThis.addEventListener=(name,listener)=>{const list=listeners.get(name)||[];list.push(listener);listeners.set(name,list)};
 globalThis.dispatchEvent=event=>{if(event.type==='family-logout')assert.ok(++logouts<3,'authentication reset cannot recurse');for(const listener of listeners.get(event.type)||[])listener(event)};
 const course={root:{},lessons:[],storageKey:'pearl-math-course-v1',progress:empty(),snapshot(){return this.progress},save(){},home(){},replaceProgress(data,{storageKey}){this.progress=data;this.storageKey=storageKey}};
 globalThis.fetch=async(path,options={})=>{
  requests.push({path,options});
  let data=path==='/api/family/status'?{enabled:true}:path==='/api/auth/get-session'?{user:{id:owner,emailVerified:true}}:path==='/api/family/profiles'?{profiles:[profile]}:{revision:options.method==='POST'?1:0,data:course.progress};
  return new Response(JSON.stringify(expired?{message:'Expired'}:data),{status:expired?401:200,headers:{'content-type':'application/json'}});
 };
 const root={dataset:{},innerHTML:'',insertAdjacentHTML(){},querySelector(){return null},addEventListener(){}};
 const cloud=mountFamily({course,root,notice:()=>{}});
 assert.equal(root.dataset.guest,'true','guest can start before authentication request completes');
 for(let i=0;i<50&&!cloud.profile;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(cloud.profile?.id,profile.id);
 const profileKey=`pearl-math-cloud-v1:${encodeURIComponent(owner)}:${encodeURIComponent(profile.id)}`;
 assert.equal(course.storageKey,profileKey);
 cloud.onSave({progress:course.progress,event:{contentId:'math-1',kind:'answer',result:{itemKey:'math-1:question:3',selected:'2',correct:true,hinted:false}}});
 await cloud.flush();
 const post=requests.find(row=>row.options.method==='POST');assert.ok(post);
 assert.equal(post.path,`/api/family/profiles/${encodeURIComponent(profile.id)}/progress/math`);
 assert.equal(JSON.parse(post.options.body).events[0].contentVersion,'pep3-math-2025-v1');
 assert.equal(storage.getItem('pearl-math-course-v1'),guest);
 expired=true;cloud.onSave({progress:course.progress,event:{contentId:'math-1',kind:'answer',result:{itemKey:'math-1:question:3',selected:'2',correct:true,hinted:false}}});await cloud.flush();
 for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(cloud.profile,null);assert.equal(course.storageKey,'pearl-math-course-v1');assert.equal(root.dataset.guest,'true');assert.equal(logouts,1);
 assert.equal(storage.getItem('pearl-math-course-v1'),guest);
});
