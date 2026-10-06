import http from 'node:http';
import {createHash, createHmac, randomUUID, timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {pathToFileURL} from 'node:url';
import {Pool} from 'pg';
import {ActivityStore, problem} from './store.mjs';
import {fromNodeHeaders} from 'better-auth/node';
import {createAuth, migrateAuth} from './auth.mjs';
import {createMailer} from './mail.mjs';
import {createPronunciation,MAX_WAV_BYTES,normalizeMiniprogramWav} from './pronunciation.mjs';
import {createWechat,isWechatAccount} from './wechat.mjs';
import {createMiniprogram} from './miniprogram.mjs';

const COOKIE = 'games_visitor';
function visitorCookie(req, secret) {
  const value = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!value) return null;
  const [id, signature] = value.split('.');
  if (!/^[a-f0-9-]{36}$/.test(id ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(signature ?? '')) return null;
  const expected = createHmac('sha256', secret).update(id).digest('base64url');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}
function send(res, status, value) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(value));
}
async function jsonBody(req, maxLength = 8192) {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) throw problem(415, 'JSON required');
  let length = 0, chunks = [];
  for await (const chunk of req.iterator({destroyOnReturn:false})) {
    length += chunk.length;
    if (length > maxLength) { req.resume(); throw problem(413, 'Body too large'); }
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw problem(400, 'Invalid JSON'); }
}

export function createApi({store, secret, publicOrigin, auth, familyStore, mailReady = auth?.mailReady ?? false, trustProxy = false, pronunciation = createPronunciation(), getSpeechTarget, wechat=auth?.wechat??createWechat()}) {
  if (!secret || secret.length < 32) throw new Error('A persistent visitor secret of at least 32 characters is required');
  const origin = new URL(publicOrigin).origin;
  const secure = origin.startsWith('https:');
  const mini=createMiniprogram({auth,familyStore,wechat,pool:store.pool,origin});
  const buckets = new Map();
  function limited(key, limit) {
    const now = Date.now();
    if (buckets.size > 10000) {
      for (const [id, bucket] of buckets) if (bucket.end < now) buckets.delete(id);
      if (buckets.size > 10000) return true;
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.end < now) buckets.set(key, bucket = {end:now + 60000, count:0});
    return ++bucket.count > limit;
  }
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, origin);
      const remote = req.socket.remoteAddress;
      const trustedProxy = trustProxy && (remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1');
      const realIP = trustedProxy && isIP(req.headers['x-real-ip'] ?? '') ? req.headers['x-real-ip'] : remote;
      const ipKey = createHmac('sha256', secret).update(realIP ?? 'unknown').digest('hex');
      if (limited(`ip:${ipKey}`, 1000)) { res.setHeader('Retry-After', '60'); throw problem(429, 'Try again later'); }
      const mutation = !['GET','HEAD','OPTIONS'].includes(req.method);
      const requireOrigin = () => {
        if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') throw problem(403, 'Origin not allowed');
      };
      if (['/api/english/speech-status','/api/miniprogram/speech-status'].includes(url.pathname) && req.method === 'GET') return send(res,200,await pronunciation.status());
      if (['/api/english/pronunciation','/api/miniprogram/pronunciation'].includes(url.pathname) && req.method === 'POST') {
        if(url.pathname.startsWith('/api/english/'))requireOrigin();
        const targetId=url.searchParams.get('target');
        if(!targetId||targetId.length>200)throw problem(400,'Unknown practice target');
        const lookup=getSpeechTarget??(await import('../english/page-practice.js')).getTarget;
        const target=lookup(targetId);if(!target)throw problem(400,'Unknown practice target');
        if(!req.headers['content-type']?.toLowerCase().startsWith('audio/wav'))throw problem(415,'WAV required');
        if(Number(req.headers['content-length'])>MAX_WAV_BYTES)throw problem(413,'Recording too large');
        let length=0;const chunks=[];
        for await(const chunk of req.iterator({destroyOnReturn:false})) {
          length+=chunk.length;if(length>MAX_WAV_BYTES){req.resume();throw problem(413,'Recording too large');}chunks.push(chunk);
        }
        const audio=Buffer.concat(chunks);
        try {
          const normalized=url.pathname==='/api/miniprogram/pronunciation'?normalizeMiniprogramWav(audio):audio;
          return send(res,200,await pronunciation.assess({ip:ipKey,target,audio:normalized}));
        } catch(error) {
          if(url.pathname==='/api/miniprogram/pronunciation'&&error.status===400) {
            // Format metadata only: never log the recording, identity or request headers.
            console.warn('mini-recording-format',JSON.stringify({targetId,bytes:audio.length,
              riff:audio.toString('ascii',0,4)==='RIFF',wave:audio.toString('ascii',8,12)==='WAVE',
              declaredBytes:audio.length>=8?audio.readUInt32LE(4)+8:null,
              format:audio.length>=44&&audio.toString('ascii',12,16)==='fmt '?[
                audio.readUInt16LE(20),audio.readUInt16LE(22),audio.readUInt32LE(24),
                audio.readUInt32LE(28),audio.readUInt16LE(32),audio.readUInt16LE(34)]:null,
              declaredDataBytes:audio.length>=44&&audio.toString('ascii',36,40)==='data'?audio.readUInt32LE(40):null}));
          }
          throw error;
        }
      }
      const authHeaders = fromNodeHeaders(req.headers);
      for (const key of ['x-forwarded-for','x-forwarded-host','x-forwarded-proto','forwarded','x-real-ip']) authHeaders.delete(key);
      authHeaders.set('x-real-ip', realIP ?? 'unknown');
      const handleAuth = async (path, body, method=req.method) => {
        if (!auth) throw problem(503,'Parent accounts unavailable');
        const response=await auth.handler(new Request(new URL(path,origin),{method,headers:authHeaders,...(body?{body:JSON.stringify(body)}:{})}));
        res.statusCode=response.status;
        for (const [key,value] of response.headers) if(key!=='set-cookie')res.setHeader(key,value);
        const cookies=response.headers.getSetCookie(); if(cookies.length)res.setHeader('Set-Cookie',cookies);
        res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
        res.end(Buffer.from(await response.arrayBuffer()));
      };
      if(url.pathname.startsWith('/api/miniprogram/')) {
        if(url.pathname==='/api/miniprogram/config'&&req.method==='GET')return send(res,200,mini.config());
        if(!auth||!familyStore)throw problem(503,'Parent accounts unavailable');
        if(['/api/miniprogram/login','/api/miniprogram/username','/api/miniprogram/link'].includes(url.pathname)&&limited(`mini-auth:${ipKey}`,10))throw problem(429,'Try again later');
        if(url.pathname==='/api/miniprogram/login'&&req.method==='POST')return send(res,200,await mini.login((await jsonBody(req)).code));
        if(url.pathname==='/api/miniprogram/username'&&req.method==='POST')return send(res,200,await mini.username(await jsonBody(req),authHeaders));
        const session=await mini.session(authHeaders),owner=session.user.id;
        if(url.pathname==='/api/miniprogram/session'&&req.method==='GET')return send(res,200,{user:mini.user(session.user)});
        if(url.pathname==='/api/miniprogram/link'&&req.method==='POST')return send(res,200,await mini.link((await jsonBody(req)).code,session));
        if(url.pathname==='/api/miniprogram/logout'&&req.method==='POST')return send(res,200,await mini.logout(session));
        if(url.pathname==='/api/miniprogram/profiles') {
          if(req.method==='GET')return send(res,200,{profiles:await familyStore.profiles(owner)});
          if(req.method==='POST')return send(res,201,{profile:await familyStore.createProfile(owner,await jsonBody(req,512*1024))});
        }
        const profileMatch=url.pathname.match(/^\/api\/miniprogram\/profiles\/([^/]+)$/);
        if(profileMatch) {
          if(req.method==='PATCH')return send(res,200,{profile:await familyStore.updateProfile(owner,profileMatch[1],await jsonBody(req,512*1024))});
          if(req.method==='DELETE')return send(res,200,await familyStore.deleteProfile(owner,profileMatch[1]));
        }
        const progressMatch=url.pathname.match(/^\/api\/miniprogram\/profiles\/([^/]+)\/progress\/english(\/import)?$/);
        if(progressMatch) {
          const id=progressMatch[1];
          if(req.method==='GET'&&!progressMatch[2])return send(res,200,await familyStore.getProgress(owner,id));
          if(req.method==='POST')return send(res,200,await (progressMatch[2]?familyStore.importProgress(owner,id,await jsonBody(req,512*1024)):familyStore.syncProgress(owner,id,await jsonBody(req,512*1024))));
        }
        throw problem(404,'Not found');
      }
      if (url.pathname.startsWith('/api/auth/')) {
        if(mutation)requireOrigin();
        if(limited(`auth:${ipKey}`,40)) {res.setHeader('Retry-After','60');throw problem(429,'Try again later');}
        const emailPaths=['/sign-up/email','/request-password-reset','/reset-password','/send-verification-email','/verify-email','/change-email','/delete-user/callback'];
        if(!mailReady && emailPaths.some(path=>url.pathname==='/api/auth'+path || url.pathname.startsWith('/api/auth'+path+'/')))throw problem(503,'Email service unavailable');
        const body=mutation?await jsonBody(req,16384):undefined;
        if(['/api/auth/link-social','/api/auth/unlink-account','/api/auth/delete-user'].includes(url.pathname)) {
          const session=await auth.api.getSession({headers:authHeaders});if(!session)throw problem(401,'Parent session required');mini.fresh(session);
          if(url.pathname==='/api/auth/delete-user') {
            const accounts=await (await auth.$context).internalAdapter.findAccounts(session.user.id);
            if((!isWechatAccount(session.user)||accounts.some(a=>a.providerId==='credential'))&&!body?.password)throw problem(400,'Password required');
          }
        }
        if(['/api/auth/sign-in/social','/api/auth/link-social'].includes(url.pathname)&&['wechat','wechat-mp'].includes(body?.provider)&&(!wechat.webReady||body.provider!==wechat.webProvider))throw problem(503,'Web WeChat is not configured');
        return await handleAuth(url.pathname+url.search,body);
      }
      if (url.pathname==='/api/family/status' && req.method==='GET')return send(res,200,{enabled:!!(auth&&familyStore),mailReady:!!(auth&&familyStore&&mailReady)});
      if (url.pathname.startsWith('/api/family/')) {
        if(mutation)requireOrigin();
        if(!auth||!familyStore)throw problem(503,'Parent accounts unavailable');
        const session=await auth.api.getSession({headers:authHeaders});
        if(!session?.user?.emailVerified)throw problem(401,'Verified parent session required');
        const owner=session.user.id;
        if(url.pathname==='/api/family/account' && req.method==='DELETE') {
          const body=await jsonBody(req,16384);
          mini.fresh(session);
          const accounts=await (await auth.$context).internalAdapter.findAccounts(owner);
          if((!isWechatAccount(session.user)||accounts.some(a=>a.providerId==='credential'))&&(typeof body.password!=='string'||!body.password))throw problem(400,'Password required');
          return await handleAuth('/api/auth/delete-user',{password:body.password},'POST');
        }
        if(url.pathname==='/api/family/export' && req.method==='GET')return send(res,200,await familyStore.exportAccount(owner));
        if(url.pathname==='/api/family/profiles') {
          if(req.method==='GET')return send(res,200,{profiles:await familyStore.profiles(owner)});
          if(req.method==='POST')return send(res,201,{profile:await familyStore.createProfile(owner,await jsonBody(req,512*1024))});
        }
        const profileMatch=url.pathname.match(/^\/api\/family\/profiles\/([^/]+)$/);
        if(profileMatch) {
          if(req.method==='PATCH')return send(res,200,{profile:await familyStore.updateProfile(owner,profileMatch[1],await jsonBody(req,512*1024))});
          if(req.method==='DELETE')return send(res,200,await familyStore.deleteProfile(owner,profileMatch[1]));
        }
        const progressMatch=url.pathname.match(/^\/api\/family\/profiles\/([^/]+)\/progress\/([^/]+)(\/import)?$/);
        if(progressMatch) {
          const id=progressMatch[1],subject=progressMatch[2];
          if(!['english','chinese'].includes(subject))throw problem(400,'Unknown subject');
          if(req.method==='GET'&&!progressMatch[3])return send(res,200,await familyStore.getProgress(owner,id,subject));
          if(req.method==='POST') {
            const body=await jsonBody(req,512*1024);
            return send(res,200,await (progressMatch[3]?familyStore.importProgress(owner,id,body,subject):familyStore.syncProgress(owner,id,body,subject)));
          }
        }
        throw problem(404,'Not found');
      }
      if (req.method === 'GET' && url.pathname === '/api/health') {
        await store.pool.query('SELECT 1'); return send(res, 200, {ok:true, service:'games-platform'});
      }
      if (req.method === 'GET' && url.pathname === '/api/popularity') return send(res, 200, await store.ranking(url.searchParams.get('period') ?? 'day'));
      if (req.method !== 'POST' || !['/api/activity/start','/api/activity'].includes(url.pathname)) throw problem(404, 'Not found');
      if ((req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site') throw problem(403, 'Origin not allowed');
      const body = await jsonBody(req);
      let visitor = visitorCookie(req, secret);
      if (!visitor && url.pathname !== '/api/activity/start') throw problem(401, 'Visitor session required');
      if (!visitor) {
        visitor = randomUUID();
        const signature = createHmac('sha256', secret).update(visitor).digest('base64url');
        res.setHeader('Set-Cookie', `${COOKIE}=${visitor}.${signature}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
      }
      const actor = createHash('sha256').update(visitor).digest('hex');
      if (limited(`actor:${actor}`, 60) || (url.pathname.endsWith('/start') && limited(`start:${actor}`, 20))) {
        res.setHeader('Retry-After', '60'); throw problem(429, 'Try again later');
      }
      if (url.pathname === '/api/activity/start') return send(res, 200, await store.createSession(actor, body.gameId));
      return send(res, 200, await store.heartbeat(body.sessionId, actor, body.activeSeconds));
    } catch (error) {
      const status = error.status ?? 503;
      if (!error.status) console.error(`[platform] request unavailable (${error.code ?? 'unexpected'})`);
      if (!res.headersSent) send(res, status, {error: error.status ? error.message : 'Service temporarily unavailable',...(status===409&&error.current?{current:error.current}:{})});
      else res.end();
    }
  });
}

async function main() {
  const {DATABASE_URL, VISITOR_SECRET, PUBLIC_ORIGIN = 'https://games.nblord.com', HOST = '127.0.0.1', PORT = '8790'} = process.env;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({connectionString:DATABASE_URL, max:8, connectionTimeoutMillis:5000, idleTimeoutMillis:30000, statement_timeout:10000});
  pool.on('error', error => console.error(`[platform] database connection unavailable (${error.code ?? 'unexpected'})`));
  const store = new ActivityStore({pool}); await store.migrate(); await store.prune();
  let auth, familyStore;
  const sendMail=createMailer();
  if(process.env.AUTH_SECRET) {
    auth=createAuth({pool,secret:process.env.AUTH_SECRET,publicOrigin:PUBLIC_ORIGIN,sendMail});
    await migrateAuth(auth);
    const {FamilyStore}=await import('./family-store.mjs');
    familyStore=new FamilyStore({pool}); await familyStore.migrate();
  }
  const server = createApi({store, secret:VISITOR_SECRET, publicOrigin:PUBLIC_ORIGIN,auth,familyStore,mailReady:!!sendMail,trustProxy:true,pronunciation:createPronunciation({localUrl:process.env.SPEECH_LOCAL_URL})});
  const cleanup = setInterval(() => store.prune().catch(() => console.error('[platform] cleanup unavailable')), 3600000); cleanup.unref();
  server.listen(Number(PORT), HOST, () => console.log(`[platform] listening on ${HOST}:${PORT}`));
  let stopping = false;
  const stop = () => {
    if (stopping) return; stopping = true; clearInterval(cleanup);
    server.close(() => pool.end().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => {
  console.error(`[platform] startup failed (${error.code ?? 'configuration'})`); process.exit(1);
});
