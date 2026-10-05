import {problem} from './store.mjs';
import {wechatAddress,publicWechatUser} from './wechat.mjs';

export function createMiniprogram({auth,familyStore,wechat,pool,origin}){
 const ready=!!(auth&&familyStore);
 function config(){return {enabled:ready,wechatReady:ready&&wechat.miniReady,webWechatReady:ready&&wechat.webReady,webWechatProvider:ready?wechat.webProvider:null};}
 async function session(headers){
  if(!ready)throw problem(503,'Parent accounts unavailable');
  if(!/^Bearer [^\s]+$/i.test(headers.get('authorization')??''))throw problem(401,'Parent bearer session required');
  const safe=new Headers(headers);safe.delete('cookie');
  const value=await auth.api.getSession({headers:safe});
  if(!value?.user?.emailVerified)throw problem(401,'Verified parent session required');
  return value;
 }
 function fresh(value){if(Date.now()-new Date(value.session.createdAt).getTime()>300000)throw problem(403,'Fresh login required');}
 let identityQueue=Promise.resolve();
 async function withIdentity(identity,action){
  // Adapter operations use the pool too. Reserve at most one lock connection
  // per process so simultaneous logins cannot occupy every connection.
  const preceding=identityQueue;let releaseQueue;
  identityQueue=new Promise(resolve=>{releaseQueue=resolve;});await preceding;
  let client;
  try{client=await pool.connect();}catch(error){releaseQueue();throw error;}
  try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${identity.providerId}:${identity.accountId}`]);const result=await action();await client.query('COMMIT');return result;}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();releaseQueue();}
 }
 async function login(code){
  if(!ready)throw problem(503,'Parent accounts unavailable');
  const identity=await wechat.exchangeMini(code),context=await auth.$context,adapter=context.internalAdapter;
  const user=await withIdentity(identity,async()=>{
   const existing=await adapter.findAccountOwnerByKey(identity);
   if(existing?.kind==='owned')return existing.user;
   if(existing)throw problem(409,'WeChat identity unavailable');
   // This is an internally verified identifier, never a deliverable mailbox.
   const created=await adapter.createUser({name:'微信家长',email:wechatAddress(identity.providerId,identity.accountId),emailVerified:true,wechatAccount:true},{method:'oauth',providerId:identity.providerId});
   try{await adapter.linkAccount({...identity,userId:created.id});}catch(error){await adapter.deleteUser(created.id);throw error;}
   return created;
  });
  const value=await adapter.createSession(user.id);
  if(!value)throw problem(503,'Session unavailable');
  return {token:value.token,user:publicWechatUser(user)};
 }
 async function username(body,headers){
  if(!ready)throw problem(503,'Parent accounts unavailable');
  const safe=new Headers(headers);safe.delete('cookie');safe.delete('authorization');safe.delete('content-length');safe.set('origin',origin);safe.set('content-type','application/json');
  const response=await auth.handler(new Request(new URL('/api/auth/sign-in/username',origin),{method:'POST',headers:safe,body:JSON.stringify({username:body.username,password:body.password})}));
  const value=await response.json();if(!response.ok)throw problem(response.status,value.message??'Login failed');
  if(!value.token||!value.user?.emailVerified)throw problem(401,'Verified parent session required');
  return {token:value.token,user:publicWechatUser(value.user)};
 }
 async function link(code,value){
  fresh(value);const identity=await wechat.exchangeMini(code),adapter=(await auth.$context).internalAdapter;
  return withIdentity(identity,async()=>{const owner=await adapter.findAccountOwnerByKey(identity);if(owner&&(owner.kind!=='owned'||owner.user.id!==value.user.id))throw problem(409,'WeChat identity already belongs to another account');if(!owner)await adapter.linkAccount({...identity,userId:value.user.id});return {linked:true};});
 }
 async function logout(value){await (await auth.$context).internalAdapter.deleteSession(value.session.token);return {ok:true};}
 return {config,session,fresh,login,username,link,logout,user:publicWechatUser};
}
