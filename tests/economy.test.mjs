import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel } from '../maze/levels.js';

let economy, saveModule;
try {
  economy = await import('../maze/economy.js');
  saveModule = await import('../maze/save.js');
} catch {}

const fresh = () => saveModule.createDefaultSave();

test('sells stackable tools and permanent basic skins at fixed prices', () => {
  assert.ok(economy && saveModule, 'economy and save modules should exist');
  let save = { ...fresh(), coins: 5 };
  ({ save } = economy.purchase(save, 'dynamite'));
  assert.deepEqual(save.inventory, { dynamite: 1, hook: 0 });
  assert.equal(save.coins, 4);
  ({ save } = economy.purchase(save, 'hook'));
  assert.deepEqual(save.inventory, { dynamite: 1, hook: 1 });
  assert.equal(save.coins, 1);
  const blue = economy.purchase(save, 'skin-blue');
  assert.equal(blue.ok, true);
  assert.equal(blue.save.coins, 0);
  assert.ok(blue.save.ownedSkins.includes('blue'));
  assert.equal(economy.purchase(blue.save, 'skin-blue').reason, 'already-owned');
});

test('reveals hidden skins after normal stages 1, 5 and 7, then sells each for three coins', () => {
  assert.ok(economy && saveModule);
  assert.deepEqual(economy.availableSkins(fresh()).filter(s => s.hidden).map(s => s.id), []);
  let save = { ...fresh(), coins: 9, completedNormal: [1, 5, 7] };
  assert.deepEqual(economy.availableSkins(save).filter(s => s.hidden).map(s => s.id), ['silver', 'gold', 'iridescent']);
  const bought = economy.purchase(save, 'skin-iridescent');
  assert.equal(bought.ok, true);
  assert.equal(bought.save.coins, 6);
  assert.equal(economy.equipSkin(bought.save, 'iridescent').save.equippedSkin, 'iridescent');
});

test('awards a map coin permanently only once', () => {
  assert.ok(economy && saveModule);
  const once = economy.awardCoin(fresh(), 'reward-2:4,7');
  const twice = economy.awardCoin(once, 'reward-2:4,7');
  assert.equal(once.coins, 1);
  assert.equal(twice.coins, once.coins);
  assert.equal(twice.collectedCoinIds.length, 1);
});

test('ordinary stages can replay, while reward stages require the current journey route', () => {
  assert.ok(economy && saveModule);
  let save = fresh();
  assert.equal(economy.canEnterStage(save, getLevel('normal-1')), true);
  assert.equal(economy.canEnterStage(save, getLevel('reward-1')), false);

  save = economy.completeStage(save, { levelId: 'normal-1', stars: 3, steps: 20 });
  assert.equal(economy.canEnterStage(save, getLevel('normal-1')), true);
  assert.equal(economy.canEnterStage(save, getLevel('reward-1')), true);
  save = economy.completeStage(save, { levelId: 'reward-1', stars: 2, steps: 40 });
  assert.equal(economy.canEnterStage(save, getLevel('reward-1')), false);
  assert.equal(economy.canEnterStage(save, getLevel('normal-2')), true);

  const restarted = economy.restartJourney(save);
  assert.equal(economy.canEnterStage(restarted, getLevel('normal-1')), true);
  assert.equal(economy.canEnterStage(restarted, getLevel('reward-1')), false);
});
