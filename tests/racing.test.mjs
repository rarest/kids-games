import test from "node:test";
import assert from "node:assert/strict";
import {
  TRACKS,
  CARS,
  SKINS,
  makeTrack,
  roadAt,
  newRace,
  stepRace,
  standings,
  newProfile,
  readProfile,
  purchase,
  equip,
  settleRace,
} from "../racing/core.js";
test("fourteen winding routes are continuous and elevated, mixed circuit includes five environments", () => {
  assert.equal(TRACKS.length, 14);
  for (const spec of TRACKS) {
    const t = makeTrack(spec.id);
    assert.ok(t.length > 1000);
    const a = roadAt(t, 0),
      b = roadAt(t, t.length);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.001);
    assert.ok(
      Math.max(...t.points.map((p) => p.y)) -
        Math.min(...t.points.map((p) => p.y)) >
        12,
    );
    assert.equal(
      new Set(t.points.map((p) => p.biome)).size,
      spec.id === "tour" ? 5 : 1,
    );
  }
});
test("eleven competitors race, brake and lose speed on grass, and pause never advances simulation", () => {
  const r = newRace("tour", "apex");
  assert.equal(r.cars.length, 11);
  r.countdown = 0;
  for (let i = 0; i < 180; i++) stepRace(r, { throttle: true }, 1 / 60);
  assert.ok(r.cars[0].s > 30);
  assert.ok(r.cars.slice(1).every((c) => c.s > 0));
  const speed = r.cars[0].speed;
  for (let i = 0; i < 60; i++) stepRace(r, { brake: true }, 1 / 60);
  assert.ok(r.cars[0].speed < speed / 2);
  r.paused = true;
  const s = r.cars[0].s;
  stepRace(r, { throttle: true }, 1);
  assert.equal(r.cars[0].s, s);
});
test("nitro is limited, steering moves the car and collisions do not teleport progress", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  r.cars[0].speed = 50;
  r.cars.slice(1).forEach((c, i) => (c.s = -100 - i * 10));
  for (let i = 0; i < 600; i++)
    stepRace(r, { throttle: true, boost: true, steer: 1 }, 1 / 60);
  assert.ok(r.cars[0].offset > 8);
  assert.ok(r.cars[0].speed < 45);
  assert.ok(r.cars[0].nitro >= 0 && r.cars[0].nitro <= 100);
  assert.ok(r.cars.every((c) => Number.isFinite(c.s)));
});
test("finish place uses crossing time, first three alone are awarded exactly once", () => {
  for (const [place, reward] of [
    [1, 3000],
    [2, 1500],
    [3, 700],
    [4, 0],
    [11, 0],
  ]) {
    const r = newRace("tour", "apex"),
      p = newProfile();
    r.cars.forEach((c, i) => {
      c.finished = i === 0 ? place : i < place ? i : i + 1;
      c.finishTime = c.finished;
    });
    r.status = "finished";
    assert.equal(standings(r)[place - 1].id, 0);
    const before = p.coins;
    assert.equal(settleRace(p, r), reward);
    assert.equal(p.coins, before + reward);
    assert.equal(settleRace(p, r), 0);
    assert.equal(p.coins, before + reward);
  }
});
test("same simulation step orders finishes by exact crossing, no prize before finish", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  r.cars.forEach((c, i) => {
    c.s = r.track.length * r.laps - 1000;
    c.offset = -6 + i;
  });
  r.cars[0].s = r.track.length * r.laps - 1;
  r.cars[0].speed = 40;
  r.cars[1].s = r.track.length * r.laps - 0.1;
  r.cars[1].speed = 40;
  r.cars[1].offset = 6;
  stepRace(r, { throttle: true }, 0.05);
  assert.equal(r.cars[1].finished, 1);
  assert.equal(r.cars[0].finished, 2);
  const r2 = newRace("tour", "apex");
  assert.equal(settleRace(newProfile(), r2), 0);
});
test("shop cannot overspend, buy twice, or equip locked items; malformed saves recover", () => {
  const p = newProfile();
  assert.equal(purchase(p, "cars", CARS[3].id), false);
  assert.equal(equip(p, "cars", CARS[3].id), false);
  p.coins = 10000;
  assert.equal(purchase(p, "cars", CARS[3].id), true);
  const coins = p.coins;
  assert.equal(purchase(p, "cars", CARS[3].id), false);
  assert.equal(p.coins, coins);
  assert.equal(equip(p, "cars", CARS[3].id), true);
  assert.equal(readProfile("{bad").car, "apex");
  const saved = readProfile(JSON.stringify(p));
  assert.equal(saved.car, CARS[3].id);
  assert.equal(saved.coins, p.coins);
  assert.equal(
    readProfile(JSON.stringify({ coins: -50, cars: ["bad"], skin: "bad" }))
      .coins,
    0,
  );
  assert.ok(SKINS.length >= 6);
});
test("civilian traffic collides with AI as well as the player", () => {
  const r = newRace("tour", "apex");
  r.countdown = 0;
  const s = r.track.points.find((p) => p.biome === 4).s + 30;
  r.cars.forEach((c, i) => {
    c.s = s - 200 - i * 9;
    c.offset = 0;
  });
  const ai = r.cars[1];
  ai.s = s;
  ai.offset = 5.8;
  ai.speed = 40;
  r.traffic = [{ s, offset: 5.8, speed: 21 }];
  stepRace(r, { throttle: true }, 1 / 60);
  assert.ok(ai.cooldown > 0);
  assert.ok(ai.speed < 30);
});
test("single-theme routes keep their own environment for the whole course", () => {
  for (const spec of TRACKS.filter((t) => t.id !== "tour" && !t.theme)) {
    const t = makeTrack(spec.id),
      counts = Array.from(
        { length: 5 },
        (_, b) => t.points.filter((p) => p.biome === b).length,
      );
    assert.ok(
      counts[spec.phase] > t.points.length * 0.5,
      `${spec.id} needs a majority home biome`,
    );
  }
});
test("podium is settled only after three actual finishers, preserving player crossing time", async () => {
  const { completePodium } = await import("../racing/core.js");
  const r = newRace("tour", "apex");
  r.countdown = 0;
  r.cars[0].s = r.track.length * r.laps - 0.1;
  r.cars[0].speed = 40;
  stepRace(r, { throttle: true }, 1 / 60);
  const crossing = r.cars[0].finishTime;
  assert.equal(r.status, "racing");
  assert.equal(settleRace(newProfile(), r), 0);
  completePodium(r);
  assert.equal(r.status, "finished");
  assert.equal(r.cars[0].finishTime, crossing);
  assert.equal(
    standings(r)
      .slice(0, 3)
      .filter((c) => c.finished).length,
    3,
  );
  assert.equal(settleRace(newProfile(), r), 3000);
});
test("road curvature integrates a full turn and steering is needed to stay on the road", () => {
  const track = makeTrack("tour");
  let total = 0;
  for (let s = 0; s < track.length; s += 1) total += roadAt(track, s).curvature;
  assert.ok(Math.abs(total - Math.PI * 2) < 0.1);
  const r = newRace("tour", "apex");
  r.hazards = [];
  r.countdown = 0;
  for (let i = 0; i < 3300 && !r.cars[0].finished; i++)
    stepRace(r, { throttle: true }, 1 / 60);
  assert.ok(
    Math.abs(r.cars[0].offset) > 8,
    "unsteered car runs wide in corners",
  );
});
test("busy highway has civilian traffic from the start and keeps it in the urban section", () => {
  for (const spec of TRACKS) {
    const r = newRace(spec.id, "apex");
    r.countdown = 0;
    assert.ok(
      r.traffic.every((t) => [4, 6].includes(roadAt(r.track, t.s).biome)),
    );
    for (let i = 0; i < 2000; i++) stepRace(r, { throttle: true }, 1 / 60);
    assert.ok(
      r.traffic.every((t) => [4, 6].includes(roadAt(r.track, t.s).biome)),
    );
  }
});
