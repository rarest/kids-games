import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CARS, SKINS, roadAt, wrap } from "./core.js";
import { makeLighting, lightingState } from "./lighting.js";
import { buildFlora } from "./flora.js";
import { makeTrails } from "./trails.js";
import { makeHazards } from "./hazards.js";
import { buildFantasy, buildHazardModels, checkpoint } from "./worlds.js";
import {
  surfaceMaterial,
  surfaceTextures,
  isSurfaceTexture,
  qualitySettings,
  textureQuality,
  paintSurface,
  contactTexture,
} from "./materials.js";
const TAU = Math.PI * 2;
function rng(seed = 731) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function texture(paint, w = 256, h = 256) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function asphalt() {
  return texture((c, w, h) => {
    paintSurface(c, "asphalt");
    c.fillStyle = "#d9dace";
    c.fillRect(10, 0, 3, h);
    c.fillRect(w - 13, 0, 3, h);
    c.fillStyle = "#e6ddaf";
    c.fillRect(w / 2 - 2, 15, 4, 120);
  });
}
function concrete() {
  return texture((c, w, h) => {
    c.fillStyle = "#9d9e96";
    c.fillRect(0, 0, w, h);
    const r = rng(99);
    for (let i = 0; i < 12000; i++) {
      const v = 90 + r() * 100;
      c.fillStyle = `rgba(${v},${v},${v - 8},.2)`;
      c.fillRect(r() * w, r() * h, 2, 2);
    }
    c.strokeStyle = "#75796e";
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(0, (i * h) / 4);
      c.lineTo(w, (i * h) / 4);
      c.stroke();
    }
  });
}
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function box(g, mat, x, y, z, w, h, d, rot = 0) {
  const m = new THREE.Mesh(boxGeo, mat);
  m.position.set(x, y, z);
  m.scale.set(w, h, d);
  m.rotation.y = rot;
  g.add(m);
  return m;
}
function loft(sections) {
  const verts = [],
    uv = [],
    indices = [],
    rings = [];
  for (const [z, w, lo, hi] of sections) {
    const ring = [
      [-w * 0.88, lo],
      [-w, lo + 0.08],
      [-w, hi - 0.06],
      [-w * 0.84, hi],
      [w * 0.84, hi],
      [w, hi - 0.06],
      [w, lo + 0.08],
      [w * 0.88, lo],
    ];
    rings.push(ring);
    const lengths = [0];
    for (let j = 0; j < 8; j++) {
      const a = ring[j],
        b = ring[(j + 1) % 8];
      lengths.push(lengths[j] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    // A duplicated seam gives each side panel real UV area, including vertical faces.
    for (let j = 0; j <= 8; j++) {
      const [x, y] = ring[j % 8];
      verts.push(x, y, z);
      uv.push(lengths[j] / lengths[8], z * 0.2 + 0.5);
    }
  }
  for (let i = 0; i < sections.length - 1; i++)
    for (let j = 0; j < 8; j++) {
      const a = i * 9 + j,
        b = a + 1,
        c = b + 9,
        d = a + 9;
      indices.push(a, d, b, b, d, c);
    }
  // End caps need their own planar UVs and normals, independent of the side unwrap.
  for (const section of [0, sections.length - 1]) {
    const base = verts.length / 3,
      [z, w, lo, hi] = sections[section];
    for (const [x, y] of rings[section]) {
      verts.push(x, y, z);
      uv.push(x / (w * 2) + 0.5, (y - lo) / (hi - lo));
    }
    for (let j = 1; j < 7; j++) {
      if (section === 0) indices.push(base, base + j, base + j + 1);
      else indices.push(base, base + j + 1, base + j);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const normals = geo.attributes.normal;
  for (let i = 0; i < sections.length; i++) {
    const a = i * 9,
      b = a + 8,
      n = new THREE.Vector3()
        .fromBufferAttribute(normals, a)
        .add(new THREE.Vector3().fromBufferAttribute(normals, b))
        .normalize();
    normals.setXYZ(a, n.x, n.y, n.z);
    normals.setXYZ(b, n.x, n.y, n.z);
  }
  return geo;
}
// Merge the static car parts by material: detailed silhouettes without a draw call per trim piece.
export function makeCar(model, skin, traffic = false) {
  const group = new THREE.Group(),
    parts = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color: skin.color,
    ...surfaceTextures("paint"),
    normalScale: new THREE.Vector2(0.035, 0.035),
    metalness: 0.72,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.35,
    iridescence: skin.iridescence * 0.28,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [130, 390],
  });
  paint.userData.surface = "paint";
  const pattern = new THREE.MeshPhysicalMaterial({
    color: skin.stripe,
    metalness: 0.65,
    roughness: 0.19,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
    envMapIntensity: 1.4,
    iridescence: skin.iridescence,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [180, 700],
  });
  const black = surfaceMaterial("carbon", {
    color: 0x11161a,
  });
  const rubber = surfaceMaterial("rubber", { color: 0x171a1c });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x20343e,
    metalness: 0.05,
    roughness: 0.045,
    clearcoat: 1,
    envMapIntensity: 1.5,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xc0ccd2,
    metalness: 0.96,
    roughness: 0.2,
  });
  const head = new THREE.MeshStandardMaterial({
    color: 0xe2faff,
    emissive: 0xa6e1ff,
    emissiveIntensity: 1.5,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: 0xff303a,
    emissive: 0xf21b25,
    emissiveIntensity: 1.2,
  });
  const materials = [paint, pattern, black, rubber, glass, chrome, head, tail];
  const hyper = model.style === "hyper",
    rally = model.style === "rally",
    muscle = model.style === "muscle";
  const wide = hyper ? 1.13 : muscle ? 1.1 : 1.04,
    front = hyper ? 2.6 : rally ? 2.1 : 2.4,
    rear = hyper ? -2.5 : rally ? -2.0 : -2.25,
    hood = hyper ? 0.8 : rally ? 1.06 : 0.96;
  const body = new THREE.Mesh(
    loft([
      [rear, wide * 0.78, 0.42, hood - 0.16],
      [rear + 0.35, wide, 0.38, hood],
      [-1.35, wide * 1.03, 0.36, hood + 0.12],
      [-0.65, wide * 0.95, 0.34, hood + 0.04],
      [0.65, wide * 0.94, 0.35, hood - 0.015],
      [1.35, wide * 1.025, 0.36, hood - 0.035],
      [front - 0.4, wide * 0.96, 0.42, hood - 0.06],
      [front, wide * 0.68, 0.37, hood - 0.25],
    ]),
    paint,
  );
  parts.add(body);
  const roof = hyper ? 1.22 : rally ? 1.59 : muscle ? 1.4 : 1.3;
  parts.add(
    new THREE.Mesh(
      loft([
        [-1.45, wide * 0.73, hood, hood + 0.06],
        [-0.95, wide * 0.69, hood, roof],
        [0.1, wide * 0.68, hood, roof],
        [1.0, wide * 0.78, hood - 0.02, hood + 0.05],
      ]),
      glass,
    ),
  );
  box(parts, paint, -0.0, roof + 0.018, -0.48, wide * 1.31, 0.05, 1.0);
  // Twin iridescent stripes follow the sloping bonnet and rear deck.
  for (const x of [-0.29, 0.29]) {
    const stripe = box(
      parts,
      pattern,
      x,
      hood - 0.025,
      1.45,
      0.2,
      0.018,
      Math.max(0.7, front - 0.9),
    );
    stripe.rotation.x = 0.05;
    box(parts, pattern, x, roof + 0.048, -0.48, 0.18, 0.018, 1.01);
    box(parts, pattern, x, hood + 0.018, -1.87, 0.2, 0.022, 0.43);
  }
  for (const side of [-1, 1])
    for (let mark = 0; mark < 3; mark++) {
      const foil = box(
        parts,
        pattern,
        side * (wide + 0.012),
        hood * 0.72,
        -0.85 + mark * 0.55,
        0.026,
        0.065,
        0.6,
      );
      foil.rotation.x = mark % 2 ? 0.32 : -0.32;
    }
  box(parts, black, 0, 0.48, front - 0.025, wide * 0.83, 0.19, 0.08);
  for (const side of [-1, 1]) {
    const intake = box(
      parts,
      black,
      side * wide * 0.76,
      0.51,
      front - 0.13,
      0.42,
      0.24,
      0.19,
    );
    intake.rotation.z = side * 0.19;
    const led = box(
      parts,
      head,
      side * wide * 0.72,
      hood - 0.13,
      front - 0.16,
      0.54,
      0.045,
      0.06,
    );
    led.rotation.z = side * 0.17;
    box(
      parts,
      head,
      side * wide * 0.96,
      hood - 0.2,
      front - 0.22,
      0.035,
      0.18,
      0.065,
    );
    const skirt = box(parts, black, side * wide, 0.31, 0.05, 0.14, 0.1, 3.0);
    skirt.rotation.z = side * 0.15;
    box(parts, pattern, side * (wide + 0.018), 0.365, 0.05, 0.03, 0.04, 2.1);
    for (const z of [rear + 0.65, front - 0.73]) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.065, 7, 22, Math.PI),
        paint,
      );
      arch.rotation.y = Math.PI / 2;
      arch.position.set(side * (wide + 0.025), 0.44, z);
      parts.add(arch);
    }
    for (let fin = 0; fin < 3; fin++)
      box(
        parts,
        black,
        side * (0.3 + fin * 0.21),
        0.3,
        rear - 0.09,
        0.055,
        0.23,
        0.55,
      );
  }
  box(parts, chrome, 0, 0.37, front - 0.08, wide * 1.9, 0.055, 0.24);
  for (const x of [-0.78, 0.78]) {
    box(parts, tail, x, hood - 0.13, rear - 0.012, 0.43, 0.12, 0.06);
    box(parts, black, x, hood + 0.02, 1.21, 0.18, 0.04, 0.52);
    box(parts, paint, x * 1.5, hood + 0.27, -0.07, 0.28, 0.16, 0.2);
  }
  for (const x of [-0.48, 0.48]) {
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.19, 10),
      chrome,
    );
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(x, 0.45, rear - 0.07);
    parts.add(exhaust);
  }
  box(parts, black, 0, 0.38, rear + 0.07, wide * 1.9, 0.14, 0.37);
  if (!traffic) {
    box(parts, black, 0, roof + 0.035, rear + 0.35, wide * 2.13, 0.065, 0.4);
    for (const side of [-1, 1])
      box(
        parts,
        pattern,
        side * wide * 1.05,
        roof + 0.085,
        rear + 0.35,
        0.045,
        0.24,
        0.42,
      );
    for (const x of [-0.7, 0.7])
      box(parts, chrome, x, hood + 0.19, rear + 0.35, 0.05, 0.43, 0.12);
  }
  const tireGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.29, 32),
    rimGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.305, 24);
  for (const x of [-wide, wide])
    for (const z of [rear + 0.65, front - 0.73]) {
      const tire = new THREE.Mesh(tireGeo, rubber);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(x, 0.44, z);
      parts.add(tire);
      const rim = new THREE.Mesh(rimGeo, chrome);
      rim.rotation.z = Math.PI / 2;
      rim.position.copy(tire.position);
      parts.add(rim);
      for (let i = 0; i < 5; i++) {
        const spoke = box(
          parts,
          black,
          x + Math.sign(x) * 0.16,
          0.44,
          z,
          0.013,
          0.05,
          0.51,
        );
        spoke.rotation.x = (i * TAU) / 5;
      }
    }
  parts.updateMatrixWorld(true);
  for (const mat of materials) {
    const geometries = [];
    parts.traverse((o) => {
      if (o.isMesh && o.material === mat)
        geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
    });
    if (geometries.length) {
      const merged = mergeGeometries(geometries, false);
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = mat === paint || mat === black;
      mesh.receiveShadow = true;
      group.add(mesh);
      for (const geo of geometries) geo.dispose();
    }
  }
  // Original primitive geometries are no longer used after merging (shared unit box excluded).
  parts.traverse((o) => {
    if (o.isMesh && o.geometry !== boxGeo) o.geometry.dispose();
  });
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(wide * 2.1, front - rear - 0.35).rotateX(
      -Math.PI / 2,
    ),
    new THREE.MeshBasicMaterial({
      map: contactTexture(),
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  shadow.name = "contact-shadow";
  shadow.position.y = -0.015;
  group.add(shadow);
  return group;
}
function ribbon(
  track,
  near,
  far,
  map,
  material,
  side = 1,
  raise = 0,
  repeats = 1,
) {
  const verts = [],
    uv = [],
    indices = [],
    points = track.points;
  for (let i = 0; i < points.length; i++) {
    const p = roadAt(track, points[i].s),
      s = i === points.length - 1 ? track.length : points[i].s;
    for (const dist of [near, far]) {
      const out = dist * side;
      verts.push(
        p.x + p.nx * out,
        p.y + raise - Math.max(0, Math.abs(out) - 9) * 0.075,
        p.z + p.nz * out,
      );
      uv.push(dist === near ? 0 : repeats, s / (map ? 8 : 20));
    }
    if (i < points.length - 1) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}
function terrain(track, material) {
  const size = 1100,
    segments = 80,
    geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  // World-sized ground needs small grass tiles, independently of roadside ribbons.
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, uv.getX(i) * 128, uv.getY(i) * 128);
  const attr = geo.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    const x = attr.getX(i),
      z = attr.getZ(i);
    let best = Infinity,
      height = 0;
    for (const p of track.points) {
      const d = (x - p.x) ** 2 + (z - p.z) ** 2;
      if (d < best) {
        best = d;
        height = p.y;
      }
    }
    const distance = Math.sqrt(best),
      noise =
        (Math.sin(x * 0.018) * Math.cos(z * 0.021) +
          Math.sin((x + z) * 0.009)) *
        5;
    attr.setY(
      i,
      height -
        2 -
        distance * 0.015 +
        noise * Math.min(1, Math.max(0, (distance - 32) / 90)),
    );
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}
function makeBatch(group, geo, mat, objects, shadow = true) {
  if (!objects.length) return;
  const m = new THREE.InstancedMesh(geo, mat, objects.length),
    dummy = new THREE.Object3D();
  objects.forEach((o, i) => {
    dummy.position.set(o.x, o.y, o.z);
    dummy.rotation.set(o.rx || 0, o.rot || 0, o.rz || 0);
    dummy.scale.set(o.w || 1, o.h || 1, o.d || 1);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
  });
  m.castShadow = shadow;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
export class RaceScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 700;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, this.mobile ? 1.25 : 1.6),
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xb4c7c9, 0.00165);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.2, 2000);
    this.hemi = new THREE.HemisphereLight(0xc4e1ff, 0x6c6743, 2.25);
    this.scene.add(this.hemi);
    this.neonLights = [
      new THREE.PointLight(0x21eeff, 0, 32, 2),
      new THREE.PointLight(0xf842ff, 0, 32, 2),
    ];
    this.scene.add(...this.neonLights);
    this.burst = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 10),
      new THREE.MeshBasicMaterial({
        color: 0xff951d,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    this.burst.visible = false;
    this.scene.add(this.burst);
    this.sun = new THREE.DirectionalLight(0xffe5b1, 3.4);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(
      this.mobile ? 1024 : 2048,
      this.mobile ? 1024 : 2048,
    );
    Object.assign(this.sun.shadow.camera, {
      left: -75,
      right: 75,
      top: 75,
      bottom: -75,
      near: 1,
      far: 350,
    });
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.09;
    this.scene.add(this.sun, this.sun.target);
    this.lighting = makeLighting(
      this.scene,
      this.renderer,
      this.sun,
      this.hemi,
    );
    this.lightMode = "auto";
    this.headlights = [-1, 1].map(() => {
      const light = new THREE.SpotLight(0xd1e8ff, 0, 44, 0.34, 0.65, 2);
      this.scene.add(light, light.target);
      return light;
    });
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.fleet = new THREE.Group();
    this.scene.add(this.fleet);
    this.roadTexture = asphalt();
    this.wallTexture = concrete();
    this.sharedTextures = new Set([this.roadTexture, this.wallTexture]);
    this.frame = 0;
    this.firstCamera = true;
    this.quality = "auto";
    const gl = this.renderer.getContext(),
      info = gl.getExtension("WEBGL_debug_renderer_info");
    this.software =
      !!info &&
      /swiftshader|llvmpipe|software/i.test(
        gl.getParameter(info.UNMASKED_RENDERER_WEBGL),
      );
    if (this.software) {
      this.renderer.setPixelRatio(0.65);
      this.sun.shadow.mapSize.set(512, 512);
    }
    this.resize();
  }
  resize() {
    this.dirty = true;
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  qualityMode(value) {
    this.dirty = true;
    this.frameAverage = 0;
    this.samples = 0;
    this.quality = value;
    const q = qualitySettings(
      value,
      this.software,
      this.mobile,
      devicePixelRatio || 1,
    );
    this.renderer.setPixelRatio(q.ratio);
    this.sun.shadow.mapSize.set(q.shadowSize, q.shadowSize);
    this.setTextureQuality(q.anisotropy);
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
    this.resize();
  }
  setTextureQuality(requested) {
    const value = Math.min(
      requested,
      this.renderer.capabilities.getMaxAnisotropy(),
    );
    const types = new Set();
    let detailed = 0;
    textureQuality(value);
    this.scene.traverse((o) => {
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        if (m) {
          if (m.userData.surface) types.add(m.userData.surface);
          if (m.normalMap) detailed++;
          for (const k of [
            "map",
            "normalMap",
            "roughnessMap",
            "clearcoatNormalMap",
          ])
            if (m[k] && m[k].anisotropy !== value) {
              m[k].anisotropy = value;
              m[k].needsUpdate = true;
            }
        }
    });
    this.canvas.dataset.surfaceTypes = [...types].sort().join(",");
    this.canvas.dataset.normalMaterials = String(detailed);
  }
  adapt(frameSeconds) {
    if (this.quality !== "auto" || this.software) return;
    this.frameAverage = this.frameAverage
      ? this.frameAverage * 0.94 + frameSeconds * 0.06
      : frameSeconds;
    this.samples = (this.samples || 0) + 1;
    const ratio = this.renderer.getPixelRatio();
    if (this.samples < 45 || this.frameAverage < 0.037 || ratio <= 0.75) return;
    this.renderer.setPixelRatio(Math.max(0.75, ratio * 0.8));
    this.sun.shadow.mapSize.set(
      this.mobile ? 512 : 1024,
      this.mobile ? 512 : 1024,
    );
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map = null;
    this.samples = 0;
    this.resize();
  }
  clear(group) {
    const geos = new Set(),
      mats = new Set();
    group.traverse((o) => {
      if (o.isMesh || o.isSprite) {
        if (o.isMesh) geos.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          mats.add(m);
        o.dispose?.();
      }
    });
    for (const g of geos) if (g !== boxGeo) g.dispose();
    for (const m of mats) {
      for (const key of [
        "map",
        "alphaMap",
        "emissiveMap",
        "normalMap",
        "roughnessMap",
        "metalnessMap",
        "clearcoatNormalMap",
      ])
        if (
          m[key] &&
          !this.sharedTextures.has(m[key]) &&
          !isSurfaceTexture(m[key])
        )
          m[key].dispose();
      m.dispose();
    }
    group.clear();
  }
  build(track) {
    this.clear(this.world);
    this.track = track;
    this.fantasy = null;
    if (!track.spec.theme) {
      const asphaltMat = surfaceMaterial("asphalt", {
        map: this.roadTexture,
        roughness: 0.96,
        side: THREE.DoubleSide,
      });
      const grassMat = surfaceMaterial("grass", {
        color: 0xa3b78c,
        roughness: 1,
        side: THREE.DoubleSide,
      });
      this.world.add(
        ribbon(track, -9, 9, true, asphaltMat, 1, 0.03),
        ribbon(track, 9, 30, true, grassMat, 1, 0, 14),
        ribbon(track, 9, 30, true, grassMat, -1, 0, 14),
        terrain(track, grassMat),
      );
      const gray = surfaceMaterial("stone", {
          color: 0x848b8b,
          roughness: 0.88,
          map: this.wallTexture,
        }),
        rust = surfaceMaterial("metal", {
          color: 0x704534,
          roughness: 0.9,
        }),
        windows = new THREE.MeshStandardMaterial({
          color: 0x607f8b,
          metalness: 0.5,
          roughness: 0.27,
        }),
        dark = new THREE.MeshStandardMaterial({
          color: 0x2a3439,
          roughness: 0.65,
        });
      const boxes = [],
        rustBoxes = [],
        glassBoxes = [],
        cracks = [],
        rails = [],
        white = [],
        red = [],
        treeTrunks = [],
        treeCrowns = [],
        broadCrowns = [],
        lamps = [],
        lampHeads = [],
        blades = [],
        hills = [];
      const r = rng(45 + track.spec.phase),
        length = track.length;
      const at = (s, offset, y = 0) => {
        const p = roadAt(track, s);
        return {
          x: p.x + p.nx * offset,
          y: p.y + y - Math.max(0, Math.abs(offset) - 9) * 0.075,
          z: p.z + p.nz * offset,
          rot: p.theta,
        };
      };
      for (let s = 0; s < length; s += 9) {
        const p = roadAt(track, s);
        for (const side of [-1, 1]) {
          if (p.biome === 1 || p.biome === 4) {
            const a = at(s, side * 10, 1.1);
            rails.push({ ...a, w: 0.17, h: 0.4, d: 9.2 });
            rails.push({
              ...at(s, side * 10, 0.48),
              w: 0.16,
              h: 1.05,
              d: 0.15,
            });
          }
          (Math.floor(s / 9) % 2 ? red : white).push({
            ...at(s, side * 9.15, 0.12),
            w: 0.45,
            h: 0.17,
            d: 9.1,
          });
          if (Math.floor(s / 9) % 3 === 0) {
            const a = at(s, side * (15 + r() * 14));
            treeTrunks.push({ ...a, y: a.y + 2, w: 0.35, h: 4, d: 0.35 });
            if (p.biome === 1 || p.biome === 3)
              treeCrowns.push({
                ...a,
                y: a.y + 5,
                w: 2.3 + r() * 1.5,
                h: 6 + r() * 2,
                d: 2.3 + r() * 1.5,
              });
            else
              for (let leaf = 0; leaf < 3; leaf++)
                broadCrowns.push({
                  ...a,
                  x: a.x + (r() - 0.5) * 2.3,
                  z: a.z + (r() - 0.5) * 2.3,
                  y: a.y + 4.7 + r() * 1.1,
                  w: 2 + r(),
                  h: 1.7 + r(),
                  d: 2 + r(),
                });
          }
        }
      }
      for (let s = 0; s < length; s += 27) {
        const p = roadAt(track, s),
          side = r() > 0.5 ? 1 : -1;
        if (p.biome === 2) {
          const a = at(s, side * (27 + r() * 22)),
            h = 7 + r() * 13,
            w = 12 + r() * 12,
            d = 10 + r() * 15;
          boxes.push({ ...a, y: a.y + h / 2, w, h, d });
          rustBoxes.push({
            ...a,
            y: a.y + h + 0.4,
            w: w + 1,
            h: 0.8,
            d: d + 1,
          });
          boxes.push({ ...a, y: a.y + h + 1.3, w: 3.8, h: 1.6, d: 2.3 });
          for (let pipe = 0; pipe < 3; pipe++)
            rustBoxes.push({
              ...a,
              y: a.y + 1.7 + pipe * 0.8,
              w: w + 1.3,
              h: 0.18,
              d: 0.23,
            });
          for (let row = 0; row < 3; row++)
            glassBoxes.push({
              ...a,
              y: a.y + 2 + row * 2.1,
              x: a.x + Math.cos(a.rot) * (w / 2 + 0.03),
              z: a.z - Math.sin(a.rot) * (w / 2 + 0.03),
              w: 0.06,
              h: 1.2,
              d: d * 0.68,
            });
          const chimney = at(s + 8, side * 44);
          rustBoxes.push({
            ...chimney,
            y: chimney.y + 17,
            w: 3.5,
            h: 34,
            d: 3.5,
          });
        }
        if (p.biome === 3) {
          for (let i = 0; i < 6; i++) {
            const a = at(s + i * 2, (r() - 0.5) * 14, 0.065);
            cracks.push({
              ...a,
              w: 0.045,
              h: 0.016,
              d: 1.5 + r() * 2,
              rot: a.rot + (r() - 0.5) * 1.7,
            });
          }
          const a = at(s, side * (22 + r() * 10));
          boxes.push({ ...a, y: a.y + 1.5, w: 9, h: 3, d: 2.2 });
          rustBoxes.push({
            ...at(s + 9, side * 12, 1.6),
            w: 0.15,
            h: 3.4,
            d: 0.15,
          });
        }
        if (p.biome === 4) {
          const a = at(s, side * (39 + r() * 35)),
            h = 18 + r() * 40,
            w = 10 + r() * 15,
            d = 10 + r() * 12;
          boxes.push({ ...a, y: a.y + h / 2, w, h, d });
          glassBoxes.push({
            ...a,
            y: a.y + h * 0.55,
            w: w + 0.04,
            h: h * 0.76,
            d: d + 0.04,
          });
          for (let row = 0; row < 5; row++)
            boxes.push({
              ...a,
              y: a.y + (row * h) / 5,
              w: w + 0.15,
              h: 0.3,
              d: d + 0.15,
            });
          for (const sign of [-1, 1]) {
            const l = at(s, sign * 12);
            lamps.push({ ...l, y: l.y + 5, w: 0.13, h: 10, d: 0.13 });
            lamps.push({
              ...l,
              y: l.y + 9.8,
              x: l.x - p.nx * sign * 1.4,
              z: l.z - p.nz * sign * 1.4,
              w: 3,
              h: 0.12,
              d: 0.12,
            });
            lampHeads.push({
              ...l,
              y: l.y + 9.72,
              x: l.x - p.nx * sign * 2.5,
              z: l.z - p.nz * sign * 2.5,
              w: 1.4,
              h: 0.11,
              d: 0.4,
            });
          }
        }
        if (p.biome === 0 || p.biome === 1) {
          const w = 50 + r() * 65,
            h = 65 + r() * 100,
            d = 50 + r() * 60,
            a = at(s, side * (Math.max(w, d) + 70 + r() * 50));
          hills.push({ ...a, y: a.y - h * 0.7, w, h, d });
        }
      }
      // Thousands of small grass tufts share a single instanced draw, kept outside the tarmac.
      for (let i = 0; i < (this.mobile ? 1700 : 3200); i++) {
        const s = r() * length,
          offset = (r() > 0.5 ? 1 : -1) * (10 + r() * 34),
          a = at(s, offset);
        blades.push({
          ...a,
          y: a.y + 0.23,
          w: 0.3 + r() * 0.6,
          h: 0.4 + r() * 0.5,
          d: 0.4,
          rot: r() * TAU,
        });
      }
      makeBatch(
        this.world,
        boxGeo,
        new THREE.MeshStandardMaterial({ color: 0x171d1b, roughness: 1 }),
        cracks,
        false,
      );
      makeBatch(this.world, boxGeo, gray, boxes);
      makeBatch(this.world, boxGeo, rust, rustBoxes);
      makeBatch(this.world, boxGeo, windows, glassBoxes);
      makeBatch(
        this.world,
        boxGeo,
        new THREE.MeshStandardMaterial({
          color: 0xc4cbcb,
          metalness: 0.72,
          roughness: 0.4,
        }),
        rails,
      );
      makeBatch(
        this.world,
        boxGeo,
        new THREE.MeshStandardMaterial({ color: 0xcfcdbd, roughness: 0.9 }),
        white,
        false,
      );
      makeBatch(
        this.world,
        boxGeo,
        new THREE.MeshStandardMaterial({ color: 0x7f3029, roughness: 0.9 }),
        red,
        false,
      );
      makeBatch(
        this.world,
        boxGeo,
        surfaceMaterial("bark", { color: 0x615039 }),
        treeTrunks,
      );
      makeBatch(
        this.world,
        new THREE.ConeGeometry(1, 1, 9),
        surfaceMaterial("leaves", { color: 0x3e6249 }),
        treeCrowns,
      );
      makeBatch(
        this.world,
        new THREE.SphereGeometry(1, 10, 7),
        surfaceMaterial("leaves", { color: 0x486d46 }),
        broadCrowns,
      );
      makeBatch(this.world, boxGeo, dark, lamps);
      makeBatch(
        this.world,
        boxGeo,
        new THREE.MeshStandardMaterial({
          color: 0xe2d5a9,
          emissive: 0x62553c,
          roughness: 0.5,
        }),
        lampHeads,
        false,
      );
      makeBatch(
        this.world,
        new THREE.ConeGeometry(0.25, 1, 3),
        new THREE.MeshStandardMaterial({ color: 0x82935b, roughness: 1 }),
        blades,
        false,
      );
      const hillGeo = new THREE.SphereGeometry(1, 18, 10),
        pos = hillGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const mult = 0.9 + r() * 0.2;
        pos.setXYZ(
          i,
          pos.getX(i) * mult,
          pos.getY(i) * mult,
          pos.getZ(i) * mult,
        );
      }
      hillGeo.computeVertexNormals();
      makeBatch(
        this.world,
        hillGeo,
        surfaceMaterial("stone", { color: 0xa7aca0 }),
        hills,
      );
    } else this.fantasy = buildFantasy(this.world, track);
    const dark = new THREE.MeshStandardMaterial({
      color: 0x2a3439,
      roughness: 0.65,
    });
    const hazards = makeHazards(track);
    checkpoint(this.world, track);
    this.hazardUpdate = buildHazardModels(this.world, track, hazards);
    Object.assign(this.canvas.dataset, {
      theme: track.spec.theme || "nature",
      checkpoint: "T",
      hazards: String(hazards.length),
      deck: this.fantasy?.deck || "",
      neonRings: String(this.fantasy?.ringCount || 0),
      pavilions: String(this.fantasy?.pavilions || 0),
    });
    const flora = buildFlora(this.world, track);
    Object.assign(this.canvas.dataset, {
      trees: String(flora.trees),
      pines: String(flora.pines),
      shrubs: String(flora.shrubs),
      flowers: String(flora.flowers),
      containers: String(this.fantasy?.meta?.containers || 0),
      ships: String(this.fantasy?.meta?.ships || 0),
      bridgeTowers: String(this.fantasy?.meta?.bridgeTowers || 0),
      river: String(this.fantasy?.meta?.river || 0),
    });
    this.night = ["cyber", "tunnel"].includes(track.spec.theme);
    this.burst.visible = false;
    // Starting gantry and checker-painted grid.
    const g = new THREE.Group(),
      p = roadAt(track, 0);
    g.position.set(p.x, p.y + 0.07, p.z);
    g.rotation.y = p.theta;
    box(g, dark, -10, 4, 0, 0.65, 8, 0.65);
    box(g, dark, 10, 4, 0, 0.65, 8, 0.65);
    box(g, dark, 0, 7.7, 0, 21, 0.85, 0.6);
    const banner = texture(
      (c, w, h) => {
        c.fillStyle = "#182c32";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#e5f0db";
        c.font = "bold 35px sans-serif";
        c.textAlign = "center";
        c.fillText("SUMMIT / FINISH", w / 2, h * 0.63);
      },
      512,
      64,
    );
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 1.7),
      new THREE.MeshBasicMaterial({ map: banner, side: THREE.DoubleSide }),
    );
    sign.position.set(0, 6.4, 0.37);
    g.add(sign);
    const checkers = [[], []];
    for (let i = 0; i < 18; i++)
      for (let j = 0; j < 2; j++)
        checkers[(i + j) % 2].push({
          x: -8.5 + i,
          y: 0.035,
          z: -0.5 + j,
          w: 1,
          h: 0.04,
          d: 1,
        });
    makeBatch(g, boxGeo, dark, checkers[0], false);
    makeBatch(
      g,
      boxGeo,
      new THREE.MeshStandardMaterial({ color: 0xe9e6d9 }),
      checkers[1],
      false,
    );
    g.traverse((o) => {
      if (o.isMesh) {
        o.receiveShadow = true;
        if (!o.isInstancedMesh && o.material === dark) o.castShadow = true;
      }
    });
    this.world.add(g);
    this.firstCamera = true;
    this.frame = 0;
    this.renderer.shadowMap.needsUpdate = true;
    this.canvas.dataset.track = track.spec.id;
    this.setTextureQuality(
      qualitySettings(
        this.quality,
        this.software,
        this.mobile,
        devicePixelRatio || 1,
      ).anisotropy,
    );
    this.dirty = true;
  }
  setCars(race, skin) {
    this.clear(this.fleet);
    this.carMeshes = race.cars.map((c, i) => {
      const car = makeCar(c.model, SKINS.find(s => s.id === c.skin) || (i === 0 ? skin : SKINS[i % SKINS.length]));
      this.fleet.add(car);
      return car;
    });
    this.trafficMeshes = race.traffic.map((_, i) => {
      const car = makeCar(CARS[i % 3], SKINS[(i + 1) % 6], true);
      car.scale.setScalar(0.95);
      this.fleet.add(car);
      return car;
    });
    this.trailUpdate = makeTrails(
      this.fleet,
      this.track,
      race.cars,
      race.cars.map((c, i) => SKINS.find(s => s.id === c.skin) || (i === 0 ? skin : SKINS[i % SKINS.length])),
    );
    this.setTextureQuality(
      qualitySettings(
        this.quality,
        this.software,
        this.mobile,
        devicePixelRatio || 1,
      ).anisotropy,
    );
    this.firstCamera = true;
  }
  preview(model, skin) {
    this.previewRace = {
      cars: [{ model, id: 0, s: 15, offset: 0, speed: 0 }],
      traffic: [],
    };
    this.setCars(this.previewRace, skin);
    this.firstCamera = true;
  }
  place(mesh, s, offset, speed) {
    const p = roadAt(this.track, s);
    mesh.position.set(p.x + p.nx * offset, p.y + 0.08, p.z + p.nz * offset);
    mesh.rotation.set(
      -p.pitch,
      p.theta,
      Math.sin(this.frame * 0.09) * 0.004 * (speed / 65),
      "YXZ",
    );
    return p;
  }
  render(race, dt, garage = false) {
    this.frame++;
    const r = race || this.previewRace,
      p = r.cars[0];
    r.cars.forEach((c, i) => {
      this.place(this.carMeshes[i], c.s, c.offset, c.speed);
      this.carMeshes[i].visible =
        !c.finished &&
        (!(c.respawn > 0) || Math.floor(c.respawn * 5) % 2 === 0);
      this.carMeshes[i].rotation.y += (c.steer || 0) * 0.13;
    });
    r.traffic.forEach((t, i) => {
      const mesh = this.trafficMeshes[i];
      mesh.visible = [4, 6].includes(roadAt(this.track, t.s).biome);
      if (mesh.visible) this.place(mesh, t.s, t.offset, t.speed);
    });
    const road = roadAt(this.track, p.s),
      car = this.carMeshes[0].position;
    const target = new THREE.Vector3(),
      look = new THREE.Vector3();
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    if (garage) {
      const portrait = h > w;
      this.camera.setViewOffset(
        w,
        h,
        portrait ? 0 : w * 0.17,
        portrait ? h * 0.2 : 0,
        w,
        h,
      );
    } else this.camera.clearViewOffset();
    if (garage) {
      const a = road.theta + 0.65 + Math.sin(this.frame * 0.006) * 0.42;
      target.set(
        car.x + Math.sin(a) * 8.7,
        car.y + 3.5,
        car.z + Math.cos(a) * 8.7,
      );
      look.set(car.x, car.y + 0.8, car.z);
    } else {
      const narrow = this.camera.aspect < 0.85,
        distance = narrow ? 15 : 13;
      target.set(
        car.x - road.tx * distance,
        car.y + (narrow ? 5.8 : 5.3),
        car.z - road.tz * distance,
      );
      const ahead = roadAt(this.track, p.s + 12);
      look.set(
        ahead.x + ahead.nx * p.offset * 0.6,
        ahead.y + 1.3,
        ahead.z + ahead.nz * p.offset * 0.6,
      );
    }
    if (this.firstCamera) {
      this.camera.position.copy(target);
      this.firstCamera = false;
    } else this.camera.position.lerp(target, 1 - Math.exp(-dt * 7));
    this.camera.lookAt(look);
    const worldTime = garage ? this.frame / 30 : r.time;
    this.canvas.dataset.trailVertices = String(this.trailUpdate(r, worldTime));
    this.canvas.dataset.finishedVisible = String(
      r.cars.filter((c, i) => c.finished && this.carMeshes[i].visible).length,
    );
    this.fantasy?.update(worldTime);
    this.hazardUpdate(worldTime);
    this.neonLights.forEach((light, i) =>
      light.position.set(
        car.x + road.nx * (i ? 4 : -4),
        car.y + 2.5,
        car.z + road.nz * (i ? 4 : -4),
      ),
    );
    this.burst.visible = !!(p.respawn > 4);
    if (this.burst.visible) {
      const q = roadAt(this.track, p.crashS),
        size = (5 - p.respawn) * 5 + 0.3;
      this.burst.position.set(
        q.x + q.nx * p.crashOffset,
        q.y + 1,
        q.z + q.nz * p.crashOffset,
      );
      this.burst.scale.setScalar(size);
      this.burst.material.opacity = Math.max(0, p.respawn - 4) * 0.85;
    }
    const lightState = lightingState(
      this.lightMode,
      garage ? 0 : r.time,
      this.night,
    );
    this.lighting.update(lightState, this.camera.position);
    this.canvas.dataset.lightMode = this.lightMode;
    this.canvas.dataset.lightPeriod = lightState.label;
    this.neonLights.forEach(
      (light) => (light.intensity = this.night ? lightState.neonIntensity : 0),
    );
    this.headlights.forEach((light, i) => {
      const side = i ? 1 : -1;
      light.position.set(
        car.x + road.nx * side * 0.75 + road.tx * 2,
        car.y + 0.7,
        car.z + road.nz * side * 0.75 + road.tz * 2,
      );
      light.target.position.set(
        car.x + road.tx * 23,
        car.y - 0.2,
        car.z + road.tz * 23,
      );
      light.intensity = Math.max(0, 1 - lightState.sunIntensity / 4.5) * 950;
    });
    if (this.frame % (this.mobile || this.quality === "low" ? 3 : 2) === 0)
      this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.dirty = false;
    this.canvas.dataset.triangles = String(this.renderer.info.render.triangles);
    this.canvas.dataset.draws = String(this.renderer.info.render.calls);
    this.canvas.dataset.pixelRatio = String(this.renderer.getPixelRatio());
    this.canvas.dataset.textureCount = String(
      this.renderer.info.memory.textures,
    );
  }
}
