import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { makeTrack, roadAt } from "../racing/core.js";
import { makePine, makeBroadleaf, buildFlora } from "../racing/flora.js";

function dispose(parent) {
  const geometries = new Set(), materials = new Set();
  parent.traverse((mesh) => {
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material) materials.add(mesh.material);
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}

function validMeshes(parent) {
  parent.traverse((mesh) => {
    if (!mesh.isMesh) return;
    assert.ok(mesh.geometry.attributes.position.count > 0);
    for (const name of ["position", "normal", "uv"])
      assert.ok([...mesh.geometry.attributes[name].array].every(Number.isFinite), name);
    assert.ok(mesh.material.isMeshStandardMaterial);
    assert.ok(mesh.castShadow && mesh.receiveShadow);
  });
}

test("welcoming pine has a bent trunk and a wide, flattened, asymmetric crown", () => {
  const pine = makePine(), box = new THREE.Box3().setFromObject(pine);
  assert.ok(pine.children.length <= 3, "a tree shares only a few material draws");
  assert.ok(box.min.y >= -0.05 && box.max.y > 5);
  const foliage = pine.children.filter((m) => m.name.includes("crown"));
  assert.ok(foliage.length >= 1);
  const crown = new THREE.Box3();
  for (const mesh of foliage) crown.expandByObject(mesh);
  const size = crown.getSize(new THREE.Vector3());
  assert.ok(size.x > 5.5 && size.x > size.y * 1.6, "cloud boughs spread sideways");
  assert.ok(crown.max.x > Math.abs(crown.min.x) * 1.15, "welcoming branch reaches out");
  const trunk = pine.children.find((m) => m.name.includes("trunk"));
  trunk.geometry.computeBoundingBox();
  assert.ok(trunk.geometry.boundingBox.max.x > 3, "visible curved side branches");
  validMeshes(pine);
  dispose(pine);
});

test("broadleaf tree has a branching crown instead of a single spherical canopy", () => {
  const tree = makeBroadleaf(), bounds = new THREE.Box3().setFromObject(tree);
  assert.ok(tree.children.length <= 3);
  assert.ok(bounds.min.y >= -0.05 && bounds.max.y > 6);
  const trunk = tree.children.find((m) => m.name.includes("trunk"));
  trunk.geometry.computeBoundingBox();
  assert.ok(trunk.geometry.boundingBox.max.x - trunk.geometry.boundingBox.min.x > 3);
  assert.ok(bounds.max.x - bounds.min.x > 5);
  validMeshes(tree);
  dispose(tree);
});

for (const theme of ["china", "gorge"])
  test(`${theme} roadside flora stays clear of driving lanes and stands on stone islands`, () => {
    const track = makeTrack(theme);
    const parent = new THREE.Group(), counts = buildFlora(parent, track);
    assert.ok(counts.trees > 24 && counts.pines > 20);
    assert.ok(counts.shrubs > 40 && counts.flowers > 60);
    assert.ok(counts.pines <= counts.trees);
    assert.ok(parent.children.length <= 16, "many plants share a bounded number of draws");
    assert.ok(parent.children.every((mesh) => mesh.isInstancedMesh));
    const ground = parent.children.find((mesh) => mesh.userData.floraKind === "island");
    assert.ok(ground && ground.count >= counts.trees + counts.shrubs);
    const matrix = new THREE.Matrix4(), position = new THREE.Vector3();
    let treeInstances = 0;
    for (const mesh of parent.children) {
      validMeshes(mesh);
      const isTree = mesh.userData.floraKind === "pine" || mesh.userData.floraKind === "tree";
      if (isTree && mesh.name.includes("trunk")) treeInstances += mesh.count;
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, matrix);
        assert.ok(matrix.elements.every(Number.isFinite));
        position.setFromMatrixPosition(matrix);
        let nearest = Infinity;
        for (const p of track.points)
          nearest = Math.min(nearest, Math.hypot(p.x - position.x, p.z - position.z));
        assert.ok(nearest >= 11.5, "plants and flowerbeds stay outside the road");
      }
    }
    assert.equal(treeInstances, counts.trees);
    dispose(parent);
  });

test("cloud-world trunks, shrubs and flower stems touch the top of their own planting island", () => {
  const parent = new THREE.Group();
  buildFlora(parent, makeTrack("china"));
  const island = parent.children.find((mesh) => mesh.userData.floraKind === "island"),
    matrix = new THREE.Matrix4(), origin = new THREE.Vector3(), bases = [];
  for (let i = 0; i < island.count; i++) {
    island.getMatrixAt(i, matrix);
    bases.push(new THREE.Vector3().setFromMatrixPosition(matrix));
  }
  for (const mesh of parent.children.filter((mesh) =>
    mesh.name.includes("trunk") || mesh.name === "shrub-dark" || mesh.name === "flower-stem"))
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix);
      origin.setFromMatrixPosition(matrix);
      const base = bases.find((p) => Math.hypot(origin.x - p.x, origin.z - p.z) < 0.01);
      assert.ok(base, "each plant owns a supporting stone island");
      assert.ok(Math.abs(origin.y - base.y - 0.065) < 0.0001, "root height matches the soil top");
    }
  dispose(parent);
});

test("three-dimensional flower clusters use a small mesh budget even when repeated hundreds of times", () => {
  const parent = new THREE.Group();
  buildFlora(parent, makeTrack("china"));
  const flowerParts = parent.children.filter((mesh) => mesh.userData.floraKind === "flower");
  const triangles = flowerParts.reduce((total, mesh) => total + mesh.geometry.index.count / 3, 0);
  assert.ok(triangles <= 600, "each three-flower clump stays inexpensive");
  dispose(parent);
});

test("natural routes receive layered trees, shrubs and flowers rooted in the grass shoulder", () => {
  const track = makeTrack("plateau"), parent = new THREE.Group();
  const counts = buildFlora(parent, track);
  assert.ok(counts.trees > 10 && counts.shrubs > 20 && counts.flowers > 30);
  assert.ok(parent.children.length <= 15);
  assert.ok(!parent.children.some((mesh) => mesh.userData.floraKind === "island"));
  const trunk = parent.children.find((mesh) => mesh.name.includes("trunk"));
  const matrix = new THREE.Matrix4(), base = new THREE.Vector3();
  for (let i = 0; i < trunk.count; i++) {
    trunk.getMatrixAt(i, matrix);
    base.setFromMatrixPosition(matrix);
    const nearest = track.points.reduce((best, point) =>
      Math.hypot(point.x - base.x, point.z - base.z) <
      Math.hypot(best.x - base.x, best.z - base.z) ? point : best);
    const p = roadAt(track, nearest.s), offset = Math.hypot(p.x - base.x, p.z - base.z);
    assert.ok(Math.abs(base.y - (p.y - Math.max(0, offset - 9) * 0.075)) < 1.5);
  }
  validMeshes(parent);
  dispose(parent);
});

test("industrial, ocean and aerial fantasy worlds do not receive misplaced terrestrial plants", () => {
  for (const theme of ["tunnel", "cyber", "sky", "container", "ocean", "ship"]) {
    const track = makeTrack("china"), parent = new THREE.Group();
    track.spec = { ...track.spec, theme };
    assert.deepEqual(buildFlora(parent, track), { trees: 0, shrubs: 0, flowers: 0, pines: 0 });
    assert.equal(parent.children.length, 0);
  }
});
