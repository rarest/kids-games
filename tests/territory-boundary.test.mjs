import test from "node:test";
import assert from "node:assert/strict";
import { createGame, movePlayer, stepGame } from "../territory/core.js";
import { containsRegion, nearestSegment } from "../territory/regions.js";
test("every fractional coast point remains reachable without sampled obstacles", () => {
  for (const [cols, rows] of [
    [7, 7],
    [44, 38],
    [88, 76],
  ])
    for (const seed of [1, 7, 21]) {
      const g = createGame({ seed, cols, rows, bots: 0 }),
        c = g.boundary,
        p = g.players[0];
      g.territories[0] = g.world;
      g.areas[0] = g.worldArea;
      const points = g.world[0][0]
        .slice(0, -1)
        .map(([x, y]) => ({
          x: c.x + (x - c.x) * 0.9999,
          y: c.y + (y - c.y) * 0.9999,
        }));
      Object.assign(p, points[0]);
      for (const q of [...points.slice(1), points[0]]) {
        assert.equal(movePlayer(g, 0, q.x, q.y), true);
        assert.ok(Math.hypot(p.x - q.x, p.y - q.y) < 1e-8);
      }
    }
});
test("outward tangential input slides around every convex and concave shore segment", () => {
  for (const seed of [1, 7, 21, 33]) {
    const g = createGame({ seed, bots: 0 }),
      c = g.boundary,
      p = g.players[0],
      ring = g.world[0][0];
    g.territories[0] = g.world;
    g.areas[0] = g.worldArea;
    stepGame(g, 0.001);
    for (let i = 0; i < 512; i += 8) {
      const [x, y] = ring[i],
        next = ring[i + 1],
        dx = next[0] - x,
        dy = next[1] - y,
        d = Math.hypot(dx, dy),
        tx = dx / d,
        ty = dy / d;
      // CCW polygon: right normal points out, with a substantial tangential component.
      Object.assign(p, {
        x: x + (c.x - x) * 0.000001,
        y: y + (c.y - y) * 0.000001,
      });
      const before = { x: p.x, y: p.y };
      stepGame(g, 0.12, { x: tx + ty * 0.7, y: ty - tx * 0.7 });
      assert.ok(
        containsRegion(g.world, p.x, p.y),
        "always inside the actual shore",
      );
      assert.ok(
        Math.hypot(p.x - before.x, p.y - before.y) > 0.18,
        `seed ${seed} shore ${i} keeps sliding`,
      );
    }
  }
});
test("long shoreline travel keeps bounded trails and makes steady continuous progress", () => {
  const g = createGame({ seed: 7, bots: 0 }),
    c = g.boundary,
    p = g.players[0],
    ring = g.world[0][0];
  let previous = { x: p.x, y: p.y },
    traveled = 0;
  for (let lap = 0; lap < 4; lap++)
    for (let i = 0; i < 512; i++) {
      const [x, y] = ring[i],
        q = { x: c.x + (x - c.x) * 0.999, y: c.y + (y - c.y) * 0.999 };
      assert.ok(movePlayer(g, 0, q.x, q.y));
      traveled += Math.hypot(p.x - previous.x, p.y - previous.y);
      previous = { x: p.x, y: p.y };
      assert.ok(p.stroke.length <= 4096);
    }
  assert.ok(traveled > c.r * 20);
  assert.ok(containsRegion(g.world, p.x, p.y));
});
