import test from "node:test";
import assert from "node:assert/strict";
import {
  TRACKS,
  makeTrack,
  roadAt,
  newRace,
  stepRace,
} from "../racing/core.js";
test("fourteen courses have distinct paths and container, ocean, ship and river-gorge worlds", () => {
  assert.equal(TRACKS.length, 14);
  for (const id of ["container", "ocean", "ship", "gorge"])
    assert.ok(TRACKS.some((t) => t.id === id));
  const signatures = TRACKS.map((t) => {
    const r = makeTrack(t.id);
    return r.points
      .filter((_, i) => i % 90 === 0)
      .map(
        (p) =>
          `${Math.round((p.x / t.radius) * 100)},${Math.round((p.z / t.radius) * 100)}`,
      )
      .join(";");
  });
  assert.equal(new Set(signatures).size, 14);
});
test("river canyon, sea bridge and two-level ship route have traversable ramps and no discontinuous deck jumps", () => {
  for (const id of ["gorge", "ocean", "ship", "container"]) {
    const t = makeTrack(id);
    assert.ok(Math.min(...t.points.map((p) => p.y)) >= 5);
    for (let i = 1; i < t.points.length; i++) {
      const a = t.points[i - 1],
        b = t.points[i];
      const pitch = Math.abs(
        Math.atan2(b.y - a.y, Math.hypot(b.x - a.x, b.z - a.z)),
      );
      assert.ok(pitch < 0.45, `${id}: ${pitch}`);
    }
    assert.ok(t.length > 1000);
  }
});
test("each single-theme route is independent, only the mixed circuit combines terrains", () => {
  for (const spec of TRACKS) {
    const t = makeTrack(spec.id);
    assert.equal(
      new Set(t.points.map((p) => p.biome)).size,
      spec.id === "tour" ? 5 : 1,
    );
  }
});
test("leaving an ocean bridge or container roof respawns with the same five second penalty", () => {
  for (const id of ["container", "ocean", "ship"]) {
    const r = newRace(id, "apex");
    r.countdown = 0;
    r.cars[0].offset = 11;
    stepRace(r, { throttle: true }, 1 / 60);
    assert.equal(r.cars[0].respawn, 5);
  }
});
test("full-width road triangles keep facing upwards through every authored bend", () => {
  for (const spec of TRACKS) {
    const track = makeTrack(spec.id);
    let previous;
    for (const point of track.points) {
      const p = roadAt(track, point.s),
        left = { x: p.x - p.nx * 9, z: p.z - p.nz * 9 },
        right = { x: p.x + p.nx * 9, z: p.z + p.nz * 9 };
      if (previous) {
        const cross = (a, b, c) =>
          (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
        assert.ok(
          cross(previous.left, left, previous.right) > 0,
          `${spec.id} folded inner bend at ${point.s}`,
        );
        assert.ok(
          cross(previous.right, left, right) > 0,
          `${spec.id} folded outer bend at ${point.s}`,
        );
      }
      previous = { left, right };
    }
  }
});
