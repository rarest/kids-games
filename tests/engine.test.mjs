import test from 'node:test';
import assert from 'node:assert/strict';

let engine;
try { engine = await import('../maze/engine.js'); } catch {}

const corridor = ({ coins = [], breakableWalls = [] } = {}) => ({
  id: 'fixture', type: 'normal', index: 1,
  rows: [
    '#######',
    '#.....#',
    '#######'
  ],
  start: { x: 1, y: 1 },
  exit: { x: 5, y: 1 },
  keys: [{ x: 3, y: 1 }],
  coins,
  breakableWalls,
  parSteps: 4
});

test('walks, bumps, collects a key and only opens a fully unlocked door', () => {
  assert.ok(engine, 'maze/engine.js should exist');
  const run = engine.createRun(corridor());

  assert.equal(engine.move(run, 'up').event.type, 'bump');
  assert.deepEqual(run.player, { x: 1, y: 1 });
  assert.equal(run.steps, 0);

  assert.equal(engine.move(run, 'right').event.type, 'step');
  const keyResult = engine.move(run, 'right');
  assert.equal(keyResult.event.type, 'key');
  assert.equal(run.collectedKeys.size, 1);
  engine.move(run, 'right');
  const complete = engine.move(run, 'right');
  assert.equal(complete.event.type, 'complete');
  assert.equal(run.complete, true);

  const locked = engine.createRun({ ...corridor(), start: { x: 4, y: 1 }, keys: [{ x: 1, y: 1 }] });
  assert.equal(engine.move(locked, 'right').event.type, 'door-locked');
  assert.deepEqual(locked.player, { x: 4, y: 1 });
});

test('scores one to three stars from par steps', () => {
  assert.ok(engine);
  assert.equal(engine.starsFor(20, 20), 3);
  assert.equal(engine.starsFor(30, 20), 2);
  assert.equal(engine.starsFor(31, 20), 1);
});

test('collects every reward coin only once across runs', () => {
  assert.ok(engine);
  const coin = { x: 2, y: 1, id: 'reward-1:2,1' };
  const first = engine.createRun(corridor({ coins: [coin] }), new Set());
  assert.equal(engine.move(first, 'right').event.type, 'coin');
  assert.deepEqual([...first.newCoinIds], [coin.id]);

  const replay = engine.createRun(corridor({ coins: [coin] }), new Set([coin.id]));
  assert.equal(engine.move(replay, 'right').event.type, 'step');
  assert.equal(replay.newCoinIds.size, 0);
});

test('dynamite breaks only a declared adjacent inner wall', () => {
  assert.ok(engine);
  const level = {
    ...corridor(),
    rows: ['#######', '#.#...#', '#.....#', '#######'],
    start: { x: 1, y: 1 }, exit: { x: 5, y: 2 }, keys: [],
    breakableWalls: [{ x: 2, y: 1 }]
  };
  const run = engine.createRun(level);
  assert.equal(engine.useDynamite(run, 'up').consumed, false);
  assert.equal(engine.useDynamite(run, 'right').consumed, true);
  assert.equal(engine.move(run, 'right').event.type, 'step');
  assert.deepEqual(run.player, { x: 2, y: 1 });
});

test('hook crosses one or two walls, lands safely, and is not spent on failure', () => {
  assert.ok(engine);
  const level = {
    ...corridor(),
    rows: ['########', '#.##...#', '#......#', '########'],
    start: { x: 1, y: 1 }, exit: { x: 6, y: 2 }, keys: []
  };
  const run = engine.createRun(level);
  assert.equal(engine.useHook(run, 'up').consumed, false);
  const hook = engine.useHook(run, 'right');
  assert.equal(hook.consumed, true);
  assert.equal(hook.event.type, 'hook');
  assert.deepEqual(run.player, { x: 4, y: 1 });
});
