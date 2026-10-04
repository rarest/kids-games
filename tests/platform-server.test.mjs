import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

test('HTTP activity protects visitor ownership, origin and persistent ranks', {skip: !process.env.PLATFORM_TEST_DATABASE_URL}, async () => {
  const {default:{Pool}} = await import('../platform/node_modules/pg/lib/index.js');
  const {ActivityStore} = await import('../platform/store.mjs');
  const admin = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL});
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL, options: `-c search_path=${schema}`});
  let api;
  try {
    let createApi;
    await assert.doesNotReject(async () => { ({createApi} = await import('../platform/server.mjs')); }, 'same-origin platform API is required');
    let clock = new Date();
    const store = new ActivityStore({pool, now: () => clock}); await store.migrate();
    api = createApi({store, secret: 'test-secret-at-least-32-characters-long', publicOrigin: 'https://games.test'});
    await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${api.address().port}`;
    const post = (path, body, cookie, origin = 'https://games.test') => fetch(base + path, {method: 'POST', headers: {'content-type':'application/json', origin, ...(cookie ? {cookie} : {})}, body: JSON.stringify(body)});
    const start = await post('/api/activity/start', {gameId:'english'});
    assert.equal(start.status, 200);
    const cookieHeader = start.headers.get('set-cookie');
    assert.match(cookieHeader, /HttpOnly/); assert.match(cookieHeader, /SameSite=Lax/);
    const cookie = cookieHeader.split(';')[0], session = await start.json();
    clock = new Date(clock.getTime() + 16000);
    assert.equal((await post('/api/activity', {sessionId:session.sessionId,activeSeconds:16})).status, 401);
    assert.equal((await post('/api/activity', {sessionId:session.sessionId,activeSeconds:16}, cookie, 'https://foreign.test')).status, 403);
    const tampered = cookie.slice(0,-1) + (cookie.endsWith('A') ? 'B' : 'A');
    assert.equal((await post('/api/activity', {sessionId:session.sessionId,activeSeconds:16}, tampered)).status, 401);
    const heartbeat = await post('/api/activity', {sessionId:session.sessionId,activeSeconds:16}, cookie);
    assert.equal(heartbeat.status, 200); assert.equal((await heartbeat.json()).counted, true);
    const rank = await fetch(base + '/api/popularity?period=month');
    assert.equal(rank.status, 200);
    const data = await rank.json(); assert.equal(data.items[0].plays, 1);
    assert.equal(data.items[0].gameId, 'english');
    assert.ok(!JSON.stringify(data).includes(session.sessionId), 'public ranking must not expose sessions');
    assert.equal((await fetch(base + '/api/popularity?period=year')).status, 400);
    assert.equal((await post('/api/activity/start', {gameId:'missing'}, cookie)).status, 400);
    assert.equal((await fetch(base + '/api/activity/start', {method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(9000)})).status, 413);
    assert.equal((await fetch(base + '/api/health')).status, 200);
    assert.equal((await post('/api/activity', {sessionId:'-'.repeat(36),activeSeconds:1}, cookie)).status, 400);
    let limited;
    for(let i=0;i<21;i++)limited=await post('/api/activity/start',{gameId:'memory'},cookie);
    assert.equal(limited.status,429,'repeated session creation must be limited');
    assert.equal(limited.headers.get('retry-after'),'60');
  } finally {
    if (api) await new Promise(resolve => api.close(resolve));
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
  }
});
