import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildIndustrial } from "./industrial.js";
import { roadAt } from "./core.js";
import { hazardState } from "./hazards.js";
import { surfaceMaterial, paintSurface } from "./materials.js";
const unit = new THREE.BoxGeometry(1, 1, 1),
  tau = Math.PI * 2;
const mat = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
function block(g, m, x, y, z, w, h, d, rot = 0) {
  const mesh = new THREE.Mesh(unit, m);
  mesh.position.set(x, y, z);
  mesh.scale.set(w, h, d);
  mesh.rotation.y = rot;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function batch(g, geo, m, rows, shadow = true) {
  if (!rows.length) return;
  const mesh = new THREE.InstancedMesh(geo, m, rows.length),
    o = new THREE.Object3D();
  o.rotation.order = "YXZ";
  rows.forEach((r, i) => {
    o.position.set(r.x, r.y, r.z);
    o.rotation.set(r.pitch || 0, r.rot || 0, 0, "YXZ");
    o.scale.set(r.w || 1, r.h || 1, r.d || 1);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function tex(paint, size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  paint(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function surface(track, left, right, material) {
  const v = [],
    uv = [],
    idx = [];
  track.points.forEach((point, i) => {
    const p = roadAt(track, point.s);
    for (const offset of [left, right]) {
      v.push(p.x + p.nx * offset, p.y + 0.055, p.z + p.nz * offset);
      uv.push(offset === left ? 0 : 1, point.s / 5);
    }
    if (i < track.points.length - 1) {
      const j = i * 2;
      idx.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material);
  m.receiveShadow = true;
  return m;
}
function eaves(radius, y) {
  const vertices = [],
    indices = [],
    rings = [
      [0.15, y + 1.15],
      [0.6, y + 0.75],
      [0.91, y + 0.08],
      [1.1, y + 0.27],
    ];
  for (const [scale, height] of rings)
    for (let i = 0; i < 8; i++) {
      const angle = (i * tau) / 8 + Math.PI / 4;
      const corner = i % 2 === 0 ? 1 : 0.76;
      vertices.push(
        Math.cos(angle) * radius * scale * corner,
        height + (i % 2 === 0 ? 0.12 : 0),
        Math.sin(angle) * radius * scale * corner,
      );
    }
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 8; i++) {
      const a = r * 8 + i,
        b = r * 8 + ((i + 1) % 8),
        c = b + 8,
        d = a + 8;
      indices.push(a, d, b, b, d, c);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      vertices.flatMap((_, i) =>
        i % 3 === 0 ? [vertices[i] / radius, vertices[i + 2] / radius] : [],
      ),
      2,
    ),
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
export function makePavilion() {
  const g = new THREE.Group(),
    wood = surfaceMaterial("bark", { color: 0x63292b }),
    stone = surfaceMaterial("stone"),
    jade = mat(0x285759, {
      metalness: 0.35,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
    gold = mat(0xb9994e, { metalness: 0.75 }),
    red = mat(0xbc392c, { emissive: 0x501512 });
  block(g, stone, 0, 0.2, 0, 5.2, 0.4, 5.2);
  for (const x of [-1.9, 1.9])
    for (const z of [-1.9, 1.9]) block(g, wood, x, 2.1, z, 0.25, 3.8, 0.25);
  for (const z of [-2, 2]) block(g, wood, 0, 3.6, z, 4.3, 0.25, 0.25);
  for (const x of [-2, 2]) block(g, wood, x, 3.6, 0, 0.25, 0.25, 4.3);
  g.add(
    new THREE.Mesh(eaves(3.6, 3.7), jade),
    new THREE.Mesh(eaves(2.0, 4.9), jade),
  );
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 12), gold);
  finial.position.y = 6.5;
  g.add(finial);
  for (const x of [-1.7, 1.7]) {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), red);
    lantern.position.set(x, 3.15, 2);
    g.add(lantern);
    block(g, gold, x, 2.78, 2, 0.05, 0.3, 0.05);
  }
  // Static pavilion trim shares five merged materials, keeping roadside architecture inexpensive.
  g.updateMatrixWorld(true);
  const out = new THREE.Group();
  for (const m of [wood, stone, jade, gold, red]) {
    const pieces = [];
    g.traverse((o) => {
      if (o.isMesh && o.material === m)
        pieces.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
    });
    if (pieces.length) {
      for (const geo of pieces)
        if (!geo.attributes.uv)
          geo.setAttribute(
            "uv",
            new THREE.Float32BufferAttribute(
              new Float32Array(geo.attributes.position.count * 2),
              2,
            ),
          );
      const merged = mergeGeometries(pieces, false),
        mesh = new THREE.Mesh(merged, m);
      mesh.castShadow = mesh.receiveShadow = true;
      out.add(mesh);
      pieces.forEach((p) => p.dispose());
    }
  }
  g.traverse((o) => {
    if (o.isMesh && o.geometry !== unit) o.geometry.dispose();
  });
  return out;
}
function clouds(parent, track) {
  const map = tex((c, size) => {
    const gradient = c.createRadialGradient(
      size * 0.5,
      size * 0.5,
      4,
      size * 0.5,
      size * 0.5,
      size * 0.5,
    );
    gradient.addColorStop(0, "rgba(255,255,255,.92)");
    gradient.addColorStop(0.5, "rgba(245,250,255,.7)");
    gradient.addColorStop(1, "rgba(245,250,255,0)");
    c.fillStyle = gradient;
    c.fillRect(0, 0, size, size);
  });
  const material = new THREE.SpriteMaterial({
    map,
    color: 0xf0f6ff,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  const sprites = [];
  for (let i = 0; i < 45; i++) {
    const p = roadAt(track, (track.length * i) / 45),
      side = i % 2 ? 1 : -1;
    const cloud = new THREE.Sprite(material);
    cloud.position.set(
      p.x + p.nx * side * (25 + (i % 5) * 20),
      p.y - 10 - (i % 4) * 7,
      p.z + p.nz * side * (25 + (i % 5) * 20),
    );
    cloud.scale.set(65 + (i % 3) * 22, 19 + (i % 4) * 7, 1);
    parent.add(cloud);
    sprites.push({ cloud, origin: cloud.position.clone(), phase: i * 0.73 });
  }
  return (t) =>
    sprites.forEach(({ cloud, origin, phase }) => {
      cloud.position.x = origin.x + Math.sin(t * 0.05 + phase) * 4;
      cloud.position.y = origin.y + Math.sin(t * 0.07 + phase) * 1.5;
    });
}
export function buildFantasy(parent, track) {
  if (["container", "ocean", "ship"].includes(track.spec.theme)) {
    const built = buildIndustrial(parent, track);
    return {
      update: built.update,
      meta: built.meta,
      ringCount: 0,
      deck: "solid",
      pavilions: 0,
    };
  }
  const theme = track.spec.theme,
    night = theme === "cyber" || theme === "tunnel";
  const floor =
    theme === "sky"
      ? null
      : tex((c, s) => {
          paintSurface(c, night ? "metal" : "paving");
          if (night) {
            c.fillStyle = "rgba(16,28,48,.8)";
            c.fillRect(0, 0, s, s);
          }
          c.strokeStyle = night ? "#517592" : "#7f8d8d";
          c.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            c.strokeRect((i * s) / 4, 0, s / 4, s);
            c.beginPath();
            c.moveTo(0, s * 0.5);
            c.lineTo(s, s * 0.5);
            c.stroke();
          }
          c.fillStyle = night ? "#21e5ef" : "#e7e8d8";
          c.fillRect(6, 0, 4, s);
          c.fillRect(s - 10, 0, 4, s);
        });
  const decks = [];
  if (theme === "sky") {
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x8de1ef,
      metalness: 0.16,
      roughness: 0.12,
      clearcoat: 1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const grid = tex((c, s) => {
      c.clearRect(0, 0, s, s);
      c.fillStyle = "#819aab";
      for (let i = 0; i < 8; i++) {
        c.fillRect((i * s) / 8, 0, 4, s);
        c.fillRect(0, (i * s) / 8, s, 4);
      }
    });
    const metal = mat(0xb1c3ce, {
      map: grid,
      alphaTest: 0.35,
      metalness: 0.8,
      roughness: 0.32,
      side: THREE.DoubleSide,
    });
    parent.add(surface(track, -9, 0, glass), surface(track, 0, 9, metal));
    decks.push("glass", "grating");
  } else
    parent.add(
      surface(
        track,
        -9,
        9,
        surfaceMaterial(night ? "metal" : "paving", {
          color: night ? 0x8ba3b6 : 0xffffff,
          map: floor,
          side: THREE.DoubleSide,
          roughness: night ? 0.43 : 0.86,
          metalness: night ? 0.35 : 0,
        }),
      ),
    );
  const steel = mat(["china", "gorge"].includes(theme) ? 0x8d8170 : 0x536a81, {
      metalness: 0.55,
    }),
    dark = mat(0x172239),
    neonA = new THREE.MeshBasicMaterial({ color: 0x26edff }),
    neonB = new THREE.MeshBasicMaterial({ color: 0xe83cff });
  const pavilionRows = [];
  const rails = [],
    posts = [],
    supports = [],
    lightsA = [],
    lightsB = [],
    towers = [],
    windows = [],
    ringsA = [],
    ringsB = [];
  const coord = (s, offset, y = 0) => {
    const p = roadAt(track, s);
    return {
      x: p.x + p.nx * offset,
      y: p.y + y,
      z: p.z + p.nz * offset,
      rot: p.theta,
      pitch: -p.pitch,
    };
  };
  for (let s = 0; s < track.length; s += 12)
    for (const side of [-1, 1]) {
      rails.push({ ...coord(s, side * 9.25, 1), w: 0.18, h: 0.22, d: 12.1 });
      posts.push({ ...coord(s, side * 9.25, 0.5), w: 0.16, h: 1, d: 0.16 });
      if (night)
        (side === 1 ? lightsA : lightsB).push({
          ...coord(s, side * 8.9, 0.13),
          w: 0.16,
          h: 0.1,
          d: 12.2,
        });
    }
  for (let s = 0; s < track.length; s += 95) {
    const p = roadAt(track, s);
    if (["china", "gorge"].includes(theme))
      for (const side of [-1, 1]) {
        pavilionRows.push(coord(s, side * (20 + (s % 19)), 0));
      }
    else if (theme === "sky") {
      for (const side of [-1, 1]) {
        supports.push({ ...coord(s, side * 11, 9), w: 0.5, h: 18, d: 0.5 });
        supports.push({ ...coord(s, side * 11, -12), w: 1.2, h: 24, d: 1.2 });
      }
      supports.push({ ...coord(s, 0, 17), w: 22.5, h: 0.6, d: 0.6 });
    } else
      for (const side of [-1, 1]) {
        const h = 25 + ((s * 7) % 53),
          a = coord(s, side * (30 + (s % 25)), h / 2);
        towers.push({ ...a, w: 14 + (s % 12), h, d: 15 });
        windows.push({
          ...a,
          y: a.y + 2,
          w: 14.2 + (s % 12),
          h: h * 0.86,
          d: 15.2,
        });
        for (let band = 0; band < 4; band++)
          (side === 1 ? lightsA : lightsB).push({
            ...a,
            y: p.y + 3 + (band * h) / 4,
            w: 14.5 + (s % 12),
            h: 0.15,
            d: 15.5,
          });
      }
  }
  if (pavilionRows.length) {
    const pavilion = makePavilion();
    for (const piece of pavilion.children)
      batch(parent, piece.geometry, piece.material, pavilionRows);
  }
  let ringCount = 0;
  if (theme === "tunnel") {
    const v = [],
      idx = [],
      segments = Math.ceil((track.length * 0.67) / 9),
      count = 20;
    for (let i = 0; i <= segments; i++) {
      const p = roadAt(track, (track.length * 0.67 * i) / segments);
      for (let j = 0; j <= count; j++) {
        const a = (j / count) * tau,
          offset = Math.cos(a) * 11,
          y = 6.3 + Math.sin(a) * 11;
        v.push(p.x + p.nx * offset, p.y + y, p.z + p.nz * offset);
        if (i < segments && j < count) {
          const n = i * (count + 1) + j;
          idx.push(
            n,
            n + 1,
            n + count + 1,
            n + 1,
            n + count + 2,
            n + count + 1,
          );
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    parent.add(
      new THREE.Mesh(
        geo,
        mat(0x101c35, {
          roughness: 0.48,
          metalness: 0.4,
          side: THREE.DoubleSide,
        }),
      ),
    );
    for (let s = 0; s < track.length * 0.67; s += 11) {
      const a = coord(s, 0, 6.3);
      (Math.floor(s / 11) % 2 ? ringsA : ringsB).push(a);
      ringCount++;
    }
    const ring = new THREE.TorusGeometry(11, 0.075, 5, 36);
    batch(parent, ring, neonA, ringsA, false);
    batch(parent, ring, neonB, ringsB, false);
    const halo = new THREE.TorusGeometry(11, 0.24, 5, 36);
    batch(
      parent,
      halo,
      new THREE.MeshBasicMaterial({
        color: 0x31d8ff,
        transparent: true,
        opacity: 0.11,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      ringsA,
      false,
    );
    batch(
      parent,
      halo,
      new THREE.MeshBasicMaterial({
        color: 0xfe3eff,
        transparent: true,
        opacity: 0.11,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      ringsB,
      false,
    );
  }
  batch(parent, unit, steel, rails);
  batch(parent, unit, steel, posts);
  batch(parent, unit, steel, supports);
  batch(parent, unit, dark, towers);
  if (windows.length) {
    const facade = tex((c, size) => {
      c.fillStyle = "#111d32";
      c.fillRect(0, 0, size, size);
      for (let y = 8; y < size; y += 16)
        for (let x = 8; x < size; x += 20) {
          c.fillStyle = (x * 7 + y * 3) % 11 < 7 ? "#417c9d" : "#102237";
          c.fillRect(x, y, 7, 9);
        }
    });
    batch(
      parent,
      unit,
      mat(0xb2dcf1, {
        map: facade,
        emissiveMap: facade,
        metalness: 0.35,
        emissive: 0x428dbb,
        emissiveIntensity: 0.8,
      }),
      windows,
    );
  }
  batch(parent, unit, neonA, lightsA, false);
  batch(parent, unit, neonB, lightsB, false);
  let update = () => {};
  if (theme === "sky" || ["china", "gorge"].includes(theme))
    update = clouds(parent, track);
  let special = null;
  if (["china", "gorge"].includes(theme))
    special = buildIndustrial(parent, track, true);
  const cloudUpdate = update;
  update = (time) => {
    cloudUpdate(time);
    special?.update(time);
  };
  return {
    update,
    meta: special?.meta,
    ringCount,
    deck: decks.join("+"),
    pavilions: ["china", "gorge"].includes(theme)
      ? Math.ceil(track.length / 95) * 2
      : 0,
  };
}
export function buildHazardModels(parent, track, hazards) {
  const entries = [],
    orange = mat(0xd75a24, { metalness: 0.15 }),
    steel = mat(0xb5bcc1, { metalness: 0.88, roughness: 0.3 }),
    black = mat(0x17242b),
    wood = mat(0x69503a),
    red = mat(0xd82c2c, { emissive: 0x8b1006, emissiveIntensity: 1.2 });
  for (const h of hazards) {
    const root = new THREE.Group(),
      p = roadAt(track, h.s);
    root.position.set(p.x, p.y + 0.07, p.z);
    root.rotation.set(-p.pitch, p.theta, 0, "YXZ");
    parent.add(root);
    let moving;
    if (h.type === "gazebo") {
      const pavilion = makePavilion();
      pavilion.position.x = h.offset;
      root.add(pavilion);
    } else if (h.type === "barrier") {
      block(root, orange, h.offset, 0.8, 0, 3.4, 1.3, 0.55);
      for (let i = 0; i < 5; i++) {
        const stripe = block(
          root,
          black,
          h.offset - 1.35 + i * 0.67,
          0.8,
          0.285,
          0.17,
          1.25,
          0.025,
        );
        stripe.rotation.z = -0.4;
      }
      for (const side of [-1, 1])
        block(root, steel, h.offset + side * 1.2, 0.18, 0, 0.3, 0.3, 1.4);
    } else if (h.type === "pendulum") {
      block(root, steel, -10.4, 5.5, 0, 0.35, 11, 0.35);
      block(root, steel, 10.4, 5.5, 0, 0.35, 11, 0.35);
      block(root, steel, 0, 11, 0, 21.1, 0.35, 0.35);
      moving = new THREE.Group();
      moving.position.y = 11;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 9, 8),
        steel,
      );
      rod.position.y = -4.5;
      moving.add(rod);
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(h.radius, 16, 10),
        orange,
      );
      ball.position.y = -9;
      ball.castShadow = true;
      moving.add(ball);
      root.add(moving);
    } else if (h.type === "spikes") {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.85, 2.0, 12),
        wood,
      );
      post.position.set(h.offset, 1, 0);
      post.castShadow = true;
      root.add(post);
      for (let i = 0; i < 8; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.14, 0.75, 6),
            steel,
          ),
          a = (i * tau) / 8;
        spike.position.set(
          h.offset + Math.cos(a) * 0.78,
          1.3,
          Math.sin(a) * 0.78,
        );
        spike.rotation.z = -a;
        root.add(spike);
      }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.75, 10), steel);
      cap.position.set(h.offset, 2.3, 0);
      root.add(cap);
    } else if (h.type === "blade") {
      moving = new THREE.Group();
      moving.position.x = h.offset;
      const shape = new THREE.Shape();
      for (let i = 0; i < 40; i++) {
        const a = (i * tau) / 40,
          r = i % 2 ? 1.1 : h.radius;
        const x = Math.cos(a) * r,
          y = Math.sin(a) * r;
        i ? shape.lineTo(x, y) : shape.moveTo(x, y);
      }
      shape.closePath();
      const saw = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false }),
        steel,
      );
      saw.castShadow = true;
      moving.add(saw);
      root.add(moving);
      block(root, black, h.offset, 0.1, 0, 3.8, 0.18, 1.3);
    } else if (h.type === "nails") {
      block(root, black, h.offset, 0.08, 0, 4, 0.16, 4.4);
      moving = new THREE.Group();
      moving.position.x = h.offset;
      for (let x = -1.5; x <= 1.5; x++)
        for (let z = -1.5; z <= 1.5; z++) {
          const nail = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.85, 6),
            steel,
          );
          nail.position.set(x, 0.45, z);
          nail.castShadow = true;
          moving.add(nail);
        }
      root.add(moving);
    }
    // A visible illuminated hazard boundary warns before the car reaches the object.
    const glow = block(
      root,
      red,
      h.offset,
      0.08,
      2.8,
      h.radius * 2 + 0.5,
      0.04,
      0.11,
    );
    entries.push({ h, moving, glow });
  }
  return (time) => {
    for (const { h, moving, glow } of entries) {
      const state = hazardState(h, time);
      glow.visible = state.active || Math.sin(time * 5 + h.phase) > 0;
      if (!moving) continue;
      if (h.type === "pendulum") moving.rotation.z = state.angle;
      else if (h.type === "blade") {
        moving.position.y = state.height;
        moving.rotation.z = state.angle;
      } else if (h.type === "nails") {
        moving.position.y = state.active ? 0 : -0.78;
      }
    }
  };
}
export function checkpoint(parent, track) {
  const p = roadAt(track, 0),
    g = new THREE.Group(),
    green = new THREE.MeshBasicMaterial({ color: 0xd7fca4 }),
    steel = mat(0x78929b, { metalness: 0.6 });
  g.position.set(p.x, p.y + 0.1, p.z);
  g.rotation.set(-p.pitch, p.theta, 0, "YXZ");
  block(g, green, 0, 0.01, 4, 1, 0.025, 6);
  block(g, green, 0, 0.01, 7, 7, 0.025, 1);
  for (const side of [-1, 1]) {
    block(g, steel, side * 10, 2, 5, 0.18, 4, 0.18);
    const plate = block(g, green, side * 10, 3.1, 5, 1.5, 0.7, 0.1);
    plate.rotation.y = side * 0.4;
  }
  parent.add(g);
}
