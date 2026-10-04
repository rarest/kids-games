import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

const database = process.env.PLATFORM_TEST_DATABASE_URL;
const password = 'parent-test-password-42';
const secret = 'auth-test-only-secret-123456789012345678901234567890';

test('mail configuration fails closed without exposing credentials', async () => {
  let createMailer;
  await assert.doesNotReject(async () => ({createMailer} = await import('../platform/mail.mjs')));
  assert.equal(createMailer({}), undefined);
  assert.throws(() => createMailer({SMTP_HOST:'smtp.example.test'}), /configuration/i);
  assert.throws(() => createMailer({SMTP_HOST:'smtp.example.test',SMTP_PORT:'25',SMTP_FROM:'games@example.test'}), /TLS/i);
});

test('auth HTTP refuses cross-origin and applies IP limits despite spoofed forwarding headers', {skip:!database}, async () => {
  const {default:{Pool}}=await import('../platform/node_modules/pg/lib/index.js');
  const {createAuth,migrateAuth}=await import('../platform/auth.mjs');
  const {createApi}=await import('../platform/server.mjs');
  const admin=new Pool({connectionString:database});
  const schema=`limits_${randomUUID().replaceAll('-','')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool=new Pool({connectionString:database,options:`-c search_path=${schema}`});
  let server;
  try {
    const auth=createAuth({pool,secret,publicOrigin:'http://games.test'}); await migrateAuth(auth); await migrateAuth(auth);
    server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    assert.deepEqual(await (await fetch(base+'/api/family/status')).json(),{enabled:false,mailReady:false});
    assert.equal((await fetch(base+'/api/auth/sign-in/email',{method:'POST',headers:{origin:'http://foreign.test','content-type':'application/json'},body:'{}'})).status,403);
    assert.equal((await fetch(base+'/api/auth/sign-in/email',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
    let last;
    for(let i=0;i<11;i++)last=await fetch(base+'/api/auth/sign-in/email',{method:'POST',headers:{origin:'http://games.test','content-type':'application/json','x-real-ip':`10.0.0.${i+1}`,'x-forwarded-for':`10.0.0.${i+1}`},body:JSON.stringify({email:'missing@example.test',password})});
    assert.equal(last.status,429,'forged proxy headers cannot bypass auth limits');
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
  }
});

test('real HTTP verified parent sessions, recovery, family ownership and deletion', {skip:!database}, async () => {
  const {default:{Pool}} = await import('../platform/node_modules/pg/lib/index.js');
  const admin = new Pool({connectionString:database});
  const schema = `auth_${randomUUID().replaceAll('-','')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString:database, options:`-c search_path=${schema}`});
  let server;
  try {
    let createAuth, migrateAuth;
    await assert.doesNotReject(async () => ({createAuth,migrateAuth}=await import('../platform/auth.mjs')), 'auth factory is required');
    const {createApi} = await import('../platform/server.mjs');
    const {FamilyStore} = await import('../platform/family-store.mjs');
    const mailbox=[];
    const auth=createAuth({pool,secret,publicOrigin:'http://games.test',sendMail:async mail=>{mailbox.push(mail);}});
    await migrateAuth(auth);
    const familyStore=new FamilyStore({pool}); await familyStore.migrate();
    server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth,familyStore,mailReady:true});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    let base=`http://127.0.0.1:${server.address().port}`;
    const request=(path,{body,cookie,method=body?'POST':'GET',origin='http://games.test',extra={}}={})=>fetch(base+path,{method,redirect:'manual',headers:{origin,...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
    const cookieOf=res=>res.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
    const signup=async email=>{
      const res=await request('/api/auth/sign-up/email',{body:{email,password,name:'家长',callbackURL:'http://games.test/account.html'}});
      assert.equal(res.status,200);
      const mail=mailbox.findLast(m=>m.to===email && m.subject.includes('验证'));
      assert.ok(mail,'verification mail was captured without printing its token');
      const link=mail.text.match(/https?:\/\/\S+/)[0];
      const verification=new URL(link); assert.equal(verification.origin,'http://games.test');
      const verified=await request(verification.pathname+verification.search); assert.equal(verified.status,302);
      const login=await request('/api/auth/sign-in/email',{body:{email,password}}); assert.equal(login.status,200);
      const cookieHeaders=login.headers.getSetCookie();
      assert.ok(cookieHeaders.some(value=>value.includes('HttpOnly')&&value.includes('SameSite=Lax')),'session cookies are HttpOnly and SameSite=Lax');
      return {cookie:cookieOf(login),user:(await login.json()).user};
    };
    assert.deepEqual(await (await request('/api/family/status')).json(),{enabled:true,mailReady:true});
    assert.equal((await request('/api/family/profiles')).status,401);
    assert.equal((await request('/api/auth/sign-up/email',{body:{email:'unverified@example.test',password,name:'家长'}})).status,200);
    assert.equal((await request('/api/auth/sign-in/email',{body:{email:'unverified@example.test',password}})).status,403);
    const a=await signup('parent-a@example.test'), b=await signup('parent-b@example.test');
    assert.equal((await request('/api/family/profiles',{cookie:a.cookie,body:{nickname:'孩子一',avatar:'fox'},origin:'http://foreign.test'})).status,403);
    assert.equal((await request('/api/family/profiles',{cookie:a.cookie,body:{nickname:'孩子一',avatar:'fox'},origin:''})).status,403);
    assert.equal((await request('/api/auth/sign-out',{cookie:a.cookie,body:{},origin:'http://foreign.test'})).status,403);
    const created=await request('/api/family/profiles',{cookie:a.cookie,body:{nickname:'孩子一',avatar:'fox',owner:b.user.id}});
    assert.equal(created.status,201); const {profile}=await created.json();
    assert.equal((await request(`/api/family/profiles/${profile.id}/progress/english`,{cookie:b.cookie})).status,404);
    assert.equal((await request(`/api/family/profiles/${profile.id}`,{cookie:b.cookie,method:'DELETE'})).status,404);
    assert.equal((await request(`/api/family/profiles/${profile.id}`,{cookie:a.cookie,method:'PATCH',body:{nickname:'孩子二'}})).status,200);
    assert.equal((await request(`/api/family/profiles/${profile.id}/progress/english`,{cookie:a.cookie,body:{baseRevision:0,session:null,events:[]}})).status,200);
    const stale=await request(`/api/family/profiles/${profile.id}/progress/english`,{cookie:a.cookie,body:{baseRevision:0,session:null,events:[]}});
    assert.equal(stale.status,409); assert.ok((await stale.json()).current);
    const exported=await (await request('/api/family/export',{cookie:a.cookie})).json();
    assert.equal(exported.profiles.length,1); assert.ok(!JSON.stringify(exported).includes('password')); assert.ok(!JSON.stringify(exported).includes('token'));
    const sibling=await (await request('/api/family/profiles',{cookie:a.cookie,body:{nickname:'孩子三',avatar:'panda'}})).json();
    const siblingPath=`/api/family/profiles/${sibling.profile.id}/progress/english`;
    const importBody={importId:randomUUID(),sourceId:randomUUID(),data:{version:1,lessons:{},items:{},session:null}};
    assert.equal((await request(siblingPath+'/import',{cookie:b.cookie,body:importBody})).status,404);
    const imported=await request(siblingPath+'/import',{cookie:a.cookie,body:importBody});assert.equal(imported.status,200);
    const importedState=await imported.json();
    assert.deepEqual(await (await request(siblingPath+'/import',{cookie:a.cookie,body:importBody})).json(),importedState,'guest import is idempotent');
    assert.equal((await request(`/api/family/profiles/${sibling.profile.id}`,{cookie:a.cookie,method:'DELETE'})).status,200);
    assert.equal((await request(siblingPath,{cookie:a.cookie,body:{baseRevision:importedState.revision,session:null,events:[]}})).status,404,'stale writes cannot resurrect a deleted child');
    assert.equal((await request('/api/family/profiles',{cookie:a.cookie,body:{nickname:'x'.repeat(530000),avatar:'fox'}})).status,413);
    assert.equal((await request('/api/auth/request-password-reset',{body:{email:'parent-a@example.test',redirectTo:'http://games.test/account.html'}})).status,200);
    const recovery=mailbox.findLast(m=>m.to==='parent-a@example.test'&&m.subject.includes('重置'));
    assert.ok(recovery);
    const resetLink=new URL(recovery.text.match(/https?:\/\/\S+/)[0]);
    const redirect=await request(resetLink.pathname+resetLink.search); assert.equal(redirect.status,302);
    const token=new URL(redirect.headers.get('location')).searchParams.get('token'); assert.ok(token);
    const nextPassword='changed-test-password-43';
    assert.equal((await request('/api/auth/reset-password',{body:{token,newPassword:nextPassword}})).status,200);
    assert.equal((await request('/api/family/profiles',{cookie:a.cookie})).status,401,'password reset revokes old sessions');
    assert.equal((await request('/api/auth/sign-in/email',{body:{email:'parent-a@example.test',password}})).status,401);
    const login=await request('/api/auth/sign-in/email',{body:{email:'parent-a@example.test',password:nextPassword}}); assert.equal(login.status,200);
    const freshCookie=cookieOf(login);
    assert.equal((await request('/api/auth/delete-user',{cookie:freshCookie,body:{}})).status,400,'account deletion always requires password');
    assert.equal((await request('/api/family/account',{cookie:freshCookie,method:'DELETE',body:{password:'incorrect'}})).status,400);
    assert.equal((await request('/api/family/account',{cookie:freshCookie,method:'DELETE',body:{password:nextPassword}})).status,200);
    assert.equal((await request('/api/family/profiles',{cookie:freshCookie})).status,401);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM family_user WHERE id=$1',[a.user.id])).rows[0].n,0);
    assert.equal((await familyStore.profiles(a.user.id)).length,0,'account deletion cascades family profiles');
    assert.equal((await request('/api/auth/sign-out',{cookie:b.cookie,body:{}})).status,200);
    assert.equal((await request('/api/family/profiles',{cookie:b.cookie})).status,401);
    const unavailableAuth=createAuth({pool,secret,publicOrigin:'http://games.test'});
    await new Promise(resolve=>server.close(resolve));
    server=createApi({store:{pool},secret,publicOrigin:'http://games.test',auth:unavailableAuth,familyStore,mailReady:false});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    base=`http://127.0.0.1:${server.address().port}`;
    assert.deepEqual(await (await request('/api/family/status')).json(),{enabled:true,mailReady:false});
    for(const path of ['/sign-up/email','/request-password-reset','/send-verification-email','/reset-password','/change-email']) assert.equal((await request('/api/auth'+path,{body:{email:'blocked@example.test',password,name:'家长'}})).status,503);
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
  }
});
