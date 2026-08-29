import test from 'node:test';
import assert from 'node:assert/strict';

let saveModule;
try { saveModule = await import('../maze/save.js'); } catch {}

test('creates and sanitizes a versioned save without trusting malformed fields', () => {
  assert.ok(saveModule, 'maze/save.js should exist');
  const fresh = saveModule.createDefaultSave();
  assert.equal(fresh.version, 1);
  assert.equal(fresh.unlockedNormal, 1);
  assert.equal(fresh.journeyPosition, 0);
  assert.deepEqual(fresh.ownedSkins, ['red']);

  const clean = saveModule.sanitizeSave({
    version: 1, coins: -20, inventory: { dynamite: 2.7, hook: -1 },
    ownedSkins: ['red', 'blue', 'hacker'], equippedSkin: 'hacker',
    collectedCoinIds: ['reward-1:2,1', 'reward-1:2,1', 9],
    completedNormal: [1, 1, 99], journeyPosition: 999
  });
  assert.equal(clean.coins, 0);
  assert.deepEqual(clean.inventory, { dynamite: 2, hook: 0 });
  assert.deepEqual(clean.ownedSkins, ['red', 'blue']);
  assert.equal(clean.equippedSkin, 'red');
  assert.deepEqual(clean.collectedCoinIds, ['reward-1:2,1']);
  assert.deepEqual(clean.completedNormal, [1]);
  assert.equal(clean.journeyPosition, 19);
});

test('load and persist recover safely from invalid JSON', () => {
  assert.ok(saveModule);
  const memory = {
    value: '{broken',
    getItem() { return this.value; },
    setItem(_key, value) { this.value = value; }
  };
  assert.equal(saveModule.loadSave(memory).coins, 0);
  const saved = saveModule.persistSave({ ...saveModule.createDefaultSave(), coins: 7 }, memory);
  assert.equal(JSON.parse(memory.value).coins, 7);
  assert.equal(saved.coins, 7);
});
