import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { makeShip } from "../racing/industrial.js";
import { routePoint } from "../racing/routes.js";
test("ferry hull top triangles face outside so its visible skin is not culled", () => {
  const hull = makeShip().children[0],
    g = hull.geometry,
    p = g.attributes.position,
    indices = g.index;
  let tops = 0;
  for (let i = 0; i < indices.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(p, indices.getX(i)),
      b = new THREE.Vector3().fromBufferAttribute(p, indices.getX(i + 1)),
      c = new THREE.Vector3().fromBufferAttribute(p, indices.getX(i + 2));
    if (a.y === 0 && b.y === 0 && c.y === 0) {
      const normal = b.sub(a).cross(c.sub(a)).normalize();
      assert.ok(normal.y > 0.99);
      tops++;
    }
  }
  assert.ok(tops > 3);
});
test("two-level ship bridge crosses at the same plan position with ample vertical separation", () => {
  const lower = routePoint("ship", 2 / 11),
    upper = routePoint("ship", 7 / 11);
  assert.ok(Math.hypot(lower[0] - upper[0], lower[2] - upper[2]) < 0.001);
  assert.ok(upper[1] - lower[1] > 15);
});
