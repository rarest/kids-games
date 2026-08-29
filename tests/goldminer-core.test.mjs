import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEM_TYPES,
  pullSpeedFor,
  levelTarget,
  createLevelItems,
  circlesOverlap,
  itemReachableByVolley,
} from '../goldminer/game-core.js';
import * as core from '../goldminer/game-core.js';

test('heavy rocks return more slowly than small gold', () => {
  assert.ok(pullSpeedFor(ITEM_TYPES.rock) < pullSpeedFor(ITEM_TYPES.smallGold));
});

test('level targets rise predictably without becoming impossible early', () => {
  assert.equal(levelTarget(1), 650);
  assert.equal(levelTarget(2), 1050);
  assert.equal(levelTarget(5), 2700);
});

test('generated treasure stays below ground and does not overlap', () => {
  const items = createLevelItems({ width: 900, height: 700, level: 3, random: () => 0.42 });
  assert.ok(items.length >= 14);
  for (const item of items) {
    assert.ok(item.y - item.radius >= 165);
    assert.ok(item.x - item.radius >= 8);
    assert.ok(item.x + item.radius <= 892);
  }
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      assert.equal(circlesOverlap(items[i], items[j], 8), false);
    }
  }
});

test('generated treasure respects the reachable top boundary', () => {
  let seed = 1;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const items = createLevelItems({ width: 390, height: 844, level: 8, top: 240, random });

  assert.ok(items.length >= 14);
  for (const item of items) assert.ok(item.y - item.radius >= 240);
});

test('seeded treasures stay inside safe bounds and intersect one of the 700 hook rays', () => {
  const viewports = [
    { width: 390, height: 844, bounds: { left: 0, right: 0, bottom: 0 } },
    { width: 844, height: 390, bounds: { left: 47, right: 47, bottom: 21 } },
    { width: 820, height: 1180, bounds: { left: 0, right: 0, bottom: 0 } },
    { width: 1440, height: 900, bounds: { left: 0, right: 0, bottom: 0 } },
  ];
  for (const viewport of viewports) {
    const origin = { x: (viewport.bounds.left + viewport.width - viewport.bounds.right) / 2, y: Math.max(118, Math.min(154, viewport.height * .22)) };
    const top = origin.y + 82;
    for (let sample = 1; sample <= 200; sample += 1) {
      let seed = sample;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
      const items = createLevelItems({ ...viewport, level: 8, top, origin, random });
      assert.ok(items.length >= 14, `${viewport.width}x${viewport.height} seed ${sample}`);
      for (const item of items) {
        assert.ok(item.x - item.radius >= viewport.bounds.left + 8);
        assert.ok(item.x + item.radius <= viewport.width - viewport.bounds.right - 8);
        assert.ok(item.y + item.radius <= viewport.height - viewport.bounds.bottom - 8);
        assert.equal(itemReachableByVolley(item, { origin }), true, `${viewport.width}x${viewport.height} seed ${sample}: ${item.kind} at ${item.x},${item.y}`);
      }
    }
  }
});

test('a volley contains exactly 700 hooks spread across the mining arc', () => {
  const hooks = core.createHookVolley?.({ count: 700, minAngle: -Math.PI / 3, maxAngle: Math.PI / 3 }) ?? [];

  assert.equal(hooks.length, 700);
  assert.equal(hooks[0].angle, -Math.PI / 3);
  assert.equal(hooks.at(-1).angle, Math.PI / 3);
  assert.equal(new Set(hooks.map((hook) => hook.angle)).size, 700);
});

test('two hooks cannot claim the same treasure', () => {
  const items = [{ x: 100, y: 100, radius: 20, caught: false }];

  const first = core.claimTreasure?.(items, { x: 100, y: 100 }, 9);
  const second = core.claimTreasure?.(items, { x: 100, y: 100 }, 9);

  assert.equal(first, items[0]);
  assert.equal(second, null);
});

test('an empty mine refreshes only after every hook returns while time remains', () => {
  assert.equal(core.shouldRefreshMine?.({ itemCount: 0, hookCount: 0, time: 18 }) ?? false, true);
  assert.equal(core.shouldRefreshMine?.({ itemCount: 0, hookCount: 4, time: 18 }) ?? false, false);
  assert.equal(core.shouldRefreshMine?.({ itemCount: 0, hookCount: 0, time: 0 }) ?? false, false);
  assert.equal(core.shouldRefreshMine?.({ itemCount: 1, hookCount: 0, time: 18 }) ?? false, false);
});
