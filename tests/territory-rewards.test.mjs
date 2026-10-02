import test from "node:test";
import assert from "node:assert/strict";
import { createGame, movePlayer } from "../territory/core.js";
import { regionArea } from "../territory/regions.js";
import {
  createProfile,
  collectReward,
  SKINS,
  equipSkin,
  rewardSummary,
} from "../territory/profile.js";
function won() {
  const g = createGame({ seed: 812, bots: 0 });
  g.territories[0] = g.world;
  g.areas[0] = regionArea(g.world);
  const p = g.players[0];
  p.stroke = [{ x: p.x - 0.1, y: p.y }];
  movePlayer(g, 0, p.x + 0.1, p.y);
  assert.equal(g.mode, "reward");
  return g;
}
test("coins persist once and each spaced chest grants a different hidden skin", () => {
  const g = won(),
    p = createProfile();
  for (const c of g.rewards.chests) {
    movePlayer(g, 0, c.x, c.y);
    const e = g.events.findLast((e) => e.type === "chest");
    const prize = collectReward(p, g, e);
    assert.equal(prize.type, "skin");
    assert.equal(SKINS.find((s) => s.id === prize.skin).tier, "hidden");
    assert.equal(collectReward(p, g, e), null);
  }
  assert.equal(new Set(p.owned).size, 4);
  assert.ok(equipSkin(p, p.owned.at(-1)));
  const coin = g.rewards.coins[20];
  movePlayer(g, 0, coin.x, coin.y);
  const e = g.events.findLast((e) => e.type === "coin"),
    before = p.coins;
  assert.ok(collectReward(p, g, e));
  assert.equal(p.coins, before + 5);
  const saved = createProfile(JSON.parse(JSON.stringify(p)));
  assert.equal(collectReward(saved, g, e), null);
  assert.equal(saved.coins, p.coins);
  assert.deepEqual(saved.owned, p.owned);
});
test("wins never grant a hidden skin without touching a reward chest", () => {
  const p = createProfile({ wins: 100, coins: 1000 }),
    g = createGame();
  assert.equal(
    collectReward(p, g, { type: "chest", rewardId: 0, id: 0 }),
    null,
  );
  assert.deepEqual(p.owned, ["red"]);
  const w = won();
  assert.equal(
    collectReward(p, w, { type: "chest", rewardId: 0, id: 0 }),
    null,
  );
});
test("existing owned hidden skins survive and completed collection earns coins instead", () => {
  const p = createProfile({
      owned: SKINS.map((s) => s.id),
      selected: "hidden-galaxy",
    }),
    g = won(),
    c = g.rewards.chests[0];
  movePlayer(g, 0, c.x, c.y);
  const e = g.events.findLast((e) => e.type === "chest");
  assert.deepEqual(collectReward(p, g, e), { type: "coins", amount: 50 });
  assert.equal(p.selected, "hidden-galaxy");
  assert.equal(p.coins, 50);
  assert.deepEqual(rewardSummary(g), { coins: 50, skins: 0 });
  for (const c of g.rewards.chests.slice(1)) {
    movePlayer(g, 0, c.x, c.y);
    collectReward(
      p,
      g,
      g.events.findLast((e) => e.type === "chest"),
    );
  }
  assert.equal(rewardSummary(g).coins, 150);
  assert.equal(rewardSummary(g).skins, 0);
});
