import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const database=process.env.PLATFORM_TEST_DATABASE_URL;
const secret='wechat-test-only-123456789012345678901234567890';

test('Tencent exchange rejects missing configuration, untrusted identity and upstream secrets',async()=>{
 const {createWechat}=await import('../platform/wechat.mjs');
 const disabled=createWechat({env:{}});
 assert.equal(disabled.miniReady,false);
 await assert.rejects(disabled.exchangeMini('temporary-code'),e=>e.status===503);
 const urls=[];let response={openid:'server-identity',session_key:'private-session-key'};
 const wx=createWechat({env:{WECHAT_MINI_APP_ID:'mini-app',WECHAT_MINI_APP_SECRET:'private-app-secret'},fetchImpl:async(url,options)=>{urls.push(String(url));assert.ok(options.signal);return Response.json(response);}});
 assert.deepEqual(await wx.exchangeMini('one-use-code'),{providerId:'wechat-mini:mini-app',accountId:'server-identity'});
 assert.ok(urls[0].startsWith('https://api.weixin.qq.com/sns/jscode2session?'));
 await assert.rejects(wx.exchangeMini({openid:'client-lie'}),e=>e.status===400);
 response={errcode:40029,errmsg:'private-app-secret private-session-key'};
 await assert.rejects(wx.exchangeMini('bad'),e=>e.status===401&&!e.message.includes('private'));
 const failed=createWechat({env:{WECHAT_MINI_APP_ID:'mini',WECHAT_MINI_APP_SECRET:'secret'},fetchImpl:async()=>{throw Error('URL contains secret');}});
 await assert.rejects(failed.exchangeMini('bad'),e=>e.status===503&&!e.message.includes('secret'));
});

test('disabled miniprogram endpoints remain truthful and preserve family Origin requirement',async()=>{
 const {createApi}=await import('../platform/server.mjs');
 const server=createApi({store:{},secret,publicOrigin:'http://games.test'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.deepEqual(await(await fetch(base+'/api/miniprogram/config')).json(),{enabled:false,wechatReady:false,webWechatReady:false,webWechatProvider:null});
  assert.equal((await fetch(base+'/api/miniprogram/login',{method:'POST',headers:{'content-type':'application/json'},body:'{"code":"abc","openid":"client-lie"}'})).status,503);
  assert.equal((await fetch(base+'/api/family/profiles',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
 }finally{await new Promise(r=>server.close(r));}
});

test('real PostgreSQL Bearer sessions, identity binding and shared family isolation',{skip:!database},async()=>{
 const {default:{Pool}}=await import('../platform/node_modules/pg/lib/index.js');
 const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
 const {createApi}=await import('../platform/server.mjs');
 const {createWechat}=await import('../platform/wechat.mjs');
 const {FamilyStore}=await import('../platform/family-store.mjs');
 const admin=new Pool({connectionString:database}),schema=`wx_${randomUUID().replaceAll('-','')}`;
 await admin.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`,max:2,connectionTimeoutMillis:2000});let server;
 try{
  // Only the Tencent code exchange is a fixture; auth, sessions and stores use real PG.
  const wechat=createWechat({env:{WECHAT_MINI_APP_ID:'fixture-mini',WECHAT_MINI_APP_SECRET:'fixture-only'},fetchImpl:async url=>Response.json({openid:new URL(url).searchParams.get('js_code'),session_key:'must-not-escape'})});
  const auth=createAuth({pool,secret,publicOrigin:'http://games.test',wechat});await migrateAuth(auth);
  const familyStore=new FamilyStore({pool});await familyStore.migrate();
  server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth,familyStore,wechat});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const req=(path,{body,token,method=body?'POST':'GET',extra={}}={})=>fetch(base+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:`Bearer ${token}`}:{ }),...extra},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal((await req('/api/miniprogram/profiles')).status,401);
  const login=async (code,wechatAccount=true)=>{const r=await req('/api/miniprogram/login',{body:{code,email:'spoof@user.test',openid:'client-lie'}});assert.equal(r.status,200);const v=await r.json();assert.ok(v.token);assert.equal(v.user.wechatAccount,wechatAccount);assert.ok(!JSON.stringify(v).includes('session_key'));return v;};
  const a=await login('identity-a'),b=await login('identity-b');
  assert.equal((await login('identity-a')).user.id,a.user.id);
  assert.equal((await(await req('/api/miniprogram/session',{token:a.token})).json()).user.id,a.user.id);
  const r=await req('/api/miniprogram/profiles',{token:a.token,body:{nickname:'孩子',avatar:'fox'}});assert.equal(r.status,201);const {profile}=await r.json();
  const path=`/api/miniprogram/profiles/${profile.id}/progress/english`;
  assert.equal((await req(path,{token:b.token})).status,404);
  assert.equal((await req(path,{token:a.token,body:{baseRevision:0,session:null,events:[]}})).status,200);
  assert.equal((await req(path,{token:a.token,body:{baseRevision:0,session:null,events:[]}})).status,409);
  assert.equal((await req('/api/miniprogram/link',{token:a.token,body:{code:'identity-b'}})).status,409);
  const signup=await req('/api/auth/sign-up/username',{body:{username:'existing-parent',password:'test-password-long-123'},extra:{origin:'http://games.test'}});assert.equal(signup.status,200);
  const web=(await signup.json());
  const parentResponse=await req('/api/miniprogram/username',{body:{username:'existing-parent',password:'test-password-long-123'}});assert.equal(parentResponse.status,200);const parent=await parentResponse.json();assert.equal(parent.user.id,web.user.id);
  assert.equal((await req('/api/miniprogram/link',{token:parent.token,body:{code:'unoccupied'}})).status,200);
  assert.equal((await login('unoccupied',false)).user.id,parent.user.id);
  await pool.query('UPDATE family_session SET "createdAt"=now()-interval \'10 minutes\' WHERE "userId"=$1',[parent.user.id]);
  assert.equal((await req('/api/miniprogram/link',{token:parent.token,body:{code:'other'}})).status,403);
  assert.equal((await req('/api/family/profiles',{token:a.token,body:{nickname:'孩子',avatar:'fox'}})).status,403);
  assert.equal((await req('/api/miniprogram/logout',{token:a.token,body:{}})).status,200);
  assert.equal((await req('/api/miniprogram/session',{token:a.token})).status,401);
  const {createMiniprogram}=await import('../platform/miniprogram.mjs');
  const concurrent=createMiniprogram({auth,familyStore,wechat,pool,origin:'http://games.test'});
  const many=await Promise.all(Array.from({length:8},(_,i)=>concurrent.login(`simultaneous-${i}`)));
  assert.equal(new Set(many.map(v=>v.user.id)).size,8,'identity locks do not exhaust a pool with just two connections');
  const accounts=(await pool.query('SELECT * FROM family_account WHERE "providerId" LIKE \'wechat%\'')).rows;
  assert.ok(accounts.every(row=>!row.accessToken&&!row.refreshToken&&!row.idToken));
 }finally{if(server)await new Promise(r=>server.close(r));await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});

test('real PostgreSQL web QR and official-account OAuth state, safe identities and fresh deletion',{skip:!database},async()=>{
 const {default:{Pool}}=await import('../platform/node_modules/pg/lib/index.js');
 const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
 const {createApi}=await import('../platform/server.mjs');
 const {createWechat}=await import('../platform/wechat.mjs');
 const {FamilyStore}=await import('../platform/family-store.mjs');
 const admin=new Pool({connectionString:database});
 try{for(const mode of ['website','official-account']){
  const schema=`webwx_${randomUUID().replaceAll('-','')}`;await admin.query(`CREATE SCHEMA ${schema}`);
  const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`});let server;
  try{
   let exchanges=0,currentIdentity='server-openid';
   const wechat=createWechat({env:{WECHAT_WEB_APP_ID:'fixture-web',WECHAT_WEB_APP_SECRET:'fixture-secret',WECHAT_WEB_MODE:mode},fetchImpl:async url=>{const u=new URL(url);if(u.pathname==='/sns/oauth2/access_token'){exchanges++;currentIdentity=u.searchParams.get('code')==='bind-code'?'bound-openid':u.searchParams.get('code')==='race-code'?'race-openid':'server-openid';return Response.json({openid:currentIdentity,access_token:'must-not-persist',refresh_token:'must-not-persist',expires_in:7200,scope:'snsapi_userinfo'});}return Response.json({openid:currentIdentity,nickname:'微信家长',email:'attacker-claimed@example.test',unionid:'untrusted-profile-alternate'});}});
   const auth=createAuth({pool,secret,publicOrigin:'http://games.test',wechat});await migrateAuth(auth);const familyStore=new FamilyStore({pool});await familyStore.migrate();
   server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth,familyStore});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
   const req=(path,{body,cookie,method=body?'POST':'GET'}={})=>fetch(base+path,{method,redirect:'manual',headers:{origin:'http://games.test',...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
   const cookies=r=>r.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
   const config=await(await req('/api/miniprogram/config')).json();assert.equal(config.webWechatReady,true);assert.equal(config.webWechatProvider,mode==='website'?'wechat':'wechat-mp');
   const start=async()=>{const r=await req('/api/auth/sign-in/social',{body:{provider:config.webWechatProvider,callbackURL:'http://games.test/account.html',disableRedirect:true}});assert.equal(r.status,200);const value=await r.json();const url=new URL(value.url);assert.equal(url.hostname,'open.weixin.qq.com');assert.equal(url.searchParams.get('appid'),'fixture-web');assert.ok(url.searchParams.get('state'));return {state:url.searchParams.get('state'),cookie:cookies(r)};};
   const wrong=await start();assert.equal((await req(`/api/auth/callback/${config.webWechatProvider}?code=code&state=invalid`,{cookie:wrong.cookie})).status,302);assert.equal(exchanges,0,'invalid state fails before exchanging code');
   const login=async()=>{const pending=await start();const callback=await req(`/api/auth/callback/${config.webWechatProvider}?code=code&state=${encodeURIComponent(pending.state)}`,{cookie:pending.cookie});assert.equal(callback.status,302);assert.equal(new URL(callback.headers.get('location'),'http://games.test').pathname,'/account.html');const cookie=cookies(callback);const session=await(await req('/api/auth/get-session',{cookie})).json();assert.ok(session?.user?.id);assert.equal(session.user.wechatAccount,true);assert.equal(session.user.emailVerified,true);assert.ok(session.user.email.endsWith('@accounts.invalid'));assert.notEqual(session.user.email,'attacker-claimed@example.test');return {cookie,user:session.user};};
   const first=await login(),repeat=await login();assert.equal(repeat.user.id,first.user.id);
   const rows=(await pool.query('SELECT * FROM family_account')).rows;assert.ok(rows.every(row=>!row.accessToken&&!row.refreshToken&&!row.idToken),'Tencent tokens never persisted on repeated login');
   const made=await req('/api/family/profiles',{cookie:first.cookie,body:{nickname:'孩子',avatar:'fox'}});assert.equal(made.status,201);
   await pool.query('UPDATE family_session SET "createdAt"=now()-interval \'10 minutes\' WHERE "userId"=$1',[first.user.id]);
   assert.equal((await req('/api/family/account',{cookie:first.cookie,method:'DELETE',body:{}})).status,403);
   assert.equal((await req('/api/auth/link-social',{cookie:first.cookie,body:{provider:config.webWechatProvider}})).status,403);
   await pool.query('DELETE FROM family_rate_limit');
   const registered=await req('/api/auth/sign-up/username',{body:{username:'wechat-parent',password:'existing-password-long-123'}});assert.equal(registered.status,200);const parentCookie=cookies(registered),parentUser=(await registered.json()).user;
   const staleStart=await req('/api/auth/link-social',{cookie:parentCookie,body:{provider:config.webWechatProvider,callbackURL:'http://games.test/account.html',disableRedirect:true}});assert.equal(staleStart.status,200);const staleState=new URL((await staleStart.json()).url).searchParams.get('state');
   await pool.query('UPDATE family_session SET "createdAt"=now()-interval \'10 minutes\' WHERE "userId"=$1',[parentUser.id]);
   const staleCallback=await req(`/api/auth/callback/${config.webWechatProvider}?code=bind-code&state=${encodeURIComponent(staleState)}`,{cookie:[parentCookie,cookies(staleStart)].join('; ')});assert.equal(staleCallback.status,302);assert.ok(new URL(staleCallback.headers.get('location'),'http://games.test').searchParams.get('error'),'link callback also rejects an expired fresh session');
   assert.equal((await pool.query('SELECT id FROM family_account WHERE "accountId"=$1',['fixture-web:bound-openid'])).rowCount,0);
   await pool.query('UPDATE family_session SET "createdAt"=now() WHERE "userId"=$1',[parentUser.id]);
   const linkStart=await req('/api/auth/link-social',{cookie:parentCookie,body:{provider:config.webWechatProvider,callbackURL:'http://games.test/account.html',disableRedirect:true}});assert.equal(linkStart.status,200);const linkState=new URL((await linkStart.json()).url).searchParams.get('state');
   const linked=await req(`/api/auth/callback/${config.webWechatProvider}?code=bind-code&state=${encodeURIComponent(linkState)}`,{cookie:[parentCookie,cookies(linkStart)].join('; ')});assert.equal(linked.status,302);assert.equal(new URL(linked.headers.get('location'),'http://games.test').pathname,'/account.html');
   assert.equal((await pool.query('SELECT "userId" FROM family_account WHERE "accountId"=$1',['fixture-web:bound-openid'])).rows[0].userId,parentUser.id,'explicit web link keeps the original username owner');
   const linkedSession=await(await req('/api/auth/get-session',{cookie:parentCookie})).json();assert.equal(linkedSession.user.username,'wechat-parent');assert.equal(linkedSession.user.wechatAccount,false);
   await pool.query('DELETE FROM family_rate_limit');
   const contenders=await Promise.all(['race-parent-a','race-parent-b'].map(async username=>{const signed=await req('/api/auth/sign-up/username',{body:{username,password:'contender-password-long-123'}});assert.equal(signed.status,200);const cookie=cookies(signed),user=(await signed.json()).user;const start=await req('/api/auth/link-social',{cookie,body:{provider:config.webWechatProvider,callbackURL:'http://games.test/account.html',disableRedirect:true}});assert.equal(start.status,200);return {user,cookie:[cookie,cookies(start)].join('; '),state:new URL((await start.json()).url).searchParams.get('state')};}));
   const callbacks=await Promise.all(contenders.map(c=>req(`/api/auth/callback/${config.webWechatProvider}?code=race-code&state=${encodeURIComponent(c.state)}`,{cookie:c.cookie})));
   const successful=callbacks.filter(c=>c.status===302&&!new URL(c.headers.get('location'),'http://games.test').searchParams.has('error'));assert.equal(successful.length,1,'concurrent callbacks cannot assign the same identity to two parents');
   assert.equal((await pool.query('SELECT id FROM family_account WHERE "accountId"=$1',['fixture-web:race-openid'])).rowCount,1);
   // Reset only the fixture rate rows after asserting stale-session guards.
   await pool.query('DELETE FROM family_rate_limit');
   const fresh=await login();assert.equal((await req('/api/family/account',{cookie:fresh.cookie,method:'DELETE',body:{}})).status,200);assert.equal((await familyStore.profiles(first.user.id)).length,0);
  }finally{if(server)await new Promise(r=>server.close(r));await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);}
 }}finally{await admin.end();}
});

test('guest miniprogram binary pronunciation shares target lookup and assessment service',async()=>{
 const {createApi}=await import('../platform/server.mjs');
 let calls=0;const audio=Buffer.alloc(44);audio.write('RIFF');audio.write('WAVE',8);
 const target={id:'p1-word-0',kind:'word',en:'hello'},result={engine:'local-phoneme',score:82};
 const server=createApi({store:{},secret,publicOrigin:'http://games.test',getSpeechTarget:id=>id===target.id?target:null,pronunciation:{status:async()=>({enabled:true,provider:'local-phoneme'}),assess:async value=>{calls++;assert.deepEqual(value.audio,audio);assert.equal(value.target,target);assert.match(value.ip,/^[a-f0-9]{64}$/);return result;}}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const post=(path,body=audio,contentType='audio/wav')=>fetch(base+path,{method:'POST',headers:{'content-type':contentType},body});
  assert.deepEqual(await(await post('/api/miniprogram/pronunciation?target=p1-word-0')).json(),result);
  assert.equal((await post('/api/miniprogram/pronunciation?target=wrong')).status,400);
  assert.equal((await post('/api/miniprogram/pronunciation?target=p1-word-0',audio,'application/json')).status,415);
  assert.equal((await post('/api/miniprogram/pronunciation?target=p1-word-0',Buffer.alloc(640045))).status,413);
  assert.equal((await post('/api/english/pronunciation?target=p1-word-0')).status,403);assert.equal(calls,1);
 }finally{await new Promise(r=>server.close(r));}
});
