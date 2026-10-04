import test from 'node:test';
import assert from 'node:assert/strict';
const core = await import('../memory/core.js').catch(() => null);
const p = await import('../memory/profile.js').catch(() => null);
const fresh = () => { assert.ok(p, 'durable wallet module must exist'); return p.createProfile(); };
test('newcomer gift is 1000 coins, two add items and one peek, never repeated on reload', () => {
  const profile = fresh(); assert.equal(profile.coins, 1000); assert.deepEqual(profile.items, { peek: 1, bomb: 0, add: 2 });
  profile.coins = 11; profile.items.peek = 0;
  const restored = p.readProfile(JSON.stringify(profile)); assert.equal(restored.coins, 11); assert.equal(restored.items.peek, 0);
  assert.deepEqual(restored.unlocked, [1]);
});
test('shop prices, eight-peek bundle and insufficient funds are real wallet transactions', () => {
  const profile = fresh();
  assert.equal(p.purchase(profile, 'peek8').ok, true); assert.equal(profile.coins, 0); assert.equal(profile.items.peek, 9);
  const before = structuredClone(profile); assert.equal(p.purchase(profile, 'bomb').ok, false); assert.deepEqual(profile, before);
  profile.coins = 2100;
  assert.ok(p.purchase(profile, 'peek').ok); assert.equal(profile.coins, 1600);
  assert.ok(p.purchase(profile, 'bomb').ok); assert.equal(profile.coins, 100); assert.equal(profile.items.bomb, 1);
  assert.ok(p.purchase(profile, 'add').ok); assert.equal(profile.coins, 0); assert.equal(profile.items.add, 3);
});
test('paying unlocks only the requested level and cannot charge twice or for invalid levels', () => {
  const profile = fresh(); assert.ok(p.unlockLevel(profile, 40).ok);
  assert.deepEqual(profile.unlocked, [1, 40]); assert.equal(profile.coins, 900);
  assert.equal(p.unlockLevel(profile, 40).ok, false); assert.equal(profile.coins, 900);
  for (const n of [0, 201, 2.5]) assert.equal(p.unlockLevel(profile, n).ok, false);
});
test('last pair awards first-clear coins and next unlock exactly once', () => {
  const profile = fresh(); assert.ok(core); const g = core.createGame(40, () => .3); core.advance(g, 5);
  assert.equal(p.completeLevel(profile, g).ok, false); p.unlockLevel(profile, 40);
  core.useItem(g, 'bomb'); core.useItem(g, 'bomb');
  assert.equal(p.completeLevel(profile, g).reward, 100); assert.equal(profile.coins, 1000);
  assert.deepEqual(profile.unlocked, [1, 40, 41]);
  assert.equal(p.completeLevel(profile, g).reward, 0); assert.equal(profile.coins, 1000);
  const restored = p.readProfile(JSON.stringify(profile)); assert.equal(p.completeLevel(restored, g).reward, 0);
});
test('consumption respects valid phases and saves inventory plus game together', () => {
  const profile = fresh(); assert.ok(core); const g = core.createGame(1);
  assert.equal(p.consume(profile, g, 'peek').ok, false); assert.equal(profile.items.peek, 1);
  core.advance(g, 5); assert.ok(p.consume(profile, g, 'peek').ok); assert.equal(profile.items.peek, 0);
  profile.session = g; const saved = p.readProfile(JSON.stringify(profile));
  assert.equal(saved.items.peek, 0); assert.equal(saved.session.phase, 'peek');
  assert.equal(p.consume(profile, g, 'add').ok, false); assert.equal(profile.items.add, 2);
});
test('corrupt saves do not mint replacement newcomer coins and normalize invalid fields', () => {
  fresh(); const broken = p.readProfile('{bad json'); assert.equal(broken.coins, 0); assert.equal(broken.items.peek, 0);
  const invalid = p.readProfile(JSON.stringify({ coins: -9, unlocked: [0, 201, 2.5], completed: [2], items: { peek: -2 }, session: {} }));
  assert.equal(invalid.coins, 0); assert.deepEqual(invalid.unlocked, [1, 2, 3]); assert.equal(invalid.session, null);
});
