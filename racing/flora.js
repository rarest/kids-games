import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { roadAt } from "./core.js";
import { surfaceMaterial } from './materials.js';

const TAU = Math.PI * 2;
const material = (color, extra = {}) =>
  surfaceMaterial('leaves',{ color, roughness: 0.95, ...extra });

function branch(points, radius, segments = 12, sides = 7) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    geometry = new THREE.TubeGeometry(curve, segments, radius, sides, false),
    positions = geometry.attributes.position;
  // Taper each curved ring toward the tip, retaining the curve rather than a straight cone.
  for (let ring = 0; ring <= segments; ring++) {
    const center = curve.getPointAt(ring / segments), taper = 1 - (ring / segments) * 0.72;
    for (let j = 0; j <= sides; j++) {
      const i = ring * (sides + 1) + j;
      positions.setXYZ(i,
        center.x + (positions.getX(i) - center.x) * taper,
        center.y + (positions.getY(i) - center.y) * taper,
        center.z + (positions.getZ(i) - center.z) * taper);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function oval(x, y, z, width, height, depth, rotation = 0) {
  const geometry = new THREE.SphereGeometry(1, 9, 6);
  geometry.scale(width, height, depth);
  geometry.rotateY(rotation);
  geometry.translate(x, y, z);
  return geometry;
}

function mergedMesh(parts, mat, name) {
  const mesh = new THREE.Mesh(mergeGeometries(parts, false), mat);
  parts.forEach((g) => g.dispose());
  mesh.name = name;
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

export function makePine() {
  const tree = new THREE.Group(), wood = surfaceMaterial('bark',{color:0x685245}),
    dark = material(0x204c3a), light = material(0x44774d);
  const trunk = [branch([[0, 0.24, 0], [0.22, 1.5, 0.1], [-0.3, 2.8, 0.15],
    [0.6, 4.2, -0.16], [1.18, 5.4, 0], [1.55, 6.18, -0.1]], 0.32, 22)];
  // The outstretched bough is the welcoming-pine silhouette; the smaller limbs balance it.
  for (const [points, radius] of [
    [[[0.1, 2.7, 0.1], [1.3, 3.35, 0.15], [3.2, 3.5, 0.05], [5.1, 4.05, 0]], 0.2],
    [[[0.58, 4.2, -0.16], [-0.5, 4.45, 0.1], [-1.65, 4.85, 0.05]], 0.16],
    [[[1.1, 5.3, 0], [2.25, 5.3, 0.25], [3.45, 5.65, 0.3]], 0.13],
    [[[0.55, 4.12, -0.1], [0.85, 4.6, -1.1], [1.45, 4.92, -1.85]], 0.13],
    [[[1.45, 6, -0.08], [0.8, 6.25, 0.1], [0.2, 6.3, 0.3]], 0.09],
  ]) trunk.push(branch(points, radius));
  for (const angle of [0, 2.1, 4.2])
    trunk.push(branch([[0, 0.24, 0], [Math.cos(angle) * 0.45, 0.16, Math.sin(angle) * 0.45],
      [Math.cos(angle) * 0.85, 0.055, Math.sin(angle) * 0.85]], 0.15, 6));
  const crowns = [[], []];
  for (const [x, y, z, w, h, d, tone] of [
    [4.6, 4.18, 0, 1.62, 0.48, 1.18, 0], [3.12, 3.98, 0.16, 1.25, 0.38, 1.02, 1],
    [5.18, 4.27, -0.36, 0.95, 0.35, 0.92, 1], [-1.45, 4.98, 0, 1.48, 0.45, 1.1, 0],
    [-0.25, 5.1, 0.15, 1.05, 0.35, 0.85, 1], [3.25, 5.72, 0.32, 1.58, 0.4, 1.15, 0],
    [2.12, 5.77, 0.26, 1.13, 0.32, 0.98, 1], [1.48, 5.07, -1.6, 1.28, 0.36, 0.96, 0],
    [0.28, 6.38, 0.24, 1.45, 0.43, 1.02, 0], [1.35, 6.48, -0.14, 1.22, 0.35, 0.95, 1],
  ]) crowns[tone].push(oval(x, y, z, w, h, d));
  tree.add(mergedMesh(trunk, wood, "pine-trunk"),
    mergedMesh(crowns[0], dark, "pine-crown-dark"),
    mergedMesh(crowns[1], light, "pine-crown-light"));
  tree.name = "welcoming-pine";
  return tree;
}

export function makeBroadleaf() {
  const tree = new THREE.Group(), trunk = [branch([[0, 0.25, 0], [-0.2, 1.5, 0.05],
    [0.14, 2.9, -0.08], [-0.05, 4.25, 0.12], [0.6, 5.55, 0.2]], 0.32, 18)],
    crowns = [[], []];
  for (const [x, y, z, w, h, d, tone] of [
    [-1.85, 4.88, -0.15, 1.65, 1.3, 1.45, 0], [1.85, 5.35, 0.35, 1.58, 1.4, 1.5, 1],
    [0.4, 6.0, -0.45, 1.85, 1.5, 1.6, 0], [-0.45, 4.85, 1.55, 1.48, 1.25, 1.3, 1],
    [0.1, 5.1, -1.6, 1.55, 1.4, 1.3, 1],
  ]) {
    trunk.push(branch([[0.04, 2.65, 0], [x * 0.45, y * 0.72, z * 0.45], [x, y - 0.35, z]], 0.16));
    crowns[tone].push(oval(x, y, z, w, h, d));
  }
  for (const angle of [0, 2.1, 4.2])
    trunk.push(branch([[0, 0.25, 0], [Math.cos(angle) * 0.52, 0.13, Math.sin(angle) * 0.52],
      [Math.cos(angle) * 0.85, 0.05, Math.sin(angle) * 0.85]], 0.14, 6));
  tree.add(mergedMesh(trunk, surfaceMaterial('bark',{color:0x685344}), "tree-trunk"),
    mergedMesh(crowns[0], material(0x396044), "tree-crown-dark"),
    mergedMesh(crowns[1], material(0x6f8c46), "tree-crown-light"));
  tree.name = "branching-broadleaf";
  return tree;
}

function makeShrub() {
  const shrub = new THREE.Group(), crowns = [[], []];
  for (const [x, y, z, w, h, d, tone] of [
    [-0.7, 0.63, 0, 0.82, 0.6, 0.82, 0], [0.55, 0.78, 0.1, 0.92, 0.75, 0.8, 1],
    [0, 1, -0.45, 0.9, 0.92, 0.7, 0], [0.12, 0.54, 0.58, 0.82, 0.5, 0.6, 1],
  ]) crowns[tone].push(oval(x, y, z, w, h, d));
  shrub.add(mergedMesh(crowns[0], material(0x315d43), "shrub-dark"),
    mergedMesh(crowns[1], material(0x7a9951), "shrub-light"));
  return shrub;
}

function petal(x, y, z, length, width, height, angle) {
  // A closed, gently folded petal has depth and a pointed silhouette with only eight triangles.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([
    0, 0, 0, length * 0.4, 0, -width, length, height * 0.35, 0,
    length * 0.4, 0, width, length * 0.45, height, 0, length * 0.45, -height * 0.2, 0,
  ], 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute([
    0, 0.5, 0.4, 0, 1, 0.5, 0.4, 1, 0.45, 0.5, 0.45, 0.5,
  ], 2));
  geometry.setIndex([0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0,
    0, 1, 5, 1, 2, 5, 2, 3, 5, 3, 0, 5]);
  geometry.computeVertexNormals();
  geometry.rotateY(-angle);
  geometry.translate(x, y, z);
  return geometry;
}

function makeFlowers(fantasy) {
  const flowers = new THREE.Group(), stems = [], petals = [], centers = [];
  for (let f = 0; f < 3; f++) {
    const x = Math.cos(f * 2.3) * 0.35, z = Math.sin(f * 2.3) * 0.35,
      height = (fantasy ? 1.1 : 0.55) + f * 0.18;
    stems.push(branch([[x, 0.06, z], [x - 0.12, height * 0.55, z + 0.08], [x, height, z]], 0.035, 5, 4));
    for (const side of [-1, 1])
      stems.push(petal(x - 0.08, height * 0.45, z, 0.45, 0.11, 0.12, side < 0 ? Math.PI : 0));
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * TAU, size = fantasy ? 0.33 : 0.2;
      petals.push(petal(x, height + 0.015, z, size * 1.55, size * 0.5, size * 0.28, angle));
    }
    const center = new THREE.SphereGeometry(1, 6, 3), radius = fantasy ? 0.14 : 0.09;
    center.scale(radius, 0.09, radius);
    center.translate(x, height + 0.1, z);
    centers.push(center);
  }
  flowers.add(mergedMesh(stems, material(0x4f8150), "flower-stem"),
    mergedMesh(petals, material(0xffffff, { emissive: fantasy ? 0x532651 : 0x000000,
      emissiveIntensity: 0.18, roughness: 0.68 }), "flower-petals"),
    mergedMesh(centers, material(0xf3c46a), "flower-center"));
  return flowers;
}

function grassGeometry() {
  const blades = [];
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * TAU, geometry = new THREE.ConeGeometry(0.085, 0.8 + (i % 3) * 0.17, 3);
    geometry.translate(0, 0.4, 0);
    geometry.rotateZ(0.15 + (i % 3) * 0.12);
    geometry.rotateY(angle);
    geometry.translate(Math.cos(angle) * 0.16, 0.035, Math.sin(angle) * 0.16);
    blades.push(geometry);
  }
  const merged = mergeGeometries(blades, false);
  blades.forEach((g) => g.dispose());
  return merged;
}

function batch(parent, prototype, rows, kind) {
  if (!rows.length) {
    prototype.traverse((mesh) => { mesh.geometry?.dispose(); mesh.material?.dispose(); });
    return;
  }
  const transform = new THREE.Object3D();
  for (const part of prototype.children) {
    const mesh = new THREE.InstancedMesh(part.geometry, part.material, rows.length);
    mesh.name = part.name;
    mesh.userData.floraKind = kind;
    mesh.castShadow = mesh.receiveShadow = true;
    rows.forEach((row, i) => {
      transform.position.set(row.x, row.y, row.z);
      transform.rotation.set(0, row.rot, 0);
      transform.scale.set(row.w, row.h, row.d);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
      if (part.name === "flower-petals") mesh.setColorAt(i, new THREE.Color(row.color));
    });
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    parent.add(mesh);
  }
  // Every retained geometry/material now belongs to parent and scene.clear releases it.
  prototype.clear();
}

export function buildFlora(parent, track) {
  const theme = track.spec.theme, counts = { trees: 0, shrubs: 0, flowers: 0, pines: 0 };
  if (theme && theme !== "china" && theme !== "gorge") return counts;
  const fantasy = !!theme, pineRows = [], treeRows = [], shrubs = [], flowers = [],
    grasses = [], islands = [], moss = [];
  let seed = 137;
  for (const c of track.spec.id || "flora") seed = Math.imul(seed, 31) + c.charCodeAt(0);
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function place(s, side, offset, scale, radius, tree = false) {
    const p = roadAt(track, s), row = {
      x: p.x + p.nx * side * offset,
      y: p.y - (fantasy ? 0 : Math.max(0, offset - 9) * 0.075),
      z: p.z + p.nz * side * offset,
      rot: p.theta + (tree ? (side > 0 ? Math.PI : 0) : random() * TAU),
      w: scale, h: scale * (0.9 + random() * 0.2), d: scale,
    };
    // A verge of one hairpin can overlap the next road section. Check the whole route,
    // including the canopy/flowerbed footprint, before creating a supporting island.
    const clearance = 10.5 + (tree ? 6.5 * scale : Math.max(radius, 1.6 * scale));
    if (track.points.some((q) => (q.x - row.x) ** 2 + (q.z - row.z) ** 2 < clearance ** 2))
      return null;
    if (fantasy) {
      islands.push({ ...row, w: radius, h: tree ? 3.1 : 1.15, d: radius * 0.85 });
      moss.push({ ...row, w: radius * 0.98, h: 1, d: radius * 0.83 });
      row.y += 0.065;
    }
    return row;
  }
  for (let s = 14; s < track.length; s += fantasy ? 27 : 48) {
    const p = roadAt(track, s);
    for (const side of [-1, 1]) {
      // Meadow and gorge trees are denser; abandoned and urban verges get small pockets.
      if (!fantasy && p.biome >= 2 && random() < 0.55) continue;
      const scale = (fantasy ? 0.92 : 0.74) + random() * 0.25,
        isPine = fantasy || p.biome === 1 || p.biome === 3,
        row = place(s, side, 19 + random() * 9, scale, 3.3 * scale, true);
      if (row) (isPine ? pineRows : treeRows).push(row);
      if (fantasy && Math.floor(s / 27) % 5 === 0) {
        const broadleaf = place(s + 10, -side, 25 + random() * 4, scale * 0.9, 3.3 * scale, true);
        if (broadleaf) treeRows.push(broadleaf);
      }
    }
  }
  const colors = fantasy ? [0xe2a4df, 0x7fe2e0, 0xbfa4ee, 0xf2b6bc] : [0xf0ca6b, 0xeacfe9, 0xd29edb];
  for (let s = 7; s < track.length; s += fantasy ? 12 : 21)
    for (const side of [-1, 1]) {
      const offset = 12.6 + random() * 4.3,
        flower = place(s, side, offset, 0.75 + random() * 0.45, 1.15);
      if (flower) {
        flower.color = colors[Math.floor(random() * colors.length)];
        flowers.push(flower);
        // Grass shares the flowerbed, so it has a real supporting surface on cloud routes.
        grasses.push({ ...flower, x: flower.x + Math.cos(flower.rot) * 0.45,
          z: flower.z - Math.sin(flower.rot) * 0.45, w: 0.8, h: 0.85, d: 0.8 });
      }
      if (Math.floor(s / (fantasy ? 12 : 21)) % 2 === 0) {
        const shrub = place(s + 4, side, 14.2 + random() * 4.5, 0.7 + random() * 0.45, 1.85);
        if (shrub) shrubs.push(shrub);
      }
    }
  batch(parent, makePine(), pineRows, "pine");
  batch(parent, makeBroadleaf(), treeRows, "tree");
  batch(parent, makeShrub(), shrubs, "shrub");
  batch(parent, makeFlowers(fantasy), flowers, "flower");
  const grass = new THREE.Group();
  grass.add(new THREE.Mesh(grassGeometry(), material(0x7b9c59)));
  grass.children[0].name = "grass-tuft";
  batch(parent, grass, grasses, "grass");
  if (fantasy) {
    const rock = new THREE.CylinderGeometry(1, 0.48, 1, 8, 1);
    rock.translate(0, -0.5, 0);
    const patch = new THREE.CylinderGeometry(1, 1, 0.1, 8);
    patch.translate(0, 0.015, 0);
    for (const [geometry, mat, rows, kind] of [
      [rock, surfaceMaterial('stone',{color:0xb4b5a1}), islands, "island"],
      [patch, surfaceMaterial('grass',{color:0xbbc5a4}), moss, "moss"],
    ]) {
      const prototype = new THREE.Group();
      prototype.add(new THREE.Mesh(geometry, mat));
      prototype.children[0].name = kind;
      batch(parent, prototype, rows, kind);
    }
  }
  counts.pines = pineRows.length;
  counts.trees = pineRows.length + treeRows.length;
  counts.shrubs = shrubs.length;
  counts.flowers = flowers.length;
  return counts;
}
