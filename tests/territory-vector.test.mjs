import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  movePlayer,
  stepGame,
  coverage,
} from "../territory/core.js";
import {
  regionArea,
  containsRegion,
  disk,
  difference,
  simplifyPath,
  nearestSegment,
} from "../territory/regions.js";
import { createProfile, settleRun } from "../territory/profile.js";
const rect = (x, y, w, h) => [
  [
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ],
  ],
];
function fixture(bots = 0) {
  const g = createGame({ seed: 7, cols: 40, rows: 40, bots });
  g.territories[0] = rect(10, 17, 3, 6);
  g.areas[0] = 18;
  Object.assign(g.players[0], { x: 12, y: 18 });
  return g;
}
const walk = (g, id, points) => {
  for (const [x, y] of points) assert.equal(movePlayer(g, id, x, y), true);
};

test("production game has no sampled grid and starts everyone with the same actual circular area", () => {
  const g = createGame({ seed: 7, cols: 88, rows: 76 });
  assert.equal(
    "mask" in g,
    false,
    "production movement and ownership must not use a grid",
  );
  assert.equal(g.territories.length, 4);
  assert.equal(new Set(g.areas.map((a) => a.toFixed(6))).size, 1);
  assert.ok(g.initialDisks.every((c) => c.r === g.initialDisks[0].r));
});
test("the world is a deterministic smooth wavy coastline, not a single circular disk", () => {
  const g = createGame({ seed: 7 }),
    c = g.boundary,
    r = g.world[0][0].map(([x, y]) => Math.hypot(x - c.x, y - c.y));
  assert.ok(Math.max(...r) - Math.min(...r) > c.r * 0.2);
  assert.deepEqual(g.world, createGame({ seed: 7 }).world);
  assert.notDeepEqual(g.world, createGame({ seed: 8 }).world);
  g.territories[0] = g.world;
  g.areas[0] = g.worldArea;
  const p = g.players[0],
    points = g.world[0][0].map(([x, y]) => ({
      x: c.x + (x - c.x) * 0.999,
      y: c.y + (y - c.y) * 0.999,
    }));
  Object.assign(p, points[0]);
  for (const q of points.slice(1))
    assert.equal(
      movePlayer(g, 0, q.x, q.y),
      true,
      "no stair on the actual coastline",
    );
});
test("fractional actual routes fill their interior and never snap the boundary to cells", () => {
  const g = fixture();
  walk(g, 0, [
    [17.3, 18.25],
    [17.3, 22.25],
    [12, 22.25],
  ]);
  assert.ok(containsRegion(g.territories[0], 16.9, 21.9));
  assert.equal(containsRegion(g.territories[0], 17.7, 21.9), false);
  assert.equal(g.players[0].stroke.length, 0);
  assert.ok(coverage(g, 0) > 18 / g.worldArea);
});
test("concave capture leaves the real notch unfilled", () => {
  const g = fixture();
  walk(g, 0, [
    [20, 18],
    [20, 20],
    [17, 20],
    [17, 22],
    [12, 22],
  ]);
  assert.ok(containsRegion(g.territories[0], 15.5, 21));
  assert.equal(containsRegion(g.territories[0], 18.5, 21), false);
});
test("joining disconnected own regions takes only the real connecting ribbon from the enemy", () => {
  const g = fixture(1);
  g.territories[0] = [...rect(10, 19, 2, 2), ...rect(18, 19, 2, 2)];
  g.areas[0] = 8;
  g.territories[1] = rect(12, 18, 6, 4);
  g.areas[1] = 24;
  Object.assign(g.players[0], { x: 11, y: 20 });
  Object.assign(g.players[1], { x: 15, y: 19 });
  walk(g, 0, [[19, 20]]);
  assert.ok(containsRegion(g.territories[0], 15, 20));
  assert.equal(containsRegion(g.territories[0], 15, 18.5), false);
  assert.ok(containsRegion(g.territories[1], 15, 18.5));
  assert.ok(g.areas[1] < 24);
});
test("swept real trail cuts discard only pending expansion", () => {
  const g = fixture(1);
  g.territories[1] = disk(14, 13, 1.45);
  g.areas[1] = regionArea(g.territories[1]);
  Object.assign(g.players[1], { x: 14, y: 13 });
  const saved = JSON.stringify(g.territories[0]);
  walk(g, 0, [
    [16, 18],
    [16, 23],
  ]);
  movePlayer(g, 1, 14, 23);
  assert.ok(g.events.some((e) => e.type === "cut" && e.id === 0));
  assert.equal(g.players[0].stroke.length, 0);
  assert.equal(JSON.stringify(g.territories[0]), saved);
});
test("nearby bots aim at an actual enemy trail and return without free teleportation", () => {
  const g = fixture(1);
  g.territories[1] = disk(18, 14, 1.45);
  g.areas[1] = regionArea(g.territories[1]);
  Object.assign(g.players[1], { x: 18, y: 14 });
  walk(g, 0, [[23, 18]]);
  const bot = g.players[1];
  stepGame(g, 0.35);
  assert.ok(bot.y > 14.7 && Math.abs(bot.x - 18) < 0.1);
  let cut = false;
  for (let n = 0; n < 100; n++) {
    const old = { x: bot.x, y: bot.y };
    stepGame(g, 0.08);
    assert.ok(
      Math.hypot(bot.x - old.x, bot.y - old.y) < 0.3,
      "attacker keeps its normal speed",
    );
    if (g.events.some((e) => e.type === "cut" && e.id === 0)) cut = true;
  }
  assert.ok(cut);
  assert.ok(
    g.events.some((e) => e.type === "capture" && e.id === 1),
    "bot actually returns home and closes its route",
  );
});
test("a full win creates sixty one-time coins and three well-separated chests", () => {
  const g = createGame({ seed: 7, bots: 0 });
  g.territories[0] = g.world;
  g.areas[0] = g.worldArea;
  stepGame(g, 0.01);
  assert.equal(g.mode, "reward");
  assert.equal(g.rewards.coins.length, 60);
  assert.equal(g.rewards.chests.length, 3);
  for (const a of g.rewards.chests)
    for (const b of g.rewards.chests)
      if (a !== b) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > g.boundary.r);
  const chest = g.rewards.chests[0];
  movePlayer(g, 0, chest.x, chest.y);
  movePlayer(g, 0, chest.x, chest.y);
  assert.equal(
    g.events.filter((e) => e.type === "chest" && e.rewardId === chest.id)
      .length,
    1,
  );
  const coin = g.rewards.coins.find((c) => !c.collected);
  movePlayer(g, 0, coin.x, coin.y);
  movePlayer(g, 0, coin.x, coin.y);
  assert.equal(
    g.events.filter((e) => e.type === "coin" && e.rewardId === coin.id).length,
    1,
  );
});
test("an actual legal shoreline loop wins the whole wavy map and creates rewards", () => {
  for (let seed = 1; seed <= 6; seed++) {
    const g = createGame({ seed, bots: 0 }),
      p = g.players[0],
      home = { x: p.x, y: p.y };
    for (const [x, y] of g.world[0][0]) assert.ok(movePlayer(g, 0, x, y));
    assert.ok(movePlayer(g, 0, home.x, home.y));
    stepGame(g, 0.001);
    assert.equal(g.mode, "reward");
    assert.ok(Math.abs(coverage(g, 0) - 1) < 1e-10);
    assert.ok(g.rewards.coins.every((c) => containsRegion(g.world, c.x, c.y)));
    assert.ok(g.rewards.chests.every((c) => containsRegion(g.world, c.x, c.y)));
    g.mode = "over";
    const profile = createProfile();
    assert.equal(settleRun(profile, g), 150);
    assert.equal(profile.wins, 1);
  }
});
test("a real curved route fills its smooth interior, not its rectangular bounds", () => {
  const g = fixture(),
    points = [];
  for (let n = 0; n <= 100; n++) {
    const a = -Math.PI / 2 + (n * Math.PI) / 100;
    points.push([13 + Math.cos(a) * 5, 20 + Math.sin(a) * 2]);
  }
  walk(g, 0, points);
  assert.equal(g.players[0].stroke.length, 0);
  assert.ok(containsRegion(g.territories[0], 16, 20));
  assert.equal(containsRegion(g.territories[0], 17.8, 21.8), false);
});
test("self crossing loop remains pending until returning and a cut discards it", () => {
  const g = fixture(1),
    saved = JSON.stringify(g.territories[0]);
  g.territories[1] = disk(18, 14, 1);
  g.areas[1] = regionArea(g.territories[1]);
  Object.assign(g.players[1], { x: 18, y: 14 });
  walk(g, 0, [
    [16, 18],
    [20, 18],
    [20, 22],
    [16, 22],
    [16, 17.8],
  ]);
  assert.ok(g.players[0].pending.length);
  assert.equal(JSON.stringify(g.territories[0]), saved);
  movePlayer(g, 1, 18, 22);
  assert.equal(g.players[0].pending.length, 0);
  assert.equal(JSON.stringify(g.territories[0]), saved);
});
test("returning into an existing hole fills only the enclosed portion of that hole", () => {
  const g = fixture();
  g.territories[0] = difference(rect(10, 15, 12, 10), rect(14, 17, 6, 6));
  g.areas[0] = regionArea(g.territories[0]);
  Object.assign(g.players[0], { x: 13, y: 18 });
  walk(g, 0, [
    [17, 18],
    [17, 21],
    [13, 21],
  ]);
  assert.ok(containsRegion(g.territories[0], 16, 20));
  assert.equal(containsRegion(g.territories[0], 19, 21), false);
});
test("bots do not detect an enemy trail outside their fourteen-unit sight", () => {
  const g = createGame({ seed: 7, cols: 88, rows: 76, bots: 1 }),
    bot = g.players[1],
    p = g.players[0];
  movePlayer(g, 0, p.x + 4, p.y);
  stepGame(g, 0.4);
  assert.equal(bot.hunt, null);
});
test("retracing the same path keeps the whole real connecting band", () => {
  const g = createGame({ seed: 7, bots: 0 }),
    p = g.players[0],
    home = { x: p.x, y: p.y };
  movePlayer(g, 0, home.x + 5, home.y);
  movePlayer(g, 0, home.x, home.y);
  assert.ok(containsRegion(g.territories[0], home.x + 4, home.y));
  assert.ok(g.areas[0] > 7.5);
});
test("a narrow existing territory crossed between frame endpoints closes the route immediately", () => {
  const g = fixture();
  g.territories[0].push(...rect(16.03, 17, 0.02, 2));
  g.areas[0] = regionArea(g.territories[0]);
  movePlayer(g, 0, 17, 18);
  assert.ok(g.events.some((e) => e.type === "capture"));
  assert.ok(containsRegion(g.territories[0], 15, 18));
  assert.ok(g.players[0].stroke[0].x > 16.04);
});
test("long-path reduction preserves sharp corners and only removes subpixel deviations", () => {
  const points = Array.from({ length: 6000 }, (_, i) => ({
    x: i * 0.001,
    y: Math.sin(i * 0.015) * 0.2,
  }));
  points.push({ x: 6, y: 4 }, { x: 6.1, y: 4 }, { x: 6.1, y: 0 });
  const epsilon = 0.003,
    out = simplifyPath(points, epsilon);
  assert.ok(out.length < 4096);
  assert.ok(out.some((p) => p.x === 6 && p.y === 4));
  assert.ok(out.some((p) => p.x === 6.1 && p.y === 4));
  for (let i = 0; i < points.length; i += 7) {
    const p = points[i];
    let d = Infinity;
    for (let n = 1; n < out.length; n++) {
      const q = nearestSegment(
        p,
        [out[n - 1].x, out[n - 1].y],
        [out[n].x, out[n].y],
      );
      d = Math.min(d, Math.hypot(p.x - q.x, p.y - q.y));
    }
    assert.ok(d <= epsilon + 1e-9);
  }
  assert.deepEqual(out[0], points[0]);
  assert.deepEqual(out.at(-1), points.at(-1));
});
