import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { roadAt } from "./core.js";
const box = new THREE.BoxGeometry(1, 1, 1);
const material = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...opts });
function instances(parent, geo, mat, rows, shadow = true) {
  if (!rows.length) {
    mat.dispose();
    return;
  }
  const mesh = new THREE.InstancedMesh(geo, mat, rows.length),
    o = new THREE.Object3D();
  rows.forEach((r, i) => {
    o.position.set(r.x, r.y, r.z);
    o.rotation.set(r.pitch || 0, r.rot || 0, r.roll || 0, "YXZ");
    o.scale.set(r.w || 1, r.h || 1, r.d || 1);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    if (r.color !== undefined) mesh.setColorAt(i, new THREE.Color(r.color));
  });
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function paintTexture(paint) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  paint(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function deck(parent, track, mat, left = -9, right = 9, height = 0) {
  const pos = [],
    uv = [],
    indices = [];
  track.points.forEach((p, i) => {
    const q = roadAt(track, p.s);
    for (const side of [left, right]) {
      pos.push(q.x + q.nx * side, q.y + height, q.z + q.nz * side);
      uv.push(side === left ? 0 : 1, p.s / 12);
    }
    if (i < track.points.length - 1) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function water(parent, level) {
  const g = new THREE.PlaneGeometry(3000, 3000, 70, 70);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshPhysicalMaterial({
    color: 0x16728c,
    metalness: 0.36,
    roughness: 0.19,
    clearcoat: 0.75,
    side: THREE.DoubleSide,
  });
  const clock = { value: 0 };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.waveTime = clock;
    shader.vertexShader = "uniform float waveTime;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed.y += .7*sin(position.x*.04+waveTime*.8)+.45*cos(position.z*.055-waveTime*.65);",
      )
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\nobjectNormal=normalize(vec3(-.028*cos(position.x*.04+waveTime*.8),1.,.02475*sin(position.z*.055-waveTime*.65)));",
      );
  };
  m.customProgramCacheKey = () => "racing-water-v1";
  const sea = new THREE.Mesh(g, m);
  sea.position.y = level;
  sea.receiveShadow = true;
  parent.add(sea);
  return (time) => (clock.value = time);
}
export function makeShip() {
  const root = new THREE.Group(),
    hullmat = material(0x254556, { metalness: 0.6 }),
    white = material(0xd8ddd6),
    glass = material(0x173f54, { metalness: 0.6, roughness: 0.2 }),
    red = material(0xae3c2a),
    wood = material(0x9b8a6a);
  const shape = [
      [-22, -58],
      [22, -58],
      [23, 23],
      [12, 52],
      [0, 66],
      [-12, 52],
      [-23, 23],
    ],
    v = [],
    ix = [];
  for (const bottom of [true, false])
    for (const [x, z] of shape)
      v.push(x * (bottom ? 0.75 : 1), bottom ? -6 : 0, z * (bottom ? 0.9 : 1));
  for (let i = 0; i < shape.length; i++) {
    const j = (i + 1) % shape.length;
    ix.push(i, j, i + 7, j, j + 7, i + 7);
  }
  for (let i = 1; i < 6; i++) ix.push(7, 7 + i, 8 + i, 0, i + 1, i);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  for (let i = 0; i < ix.length; i += 3)
    [ix[i + 1], ix[i + 2]] = [ix[i + 2], ix[i + 1]];
  g.setIndex(ix);
  g.computeVertexNormals();
  const hull = new THREE.Mesh(g, hullmat);
  hull.castShadow = hull.receiveShadow = true;
  root.add(hull);
  const add = (mat, x, y, z, w, h, d) => {
    const m = new THREE.Mesh(box, mat);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.castShadow = m.receiveShadow = true;
    root.add(m);
  };
  add(wood, 0, 0.12, 0, 42, 0.25, 110);
  for (const side of [-1, 1]) {
    add(white, side * 16, 4, -22, 8, 8, 31);
    add(glass, side * 16, 5, -22, 8.1, 1.2, 31.1);
    add(red, side * 16, 9, -30, 3, 2, 4);
    for (let z = -50; z < 50; z += 10)
      add(white, side * 21, 1, z, 0.18, 2, 0.18);
    add(white, side * 21, 1.6, 0, 0.16, 0.15, 104);
  }
  root.updateMatrixWorld(true);
  const mergedRoot = new THREE.Group();
  for (const mat of [hullmat, white, glass, red, wood]) {
    const pieces = [];
    root.traverse((o) => {
      if (o.isMesh && o.material === mat) {
        const geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
        if (!geo.attributes.uv)
          geo.setAttribute(
            "uv",
            new THREE.Float32BufferAttribute(
              new Float32Array(geo.attributes.position.count * 2),
              2,
            ),
          );
        pieces.push(geo);
      }
    });
    if (pieces.length) {
      const geometry = mergeGeometries(pieces, false),
        mesh = new THREE.Mesh(geometry, mat);
      mesh.castShadow = mesh.receiveShadow = true;
      mergedRoot.add(mesh);
      pieces.forEach((p) => p.dispose());
    }
  }
  root.traverse((o) => {
    if (o.isMesh && o.geometry !== box) o.geometry.dispose();
  });
  return mergedRoot;
}
export function buildIndustrial(parent, track, landscapeOnly = false) {
  const theme = track.spec.theme,
    seaLevel = Math.min(...track.points.map((p) => p.y)) - 7,
    at = (s, offset = 0, y = 0) => {
      const p = roadAt(track, s);
      return {
        x: p.x + p.nx * offset,
        y: p.y + y,
        z: p.z + p.nz * offset,
        rot: p.theta,
        pitch: -p.pitch,
      };
    };
  const meta = { containers: 0, ships: 0, bridgeTowers: 0, river: 0 };
  let animate = () => {};
  const rails = [],
    posts = [],
    supports = [],
    cables = [];
  const steel = material(0x718993, { metalness: 0.7, roughness: 0.32 });
  if (!landscapeOnly) {
    const road = paintTexture((c) => {
      c.fillStyle = theme === "container" ? "#52636b" : "#343c42";
      c.fillRect(0, 0, 256, 256);
      c.fillStyle = "#ede4b7";
      c.fillRect(7, 0, 3, 256);
      c.fillRect(246, 0, 3, 256);
      c.fillRect(126, 18, 4, 95);
    });
    deck(
      parent,
      track,
      material(0xd5e0df, {
        map: road,
        side: THREE.DoubleSide,
        roughness: 0.88,
      }),
      -9,
      9,
      0.055,
    );
    for (let s = 0; s < track.length; s += 12)
      for (const side of [-1, 1]) {
        rails.push({ ...at(s, side * 9.25, 1), w: 0.16, h: 0.25, d: 12.1 });
        posts.push({ ...at(s, side * 9.25, 0.5), w: 0.16, h: 1, d: 0.15 });
      }
    instances(parent, box, steel, rails);
    instances(parent, box, material(0x6f8592, { metalness: 0.65 }), posts);
  }
  if (theme === "container") {
    const corrugation = paintTexture((c) => {
      c.fillStyle = "#dadad6";
      c.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 16) {
        c.fillStyle = "#a8adb1";
        c.fillRect(x, 0, 2, 256);
        c.fillStyle = "#eff0eb";
        c.fillRect(x + 3, 0, 2, 256);
      }
      c.fillStyle = "#293c49";
      c.font = "bold 24px sans-serif";
      c.fillText("SUMMIT", 20, 100);
      c.font = "14px monospace";
      c.fillText("CARGO / 40H", 20, 127);
    });
    const colors = [0x26768f, 0xc46c32, 0x4c7966, 0x7b4e66, 0xbbb067];
    const rows = [],
      walls = [],
      roofs = [],
      cranes = [];
    for (let s = 0; s < track.length; s += 14) {
      const q = s / track.length;
      for (let i = 0; i < 6; i++) {
        rows.push({
          ...at(s, -7.5 + i * 3, -1.52),
          w: 2.96,
          h: 3,
          d: 14.2,
          color: colors[(i + Math.floor(s / 14)) % 5],
        });
        if (i === 0 || i === 5)
          for (let h = 0; h < 2; h++)
            rows.push({
              ...at(
                s,
                (i === 0 ? -1 : 1) * (15 + (s % 2) * 3),
                -1.5 - h * 3.05,
              ),
              w: 3,
              h: 3,
              d: 13.9,
              color: colors[(i + h) % 5],
            });
      }
      if (q > 0.27 && q < 0.53) {
        for (const side of [-1, 1])
          walls.push({
            ...at(s, side * 9.6, 2.7),
            w: 0.9,
            h: 5.4,
            d: 14.1,
            color: colors[Math.floor(s / 14) % 5],
          });
        roofs.push({
          ...at(s, 0, 5.45),
          w: 20,
          h: 0.25,
          d: 14.1,
          color: 0x486c77,
        });
      }
    }
    instances(
      parent,
      box,
      material(0xffffff, {
        map: corrugation,
        metalness: 0.52,
        roughness: 0.46,
      }),
      rows,
    );
    instances(
      parent,
      box,
      material(0xffffff, { map: corrugation, metalness: 0.52 }),
      walls,
    );
    instances(
      parent,
      box,
      material(0xffffff, { map: corrugation, metalness: 0.52 }),
      roofs,
    );
    meta.containers = rows.length;
    for (let s = 0; s < track.length; s += 250) {
      const a = at(s, 0, 0);
      for (const side of [-1, 1])
        cranes.push({ ...at(s, side * 24, 12), w: 0.8, h: 24, d: 0.8 });
      cranes.push({ ...a, y: a.y + 24, w: 50, h: 0.8, d: 0.8 });
      cranes.push({ ...a, y: a.y + 27, w: 32, h: 0.45, d: 1 });
    }
    instances(parent, box, material(0xd69a29, { metalness: 0.45 }), cranes);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 1500),
      material(0x6c7376),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = seaLevel;
    ground.receiveShadow = true;
    parent.add(ground);
  } else if (theme === "ocean" || theme === "ship") {
    animate = water(parent, seaLevel);
    for (let s = 0; s < track.length; s += 80) {
      const p = roadAt(track, s),
        height = p.y - seaLevel;
      for (const side of [-1, 1])
        supports.push({
          ...at(s, side * 7),
          y: seaLevel + height / 2,
          w: 1.2,
          h: height,
          d: 2.4,
        });
    }
    for (let s = 0; s < track.length; s += 270) {
      const p = roadAt(track, s),
        height = 34;
      for (const side of [-1, 1]) {
        supports.push({ ...at(s, side * 10.7, 16), w: 0.8, h: 32, d: 0.8 });
        for (let k = 1; k < 6; k++)
          for (const dir of [-1, 1]) {
            const end = roadAt(track, s + dir * k * 14),
              start = new THREE.Vector3(
                p.x + p.nx * side * 10.7,
                p.y + height,
                p.z + p.nz * side * 10.7,
              ),
              to = new THREE.Vector3(
                end.x + end.nx * side * 9.3,
                end.y + 1,
                end.z + end.nz * side * 9.3,
              ),
              distance = start.distanceTo(to),
              m = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.045, distance, 5),
                steel,
              );
            m.position.copy(start).add(to).multiplyScalar(0.5);
            m.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              to.clone().sub(start).normalize(),
            );
            parent.add(m);
          }
      }
      supports.push({ ...at(s, 0, 31), w: 22, h: 0.8, d: 0.8 });
      meta.bridgeTowers++;
    }
    instances(parent, box, steel, supports);
    if (theme === "ship") {
      for (const f of [0.13, 0.46, 0.78]) {
        const p = roadAt(track, track.length * f),
          ship = makeShip();
        ship.position.set(p.x, seaLevel + 2, p.z);
        ship.rotation.y = p.theta;
        parent.add(ship);
        meta.ships++;
      }
    } else {
      const islands = [];
      for (let i = 0; i < 16; i++) {
        const p = at(
          (track.length * i) / 16,
          (i % 2 ? -1 : 1) * (100 + (i % 3) * 40),
        );
        islands.push({
          ...p,
          y: seaLevel - 3,
          w: 25 + (i % 4) * 8,
          h: 15 + (i % 3) * 7,
          d: 30 + (i % 3) * 12,
        });
      }
      instances(
        parent,
        new THREE.SphereGeometry(1, 14, 8),
        material(0x627c64),
        islands,
      );
    }
  } else if (theme === "china" || theme === "gorge") {
    const riverMat = new THREE.MeshPhysicalMaterial({
      color: 0x337d8e,
      roughness: 0.17,
      metalness: 0.4,
      clearcoat: 0.7,
      side: THREE.DoubleSide,
    });
    const pos = [],
      uv = [],
      idx = [];
    track.points.forEach((p, i) => {
      const q = roadAt(track, p.s);
      for (const offset of [18, 62]) {
        pos.push(q.x + q.nx * offset, seaLevel, q.z + q.nz * offset);
        uv.push(offset === 18 ? 0 : 1, p.s / 40);
      }
      if (i < track.points.length - 1) {
        const n = i * 2;
        idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      }
    });
    const riverG = new THREE.BufferGeometry();
    riverG.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    riverG.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    riverG.setIndex(idx);
    riverG.computeVertexNormals();
    parent.add(new THREE.Mesh(riverG, riverMat));
    meta.river = 1;
    const cliffs = [],
      banks = [];
    for (let s = 0; s < track.length; s += 36) {
      const p = roadAt(track, s),
        height = 45 + (Math.floor(s) % 5) * 18;
      for (const side of [-1, 1]) {
        const offset = side < 0 ? -45 : 88,
          b = at(s, offset);
        cliffs.push({
          ...b,
          y: seaLevel + height * 0.45,
          w: 20 + (s % 10),
          h: height,
          d: 23 + (s % 8),
          color: side < 0 ? 0x708878 : 0x668278,
        });
      }
      banks.push({ ...at(s, 12), y: seaLevel + 2, w: 10, h: 7, d: 40 });
    }
    instances(
      parent,
      new THREE.CylinderGeometry(0.48, 1, 1, 9, 3),
      material(0xffffff, { roughness: 0.95 }),
      cliffs,
    );
    instances(
      parent,
      new THREE.SphereGeometry(1, 12, 8),
      material(0x61765b),
      banks,
    );
    deck(
      parent,
      track,
      material(0x9b9a88, { roughness: 1, side: THREE.DoubleSide }),
      9,
      15,
      -0.4,
    );
    const ripple = paintTexture((c) => {
      c.fillStyle = "#a1c6b8";
      c.fillRect(0, 0, 256, 256);
      c.strokeStyle = "#7c9c94";
      c.lineWidth = 2;
      for (let y = 0; y < 256; y += 16) {
        c.beginPath();
        for (let x = 0; x <= 256; x += 8)
          c.lineTo(x, y + Math.sin(x * 0.08) * 3);
        c.stroke();
      }
    });
    riverMat.map = ripple;
    animate = (time) => {
      ripple.offset.y = time * 0.015;
    };
  }
  return { meta, update: animate };
}
