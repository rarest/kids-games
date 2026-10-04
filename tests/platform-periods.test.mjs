import test from 'node:test';
import assert from 'node:assert/strict';

test('popularity period uses Shanghai midnight and Monday week start', async () => {
  let periods;
  await assert.doesNotReject(async () => { periods = await import('../platform/periods.mjs'); }, 'platform period implementation is required');
  const now = new Date('2026-10-04T16:01:00Z'); // Monday 00:01 in Shanghai.
  assert.equal(periods.periodRange('day', now).start, '2026-10-04T16:00:00.000Z');
  assert.equal(periods.periodRange('day', now).end, '2026-10-05T16:00:00.000Z');
  assert.equal(periods.periodRange('week', now).start, '2026-10-04T16:00:00.000Z');
  assert.equal(periods.periodRange('week', now).end, '2026-10-11T16:00:00.000Z');
  assert.equal(periods.periodRange('month', now).start, '2026-09-30T16:00:00.000Z');
  assert.equal(periods.periodRange('month', now).end, '2026-10-31T16:00:00.000Z');
});

test('Sunday belongs to previous week and December rolls into next year', async () => {
  const {periodRange} = await import('../platform/periods.mjs');
  assert.equal(periodRange('week', new Date('2026-10-04T15:59:59Z')).start, '2026-09-27T16:00:00.000Z');
  assert.equal(periodRange('month', new Date('2026-12-31T15:59:59Z')).end, '2026-12-31T16:00:00.000Z');
  assert.throws(() => periodRange('year'), /period/);
});
