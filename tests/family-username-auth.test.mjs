import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {accountError} from '../shared/family-client.js';
const database=process.env.PLATFORM_TEST_DATABASE_URL;
const secret='username-fixture-only-secret-123456789012345678901234567890';
const password='fixture-parent-password-42';

test('registration accepts six-character passwords without composition rules and preserves login',{skip:!database},async t=>{
 const {Pool}=await import('../platform/node_modules/pg/esm/index.mjs');const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
 const admin=new Pool({connectionString:database}),schema=`password_${randomUUID().replaceAll('-','')}`;await admin.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`});
 try{
  const auth=createAuth({pool,secret,publicOrigin:'http://games.test'});await migrateAuth(auth);
  const request=(path,body)=>auth.handler(new Request('http://games.test/api/auth/'+path,{method:'POST',headers:{origin:'http://games.test','content-type':'application/json'},body:JSON.stringify(body)}));
  for(const [username,password] of [['digits','123456'],['letter','abcdef'],['symbol','!!!!!!']])await t.test(`${username} password registers and logs in`,async()=>{
   const signup=await request('sign-up/username',{username,password});assert.equal(signup.status,200,'six characters accepted');
   const registered=await signup.json();assert.ok(registered.user.emailVerified);assert.ok(signup.headers.getSetCookie().length);
   const login=await request('sign-in/username',{username,password});assert.equal(login.status,200);assert.equal((await login.json()).user.id,registered.user.id);assert.ok(login.headers.getSetCookie().length);
  });
  await t.test('five characters are rejected with the six-character instruction',async()=>{
   const rejected=await request('sign-up/username',{username:'shorter',password:'12345'});assert.equal(rejected.status,400);
   const data=await rejected.json();assert.equal(data.code,'PASSWORD_TOO_SHORT');assert.equal(accountError({status:rejected.status,data}),'密码至少需要6个字符。');
  });
  await t.test('the existing 128-character maximum is retained',async()=>{
   const rejected=await request('sign-up/username',{username:'toolong',password:'a'.repeat(129)});assert.equal(rejected.status,400);assert.equal((await rejected.json()).code,'PASSWORD_TOO_LONG');
  });
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});

test('username recovery never pretends to send mail even when an email transport exists',{skip:!database},async()=>{
 const {Pool}=await import('../platform/node_modules/pg/esm/index.mjs');const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
 const admin=new Pool({connectionString:database}),schema=`recovery_${randomUUID().replaceAll('-','')}`;await admin.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`}),mailbox=[];
 try{
  const auth=createAuth({pool,secret,publicOrigin:'http://games.test',sendMail:async mail=>mailbox.push(mail)});await migrateAuth(auth);
  const request=(path,body)=>auth.handler(new Request('http://games.test/api/auth/'+path,{method:'POST',headers:{origin:'http://games.test','content-type':'application/json'},body:JSON.stringify(body)}));
  const signup=await request('sign-up/username',{username:'parent',password});assert.equal(signup.status,200);const {user}=await signup.json();assert.equal(mailbox.length,0);
  assert.equal((await request('request-password-reset',{email:user.email})).status,400);
  assert.equal((await request('request-password-reset',{username:'parent'})).status,400);
  assert.equal(mailbox.length,0);
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});

test('six-character username registers without mail; normalized login and old verified sessions preserve child progress',{skip:!database},async()=>{
 const {Pool}=await import('../platform/node_modules/pg/esm/index.mjs');
 const {betterAuth}=await import('../platform/node_modules/better-auth/dist/index.mjs');
 const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
 const {createApi}=await import('../platform/server.mjs');
 const {FamilyStore}=await import('../platform/family-store.mjs');
 const admin=new Pool({connectionString:database}),schema=`username_${randomUUID().replaceAll('-','')}`;
 await admin.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`});
 let server;
 try{
  // Start with the pre-username database shape, a verified parent and its session.
  const legacy=betterAuth({database:pool,secret,baseURL:'http://games.test',basePath:'/api/auth',trustedOrigins:['http://games.test'],logger:{disabled:true},user:{modelName:'family_user'},session:{modelName:'family_session'},account:{modelName:'family_account'},verification:{modelName:'family_verification'},emailAndPassword:{enabled:true,requireEmailVerification:true,autoSignIn:false}});
  await migrateAuth(legacy);
  const legacyRequest=(path,body)=>legacy.handler(new Request('http://games.test/api/auth/'+path,{method:'POST',headers:{origin:'http://games.test','content-type':'application/json'},body:JSON.stringify(body)}));
  assert.equal((await legacyRequest('sign-up/email',{email:'existing@example.test',password,name:'老家长'})).status,200);
  await pool.query('UPDATE family_user SET "emailVerified"=true WHERE email=$1',['existing@example.test']);
  const oldLogin=await legacyRequest('sign-in/email',{email:'existing@example.test',password});assert.equal(oldLogin.status,200);
  const cookieOf=response=>response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const oldCookie=cookieOf(oldLogin),oldUser=(await oldLogin.json()).user;
  const auth=createAuth({pool,secret,publicOrigin:'http://games.test'});await migrateAuth(auth);await migrateAuth(auth);
  const familyStore=new FamilyStore({pool});await familyStore.migrate();
  server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth,familyStore,mailReady:false});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(path,{body,cookie,method=body?'POST':'GET',origin='http://games.test'}={})=>fetch(base+path,{method,headers:{origin,...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const session=await (await request('/api/auth/get-session',{cookie:oldCookie})).json();assert.equal(session.user.id,oldUser.id,'existing session survives username migration');
  assert.equal((await request('/api/auth/sign-in/email',{body:{email:'existing@example.test',password}})).status,200);
  assert.equal((await request('/api/auth/sign-up/username',{body:{username:'abcde',password}})).status,400,'five characters rejected');
  const signup=await request('/api/auth/sign-up/username',{body:{username:'Parent',password}});assert.equal(signup.status,200,'exactly six characters accepted without mail');
  const signupData=await signup.json();assert.equal(signupData.user.username,'parent');assert.ok(signupData.user.emailVerified);const parentCookie=cookieOf(signup);assert.ok(parentCookie,'registration immediately activates a session');
  assert.ok(signup.headers.getSetCookie().some(value=>value.includes('HttpOnly')&&value.includes('SameSite=Lax')));
  const duplicate=await request('/api/auth/sign-up/username',{body:{username:' ＰＡＲＥＮＴ ',password}});assert.ok([400,409,422].includes(duplicate.status),'case and width normalization cannot duplicate an account');
  assert.equal((await request('/api/auth/sign-in/username',{body:{username:' parent ',password}})).status,200);
  assert.equal((await request('/api/auth/sign-in/username',{body:{username:'PARENT',password:'wrong-password'}})).status,401);
  assert.equal((await request('/api/auth/sign-up/username',{body:{username:'othername',password},origin:'https://foreign.test'})).status,403);
  const concurrent=await Promise.all([request('/api/auth/sign-up/username',{body:{username:'RaceUsr',password}}),request('/api/auth/sign-up/username',{body:{username:'RACEUSR',password}})]);
  assert.equal(concurrent.filter(response=>response.status===200).length,1,'concurrent normalized names create exactly one account');
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM family_user WHERE username=$1',['raceusr'])).rows[0].n,1);
  const created=await request('/api/family/profiles',{cookie:parentCookie,body:{nickname:'用户名孩子',avatar:'fox'}});assert.equal(created.status,201);const {profile}=await created.json();
  const path=`/api/family/profiles/${profile.id}/progress/english`;
  const saved=await request(path,{cookie:parentCookie,body:{baseRevision:0,session:null,events:[]}});assert.equal(saved.status,200);const state=await saved.json();assert.equal(state.revision,1);
  const login=await request('/api/auth/sign-in/username',{body:{username:'PARENT',password}});const newCookie=cookieOf(login);
  assert.equal((await (await request(path,{cookie:newCookie})).json()).revision,1,'relogin retains the same child progress');
  assert.equal((await request(path,{cookie:oldCookie})).status,404,'legacy parent cannot read the username family');
  assert.equal((await request('/api/auth/request-password-reset',{body:{username:'parent'}})).status,503,'no imaginary recovery email is sent');
  assert.equal((await request('/api/auth/delete-user',{cookie:newCookie,body:{password:'wrong-password'}})).status,400);
  assert.equal((await request('/api/auth/delete-user',{cookie:newCookie,body:{password}})).status,200);
  assert.equal((await request(path,{cookie:parentCookie})).status,401,'deletion revokes username sessions');
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM family_user WHERE username=$1',['parent'])).rows[0].n,0);
 }finally{if(server)await new Promise(resolve=>server.close(resolve));await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
