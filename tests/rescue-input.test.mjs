import test from "node:test";
import assert from "node:assert/strict";
import { createGame, stepGame } from "../rescue/core.js";
import { getLevel } from "../rescue/levels.js";
let createControls;
try {
  ({ createControls } = await import("../rescue/controls.js"));
} catch {}
function setup(players = 2) {
  assert.equal(
    typeof createControls,
    "function",
    "production createControls must exist",
  );
  const target = new EventTarget();
  let pads = [];
  let pauses = 0;
  const controls = createControls({
    target,
    players,
    gamepads: () => pads,
    onPause: () => pauses++,
  });
  const key = (code, down = true) => {
    const e = new Event(down ? "keydown" : "keyup", { cancelable: true });
    Object.assign(e, { code, repeat: false });
    target.dispatchEvent(e);
  };
  return {
    controls,
    target,
    key,
    setPads: (p) => (pads = p),
    get pauses() {
      return pauses;
    },
  };
}
const pad = (index, axes = [0, 0], pressed = []) => ({
  index,
  connected: true,
  mapping: "standard",
  axes,
  buttons: Array.from({ length: 17 }, (_, i) => ({
    pressed: pressed.includes(i),
    value: pressed.includes(i) ? 1 : 0,
  })),
});
test("keys map independently and short taps survive sampling", () => {
  const s = setup();
  s.key("KeyD");
  s.key("ArrowLeft");
  s.key("Space");
  s.key("Space", false);
  s.key("ShiftRight");
  s.key("ShiftRight", false);
  let a = s.controls.sample();
  assert.equal(a[0].move, 1);
  assert.equal(a[1].move, -1);
  assert.equal(a[0].jump, true);
  assert.equal(a[1].action, true);
  assert.equal(a[0].action, false);
  a = s.controls.sample();
  assert.equal(a[0].jump, false);
  assert.equal(a[1].action, false);
  s.controls.dispose();
});
test("brief direction and action taps persist, holds never retrigger", () => {
  const s = setup();
  s.key("KeyD");
  s.key("KeyD", false);
  s.key("KeyE");
  s.key("KeyW");
  assert.equal(s.controls.sample()[0].move, 1);
  let a = s.controls.sample()[0];
  assert.equal(a.move, 0);
  assert.equal(a.action, false);
  assert.equal(a.up, true);
  s.key("KeyE", false);
  s.key("KeyE");
  assert.equal(s.controls.sample()[0].action, true);
  s.controls.dispose();
});
test("clear and blur suppress held actions and discard stale direction", () => {
  const s = setup();
  s.key("Space");
  s.key("KeyD");
  s.controls.clear();
  assert.deepEqual(s.controls.sample()[0], {
    move: 0,
    up: false,
    down: false,
    jump: false,
    action: false,
  });
  s.key("Space");
  assert.equal(s.controls.sample()[0].jump, false);
  s.key("Space", false);
  s.key("Space");
  assert.equal(s.controls.sample()[0].jump, true);
  s.target.dispatchEvent(new Event("blur"));
  assert.equal(s.controls.sample()[0].jump, false);
  s.controls.dispose();
});
test("two standard pads retain distinct indices through hot disconnect", () => {
  const s = setup();
  s.setPads([null, pad(4, [1, -1], [0]), pad(9, [-1, 1], [1])]);
  let a = s.controls.sample();
  assert.equal(a[0].move, 1);
  assert.equal(a[1].move, -1);
  assert.equal(a[0].jump, true);
  assert.equal(a[1].action, true);
  a = s.controls.sample();
  assert.equal(a[0].jump, false);
  assert.equal(a[1].action, false);
  s.setPads([pad(9, [-1, 1], [1])]);
  a = s.controls.sample();
  assert.equal(a[0].move, 0);
  assert.equal(a[1].move, -1);
  s.setPads([pad(2, [1, 0]), pad(9, [-1, 0])]);
  a = s.controls.sample();
  assert.equal(a[0].move, 1);
  assert.equal(a[1].move, -1);
  s.controls.dispose();
});
test("solo takes available index, deadzone and D-pad mapping, Start once", () => {
  const s = setup(1);
  s.setPads([pad(7, [0.1, -0.12], [9, 14, 12])]);
  let a = s.controls.sample()[0];
  assert.equal(a.move, -1);
  assert.equal(a.up, true);
  assert.equal(s.pauses, 1);
  s.controls.sample();
  assert.equal(s.pauses, 1);
  s.setPads([pad(7, [0.1, -0.12])]);
  assert.equal(s.controls.sample()[0].move, 0);
  s.controls.clear();
  s.setPads([pad(7, [0, 0], [0])]);
  assert.equal(s.controls.sample()[0].jump, true);
  s.controls.clear();
  assert.equal(s.controls.sample()[0].jump, false);
  s.controls.dispose();
});
test("two fresh action taps on consecutive slow frames both reach the real core", () => {
  const s = setup(1),
    state = createGame(getLevel("0"));
  s.key("KeyD");
  for (let i = 0; i < 7; i++) stepGame(state, s.controls.sample(), 1 / 30);
  s.key("KeyD", false);
  stepGame(state, s.controls.sample(), 1 / 30);
  s.key("KeyE");
  s.key("KeyE", false);
  stepGame(state, s.controls.sample(), 1 / 30);
  assert.equal(state.players[0].carrying?.id, "s1");
  s.key("KeyE");
  s.key("KeyE", false);
  for (let i = 0; i < 3; i++) stepGame(state, s.controls.sample(), 1 / 30);
  assert.equal(
    state.players[0].carrying,
    null,
    "the second fresh tap must throw rather than disappear as a held edge",
  );
  assert.ok(state.events.some((e) => e.type === "throw"));
  s.controls.dispose();
});
