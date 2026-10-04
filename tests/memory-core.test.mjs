import test from 'node:test';
import assert from 'node:assert/strict';
const core = await import('../memory/core.js').catch(() => null);
const ready = () => assert.ok(core, 'the playable memory rules module must exist');
const playing = (level = 1) => { ready(); const g = core.createGame(level, () => .37); core.advance(g, 5); return g; };
// A reset at every fortieth level or an off-by-one after level 40 breaks these independent fixtures.
test('all 200 authored levels keep exact pair progression with only level 40 resting', () => {
  ready();
  for (const [level, pairs] of [[1, 2], [2, 4], [39, 78], [40, 2], [41, 80], [80, 158], [200, 398]]) {
    const g = core.createGame(level, () => .41);
    assert.equal(g.cards.length, pairs * 2);
    const counts = new Map(); for (const c of g.cards) counts.set(c.symbol, (counts.get(c.symbol) || 0) + 1);
    assert.equal(counts.size, pairs); assert.ok([...counts.values()].every(n => n === 2));
  }
  assert.throws(() => core.createGame(0), /关卡/); assert.throws(() => core.createGame(201), /关卡/);
});
test('preview, repeated clicks and mismatch lock cannot create false matches', () => {
  ready(); const g = core.createGame(2, () => .37);
  assert.equal(core.flip(g, 0).type, 'ignored'); core.advance(g, 5);
  assert.equal(core.flip(g, 0).type, 'flip'); assert.equal(core.flip(g, 0).type, 'ignored');
  const different = g.cards.findIndex(c => c.symbol !== g.cards[0].symbol);
  assert.equal(core.flip(g, different).type, 'mismatch');
  const third = g.cards.findIndex((c, i) => i !== 0 && i !== different);
  assert.equal(core.flip(g, third).type, 'ignored');
  core.advance(g, .99); assert.equal(g.phase, 'mismatch');
  core.advance(g, .01); assert.equal(g.phase, 'playing'); assert.deepEqual(g.selected, []);
  assert.equal(g.moves, 1);
});
test('each full pair matches once and the last pair alone wins', () => {
  const g = playing();
  for (const symbol of [0, 1]) {
    const indexes = g.cards.flatMap((c, i) => c.symbol === symbol ? [i] : []);
    core.flip(g, indexes[0]); const event = core.flip(g, indexes[1]);
    assert.equal(event.type, symbol === 1 ? 'win' : 'match');
    assert.equal(core.flip(g, indexes[0]).type, 'ignored');
  }
  assert.equal(g.phase, 'won'); assert.equal(g.matched, 2);
});
test('paused preview and mismatch timers never advance or consume extra time', () => {
  ready(); const g = core.createGame(1); core.advance(g, 2); core.pause(g);
  core.advance(g, 999); assert.equal(g.remaining, 3); assert.equal(g.elapsed, 0);
  core.resume(g); core.advance(g, 3); assert.equal(g.phase, 'playing');
  core.advance(g, 2); assert.equal(g.elapsed, 2);
  core.pause(g); core.advance(g, 100); assert.equal(g.elapsed, 2);
});
test('peek restores an already selected card and adding cards keeps old identities and indexes', () => {
  const g = playing(); core.flip(g, 0);
  assert.equal(core.useItem(g, 'peek').type, 'peek'); core.advance(g, 5);
  assert.deepEqual(g.selected, [0]); assert.equal(g.phase, 'playing');
  assert.equal(core.useItem(g, 'add').type, 'ignored', 'cannot insert cards into a half-selected pair');
  const partner = g.cards.findIndex((c, i) => i !== 0 && c.symbol === g.cards[0].symbol);
  core.flip(g, partner);
  const before = structuredClone(g.cards), columns = g.columns;
  assert.equal(core.useItem(g, 'add', () => .4).type, 'add');
  assert.deepEqual(g.cards.slice(0, 4), before); assert.equal(g.columns, columns); assert.equal(g.cards.length, 8);
  assert.equal(core.useItem(g, 'peek').type, 'ignored'); core.advance(g, 5);
  assert.equal(g.phase, 'playing');
});
test('bomb removes an actual complete random pair and can trigger final win', () => {
  const g = playing(); const event = core.useItem(g, 'bomb', () => 0);
  assert.equal(event.type, 'bomb'); assert.equal(event.indexes.length, 2);
  assert.equal(g.cards[event.indexes[0]].symbol, g.cards[event.indexes[1]].symbol);
  assert.equal(g.matched, 1);
  assert.equal(core.useItem(g, 'bomb', () => 0).type, 'win'); assert.equal(g.phase, 'won');
  assert.equal(core.useItem(g, 'add').type, 'ignored');
});
test('save restoration checks pair counts, selected indexes and stage timers', () => {
  const g = playing(41); core.flip(g, 0); core.pause(g);
  const restored = core.restoreGame(JSON.parse(JSON.stringify(g)));
  assert.deepEqual(restored, g); assert.equal(core.restoreGame({ ...g, cards: g.cards.slice(1) }), null);
  assert.equal(core.restoreGame({ ...g, selected: [9999] }), null);
});
test('corrupt transitional saves cannot restore permanently locked cards', () => {
  const g = core.createGame(1);
  assert.equal(core.restoreGame({ ...g, remaining: 0 }), null);
  assert.equal(core.restoreGame({ ...g, phase: 'peek', remaining: 0 }), null);
});
