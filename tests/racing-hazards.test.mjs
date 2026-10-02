import test from "node:test";
import assert from "node:assert/strict";
import {
  TRACKS,
  newRace,
  stepRace,
  settleRace,
  newProfile,
  completePodium,
} from "../racing/core.js";
import {
  makeHazards,
  hazardState,
  hazardWarning,
  crashCar,
} from "../racing/hazards.js";
test("eight new worlds supplement the six original routes", () => {
  assert.equal(TRACKS.length, 14);
  assert.deepEqual(
    TRACKS.slice(6, 10).map((t) => t.theme),
    ["tunnel", "cyber", "sky", "china"],
  );
});
test("all tracks have spaced avoidable hazards, a protected start and at least two seconds warning", () => {
  for (const spec of TRACKS) {
    const r = newRace(spec.id, "apex");
    const hs = makeHazards(r.track);
    assert.ok(hs.length >= 5);
    assert.ok(Math.min(...hs.map((h) => h.s)) > r.track.length * 0.18);
    for (const h of hs) {
      assert.ok(h.radius < 3);
      const p = { s: h.s - 160, offset: 0, speed: 73 };
      assert.ok(hazardWarning(r.track, hs, p, 0));
      assert.ok(160 / p.speed > 2);
    }
    assert.ok(hs.some((h) => h.type === "pendulum"));
    assert.ok(hs.some((h) => h.type === "nails"));
  }
});
test("obstacle collision sends the car to the current lap T point and freezes it exactly five seconds", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  const p = r.cars[0];
  r.cars.slice(1).forEach((c, i) => (c.s = -100 - i * 10));
  const h = r.hazards.find((h) => h.type === "barrier");
  p.s = r.track.length + h.s - 1;
  p.offset = h.offset;
  p.speed = 40;
  stepRace(r, { throttle: true }, 1 / 60);
  assert.equal(p.crashes, 1);
  assert.equal(p.s, r.track.length);
  assert.equal(p.respawn, 5);
  for (let i = 0; i < 299; i++)
    stepRace(r, { throttle: true, boost: true, steer: 1 }, 1 / 60);
  assert.equal(p.s, r.track.length);
  assert.equal(p.speed, 0);
  assert.ok(p.respawn > 0);
  for (let i = 0; i < 5; i++) stepRace(r, { throttle: true }, 1 / 60);
  assert.ok(p.s > r.track.length);
  assert.equal(p.crashes, 1);
});
test("all competitors incur the same penalty and can still earn podium prizes", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  const p = r.cars[0],
    ai = r.cars[1];
  p.s = r.track.length * 0.7;
  ai.s = p.s;
  crashCar(r, p, "blade");
  crashCar(r, ai, "blade");
  assert.equal(p.respawn, ai.respawn);
  assert.equal(ai.s, p.s);
  assert.equal(p.respawn, 5);
  p.respawn = 0;
  p.cooldown = 0;
  p.s = r.track.length * r.laps - 0.1;
  p.speed = 40;
  stepRace(r, { throttle: true }, 1 / 60);
  completePodium(r);
  assert.equal(settleRace(newProfile(), r), 3000);
});
test("pendulums and nails are predictable and have clear safe intervals", () => {
  const r = newRace("tunnel", "apex");
  for (const kind of ["pendulum", "nails", "blade"]) {
    const h = r.hazards.find((h) => h.type === kind);
    const states = Array.from({ length: 100 }, (_, i) =>
      hazardState(h, i * 0.1),
    );
    assert.ok(states.some((s) => s.active));
    assert.ok(states.some((s) => !s.active));
    assert.deepEqual(hazardState(h, 2), hazardState(h, 2));
  }
});
test("sky bridge halves are equally traversable, going over an edge triggers respawn", () => {
  const r = newRace("sky", "apex");
  r.countdown = 0;
  r.hazards = [];
  const p = r.cars[0];
  p.offset = -5;
  stepRace(r, { throttle: true }, 1 / 60);
  assert.equal(p.crashes, 0);
  p.offset = 5;
  stepRace(r, { throttle: true }, 1 / 60);
  assert.equal(p.crashes, 0);
  p.offset = 10;
  stepRace(r, { throttle: true }, 1 / 60);
  assert.equal(p.crashes, 1);
  assert.equal(p.respawn, 5);
});
