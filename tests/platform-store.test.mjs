import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

test('durable activity qualifies genuine time, deduplicates concurrent sessions and survives reconnect', {skip: !process.env.PLATFORM_TEST_DATABASE_URL}, async () => {
  const {default: {Pool}} = await import('../platform/node_modules/pg/lib/index.js');
  const admin = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL});
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL, options: `-c search_path=${schema}`});
  try {
    let ActivityStore;
    await assert.doesNotReject(async () => { ({ActivityStore} = await import('../platform/store.mjs')); }, 'persistent activity store is required');
    let clock = new Date('2026-10-04T15:59:30Z');
    let store = new ActivityStore({pool, now: () => clock});
    await store.migrate();
    await assert.rejects(store.createSession('visitor-a', 'missing'), /game/);
    const first = await store.createSession('visitor-a', 'memory');
    const second = await store.createSession('visitor-a', 'memory');
    clock = new Date(clock.getTime() + 14000);
    assert.equal((await store.heartbeat(first.sessionId, 'visitor-a', 14)).qualified, false);
    assert.equal((await store.ranking('day')).items.length, 0);
    clock = new Date(clock.getTime() + 2000);
    const results = await Promise.all([
      store.heartbeat(first.sessionId, 'visitor-a', 16),
      store.heartbeat(second.sessionId, 'visitor-a', 16),
    ]);
    assert.equal(results.filter(x => x.counted).length, 1, 'two tabs must count only once');
    let ranking = await store.ranking('day');
    assert.equal(ranking.items[0].plays, 1);
    assert.equal(ranking.items[0].gameId, 'memory');
    const seconds = ranking.items[0].activeSeconds;
    await store.heartbeat(first.sessionId, 'visitor-a', 16);
    assert.equal((await store.ranking('day')).items[0].activeSeconds, seconds, 'retry must not add time');
    await assert.rejects(store.heartbeat(first.sessionId, 'another-visitor', 16), /session/);
    store = new ActivityStore({pool, now: () => clock});
    await store.migrate();
    assert.equal((await store.ranking('day')).items[0].plays, 1, 'recreating service must retain ranking');
    const independent = await store.createSession('visitor-b', 'memory');
    clock = new Date(clock.getTime() + 16000); // New Shanghai day.
    await store.heartbeat(independent.sessionId, 'visitor-b', 16);
    assert.equal((await store.ranking('day')).items[0].plays, 1);
    assert.equal((await store.ranking('month')).items[0].plays, 2);
    const refreshed = await store.createSession('visitor-a', 'memory');
    clock = new Date(clock.getTime() + 16000);
    assert.equal((await store.heartbeat(refreshed.sessionId, 'visitor-a', 16)).counted, false, 'midnight does not bypass sliding dedup');
    clock = new Date(clock.getTime() + 30 * 60000);
    const later = await store.createSession('visitor-a', 'memory');
    clock = new Date(clock.getTime() + 16000);
    assert.equal((await store.heartbeat(later.sessionId, 'visitor-a', 16)).counted, true);
    assert.equal((await store.ranking('month')).items[0].plays, 3);
  } finally {
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
  }
});

test('server bounds forged duration and rejects stale backdating', {skip: !process.env.PLATFORM_TEST_DATABASE_URL}, async () => {
  const {default: {Pool}} = await import('../platform/node_modules/pg/lib/index.js');
  const {ActivityStore} = await import('../platform/store.mjs');
  const admin = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL});
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString: process.env.PLATFORM_TEST_DATABASE_URL, options: `-c search_path=${schema}`});
  try {
    let clock = new Date();
    const store = new ActivityStore({pool, now: () => clock}); await store.migrate();
    const s = await store.createSession('visitor', 'english');
    let result = await store.heartbeat(s.sessionId, 'visitor', 50000);
    assert.ok(result.acceptedSeconds < 1, 'duration cannot jump ahead of the server clock');
    assert.equal(result.qualified, false);
    clock = new Date(clock.getTime() + 130000);
    await assert.rejects(store.heartbeat(s.sessionId, 'visitor', 130), error => error.status === 409);
    await assert.rejects(store.heartbeat(s.sessionId, 'visitor', -1), error => error.status === 400);
    assert.deepEqual((await store.ranking('day')).items, []);
  } finally { await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end(); }
});
