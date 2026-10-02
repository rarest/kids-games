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
