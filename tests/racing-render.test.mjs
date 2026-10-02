import test from "node:test";
import assert from "node:assert/strict";
import { CARS, SKINS } from "../racing/core.js";
import { makeCar } from "../racing/scene.js";
test("every styled car has valid merged geometry, glossy paint, iridescent patterns and shadow casters", () => {
  for (const car of CARS)
    for (const skin of SKINS) {
      const mesh = makeCar(car, skin);
      assert.ok(mesh.children.length >= 6);
      assert.ok(
        mesh.children.every((m) => m.geometry?.attributes.position.count > 0),
      );
      assert.ok(mesh.children.some((m) => m.castShadow));
      assert.ok(mesh.children.some((m) => m.material.clearcoat === 1));
      assert.ok(
        mesh.children.some((m) => m.material.iridescence === skin.iridescence),
      );
      mesh.traverse((m) => {
        m.geometry?.dispose();
        m.material?.dispose();
      });
    }
});
test("car shell normals face outwards so the bonnet and near-side panels remain visible", () => {
  const car = makeCar(CARS[0], SKINS[0]);
  const paint = car.children.find(
    (m) => m.material.color.getHex() === SKINS[0].color,
  );
  assert.ok(
    paint.geometry.attributes.normal.getX(1) < 0,
    "left body panel faces left",
  );
  assert.ok(paint.geometry.attributes.normal.getY(3) > 0, "bonnet faces up");
});

import * as THREE from "three";
import { makeTrack } from "../racing/core.js";
import { makeHazards, hazardState } from "../racing/hazards.js";
import { buildHazardModels } from "../racing/worlds.js";
test("the visible pendulum ball occupies the exact collision lane throughout its swing", () => {
  const t = makeTrack("china"),
    hazards = makeHazards(t),
    world = new THREE.Group(),
    update = buildHazardModels(world, t, hazards),
    h = hazards.find((h) => h.type === "pendulum"),
    root = world.children[hazards.indexOf(h)];
  let ball;
  root.traverse((o) => {
    if (o.geometry?.type === "SphereGeometry") ball = o;
  });
  for (const time of [0, 1, 2, 3, 4, 5]) {
    update(time);
    world.updateMatrixWorld(true);
    const p = root.worldToLocal(ball.getWorldPosition(new THREE.Vector3())),
      state = hazardState(h, time);
    assert.ok(Math.abs(p.x - state.offset) < 1e-6);
    assert.ok(Math.abs(p.y - state.height) < 1e-6);
  }
});

import { carSize } from "../racing/contact.js";
test("solid collision envelopes cover each car including aero parts and steering yaw", () => {
  for (const model of CARS)
    for (const steer of [-1, 0, 1]) {
      const mesh = makeCar(model, SKINS[0]);
      mesh.rotation.y = steer * 0.13;
      mesh.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(mesh),
        size = carSize({ model, steer });
      assert.ok(
        bounds.max.x <= size.width / 2 && bounds.min.x >= -size.width / 2,
        model.id + " width",
      );
      assert.ok(
        bounds.max.z <= size.length / 2 && bounds.min.z >= -size.length / 2,
        model.id + " length",
      );
    }
});
