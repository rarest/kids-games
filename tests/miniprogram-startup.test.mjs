import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const file=new URL('../miniprogram/app.js',import.meta.url);
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function startup(){
 const child={id:'child-a',nickname:'小珠'},saved={revision:3,verified:true,data:{version:1,lessons:{old:{completed:true}},items:{},session:null},events:[],dirty:false};
 const storage=new Map([['mini-session-v1',{user:{id:'parent-a'},token:'test-token'}],['mini-profile-v1:parent-a',child],['mini-course-v1:parent-a:child-a',saved]]),requests=[];
 const wx={getStorageSync:key=>storage.get(key),setStorageSync:(key,value)=>storage.set(key,structuredClone(value)),removeStorageSync:key=>storage.delete(key),request:options=>requests.push(options)};
 let definition;vm.runInNewContext(readFileSync(file,'utf8'),{App:value=>definition=value,require:createRequire(file),wx});
 const app={...definition};app.onLaunch();
 const respond=(index,data)=>requests[index].success({statusCode:200,data});
 return {app,wx,storage,requests,child,saved,respond};
}
for(const stage of ['session','profiles','progress'])test(`choosing guest during ${stage} restoration unlocks local learning and ignores late identity changes`,async()=>{
 const h=startup();
 if(stage!=='session'){h.respond(0,{user:{id:'parent-a'}});await tick()}
 if(stage==='progress'){h.respond(1,{profiles:[h.child]});await tick()}
 assert.equal(h.app.useGuestStartup(),true);
 await h.app.ready;
 assert.equal(h.app.client.identity,'guest');
 h.app.client.saveProgress({version:1,lessons:{guestLesson:{completed:true}},items:{},session:null});
 if(stage==='session')h.respond(0,{user:{id:'parent-a'}});
 if(stage==='profiles')h.respond(1,{profiles:[h.child]});
 if(stage==='progress')h.respond(2,{revision:4,data:{version:1,lessons:{},items:{},session:null}});
 await tick();
 assert.equal(h.app.client.identity,'guest');
 assert.equal(h.app.client.progress().lessons.guestLesson.completed,true);
 assert.deepEqual(h.storage.get('mini-course-v1:parent-a:child-a'),h.saved);
 assert.deepEqual(h.storage.get('mini-profile-v1:parent-a'),h.child);
 assert.equal(h.storage.get('mini-session-v1').token,'test-token');
 assert.equal(h.requests.length,stage==='session'?1:stage==='profiles'?2:3);
});
test('a late network failure after guest choice cannot retry selecting the saved child',async()=>{
 const h=startup();h.app.useGuestStartup();await h.app.ready;
 h.requests[0].fail();await tick();
 assert.equal(h.requests.length,1);assert.equal(h.app.client.identity,'guest');
});
test('normal restoration still selects the saved child and guest bypass is unavailable afterward',async()=>{
 const h=startup();h.respond(0,{user:{id:'parent-a'}});await tick();h.respond(1,{profiles:[h.child]});await tick();
 h.respond(2,{revision:4,data:h.saved.data});await h.app.ready;
 assert.equal(h.app.client.identity,'parent-a:child-a');
 assert.equal(h.app.useGuestStartup(),false);
 assert.equal(h.app.client.identity,'parent-a:child-a');
});
test('a network outage still restores a previously verified local child journal',async()=>{
 const h=startup();h.requests[0].fail();await tick();h.requests[1].fail();await h.app.ready;
 assert.equal(h.app.client.identity,'parent-a:child-a');
 assert.equal(h.app.client.progress().lessons.old.completed,true);
});
test('parent-page guest choice also cancels startup and its own late profile loading',async()=>{
 const h=startup(),accountFile=new URL('../miniprogram/pages/account/account.js',import.meta.url);
 let definition,returned=false;
 h.wx.navigateBack=()=>{returned=true};
 vm.runInNewContext(readFileSync(accountFile,'utf8'),{Page:value=>definition=value,require:createRequire(accountFile),getApp:()=>h.app,wx:h.wx});
 const page={...definition,data:structuredClone(definition.data),setData(value){Object.assign(this.data,value)}};
 page.onLoad();const loading=page.load();
 page.guest();await h.app.ready;assert.equal(returned,true);
 h.respond(0,{user:{id:'parent-a'}});h.respond(1,{wechatReady:true});await loading;await tick();
 assert.equal(h.requests.length,2);assert.equal(h.app.client.identity,'guest');
 assert.equal(page.data.selected,null);assert.equal(page.data.wechatReady,false);
});
for(const finishFirst of [false,true])test(`startup cannot replace a child selected by the parent (${finishFirst?'completed':'pending'} selection)`,async()=>{
 const h=startup();h.respond(0,{user:{id:'parent-a'}});await tick();
 const other={id:'child-b',nickname:'小伴'},selection=h.app.client.selectProfile(other);
 if(finishFirst){h.respond(2,{revision:1,data:h.saved.data});await selection}
 h.respond(1,{profiles:[h.child,other]});await tick();
 assert.equal(h.requests.length,3,'startup must not request saved child A after explicit selection B');
 await h.app.ready;
 if(!finishFirst){h.respond(2,{revision:1,data:h.saved.data});await selection}
 assert.equal(h.app.client.identity,'parent-a:child-b');
 assert.deepEqual(h.storage.get('mini-course-v1:parent-a:child-a'),h.saved);
});
