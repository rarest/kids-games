import test from 'node:test';
import assert from 'node:assert/strict';
import {createCourseCloud,guestStorageKey,profileStorageKey} from '../english/course-cloud.js';
const empty=()=>({version:1,lessons:{},items:{},session:null});
const guestKey='pearl-chinese-course-v1';
const profileKey=(owner,id)=>`pearl-chinese-cloud-v1:${encodeURIComponent(owner)}:${encodeURIComponent(id)}`;
const storage=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),get length(){return map.size},key:i=>[...map.keys()][i]??null}};
function fixture(request,store=storage(),options={}){
 const course={storageKey:guestKey,value:empty(),save(){},home(){},snapshot(){return structuredClone(this.value)},replaceProgress(data,{storageKey}){this.value=structuredClone(data);this.storageKey=storageKey}};
 const cloud=createCourseCloud({course,storage:store,request,subject:'chinese',contentVersion:'pep3-cn-2026-v1',guestKey,profileKey,emptyProgress:empty,debounceMs:999999,...options});return{cloud,course,store};
}
const answer={contentId:'cn-1',kind:'answer',result:{itemKey:'cn-1:word:0',correct:true,hinted:false}};

test('subject alone derives Chinese endpoint, version and storage isolation while overrides remain supported',async()=>{
 const calls=[],shared=storage(),course={storageKey:null,save(){},home(){},replaceProgress(data,{storageKey}){this.value=data;this.storageKey=storageKey}};
 const cloud=createCourseCloud({subject:'chinese',course,storage:shared,request:async(path,options)=>{calls.push({path,options});return{revision:options?1:0,data:empty()}},debounceMs:999999});
 await cloud.select('家长',{id:'child'});assert.equal(course.storageKey,'pearl-chinese-cloud-v1:%E5%AE%B6%E9%95%BF:child');
 cloud.onSave({progress:empty(),event:answer});await cloud.flush();assert.equal(calls[0].path,'/api/family/profiles/child/progress/chinese');assert.equal(calls[1].options.body.events[0].contentVersion,'pep3-cn-2026-v1');
 await cloud.logout();assert.equal(course.storageKey,'pearl-chinese-course-v1');assert.equal(shared.getItem(profileStorageKey('家长','child')),null);
});

test('Chinese cloud uses selected endpoint/version and separate guest/profile/queue/import keys',async()=>{
 const calls=[],shared=storage();shared.setItem(guestStorageKey,JSON.stringify({...empty(),session:{lessonId:'english-guest'}}));shared.setItem(guestKey,JSON.stringify({...empty(),session:{lessonId:'chinese-guest'}}));
 const f=fixture(async(path,options)=>{calls.push({path,options});return{revision:options?1:0,data:options?.body.data||empty()}},shared);
 await f.cloud.select('parent',{id:'child'});assert.equal(f.course.storageKey,profileKey('parent','child'));assert.equal(calls[0].path,'/api/family/profiles/child/progress/chinese');assert.equal(calls.length,1,'selection never imports guest automatically');
 f.cloud.onSave({progress:empty(),event:answer});const queues=Array.from({length:shared.length},(_,i)=>shared.key(i)).filter(key=>key.includes(':queue:'));assert.equal(queues.length,1);assert.ok(queues[0].startsWith(profileKey('parent','child')));
 await f.cloud.flush();assert.equal(calls[1].options.body.events[0].contentVersion,'pep3-cn-2026-v1');assert.equal(shared.getItem(profileStorageKey('parent','child')),null);
 await f.cloud.importGuest();assert.equal(calls[2].path,'/api/family/profiles/child/progress/chinese/import');assert.equal(calls[2].options.body.data.session.lessonId,'chinese-guest');
 assert.equal(shared.getItem(`${guestStorageKey}:source`),null);assert.ok(shared.getItem(`${guestKey}:source`));
 await f.cloud.logout();assert.equal(f.course.storageKey,guestKey);assert.equal(f.course.value.session.lessonId,'chinese-guest');assert.equal(JSON.parse(shared.getItem(guestStorageKey)).session.lessonId,'english-guest');
});

test('Chinese verified offline caches and durable tab journals recover independently from English',async()=>{
 const shared=storage();let offline=false,revision=0,data=empty();const received=[];
 const request=async(path,options)=>{assert.ok(path.endsWith('/chinese'));if(offline)throw new TypeError('offline');if(options){if(options.body.baseRevision!==revision){const e=new Error('conflict');e.status=409;e.data={current:{revision,data}};throw e}received.push(...options.body.events);data={...empty(),session:options.body.session};return{revision:++revision,data}}return{revision,data}};
 shared.setItem(`${profileStorageKey('p','c')}:sync`,JSON.stringify({verified:true,revision:99,data:empty()}));
 offline=true;const unavailable=fixture(request,shared);await assert.rejects(unavailable.cloud.select('p',{id:'c'}),/offline/);assert.equal(unavailable.course.storageKey,guestKey);
 offline=false;const a=fixture(request,shared),b=fixture(request,shared);await a.cloud.select('p',{id:'c'});await b.cloud.select('p',{id:'c'});offline=true;
 a.cloud.onSave({progress:{...empty(),session:{lessonId:'cn-1',index:2}},event:answer});b.cloud.onSave({progress:{...empty(),session:{lessonId:'cn-1',index:7}},event:answer});const ids=[a.cloud.pending[0].eventId,b.cloud.pending[0].eventId];await a.cloud.logout();await b.cloud.logout();
 const recovered=fixture(request,shared);await recovered.cloud.select('p',{id:'c'});assert.equal(recovered.cloud.status,'需选择进度');assert.deepEqual(recovered.cloud.conflict.alternatives.map(row=>row.data.session.index).sort((x,y)=>x-y),[2,7]);await recovered.cloud.resolveConflict('local');assert.equal(recovered.cloud.pending.length,2);
 offline=false;await recovered.cloud.flush();assert.deepEqual(received.map(row=>row.eventId).sort(),ids.sort());assert.equal(JSON.parse(shared.getItem(`${profileStorageKey('p','c')}:sync`)).revision,99);
 await assert.rejects(recovered.cloud.select('other',{id:'c'}).then(()=>{offline=true;return recovered.cloud.select('new',{id:'c'})}),/offline/);
});

test('Chinese late responses preserve guest selection and configurable empty progress is used',async()=>{
 let release;const f=fixture(async(path,options)=>options?new Promise(resolve=>release=resolve):{revision:0,data:empty()});
 await f.cloud.select('p',{id:'c'});f.cloud.onSave({progress:empty(),event:answer});const flight=f.cloud.flush();await f.cloud.logout();release({revision:1,data:{...empty(),session:{lessonId:'late'}}});await flight;assert.equal(f.course.storageKey,guestKey);assert.equal(f.course.value.session,null);
 const custom=fixture(async()=>({revision:0,data:empty()}),storage(),{emptyProgress:()=>({...empty(),marker:'custom'})});custom.course.storageKey=null;await custom.cloud.logout();assert.equal(custom.course.value.marker,'custom');
});
