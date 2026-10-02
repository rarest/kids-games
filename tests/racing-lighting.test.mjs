import test from "node:test";
import assert from "node:assert/strict";
import { lightingState } from "../racing/lighting.js";

test("manual lighting stays fixed regardless of race time and the map theme", () => {
  for (const mode of ["dawn", "noon", "sunset", "night"]) {
    assert.deepEqual(lightingState(mode, 0), lightingState(mode, 87, true));
    assert.equal(lightingState(mode, 0).mode, mode);
  }
});

test("automatic lighting visits all four periods in a normal race and starts night maps at night", () => {
  for (const [time, period] of [[0, "dawn"], [32, "noon"], [64, "sunset"], [96, "night"]]) {
    const automatic = lightingState("auto", time);
    const manual = lightingState(period, 0);
    assert.deepEqual(automatic.sunColor, manual.sunColor);
    assert.deepEqual(automatic.sunDirection, manual.sunDirection);
    assert.equal(automatic.sunIntensity, manual.sunIntensity);
  }
  assert.deepEqual(lightingState("auto", 0, true).skyTop, lightingState("night", 0).skyTop);
  assert.deepEqual(lightingState("auto", 128), lightingState("auto", 0));
});

test("sun, sky and reflections remain continuous across each time boundary and the cycle seam", () => {
  for (const boundary of [0, 32, 64, 96, 128]) {
    const before = lightingState("auto", boundary - 0.001);
    const after = lightingState("auto", boundary + 0.001);
    for (const field of ["sunColor", "sunDirection", "ambientSky", "ambientGround", "skyTop", "skyHorizon", "skyBottom", "fogColor"])
      for (let i = 0; i < 3; i++) assert.ok(Math.abs(before[field][i] - after[field][i]) < 0.001, field);
    for (const field of ["sunIntensity", "ambientIntensity", "fogDensity", "exposure", "stars", "neonIntensity"])
      assert.ok(Math.abs(before[field] - after[field]) < 0.001, field);
  }
  const halfway = lightingState("auto", 16);
  assert.equal(halfway.envFrom, "dawn");
  assert.equal(halfway.envTo, "noon");
  assert.ok(Math.abs(halfway.envMix - 0.5) < 1e-8);
});

test("warm low-angle dawn and sunset produce longer shadows than noon while night enables stars and neon", () => {
  const dawn = lightingState("dawn", 0), noon = lightingState("noon", 0), sunset = lightingState("sunset", 0), night = lightingState("night", 0);
  for (const warm of [dawn, sunset]) {
    assert.ok(warm.sunColor[0] > warm.sunColor[2] * 2);
    assert.ok(warm.sunDirection[1] < noon.sunDirection[1] * 0.4);
    assert.ok(Math.abs(warm.sunDirection[0]) > 0.5);
  }
  assert.ok(dawn.sunDirection[0] * sunset.sunDirection[0] < 0, "sunrise and sunset cast shadows in different directions");
  assert.ok(night.sunIntensity < noon.sunIntensity * 0.25);
  assert.ok(night.stars > 0.9 && noon.stars === 0);
  assert.ok(night.neonIntensity > noon.neonIntensity * 4);
});

test("lighting inputs produce finite independent states with normalized celestial directions", () => {
  for (const time of [-100000, -1, 0, 18, 1e9, NaN, Infinity]) {
    const state = lightingState("auto", time);
    assert.ok(Object.values(state).flat().filter((v) => typeof v === "number").every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...state.sunDirection) - 1) < 1e-10);
  }
  assert.deepEqual(lightingState("unknown", 0), lightingState("auto", 0));
  const changed = lightingState("dawn", 0);
  changed.sunColor[0] = 0;
  assert.ok(lightingState("dawn", 0).sunColor[0] > 0.5);
});
