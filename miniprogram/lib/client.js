const {origin}=require('../config.js');
const bundled=require('./bundled-content.js');
const copy=value=>JSON.parse(JSON.stringify(value));
const empty=()=>({version:1,lessons:{},items:{},session:null});
const wire=value=>{if(!value)return null;const {steps,...rest}=copy(value);return rest};
const uuid=()=> 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return (c==='x'?r:(r&3)|8).toString(16)});
function message(error){if(error.status===503)return '微信登录或服务尚未开通。可先以访客学习，或使用已有用户名。';if(error.status===401)return '登录已失效，请重新登录。';if(error.status===403)return '此操作需要刚完成的登录，请重新登录后再试。';if(error.status===409)return '记录发生冲突，请选择接着使用的进度。';return error.message||'网络未连接，请稍后重试。'}
function createClient(wx,{onChange=()=>{}}={}){
 let user=null,token=null,profile=null,generation=0,active=null;
 const read=key=>{try{return wx.getStorageSync(key)||null}catch{return null}};
 const write=(key,value)=>wx.setStorageSync(key,copy(value));
 const guestKey='mini-course-v1:guest';
 const keyFor=id=>`mini-course-v1:${encodeURIComponent(user.id)}:${encodeURIComponent(id)}`;
 function notify(){onChange()}
 function request(path,{method='GET',body,authenticated=true}={}){return new Promise((resolve,reject)=>{
  const header={'Content-Type':'application/json'};if(authenticated&&token)header.Authorization=`Bearer ${token}`;
  wx.request({url:origin+'/api/miniprogram'+path,method,data:body,header,timeout:15000,success(result){if(result.statusCode>=200&&result.statusCode<300)resolve(result.data);else{const error=Object.assign(new Error('请求失败'),{status:result.statusCode,data:result.data});error.message=message(error);reject(error)}},fail(){reject(new Error('网络未连接，请稍后重试。'))}});
 })}
 async function login(path,body){const result=await request(path,{method:'POST',body,authenticated:false});if(typeof result.token!=='string'||!result.token||!result.user?.id)throw new Error('没有取得有效登录，请重试。');generation++;user=result.user;token=result.token;profile=null;active=null;write('mini-session-v1',{user,token});notify();return result}
 const loginCode=()=>new Promise((resolve,reject)=>wx.login({success:r=>r.code?resolve(r.code):reject(new Error('微信未返回登录凭证。')),fail:()=>reject(new Error('微信登录未完成，请重试。'))}));
 function restore(){const saved=read('mini-session-v1');if(saved?.token&&saved.user?.id){user=saved.user;token=saved.token}return user}
 async function refresh(){if(!token)return null;const currentToken=token,currentGeneration=generation;try{const result=await request('/session');if(token!==currentToken||generation!==currentGeneration)return user;if(!result.user?.id)throw Object.assign(new Error('登录失效'),{status:401});user=result.user;write('mini-session-v1',{user,token});return user}catch(error){if(token!==currentToken||generation!==currentGeneration)return user;if(error.status===401||error.status===403)clearIdentity();throw error}}
 function clearIdentity(){generation++;user=null;token=null;profile=null;active=null;wx.removeStorageSync('mini-session-v1');notify()}
 async function selectProfile(next){
  if(!user||!token)throw new Error('请先登录。');
  const epoch=++generation,key=keyFor(next.id),owner=user.id;
  if(active?.flight)try{await active.flight}catch{}
  if(epoch!==generation||user?.id!==owner)return;
  const local=read(key);let remote;
  try{remote=await request('/profiles/'+encodeURIComponent(next.id)+'/progress/english')}catch(error){if(error.status||!local?.verified)throw error;remote={revision:local.revision,data:local.data}}
  if(epoch!==generation||user?.id!==owner)return;
  const pending=local?.dirty||local?.events?.length;active=pending?local:{revision:remote.revision,data:remote.data,events:[],dirty:false};
  active.key=key;active.profileId=next.id;active.verified=true;active.conflict=pending&&local.revision!==remote.revision?remote:null;profile=next;write(`mini-profile-v1:${owner}`,next);persist(active);notify();return active;
 }
 function persist(target){write(target.key,target)}
 function progress(){return copy(active?.data||read(guestKey)||empty())}
 function saveProgress(data,event){if(!active){write(guestKey,data);notify();return}active.data=copy(data);active.dirty=true;if(event){const normalized=copy(event);if(normalized.kind==='completion')normalized.result.session=wire(normalized.result.session);active.events.push({...normalized,eventId:uuid(),occurredAt:Date.now(),contentVersion:'pep3-2024-v1'})}persist(active);notify()}
 async function flush(){
  const target=active;if(!target||target.conflict||(!target.dirty&&!target.events.length))return;if(target.flight)return target.flight;
  const flight=(async()=>{while(target===active&&!target.conflict&&(target.dirty||target.events.length)){
   const session=wire(target.data.session),pending=[];for(const event of target.events.slice(0,256)){if(JSON.stringify({baseRevision:target.revision,session,events:[...pending,event]}).length*3>480*1024)break;pending.push(event)}
   if(target.events.length&&!pending.length)throw new Error('学习记录过大，请保留此设备记录并联系家长。');
   const snapshot=JSON.stringify(target.data);
   try{const result=await request('/profiles/'+encodeURIComponent(target.profileId)+'/progress/english',{method:'POST',body:{baseRevision:target.revision,session,events:pending}});
    target.revision=result.revision;const sent=new Set(pending.map(e=>e.eventId));target.events=target.events.filter(e=>!sent.has(e.eventId));
    if(JSON.stringify(target.data)===snapshot&&!target.events.length){target.data=result.data;target.dirty=false}persist(target);notify();
   }catch(error){if(error.status===409&&error.data?.current)target.conflict=error.data.current;persist(target);if(error.status===401||error.status===403)clearIdentity();notify();throw error}
  }})().finally(()=>delete target.flight);
  Object.defineProperty(target,'flight',{value:flight,writable:true,configurable:true,enumerable:false});return flight;
 }
 function resolveConflict(choice){if(!active?.conflict)return;const remote=active.conflict;active.revision=remote.revision;if(choice==='cloud')active.data.session=copy(remote.data.session);active.conflict=null;active.dirty=true;persist(active);return flush()}
 async function importGuest(){if(!active)throw new Error('请先选择孩子。');await flush();if(active.conflict||active.dirty||active.events.length)throw new Error('请先处理进度同步。');let sourceId=read(guestKey+':source');if(!sourceId){sourceId=uuid();write(guestKey+':source',sourceId)}const target=active,importKey=target.key+':import:'+sourceId;let importId=read(importKey);if(!importId){importId=uuid();write(importKey,importId)}const result=await request('/profiles/'+encodeURIComponent(target.profileId)+'/progress/english/import',{method:'POST',body:{sourceId,importId,data:read(guestKey)||empty()}});target.data=result.data;target.revision=result.revision;persist(target);notify()}
 function pageKey(page){return `mini-pages-v1:${user&&profile?encodeURIComponent(user.id)+':'+encodeURIComponent(profile.id):'guest'}:${page}`}
 function pageHistory(page){return read(pageKey(page))||{}}
 function savePageHistory(page,data){write(pageKey(page),data)}
 function pageCursor(page){return read(pageKey(page)+':cursor')}
 function savePageCursor(page,data){write(pageKey(page)+':cursor',data)}
 async function content(path){const local=bundled.content(path);if(local!==undefined)return local;return new Promise((resolve,reject)=>wx.request({url:origin+'/english/miniprogram-data/'+path,timeout:15000,success:r=>r.statusCode===200?resolve(r.data):reject(new Error('教材暂时无法加载，请重试。')),fail:()=>reject(new Error('网络未连接，请重试。'))}))}
 return {request,restore,refresh,username:(username,password)=>login('/username',{username,password}),wechatLogin:async()=>login('/login',{code:await loginCode()}),link:async()=>request('/link',{method:'POST',body:{code:await loginCode()}}),logout:async()=>{try{await request('/logout',{method:'POST',body:{}})}finally{clearIdentity()}},selectProfile,progress,saveProgress,flush,resolveConflict,importGuest,pageHistory,savePageHistory,pageCursor,savePageCursor,content,guest(){generation++;profile=null;active=null;notify()},get user(){return user},get profile(){return profile},get conflict(){return active?.conflict},get pending(){return active?.dirty||active?.events?.length},get identity(){return user&&profile?user.id+':'+profile.id:'guest'},get identityVersion(){return generation},get selected(){return user?read(`mini-profile-v1:${user.id}`):null}};
}
module.exports={createClient,message,wire};
