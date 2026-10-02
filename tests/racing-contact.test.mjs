import test from "node:test";
import assert from "node:assert/strict";
import { newRace, stepRace } from "../racing/core.js";
import { separateCars, carSize } from "../racing/contact.js";
test("solid car bodies separate even during their impact cooldown", () => {
  const r = newRace("tour", "apex"),
    [a, b] = r.cars;
  a.s = b.s = 100;
  a.offset = b.offset = 0;
  a.cooldown = b.cooldown = 0.5;
  for (let i = 0; i < 3; i++) separateCars(a, b, r.track.length);
  assert.ok(
    Math.abs(a.offset - b.offset) >=
      (carSize(a).width + carSize(b).width) / 2 - 0.001,
  );
  assert.equal(a.s, 100);
  assert.equal(b.s, 100);
});
test("front-to-back contact leaves a real gap and brakes the following car", () => {
  const r = newRace("tour", "apex"),
    [a, b] = r.cars;
  a.s = 102;
  b.s = 100;
  a.offset = b.offset = 0;
  a.speed = 20;
  b.speed = 50;
  separateCars(a, b, r.track.length);
  assert.ok(
    Math.abs(a.s - b.s) >= (carSize(a).length + carSize(b).length) / 2 - 0.001,
  );
  assert.ok(b.speed <= 20);
});
test("lapped racers collide at their shared physical track position", () => {
  const r = newRace("tour", "apex"),
    [a, b] = r.cars;
  a.s = 100;
  b.s = 100 + r.track.length;
  a.offset = b.offset = 0;
  separateCars(a, b, r.track.length);
  assert.ok(Math.abs(a.offset - b.offset) > 2);
});
test("cars that finished leave the racing lane and never block a following racer", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  r.hazards = [];
  r.traffic = [];
  const [a, b] = r.cars;
  a.s = r.track.length * r.laps;
  a.finished = 1;
  a.finishTime = 1;
  b.s = a.s - 4;
  b.speed = 45;
  b.offset = 0;
  r.cars.slice(2).forEach((c, i) => {
    c.s = 100 + i * 10;
  });
  stepRace(r, { throttle: true }, 1 / 60);
  assert.ok(b.speed > 40);
});
