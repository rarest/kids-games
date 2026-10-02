import test from "node:test";
import assert from "node:assert/strict";
import { createGame, stepGame } from "../territory/core.js";
import {
  regionArea,
  intersection,
  containsRegion,
} from "../territory/regions.js";
test(
  "four minutes of actual bot captures keep geometry valid and the usual update below a frame budget",
  { timeout: 45000 },
  () => {
    const g = createGame({ seed: 7 }),
      times = [];
    for (let n = 0; n < 4800 && g.mode === "playing"; n++) {
      const start = performance.now();
      stepGame(g, 0.05);
      times.push(performance.now() - start);
      for (const p of g.players) {
        assert.ok(containsRegion(g.world, p.x, p.y));
        assert.ok(p.stroke.length <= 4096);
      }
    }
    assert.ok(g.time > 120, "long-term geometry is actually exercised");
    for (let i = 0; i < g.territories.length; i++)
      for (let j = i + 1; j < g.territories.length; j++)
        assert.ok(
          regionArea(intersection(g.territories[i], g.territories[j])) < 1e-7,
        );
    times.sort((a, b) => a - b);
    const median = times[Math.floor(times.length * 0.5)],
      p95 = times[Math.floor(times.length * 0.95)];
    assert.ok(median < 10, "ordinary movement remains inexpensive");
    assert.ok(p95 < 80, "captures avoid former decimal-only frame stalls");
    console.log(
      "vector long-run",
      JSON.stringify({
        seconds: g.time,
        steps: times.length,
        median,
        p95,
        max: times.at(-1),
      }),
    );
  },
);
