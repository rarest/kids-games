import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  surfaceMaterial,
  surfaceTextures,
  isSurfaceTexture,
  qualitySettings,
  rockGeometry,
} from "../racing/materials.js";

test("surface details use shared sRGB color maps and linear roughness and tangent normals", () => {
  for (const kind of [
    "asphalt",
    "paving",
    "stone",
    "grass",
    "bark",
    "leaves",
    "metal",
    "carbon",
    "rubber",
    "paint",
    "water",
  ]) {
    const pack = surfaceTextures(kind);
    assert.equal(surfaceTextures(kind), pack);
    assert.equal(pack.map.colorSpace, THREE.SRGBColorSpace);
    for (const map of [pack.map, pack.normalMap, pack.roughnessMap]) {
      assert.ok(isSurfaceTexture(map));
      assert.equal(map.wrapS, THREE.RepeatWrapping);
      assert.equal(map.minFilter, THREE.LinearMipmapLinearFilter);
      assert.equal(map.image.width, 256);
    }
    assert.equal(pack.normalMap.colorSpace, THREE.NoColorSpace);
    assert.equal(pack.roughnessMap.colorSpace, THREE.NoColorSpace);
    const rough = pack.roughnessMap.image.data;
    assert.ok(
      new Set(rough).size > 8,
      kind + " surface is not uniformly glossy",
    );
    const normal = pack.normalMap.image.data;
    for (let i = 0; i < normal.length; i += 256) {
      const x = normal[i] / 127.5 - 1,
        y = normal[i + 1] / 127.5 - 1,
        z = normal[i + 2] / 127.5 - 1;
      assert.ok(Math.abs(Math.hypot(x, y, z) - 1) < 0.015 && z > 0, kind);
    }
  }
});

test("rock, rubber and metal respond differently to light while retaining caller colors", () => {
  const rock = surfaceMaterial("stone"),
    metal = surfaceMaterial("metal"),
    rubber = surfaceMaterial("rubber");
  assert.ok(rock.roughness > metal.roughness);
  assert.ok(metal.metalness > 0.7 && rubber.metalness === 0);
  assert.ok(
    surfaceMaterial("bark", { color: 0x685245 }).color.getHex() === 0x685245,
  );
  assert.ok(rock.normalMap && rock.roughnessMap && rock.map);
});

test("fine quality increases software clarity without giving software a huge shadow map", () => {
  const auto = qualitySettings("auto", true, false, 2),
    fine = qualitySettings("high", true, false, 2),
    low = qualitySettings("low", true, false, 2);
  assert.ok(
    fine.ratio >= 1 && fine.ratio > auto.ratio && auto.ratio > low.ratio,
  );
  assert.equal(fine.shadowSize, 1024);
  assert.equal(qualitySettings("high", false, true, 3).ratio, 2);
  assert.ok(
    qualitySettings("high", false, false, 2).anisotropy >
      qualitySettings("low", false, false, 2).anisotropy,
  );
});

test("eroded mountain faces stay inside the original scenery envelope with finite UVs and normals", () => {
  const rock = rockGeometry();
  rock.computeBoundingBox();
  assert.ok(rock.attributes.position.count > 100);
  for (const name of ["position", "normal", "uv"])
    assert.ok([...rock.attributes[name].array].every(Number.isFinite));
  const b = rock.boundingBox;
  assert.ok(
    b.min.x >= -1.001 &&
      b.max.x <= 1.001 &&
      b.min.z >= -1.001 &&
      b.max.z <= 1.001,
  );
  assert.ok(b.min.y >= -0.501 && b.max.y <= 0.501);
  rock.dispose();
});

test("painted color tiles retain the same UV direction as their detail maps", () => {
  const color = new THREE.CanvasTexture({ width: 256, height: 256 });
  const m = surfaceMaterial("stone", { map: color });
  assert.equal(m.map.flipY, m.normalMap.flipY);
  assert.equal(m.map.flipY, m.roughnessMap.flipY);
});
