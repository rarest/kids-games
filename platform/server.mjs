import http from 'node:http';
import {createHash, createHmac, randomUUID, timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
import {pathToFileURL} from 'node:url';
import {Pool} from 'pg';
import {ActivityStore, problem} from './store.mjs';

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
async function jsonBody(req) {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) throw problem(415, 'JSON required');
  let length = 0, chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 8192) throw problem(413, 'Body too large');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw problem(400, 'Invalid JSON'); }
}

export function createApi({store, secret, publicOrigin}) {
  if (!secret || secret.length < 32) throw new Error('A persistent visitor secret of at least 32 characters is required');
  const origin = new URL(publicOrigin).origin;
  const secure = origin.startsWith('https:');
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
      const trustedProxy = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
      const realIP = trustedProxy && isIP(req.headers['x-real-ip'] ?? '') ? req.headers['x-real-ip'] : remote;
      const ipKey = createHmac('sha256', secret).update(realIP ?? 'unknown').digest('hex');
      if (limited(`ip:${ipKey}`, 1000)) { res.setHeader('Retry-After', '60'); throw problem(429, 'Try again later'); }
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
      if (!res.headersSent) send(res, status, {error: error.status ? error.message : 'Service temporarily unavailable'});
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
  const server = createApi({store, secret:VISITOR_SECRET, publicOrigin:PUBLIC_ORIGIN});
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
